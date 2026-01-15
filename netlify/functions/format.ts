import { Handler } from '@netlify/functions';

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 15; // 15 requests per minute per IP

// Platform limits
const PLATFORM_LIMITS = {
  facebook: 63206, // Very high limit for long-form
  x: 280,
  twitter: 280, // alias for x
  instagram: 2200,
  threads: 500,
  linkedin: 3000,
} as const;

type Platform = keyof typeof PLATFORM_LIMITS;

interface FormatRequest {
  text: string;
  platform?: Platform;
  maxChars?: number;
  options?: {
    tone?: 'neutral' | 'friendly' | 'professional';
    keepHashtags?: boolean;
    keepCTA?: boolean;
  };
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

interface FormatResponse {
  cleanText: string;
  removedPhrases: string[];
  blocks: FormatBlock[];
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

// Validate FormatResponse structure
function validateFormatResponse(data: any): data is FormatResponse {
  if (!data || typeof data !== 'object') return false;
  
  // Check required top-level keys
  if (typeof data.cleanText !== 'string') return false;
  if (!Array.isArray(data.removedPhrases)) return false;
  if (!Array.isArray(data.blocks)) return false;
  
  // Validate removedPhrases array
  if (!data.removedPhrases.every((phrase: any) => typeof phrase === 'string')) return false;
  
  // Validate blocks array
  const validBlockTypes = ['heading', 'subheading', 'paragraph', 'bullets', 'numbered', 'cta', 'hashtags', 'separator'];
  
  for (const block of data.blocks) {
    if (!block || typeof block !== 'object') return false;
    if (!validBlockTypes.includes(block.type)) return false;
    
    // Validate block structure based on type
    if (['bullets', 'numbered', 'hashtags'].includes(block.type)) {
      if (!Array.isArray(block.items)) return false;
      if (!block.items.every((item: any) => typeof item === 'string')) return false;
    } else if (['heading', 'subheading', 'paragraph', 'cta'].includes(block.type)) {
      if (typeof block.text !== 'string') return false;
    }
    // separator type doesn't require text or items
    
    // Validate highlights if present
    if (block.highlights !== undefined) {
      if (!Array.isArray(block.highlights)) return false;
      for (const highlight of block.highlights) {
        if (!highlight || typeof highlight !== 'object') return false;
        if (typeof highlight.text !== 'string') return false;
        if (highlight.style !== undefined && !['bold', 'italic', 'underline'].includes(highlight.style)) return false;
      }
    }
  }
  
  return true;
}

// Estimate character count from format response
function estimateCharacterCount(formatResponse: FormatResponse): number {
  let totalChars = formatResponse.cleanText.length;
  
  // Add estimated characters from blocks
  for (const block of formatResponse.blocks) {
    if (block.text) {
      totalChars += block.text.length + 2; // +2 for line breaks
    }
    if (block.items) {
      totalChars += block.items.reduce((sum, item) => sum + item.length + 3, 0); // +3 for bullet/number + space + line break
    }
  }
  
  return totalChars;
}

// STEP 1: Call Groq API to clean the text (remove meta-talk)
async function callGroqCleanerAPI(rawText: string): Promise<{ cleanedText: string; removedPhrases: string[] }> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const systemMessage = `You are a Text Extractor. Your ONLY job is to return the core social media post content from the user input.

RULES:
- REMOVE all conversational filler such as:
  * "Sure", "Here is the post", "Here's your post", "Here you go"
  * "I hope this helps", "Let me know if you need changes"
  * "As an AI", "I can help", "I'd be happy to"
  * "The post starts here", "The post ends here"
  * Any meta-commentary about the post itself
- If the text is already clean (no filler), return it EXACTLY as is
- Do NOT rewrite, paraphrase, or modify the actual post content
- Do NOT add or remove hashtags, emojis, or formatting
- Output ONLY the cleaned text

Return a JSON object:
{
  "cleanedText": "the extracted post content",
  "removedPhrases": ["list of phrases that were removed"]
}`;

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
          content: `Extract the core post content from this text:\n\n${rawText}`
        }
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      max_tokens: 1000,
      response_format: {
        type: "json_object"
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Groq Cleaner API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Groq Cleaner API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in Groq cleaner response:', data);
    throw new Error('No content returned from Groq Cleaner API');
  }

