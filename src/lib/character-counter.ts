import type { CharacterCount } from '../types';

export function countCharacters(text: string, platformLimit: number): CharacterCount {
  // Plain text count (without Unicode formatting)
  const plainTextCount = text.length;
  
  // Unicode count (actual character count including combining characters)
  const unicodeCount = Array.from(text).length;
  
  // Calculate percentage
  const percentage = (unicodeCount / platformLimit) * 100;
  
  return {
    plainTextCount,
    unicodeCount,
    platformLimit,
    percentage,
  };
}

export function getCounterColor(percentage: number): string {
  if (percentage < 80) return '#10B981'; // Green
  if (percentage < 95) return '#F59E0B'; // Yellow
  return '#EF4444'; // Red
}
