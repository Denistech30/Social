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

interface ErrorResponse {
  error: string;
  details?: any;
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

// Call Groq API with structured output
async function callGroqFormatAPI(prompt: string, platform: Platform): Promise<FormatResponse> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  // JSON Schema for structured output
  const jsonSchema = {
    name: "format_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        cleanText: {
          type: "string",
          description: "The original text with LLM wrapper junk removed"
        },
        removedPhrases: {
          type: "array",
          items: { type: "string" },
          description: "List of phrases that were removed (like 'Here's your post', etc.)"
        },
        blocks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["heading", "subheading", "paragraph", "bullets", "numbered", "cta", "hashtags", "separator"]
              },
              text: { type: "string" },
              items: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["type"],
            additionalProperties: false
          }
        }
      },
      required: ["cleanText", "removedPhrases", "blocks"],
      additionalProperties: false
    }
  };

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
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: {
        type: "json_schema",
        json_schema: jsonSchema
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
    return JSON.parse(content);
  } catch (parseError) {
    console.error('Failed to parse Groq JSON response:', content);
    throw new Error('Invalid JSON response from AI');
  }
}

export const handler: Handler = async (event, context) => {
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

    // Construct the prompt for Groq
    const platformGuidance = platform === 'facebook' 
      ? 'Facebook long-form: prioritize readability and structure (hook, short paragraphs, bullets/steps when helpful), not aggressive shortening.'
      : `${platform.toUpperCase()}: optimize for ${maxChars} character limit while maintaining readability.`;

    const toneGuidance = options.tone ? `Use ${options.tone} tone.` : 'Use neutral tone.';
    const hashtagGuidance = options.keepHashtags !== false ? 'Keep hashtags.' : 'Hashtags can be removed if needed.';
    const ctaGuidance = options.keepCTA !== false ? 'Keep call-to-action phrases.' : 'CTA can be shortened if needed.';

    const prompt = `You are a social media formatting expert. Your task is to clean up and structure social media text.

CRITICAL RULES:
1. Remove ALL "LLM wrapper junk" like:
   - "Here's your post" / "Here's the post"
   - "Let me know if you want another version"
   - "The post starts here / ends here"
   - "Sure, I can help" / "As an AI..."
   - Any headings like "Caption:" "Post:" unless they belong to the actual content
   - "Hope this helps" / "Feel free to modify"

2. Keep meaning and language - do NOT rewrite facts or change the core message
3. Preserve links and hashtags exactly as they are
4. ${platformGuidance}
5. ${toneGuidance} ${hashtagGuidance} ${ctaGuidance}

6. Structure the output as blocks:
   - heading: Strong hook line (use for main title/hook)
   - subheading: Secondary important line
   - paragraph: Regular text content (keep paragraphs short)
   - bullets: Use when listing benefits/features/steps
   - numbered: Use for step-by-step processes
   - cta: Call-to-action phrases
   - hashtags: Group hashtags together
   - separator: Use sparingly for visual breaks

Original text to format:
${requestData.text}

Return valid JSON matching the schema. Focus on cleaning up LLM junk and structuring for ${platform}.`;

    console.log('Format request:', {
      originalLength: requestData.text.length,
      platform,
      maxChars
    });

    // Call Groq API
    let formatResult: FormatResponse;
    try {
      formatResult = await callGroqFormatAPI(prompt, platform);
    } catch (apiError) {
      console.error('Groq API call failed:', apiError);
      return {
        statusCode: 503,
        headers: corsHeaders,
        body: JSON.stringify({ 
          error: 'AI service temporarily unavailable. Please try again later.',
          details: apiError instanceof Error ? apiError.message : 'Unknown error'
        }),
      };
    }

    console.log('Format successful:', {
      originalLength: requestData.text.length,
      cleanedLength: formatResult.cleanText.length,
      blocksCount: formatResult.blocks.length,
      removedPhrasesCount: formatResult.removedPhrases.length
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