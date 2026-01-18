import { Handler } from '@netlify/functions';

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests per minute per IP

interface FormatRequest {
  text: string;
}

interface HighlightSpan {
  text: string; // exact substring from the block
  style?: 'bold' | 'italic' | 'underline'; // optional, default bold
}

interface FormatBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'numbered' | 'cta' | 'hashtags' | 'separator';
  text?: string;
  items?: string[];
  highlights?: HighlightSpan[];
}

interface SplitPost {
  platform: string;
  content: string;
}

interface FormattedPost {
  platform: string;
  blocks: FormatBlock[];
}

interface FormatResponse {
  results: FormattedPost[];
}

// Rate limiting helper
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now();
  for (const [ip, limit] of rateLimitStore.entries()) {
    if (now > limit.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}

// STEP 1: SPLITTER - Classify and split multi-post content
async function callGroqSplitterAPI(rawText: string): Promise<SplitPost[]> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const systemMessage = `You are a Social Media Content Classifier.

1. ANALYZE input: Does it contain MULTIPLE distinct posts (e.g., 'Facebook Version', 'Option 1')?
   - NO: It's a single post (even if long).
   - YES: It has clear headers like 'Twitter:', 'For LinkedIn:', or 'Option A:'.

2. IGNORE: Remove conversational filler ('Sure!', 'Here is the draft') and non-post instructions ('Image Prompt', 'Poster Gen').

3. EXTRACT: Return an array of posts.
   - If Single: Return 1 item with platform="General".
   - If Multi: Split by platform. Remove platform headers from content.
   - If user provides Image Prompts, IGNORE them.

OUTPUT JSON SCHEMA:
{
  "posts": [
    { "platform": "Facebook", "content": "..." },
    { "platform": "X (Twitter)", "content": "..." }
  ]
}

PLATFORM DETECTION RULES:
- Look for headers like: "Facebook:", "Twitter:", "X:", "LinkedIn:", "Instagram:", "Threads:"
- Look for variations like: "For Facebook", "Facebook Version", "Option 1 (Facebook)"
- If no platform headers found, return single post with platform="General"
- Remove the platform header from the content itself
- Preserve all actual post content exactly as written`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: rawText
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
      response_format: {
        type: "json_object"
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Groq Splitter API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Groq Splitter API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in Groq splitter response:', data);
    throw new Error('No content returned from Groq Splitter API');
  }

  try {
    const parsedResponse = JSON.parse(content);
    
    // Validate the response structure
    if (!Array.isArray(parsedResponse.posts)) {
      throw new Error('Invalid splitter response: missing posts array');
    }
    
    // If no posts found, return single post with original text
    if (parsedResponse.posts.length === 0) {
      return [{ platform: 'General', content: rawText }];
    }
    
    // Validate each post
    for (const post of parsedResponse.posts) {
      if (!post.platform || typeof post.platform !== 'string') {
        throw new Error('Invalid post: missing platform');
      }
      if (!post.content || typeof post.content !== 'string') {
        throw new Error('Invalid post: missing content');
      }
    }
    
    return parsedResponse.posts;
  } catch (parseError) {
    console.error('Failed to parse Groq splitter JSON response:', content);
    // Fallback: return original text as single post
    return [{ platform: 'General', content: rawText }];
  }
}

