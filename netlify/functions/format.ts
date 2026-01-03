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

interface FormatBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'numbered' | 'cta' | 'hashtags' | 'separator';
  text?: string;
  items?: string[];
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

  const systemMessage = `You are a text formatter, not a writer. Your job is to ONLY organize the user's text into structured blocks for styling (heading/subheading/paragraph/bullets/numbered/cta/hashtags/separator). ABSOLUTE RULES:

Do NOT rewrite, paraphrase, summarize, expand, or shorten the user's message.
Copy the user's original wording as-is.
Allowed edits are limited to removing LLM wrapper junk and fixing whitespace.
Keep links and hashtags EXACTLY unchanged.
Output ONLY valid JSON. No markdown. No extra text.

OUTPUT JSON SHAPE: { "cleanText": string, "removedPhrases": string[], "blocks": Array< | {"type":"heading","text":string} | {"type":"subheading","text":string} | {"type":"paragraph","text":string} | {"type":"bullets","items":string[]} | {"type":"numbered","items":string[]} | {"type":"cta","text":string} | {"type":"hashtags","items":string[]} | {"type":"separator"}>}

Block rules:
bullets/numbered/hashtags must use items (string[]).
heading/subheading/paragraph/cta must use text (string).
Do not invent content. Use only text taken from the input (minus junk removal/whitespace fixes).
Do not add any extra keys.`;

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

    // Construct the prompt for Groq - formatting only, no rewriting
    const prompt = `FORMATTER TASK: Analyze the input text and split it into formatting blocks to make it look good with Unicorn styles. Do NOT change the wording.

What counts as formatting (allowed):
Detect a strong first line as a heading (if present or can be extracted verbatim from the text).
Identify subheadings that already exist in the text (verbatim).
Split long text into short paragraphs (same sentences, just grouped).
Convert existing enumerations into bullets or numbered steps WITHOUT rewriting.
Extract hashtags into a hashtags block (keep each hashtag exactly, just grouped).
Detect CTA lines already present (e.g., 'Comment…', 'DM me…', 'Try…') and put them in a cta block (verbatim).

What is NOT allowed:
No rewriting.
No new words.
No summarizing.
No shortening for platform limits.

INPUT TEXT: <<< ${requestData.text}

Return ONLY the JSON object.`;

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