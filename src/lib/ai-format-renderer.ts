import { convertToExtraBold, convertToBold, addUnderline } from './unicode-transforms';

export interface FormatBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'numbered' | 'cta' | 'hashtags' | 'separator';
  text?: string;
  items?: string[];
}

export interface FormatResponse {
  cleanText: string;
  removedPhrases: string[];
  blocks: FormatBlock[];
}

/**
 * Renders AI format blocks into final formatted text using TextCraft's formatting utilities
 */
export function renderFormatBlocks(blocks: FormatBlock[]): string {
  const renderedParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'heading':
        if (block.text) {
          // Use extra bold for main headings (unicorn heading style)
          renderedParts.push(convertToExtraBold(block.text.toUpperCase()));
        }
        break;

      case 'subheading':
        if (block.text) {
          // Use regular bold with underline for subheadings
          renderedParts.push(addUnderline(convertToBold(block.text)));
        }
        break;

      case 'paragraph':
        if (block.text) {
          // Keep paragraphs as plain text with proper spacing
          renderedParts.push(block.text);
        }
        break;

      case 'bullets':
        if (block.items && block.items.length > 0) {
          // Convert to bullet list
          const bulletList = block.items.map(item => `• ${item}`).join('\n');
          renderedParts.push(bulletList);
        }
        break;

      case 'numbered':
        if (block.items && block.items.length > 0) {
          // Convert to numbered list
          const numberedList = block.items.map((item, index) => `${index + 1}. ${item}`).join('\n');
          renderedParts.push(numberedList);
        }
        break;

      case 'cta':
        if (block.text) {
          // Make CTA bold to stand out
          renderedParts.push(convertToBold(block.text));
        }
        break;

      case 'hashtags':
        if (block.items && block.items.length > 0) {
          // Join hashtags on one line
          const hashtagLine = block.items.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
          renderedParts.push(hashtagLine);
        }
        break;

      case 'separator':
        // Add visual separator
        renderedParts.push('—————————————————————');
        break;

      default:
        // Fallback for unknown block types
        if (block.text) {
          renderedParts.push(block.text);
        }
        break;
    }
  }

  // Join all parts with double line breaks for proper spacing
  return renderedParts.join('\n\n');
}

/**
 * Calls the AI format API
 */
export async function callAIFormatAPI(
  text: string, 
  platform?: string, 
  maxChars?: number,
  options?: {
    tone?: 'neutral' | 'friendly' | 'professional';
    keepHashtags?: boolean;
    keepCTA?: boolean;
  }
): Promise<FormatResponse> {
  const response = await fetch('/api/format', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      platform: platform || 'facebook',
      maxChars,
      options
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}