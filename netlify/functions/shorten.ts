import { Handler } from '@netlify/functions';

// Rate limiting - simple in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Platform limits
const PLATFORM_LIMITS = {
  x: 280,
  twitter: 280, // alias for x
  instagram: 2200,
  threads: 500,
  linkedin: 3000,
} as const;

type Platform = keyof typeof PLATFORM_LIMITS;

interface ShortenRequest {
  text: string;
  platform?: Platform;
  limit?: number;
  maxChars?: number; // Alternative field name for backward compatibility
  options?: {
    keepHashtags?: boolean;
    keepCTA?: boolean;
    tone?: 'neutral' | 'friendly' | 'professional';
  };
}

interface ShortenResponse {
  result: string;
  shortened: string; // Backward compatibility
  charCount: number;
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

// Call Groq API
async function callGroqAPI(prompt: string, maxTokens: number = 150): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

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
      max_tokens: maxTokens,
      top_p: 0.9,
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

  return content.trim();
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

    let requestData: ShortenRequest;
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

    // Determine character limit
    let maxChars = requestData.maxChars || requestData.limit || 280;
    
    // If platform is specified, use its limit
    if (requestData.platform && requestData.platform in PLATFORM_LIMITS) {
      maxChars = PLATFORM_LIMITS[requestData.platform];
    }

    const options = requestData.options || {};

    // Construct the prompt for Groq
    const keepHashtagsText = options.keepHashtags !== false ? 'Keep hashtags and links.' : 'Hashtags can be removed if needed.';
    const keepCTAText = options.keepCTA !== false ? 'Keep call-to-action phrases.' : 'CTA can be shortened if needed.';
    const toneText = options.tone ? `Use ${options.tone} tone.` : '';

    const prompt = `Shorten the following text to <= ${maxChars} characters. Keep meaning, ${keepHashtagsText} ${keepCTAText} Remove filler words, don't change language. ${toneText} Output only the shortened text, no explanations.

Original text (${requestData.text.length} characters):
${requestData.text}`;

    console.log('Shortening request:', {
      originalLength: requestData.text.length,
      targetLength: maxChars,
      platform: requestData.platform || 'unknown'
    });

    // Call Groq API
    let shortenedText: string;
    try {
      shortenedText = await callGroqAPI(prompt);
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

    // Validate output length
    const charCount = [...shortenedText].length; // Proper Unicode count
    
    if (charCount > maxChars) {
      console.log(`First attempt too long: ${charCount}/${maxChars} chars, retrying with stricter prompt`);
      
      // Try once more with stricter instruction
      try {
        const stricterPrompt = `Make this text shorter. Hard limit: ${maxChars} characters maximum. Remove unnecessary words, keep core meaning. Output only the shortened text:

${shortenedText}`;

        const retryText = await callGroqAPI(stricterPrompt, 100);
        const retryCount = [...retryText].length;
        
        if (retryCount <= maxChars) {
          shortenedText = retryText;
          console.log(`Retry successful: ${retryCount}/${maxChars} chars`);
        } else {
          console.log(`Retry still too long: ${retryCount}/${maxChars} chars`);
          // Still too long, return error with fallback suggestions
          return {
            statusCode: 422,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: `AI couldn't shorten to ${maxChars} characters. Try manual editing or remove some content first.`,
              details: `Generated ${retryCount} characters, needed ${maxChars} or fewer`
            }),
          };
        }
      } catch (retryError) {
        console.error('Retry API call failed:', retryError);
        return {
          statusCode: 422,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: `AI couldn't shorten to ${maxChars} characters. Please try manual editing.`,
            details: retryError instanceof Error ? retryError.message : 'Retry failed'
          }),
        };
      }
    }

    const finalCharCount = [...shortenedText].length;
    console.log('Shortening successful:', {
      originalLength: requestData.text.length,
      finalLength: finalCharCount,
      targetLength: maxChars,
      saved: requestData.text.length - finalCharCount
    });

    // Return successful response with both field names for backward compatibility
    const response: ShortenResponse = {
      result: shortenedText,
      shortened: shortenedText, // Backward compatibility
      charCount: finalCharCount,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response),
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