// STEP 2: FORMATTER - Format each post individually
async function callGroqFormatterAPI(postContent: string, isRetry: boolean = false): Promise<{ blocks: FormatBlock[] }> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const systemMessage = `You are a TEXT-PRESERVING FORMATTER.

YOUR GOAL:
- Output user text EXACTLY as provided.
- Your ONLY allowed change: wrap headings and key terms with markdown stars (**text**).

CRITICAL VISUAL RULES (DO NOT BREAK):
1. NO COMBINING CHARACTERS: Do NOT use combining underlines (U+0332), combining strikethroughs (U+0336), or any combining diacritical marks. These render as broken question marks in browsers.
2. NO FANCY UNICODE: Do NOT use 𝐁𝐨𝐥𝐝, 𝐼𝑡𝑎𝑙𝑖𝑐, 𝒮𝒸𝓇𝒾𝓅𝓉, or mathematical alphanumeric symbols.
3. PLAIN TEXT ONLY: Use standard A-Z, a-z, 0-9 characters.
4. MARKDOWN ONLY: Use **text** for emphasis. Nothing else.

EXAMPLES - WHAT NOT TO DO:
❌ WRONG: "T̲h̲e̲ ̲P̲l̲a̲n̲:" (combining underlines - causes question marks ���)
❌ WRONG: "𝐓𝐡𝐞 𝐏𝐥𝐚𝐧:" (bold unicode - not allowed)
❌ WRONG: "T̶h̶e̶ ̶P̶l̶a̶n̶:" (combining strikethrough - breaks UI)
✅ CORRECT: "**The Plan:**" (markdown stars - this is the ONLY way)

CRITICAL RULES:
1. NEVER add combining characters to text.
2. NEVER use fancy Unicode for styling.
3. NEVER censor or replace text with question marks.
4. NEVER delete "garbage" or weird sentences - output them EXACTLY as is.
5. If input contains emojis or foreign characters, PRESERVE them exactly.
6. Do NOT rewrite, paraphrase, or "fix" the text.

BLOCK TYPES:
- "heading": Main title or strong hook line
- "subheading": Section labels like "Problem:", "Solution:", "Benefits:"
- "paragraph": Normal body text (DEFAULT - use this when unsure)
- "bullets": Multiple related items (tips, features, benefits)
- "numbered": Step-by-step or ordered processes
- "cta": Call-to-action phrases (comment, like, share, DM, etc.)
- "hashtags": Group all hashtags together
- "separator": Visual breaks between sections (use sparingly)

OUTPUT FORMAT:
{
  "blocks": [
    {
      "type": "heading" | "subheading" | "paragraph" | "cta",
      "text": string
    },
    {
      "type": "bullets" | "numbered" | "hashtags",
      "items": string[]
    },
    {
      "type": "separator"
    }
  ]
}

IMPORTANT NOTES:
- Do NOT use the "highlights" field - it's not needed
- Apply markdown stars (**) directly in the text field
- When in doubt, use type "paragraph" with plain text
- Preserving exact text is MORE IMPORTANT than perfect formatting

REMEMBER: Use PLAIN TEXT with markdown stars (**) ONLY. No combining characters. No fancy Unicode.`;

  const userMessage = `Format this social media post into structured blocks.

CRITICAL WARNINGS - READ CAREFULLY:
1. Use PLAIN TEXT ONLY - standard A-Z, a-z, 0-9 characters
2. For emphasis, use markdown stars: **text** (this is the ONLY allowed styling)
3. NEVER use combining characters (U+0332, U+0336, etc.) - they cause question mark glitches ���
4. NEVER use fancy Unicode (𝐁𝐨𝐥𝐝, 𝐼𝑡𝑎𝑙𝑖𝑐, etc.)
5. Output text EXACTLY as provided, just organized into blocks

CORRECT EXAMPLE:
{
  "blocks": [
    { "type": "heading", "text": "**The Plan:**" },
    { "type": "paragraph", "text": "This is the content." }
  ]
}

INPUT TEXT:
${postContent}

Return ONLY the JSON object with "blocks" array. Use plain text with markdown stars (**) for emphasis.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: isRetry 
            ? `Your previous response was invalid. ${userMessage}`
            : userMessage
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: {
        type: "json_object"
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Groq Formatter API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Groq Formatter API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in Groq formatter response:', data);
    throw new Error('No content returned from Groq Formatter API');
  }

  try {
    const parsedResponse = JSON.parse(content);
    
    // Validate the response has blocks array
    if (!Array.isArray(parsedResponse.blocks)) {
      throw new Error('Invalid formatter response: missing blocks array');
    }
    
    // Validate each block
    const validBlockTypes = ['heading', 'subheading', 'paragraph', 'bullets', 'numbered', 'cta', 'hashtags', 'separator'];
    
    for (const block of parsedResponse.blocks) {
      if (!block || typeof block !== 'object') {
        throw new Error('Invalid block structure');
      }
      if (!validBlockTypes.includes(block.type)) {
        throw new Error(`Invalid block type: ${block.type}`);
      }
      
      // Validate block structure based on type
      if (['bullets', 'numbered', 'hashtags'].includes(block.type)) {
        if (!Array.isArray(block.items)) {
          throw new Error(`Block type ${block.type} requires items array`);
        }
        if (!block.items.every((item: any) => typeof item === 'string')) {
          throw new Error(`All items in ${block.type} must be strings`);
        }
      } else if (['heading', 'subheading', 'paragraph', 'cta'].includes(block.type)) {
        if (typeof block.text !== 'string') {
          throw new Error(`Block type ${block.type} requires text string`);
        }
      }
      
      // Validate highlights if present
      if (block.highlights !== undefined) {
        if (!Array.isArray(block.highlights)) {
          throw new Error('highlights must be an array');
        }
        for (const highlight of block.highlights) {
          if (!highlight || typeof highlight !== 'object') {
            throw new Error('Invalid highlight structure');
          }
          if (typeof highlight.text !== 'string') {
            throw new Error('highlight.text must be a string');
          }
          if (highlight.style !== undefined && !['bold', 'italic', 'underline'].includes(highlight.style)) {
            throw new Error(`Invalid highlight style: ${highlight.style}`);
          }
        }
      }
    }
    
    return { blocks: parsedResponse.blocks };
  } catch (parseError) {
    console.error('Failed to parse or validate Groq formatter JSON response:', content);
    throw new Error('Invalid JSON response from Groq Formatter API');
  }
}

export const handler: Handler = async (event) => {
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Check Groq API key
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error('GROQ_API_KEY environment variable not set');
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'AI service not configured' }),
      };
    }

    // Rate limiting
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    cleanupRateLimit();
    
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let requestData: FormatRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate required fields
    if (!requestData.text || typeof requestData.text !== 'string') {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text field is required and must be a string' }),
      };
    }

    // Validate text length (prevent abuse)
    if (requestData.text.length > 10000) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text too long. Maximum 10000 characters allowed.' }),
      };
    }

    if (requestData.text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text cannot be empty' }),
      };
    }

    // TWO-STEP PIPELINE: Split then Format
    console.log('Starting multi-split format pipeline...');
    
    // STEP 1: Split the text into posts
    console.log('Step 1: Splitting text into posts...');
    let posts: SplitPost[];
    
    try {
      posts = await callGroqSplitterAPI(requestData.text);
      console.log('Text split successfully:', {
        originalLength: requestData.text.length,
        postsCount: posts.length,
        platforms: posts.map(p => p.platform)
      });
    } catch (splitterError) {
      console.error('Splitter API call failed:', splitterError);
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AI text splitting service temporarily unavailable. Please try again later.',
          details: splitterError instanceof Error ? splitterError.message : 'Unknown error'
        }),
      };
    }

    // STEP 2: Format each post in parallel
    console.log('Step 2: Formatting each post...');
    
    try {
      const formattedResults = await Promise.all(
        posts.map(async (post) => {
          try {
            const formatResult = await callGroqFormatterAPI(post.content);
            return {
              platform: post.platform,
              blocks: formatResult.blocks
            };
          } catch (formatError) {
            console.error(`Formatter failed for ${post.platform}, retrying...`, formatError);
            // Retry once
            try {
              const retryResult = await callGroqFormatterAPI(post.content, true);
              return {
                platform: post.platform,
                blocks: retryResult.blocks
              };
            } catch (retryError) {
              console.error(`Retry failed for ${post.platform}:`, retryError);
              // Return a fallback paragraph block with the original content
              return {
                platform: post.platform,
                blocks: [
                  {
                    type: 'paragraph' as const,
                    text: post.content
                  }
                ]
              };
            }
          }
        })
      );

      const formatResponse: FormatResponse = {
        results: formattedResults
      };

      console.log('Multi-split format pipeline completed successfully:', {
        originalLength: requestData.text.length,
        postsCount: formatResponse.results.length,
        platforms: formatResponse.results.map(r => r.platform),
        totalBlocks: formatResponse.results.reduce((sum, r) => sum + r.blocks.length, 0)
      });

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(formatResponse),
      };

    } catch (formatterError) {
      console.error('Formatter API calls failed:', formatterError);
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AI formatting service temporarily unavailable. Please try again later.',
          details: formatterError instanceof Error ? formatterError.message : 'Unknown error'
        }),
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};