  try {
    const parsedResponse = JSON.parse(content);
    
    // Validate the response structure
    if (typeof parsedResponse.cleanedText !== 'string') {
      throw new Error('Invalid cleaner response: missing cleanedText');
    }
    
    return {
      cleanedText: parsedResponse.cleanedText,
      removedPhrases: Array.isArray(parsedResponse.removedPhrases) ? parsedResponse.removedPhrases : []
    };
  } catch (parseError) {
    console.error('Failed to parse Groq cleaner JSON response:', content);
    throw new Error('Invalid JSON response from Groq Cleaner API');
  }
}

// STEP 2: Call Groq API to format the cleaned text
async function callGroqFormatterAPI(cleanedText: string, isRetry: boolean = false): Promise<{ blocks: FormatBlock[] }> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const systemMessage = `You are a Creative Social Media Formatter. Your job is to format the provided text into structured blocks with proper styling and highlighting.

### INSTRUCTIONS

1. **Analyze Structure (Block Level):**
   - Detect **Headings**: Main titles or topic changes. (Label as 'heading')
   - Detect **Subheadings**: Section dividers. (Label as 'subheading')
   - Detect **Lists**: Any lines that look like points, bullets, or steps. (Label as 'bullets' or 'numbered')
   - Detect **CTAs**: Call-to-action phrases. (Label as 'cta')
   - Detect **Hashtags**: Group hashtags together. (Label as 'hashtags')
   - Detect **Standard Text**: Everything else. (Label as 'paragraph')

2. **Apply Inline Highlighting (Word Level):**
   - IDENTIFY: Names of people, Brand names, Monetary values (e.g., $500), and 'Sensitive/Impact' keywords (e.g., 'Warning', 'Important', 'Deadline').
   - ACTION: Mark these specific words in the highlights array with their exact text from the content.

3. **Strict Constraints:**
   - **DO NOT REWRITE:** Output the exact wording provided.
   - **DO NOT HALLUCINATE:** Do not add emojis or punctuation that isn't there.
   - **DO NOT REORDER:** Keep the blocks in the exact order of the input text.

### OUTPUT FORMAT
Return a JSON object:
{
  "blocks": Array<
    | {
        "type": "heading" | "subheading" | "paragraph" | "cta";
        "text": string;
        "highlights"?: { "text": string; "style"?: "bold" | "italic" | "underline" }[];
      }
    | {
        "type": "bullets" | "numbered" | "hashtags";
        "items": string[];
        "highlights"?: { "text": string; "style"?: "bold" | "italic" | "underline" }[];
      }
    | {
        "type": "separator";
      }
  >
}

### BLOCK RULES:
- "heading": Main title or strong hook line from the text.
- "subheading": Section labels like "Problem:", "Solution:", "Benefits:", etc.
- "paragraph": Normal body text.
- "bullets": Multiple related items (tips, features, benefits) - preserve exact wording.
- "numbered": Step-by-step or ordered processes - preserve exact wording.
- "cta": Call-to-action phrases (comment, like, share, DM, sign up, etc.).
- "hashtags": Group all hashtags together, preserving each exactly.
- "separator": Visual breaks between sections (use sparingly).

### HIGHLIGHTS:
- Identify important entities and keywords within each block's text or items.
- Good candidates:
  - Person names (creators, experts, authors)
  - Brand names and product names
  - Platform names (Facebook, TikTok, X, LinkedIn, Instagram, YouTube, etc.)
  - Monetary values ($500, €100, etc.)
  - Dates, times, locations
  - Impact keywords (Warning, Important, Deadline, Limited, Free, New, etc.)
- Each highlight: { "text": string, "style"?: "bold" | "italic" | "underline" }
- "text" must be an exact substring from the block's content.
- Default style is "bold" if not specified.

### CRITICAL:
- The text provided is CLEAN. Do not try to remove or clean anything.
- Output must contain 100% of the input text, just organized into blocks.
- Do NOT add any extra keys to the JSON beyond those described above.`;

  const userMessage = `STRUCTURE DETECTION TASK: Analyze the provided text and organize it into formatting blocks. The text is CLEAN - do not remove or rewrite anything.

INSTRUCTIONS:
1. **Detect Structure:**
   - Identify headings (main titles or topic changes)
   - Identify subheadings (section labels like "Problem:", "Solution:", "Benefits:")
   - Identify lists (any points, bullets, or steps)
   - Identify CTAs (call-to-action phrases)
   - Identify hashtags (group them together)
   - Everything else is a paragraph

2. **Highlight Important Entities:**
   - Within each block, identify and mark:
     * Person names
     * Brand names
     * Monetary values ($500, €100, etc.)
     * Platform names (Facebook, LinkedIn, Instagram, etc.)
     * Impact keywords (Warning, Important, Deadline, Limited, Free, etc.)
   - Add these to the highlights array with their exact text

3. **Strict Rules:**
   - Use the EXACT wording from the input
   - Do NOT rewrite, paraphrase, or summarize
   - Do NOT add emojis or punctuation
   - Do NOT reorder the content
   - Keep blocks in the same order as the input

INPUT TEXT:
${cleanedText}

Return ONLY the JSON object as specified in the system message.`;

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
            ? `Your previous response was invalid. Return ONLY a single JSON object with a "blocks" array.\n\n${userMessage}`
            : userMessage
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
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
    if (requestData.text.length > 8000) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text too long. Maximum 8000 characters allowed.' }),
      };
    }

    if (requestData.text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Text cannot be empty' }),
      };
    }

    // TWO-STEP PIPELINE: Clean then Format
    console.log('Starting two-step format pipeline...');
    
    // STEP 1: Clean the text (remove meta-talk)
    console.log('Step 1: Cleaning text...');
    let cleanedText: string;
    let removedPhrases: string[];
    
    try {
      const cleanerResult = await callGroqCleanerAPI(requestData.text);
      cleanedText = cleanerResult.cleanedText;
      removedPhrases = cleanerResult.removedPhrases;
      console.log('Text cleaned successfully:', {
        originalLength: requestData.text.length,
        cleanedLength: cleanedText.length,
        removedPhrasesCount: removedPhrases.length
      });
    } catch (cleanerError) {
      console.error('Cleaner API call failed:', cleanerError);
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AI text cleaning service temporarily unavailable. Please try again later.',
          details: cleanerError instanceof Error ? cleanerError.message : 'Unknown error'
        }),
      };
    }

    // STEP 2: Format the cleaned text
    console.log('Step 2: Formatting cleaned text...');
    let blocks: FormatBlock[];
    
    try {
      const formatterResult = await callGroqFormatterAPI(cleanedText);
      blocks = formatterResult.blocks;
      console.log('Text formatted successfully:', {
        blocksCount: blocks.length
      });
    } catch (formatterError) {
      console.error('Formatter API call failed:', formatterError);
      
      // Retry once with stricter prompt
      try {
        console.log('Retrying formatter with stricter prompt...');
        const retryResult = await callGroqFormatterAPI(cleanedText, true);
        blocks = retryResult.blocks;
      } catch (retryError) {
        console.error('Retry Formatter API call failed:', retryError);
        return {
          statusCode: 503,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'AI formatting service temporarily unavailable. Please try again later.',
            details: retryError instanceof Error ? retryError.message : 'Unknown error'
          }),
        };
      }
    }

    // Combine results
    const formatResult: FormatResponse = {
      cleanText: cleanedText,
      removedPhrases: removedPhrases,
      blocks: blocks
    };

    console.log('Format pipeline completed successfully:', {
      originalLength: requestData.text.length,
      cleanedLength: formatResult.cleanText.length,
      blocksCount: formatResult.blocks.length,
      removedPhrasesCount: formatResult.removedPhrases.length,
      estimatedFinalLength: estimateCharacterCount(formatResult)
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(formatResult),
    };

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