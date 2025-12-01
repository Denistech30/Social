/**
 * LinkedIn Algorithm Analyzer
 * Solves: "My LinkedIn posts get 60-80% less reach when using formatting"
 */

import type { LinkedInAnalysis } from '../types';
import { stripFormatting } from './unicode-transforms';

export function analyzeForLinkedIn(text: string): LinkedInAnalysis {
  let reachScore = 100;
  const issues: string[] = [];

  if (!text || text.length === 0) {
    return {
      reachScore: 100,
      charCount: 0,
      hashtagCount: 0,
      formattingPercentage: 0,
      hasExternalLink: false,
      hasEngagementBait: false,
      issues: [],
    };
  }

  // 1. Check character count
  const charCount = text.length;
  if (charCount < 800 || charCount > 1000) {
    reachScore -= 15;
    if (charCount < 800) {
      issues.push(`Post is too short (${charCount} chars). Aim for 800-1000.`);
    } else if (charCount > 1500) {
      issues.push(`Post is too long (${charCount} chars). Optimal is 800-1000.`);
    }
  }

  // 2. Count hashtags
  const hashtagCount = (text.match(/#\w+/g) || []).length;
  if (hashtagCount > 5) {
    reachScore -= 25;
    issues.push(`Too many hashtags (${hashtagCount}). Use maximum 5.`);
  }

  // 3. Calculate formatting percentage
  const formattedChars = countUnicodeFormattedChars(text);
  const formattingPercentage = charCount > 0 ? (formattedChars / charCount) * 100 : 0;
  
  if (formattingPercentage > 20) {
    reachScore -= 30;
    issues.push(`Heavy formatting (${Math.round(formattingPercentage)}%). Keep under 20%.`);
  }

  // 4. Check for external links
  const hasExternalLink = /https?:\/\//.test(text);
  if (hasExternalLink) {
    reachScore -= 20;
    issues.push("External links reduce reach by 34%. Move to first comment.");
  }

  // 5. Check for engagement bait
  const engagementBaitPhrases = [
    'like if',
    'comment below',
    'share this',
    'tag someone',
    'double tap',
    'agree?',
    'thoughts?',
  ];
  const hasEngagementBait = engagementBaitPhrases.some(phrase => 
    text.toLowerCase().includes(phrase)
  );
  if (hasEngagementBait) {
    reachScore -= 15;
    issues.push("Engagement bait detected. LinkedIn penalizes these phrases.");
  }

  return {
    reachScore: Math.max(0, reachScore),
    charCount,
    hashtagCount,
    formattingPercentage,
    hasExternalLink,
    hasEngagementBait,
    issues,
  };
}

export function optimizeForLinkedIn(text: string): string {
  let optimized = text;

  // 1. Remove excessive formatting (keep only first line bold)
  const lines = optimized.split('\n');
  if (lines.length > 1) {
    // Keep first line formatted as headline
    const restPlain = lines.slice(1).map(line => stripFormatting(line));
    optimized = [lines[0], ...restPlain].join('\n');
  }

  // 2. Limit hashtags to 5
  const hashtags = optimized.match(/#\w+/g) || [];
  if (hashtags.length > 5) {
    const removedHashtags = hashtags.slice(5);
    removedHashtags.forEach(tag => {
      optimized = optimized.replace(tag, '');
    });
  }

  // 3. Remove external links (suggest adding to comment)
  optimized = optimized.replace(/https?:\/\/[^\s]+/g, '[Link moved to comments]');

  // 4. Remove engagement bait phrases
  optimized = optimized.replace(/like if you agree/gi, '');
  optimized = optimized.replace(/comment below/gi, '');
  optimized = optimized.replace(/tag someone/gi, '');

  // 5. Clean up extra whitespace
  optimized = optimized.replace(/\n{3,}/g, '\n\n');
  optimized = optimized.trim();

  return optimized;
}

function countUnicodeFormattedChars(text: string): number {
  let count = 0;
  
  const unicodeRanges: [number, number][] = [
    [0x1D400, 0x1D7FF], // Mathematical Alphanumeric Symbols
    [0x24B6, 0x24EA],   // Enclosed Alphanumerics  
    [0xFF01, 0xFF5E],   // Fullwidth Forms
  ];

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    for (const [start, end] of unicodeRanges) {
      if (code >= start && code <= end) {
        count++;
        break;
      }
    }
  }

  return count;
}
