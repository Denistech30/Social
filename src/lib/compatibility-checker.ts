/**
 * Font Compatibility Checker
 * Solves: "Text shows as white boxes (tofu) on some platforms"
 */

import type { PlatformCompatibility } from '../types';
import { platforms } from './platforms';

// Define Unicode ranges that have issues on specific platforms
const platformIssues: Record<string, [number, number][]> = {
  twitter: [
    [0x1F900, 0x1F9FF], // Some newer emojis not supported
  ],
  instagram: [
    [0x24B6, 0x24EA],   // Enclosed alphanumerics sometimes fail on old Android
  ],
  facebook: [
    [0x1D400, 0x1D7FF], // Math symbols occasionally broken on mobile
  ],
  tiktok: [
    [0xFF01, 0xFF5E],   // Fullwidth forms may not render
  ],
  linkedin: [
    [0x1D400, 0x1D7FF], // Algorithm flags heavy Unicode
  ],
  threads: [], // Generally good support
};

export function testPlatformCompatibility(text: string): PlatformCompatibility[] {
  return platforms.map(platform => {
    const issues: string[] = [];
    let unsupportedCount = 0;
    const problematicRanges = platformIssues[platform.id] || [];

    // Count characters in problematic ranges
    for (const char of text) {
      const code = char.codePointAt(0) || 0;
      
      for (const [start, end] of problematicRanges) {
        if (code >= start && code <= end) {
          unsupportedCount++;
          break;
        }
      }
    }

    // Calculate support percentage
    const totalFormatted = countFormattedChars(text);
    const supportPercentage = totalFormatted > 0
      ? Math.round(((totalFormatted - unsupportedCount) / totalFormatted) * 100)
      : 100;

    // Add specific issues
    if (unsupportedCount > 0) {
      issues.push(`${unsupportedCount} characters may not display correctly`);
    }

    // Platform-specific warnings
    if (platform.id === 'linkedin' && totalFormatted > text.length * 0.2) {
      issues.push('Heavy formatting may reduce reach');
    }

    if (platform.id === 'twitter' && text.length > 280) {
      issues.push('Exceeds character limit');
    }

    return {
      platform: platform.id,
      platformName: platform.name,
      compatible: supportPercentage >= 95,
      supportPercentage,
      issues,
    };
  });
}

function countFormattedChars(text: string): number {
  let count = 0;
  
  const formattedRanges: [number, number][] = [
    [0x1D400, 0x1D7FF], // Math symbols
    [0x24B6, 0x24EA],   // Enclosed alphanumerics
    [0xFF01, 0xFF5E],   // Fullwidth
    [0x1F100, 0x1F1FF], // Enclosed supplemental
  ];

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    for (const [start, end] of formattedRanges) {
      if (code >= start && code <= end) {
        count++;
        break;
      }
    }
  }

  return count;
}

export function getCompatibilitySummary(text: string): {
  avgSupport: number;
  hasIssues: boolean;
  worstPlatform: string | null;
} {
  const results = testPlatformCompatibility(text);
  const avgSupport = Math.round(
    results.reduce((sum, c) => sum + c.supportPercentage, 0) / results.length
  );
  const hasIssues = results.some(c => !c.compatible);
  const worst = results.reduce((min, c) => 
    c.supportPercentage < min.supportPercentage ? c : min
  );

  return {
    avgSupport,
    hasIssues,
    worstPlatform: hasIssues ? worst.platformName : null,
  };
}
