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

// Call Groq API with JSON mode
async function callGroqFormatAPI(prompt: string, platform: Platform, isRetry: boolean = false): Promise<FormatResponse> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const systemMessage = `You are a Strict Text Formatter. You do not rewrite, summarize, or delete text. You only apply formatting styles to the exact text provided.

### INSTRUCTIONS

1. **Analyze Structure (Block Level):**
   - Detect **Headings**: Main titles or topic changes. (Label as 'heading')
   - Detect **Subheadings**: Section dividers. (Label as 'subheading')
   - Detect **Lists**: Any lines that look like points, bullets, or steps. (Label as 'bullets' or 'numbered')
   - Detect **CTAs**: Call-to-action phrases. (Label as 'cta')
   - Detect **Hashtags**: Group hashtags together. (Label as 'hashtags')
   - Detect **Standard Text**: Everything else. (Label as 'paragraph')

2. **Apply Inline Highlighting (Word Level):**
   - Read the text content carefully.
   - IDENTIFY: Names of people, Brand names, Monetary values (e.g., $500), and 'Sensitive/Impact' keywords (e.g., 'Warning', 'Important', 'Deadline').
   - ACTION: Mark these specific words in the highlights array with their exact text from the content.

3. **Strict Constraints:**
   - **DO NOT REWRITE:** Output the exact wording provided by the user.
   - **DO NOT HALLUCINATE:** Do not add emojis or punctuation that isn't there.
   - **DO NOT REORDER:** Keep the blocks in the exact order of the input text.
   - **DO NOT REMOVE:** Do not remove any text from the input.

### OUTPUT FORMAT
Return a JSON object:
{
  "cleanText": string,
  "removedPhrases": string[],
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

  const userMessage = isRetry 
    ? `Your previous response was invalid. Return ONLY a single JSON object with keys cleanText, removedPhrases, blocks.\n\n${prompt}`
    : prompt;

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
          content: userMessage
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
    console.error('Groq API Error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Groq API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in Groq response:', data);
    throw new Error('No content returned from Groq API');
  }

  try {
    const parsedResponse = JSON.parse(content);
    
    // Validate the response structure
    if (!validateFormatResponse(parsedResponse)) {
      throw new Error('Invalid response structure from AI');
    }
    
    return parsedResponse;
  } catch (parseError) {
    console.error('Failed to parse or validate Groq JSON response:', content);
    throw new Error('Invalid JSON response from AI');
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

    // Determine platform and limits
    const platform = requestData.platform || 'facebook';
    const maxChars = requestData.maxChars || PLATFORM_LIMITS[platform] || PLATFORM_LIMITS.facebook;
    const options = requestData.options || {};

    // Construct the prompt for Groq - strict formatting with inline highlighting
    const prompt = `STRUCTURE DETECTION TASK: Analyze the provided text and organize it into formatting blocks. The text is CLEAN - do not remove or rewrite anything.

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
${requestData.text}

Return ONLY the JSON object as specified in the system message.`;

    // Call Groq API
    let formatResult: FormatResponse;
    try {
      formatResult = await callGroqFormatAPI(prompt, platform);
    } catch (apiError) {
      console.error('Initial Groq API call failed:', apiError);
      
      // Retry once with stricter prompt
      try {
        console.log('Retrying with stricter prompt...');
        formatResult = await callGroqFormatAPI(prompt, platform, true);
      } catch (retryError) {
        console.error('Retry Groq API call failed:', retryError);
        return {
          statusCode: 503,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'AI service temporarily unavailable. Please try again later.',
            details: retryError instanceof Error ? retryError.message : 'Unknown error'
          }),
        };
      }
    }

    console.log('Format successful:', {
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