import type { AccessibilityScore } from '../types';

// Count Unicode formatting characters
function countUnicodeFormatting(text: string): number {
  let count = 0;
  
  // Check for Unicode formatting characters (mathematical alphanumeric symbols)
  for (const char of text) {
    const code = char.charCodeAt(0);
    // Mathematical Alphanumeric Symbols range: U+1D400 to U+1D7FF
    if (code >= 0x1D400 && code <= 0x1D7FF) {
      count++;
    }
    // Combining characters (strikethrough, underline)
    if (code >= 0x0300 && code <= 0x036F) {
      count++;
    }
  }
  
  return count;
}

export function calculateAccessibilityScore(text: string): AccessibilityScore {
  if (!text || text.trim().length === 0) {
    return {
      score: 100,
      status: 'excellent',
      message: '✓ Accessible to screen readers',
    };
  }

  let score = 100;
  
  const unicodeFormattingCount = countUnicodeFormatting(text);
  const totalChars = Array.from(text).length;
  const formattingPercentage = totalChars > 0 ? (unicodeFormattingCount / totalChars) * 100 : 0;
  
  // Deduct points based on formatting percentage
  if (formattingPercentage > 50) {
    score -= 60;
  } else if (formattingPercentage > 30) {
    score -= 40;
  } else if (formattingPercentage > 10) {
    score -= 20;
  }
  
  // Determine status and message
  if (score >= 80) {
    return {
      score,
      status: 'excellent',
      message: '✓ Accessible to screen readers',
    };
  } else if (score >= 60) {
    return {
      score,
      status: 'good',
      message: '⚠️ Mostly accessible with minor issues',
    };
  } else if (score >= 40) {
    return {
      score,
      status: 'fair',
      message: '⚠️ May be difficult for screen readers',
    };
  } else {
    return {
      score,
      status: 'poor',
      message: '❌ Not accessible to screen readers',
    };
  }
}

export function generatePlainVersion(formattedText: string): string {
  // Remove all Unicode formatting by normalizing
  let plain = formattedText;
  
  // Remove combining characters (strikethrough, underline)
  plain = plain.replace(/[\u0300-\u036F]/g, '');
  
  // This is a simplified version - in production you'd want to map back
  // Unicode characters to their ASCII equivalents
  return plain;
}
