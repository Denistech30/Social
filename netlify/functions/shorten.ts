import { Handler } from '@netlify/functions';
import { HfInference } from '@huggingface/inference';

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
  platform: Platform;
  limit?: number;
  options?: {
    keepHashtags?: boolean;
    keepCTA?: boolean;
    tone?: 'neutral' | 'friendly' | 'professional';
  };
}

interface ShortenResponse {
  result: string;
  charCount: number;
}

interface ErrorResponse {
  error: string;
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

export const handler: Handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Check HF token
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
      console.error('HF_TOKEN environment variable not set');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'AI service not configured' }),
      };
    }

    // Rate limiting
    const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
    cleanupRateLimit();
    
    if (!checkRateLimit(clientIP)) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Request body is required' }),
      };
    }

    let requestData: ShortenRequest;
    try {
      requestData = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Invalid JSON in request body' }),
      };
    }

    // Validate required fields
    if (!requestData.text || typeof requestData.text !== 'string') {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Text field is required and must be a string' }),
      };
    }

    if (!requestData.platform || !(requestData.platform in PLATFORM_LIMITS)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ 
          error: `Platform must be one of: ${Object.keys(PLATFORM_LIMITS).join(', ')}` 
        }),
      };
    }

    // Validate text length (prevent abuse)
    if (requestData.text.length > 8000) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Text too long. Maximum 8000 characters allowed.' }),
      };
    }

    if (requestData.text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: 'Text cannot be empty' }),
      };
    }

    // Get platform limit
    const limit = requestData.limit || PLATFORM_LIMITS[requestData.platform];
    const options = requestData.options || {};

    // Initialize Hugging Face client
    const hf = new HfInference(hfToken);

    // Construct the prompt
    const systemMessage = `You are a rewriting assistant for social media posts. Your task is to rewrite text to fit character limits while preserving meaning, key facts, and call-to-action.

CRITICAL RULES:
- Must output a single rewritten version only
- Must be <= ${limit} characters (hard requirement)
- No truncation, no "…"; rewrite instead
- Keep line breaks if possible
- Preserve the core message and meaning
- ${options.keepHashtags ? 'Keep hashtags' : 'Hashtags can be removed if needed'}
- ${options.keepCTA ? 'Keep call-to-action phrases' : 'CTA can be shortened if needed'}
- Use ${options.tone || 'neutral'} tone`;

    const userMessage = `Platform: ${requestData.platform.toUpperCase()}
Character limit: ${limit}
Original text (${requestData.text.length} characters):

${requestData.text}

Rewrite this to fit within ${limit} characters while preserving the core message.`;

    // Call Hugging Face API using text generation
    let rewrittenText: string;
    try {
      const prompt = `${systemMessage}\n\n${userMessage}\n\nRewritten text:`;
      
      const response = await hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          return_full_text: false,
          stop: ['\n\n', 'Original:', 'User:'],
        }
      });

      rewrittenText = response.generated_text?.trim() || '';
      
      if (!rewrittenText) {
        throw new Error('No response from AI model');
      }
    } catch (aiError) {
      console.error('AI API Error:', aiError);
      
      // Fallback: try a simpler approach with GPT-2
      try {
        const simplePrompt = `Rewrite this social media post to be under ${limit} characters while keeping the main message:\n\n"${requestData.text}"\n\nRewritten:`;
        
        const fallbackResponse = await hf.textGeneration({
          model: 'gpt2',
          inputs: simplePrompt,
          parameters: {
            max_new_tokens: 100,
            temperature: 0.7,
            return_full_text: false,
            stop: ['\n\n', '"'],
          }
        });

        rewrittenText = fallbackResponse.generated_text?.trim() || '';
        
        if (!rewrittenText) {
          throw new Error('No response from fallback model');
        }
      } catch (fallbackError) {
        console.error('Fallback AI Error:', fallbackError);
        return {
          statusCode: 503,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            error: 'AI service temporarily unavailable. Please try again later.' 
          }),
        };
      }
    }

    // Validate output length
    const charCount = [...rewrittenText].length; // Proper Unicode count
    
    if (charCount > limit) {
      // Try once more with stricter instruction
      try {
        const retryPrompt = `Make this text shorter (max ${limit} characters): "${rewrittenText}"\n\nShorter version:`;
        
        const retryResponse = await hf.textGeneration({
          model: 'gpt2',
          inputs: retryPrompt,
          parameters: {
            max_new_tokens: 80,
            temperature: 0.5,
            return_full_text: false,
            stop: ['\n\n', '"'],
          }
        });

        const retryText = retryResponse.generated_text?.trim() || rewrittenText;
        const retryCount = [...retryText].length;
        
        if (retryCount <= limit) {
          rewrittenText = retryText;
        } else {
          // Still too long, return error with fallback suggestions
          return {
            statusCode: 422,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ 
              error: `AI couldn't shorten to ${limit} characters. Try manual editing or remove some content first.`,
              suggestions: [
                'Remove emojis and extra punctuation',
                'Shorten hashtags or move them to comments',
                'Remove filler words like "really", "very", "just"',
                'Use abbreviations where appropriate',
                'Split into multiple posts if needed'
              ]
            }),
          };
        }
      } catch (retryError) {
        console.error('Retry AI Error:', retryError);
        return {
          statusCode: 422,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ 
            error: `AI couldn't shorten to ${limit} characters. Please try manual editing.`,
            suggestions: [
              'Remove emojis and extra punctuation',
              'Shorten hashtags or move them to comments',
              'Remove filler words like "really", "very", "just"',
              'Use abbreviations where appropriate',
              'Split into multiple posts if needed'
            ]
          }),
        };
      }
    }

    // Return successful response
    const response: ShortenResponse = {
      result: rewrittenText,
      charCount: [...rewrittenText].length,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      }),
    };
  }
};