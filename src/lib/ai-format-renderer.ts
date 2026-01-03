import { convertToExtraBold, convertToBold, addUnderline, convertToItalic } from './unicode-transforms';

export interface HighlightSpan {
  text: string; // exact substring from the block
  style?: 'bold' | 'italic' | 'underline'; // optional, default bold
}

export interface FormatBlock {
  type: 'heading' | 'subheading' | 'paragraph' | 'bullets' | 'numbered' | 'cta' | 'hashtags' | 'separator';
  text?: string;
  items?: string[];
  highlights?: HighlightSpan[];
}

export interface FormatResponse {
  cleanText: string;
  removedPhrases: string[];
  blocks: FormatBlock[];
}

/**
 * Applies highlights to a text string
 */
function applyHighlights(text: string, highlights?: HighlightSpan[]): string {
  if (!highlights || highlights.length === 0) {
    return text;
  }

  let result = text;
  
  // Sort highlights by position (longest first to avoid conflicts)
  const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);
  
  for (const highlight of sortedHighlights) {
    const { text: highlightText, style = 'bold' } = highlight;
    
    // Find the highlight text in the result
    const index = result.indexOf(highlightText);
    if (index === -1) continue;
    
    // Apply the appropriate style transformation
    let styledText: string;
    switch (style) {
      case 'bold':
        styledText = convertToBold(highlightText);
        break;
      case 'italic':
        styledText = convertToItalic(highlightText);
        break;
      case 'underline':
        styledText = addUnderline(highlightText);
        break;
      default:
        styledText = convertToBold(highlightText);
    }
    
    // Replace the text with the styled version
    result = result.substring(0, index) + styledText + result.substring(index + highlightText.length);
  }
  
  return result;
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
          // Apply highlights first, then extra bold for main headings
          const highlightedText = applyHighlights(block.text, block.highlights);
          renderedParts.push(convertToExtraBold(highlightedText.toUpperCase()));
        }
        break;

      case 'subheading':
        if (block.text) {
          // Apply highlights first, then bold with underline for subheadings
          const highlightedText = applyHighlights(block.text, block.highlights);
          renderedParts.push(addUnderline(convertToBold(highlightedText)));
        }
        break;

      case 'paragraph':
        if (block.text) {
          // Apply highlights to paragraphs, keep as plain text with proper spacing
          const highlightedText = applyHighlights(block.text, block.highlights);
          renderedParts.push(highlightedText);
        }
        break;

      case 'bullets':
        if (block.items && block.items.length > 0) {
          // Apply highlights to each bullet item
          const bulletList = block.items.map(item => {
            const highlightedItem = applyHighlights(item, block.highlights);
            return `• ${highlightedItem}`;
          }).join('\n');
          renderedParts.push(bulletList);
        }
        break;

      case 'numbered':
        if (block.items && block.items.length > 0) {
          // Apply highlights to each numbered item
          const numberedList = block.items.map((item, index) => {
            const highlightedItem = applyHighlights(item, block.highlights);
            return `${index + 1}. ${highlightedItem}`;
          }).join('\n');
          renderedParts.push(numberedList);
        }
        break;

      case 'cta':
        if (block.text) {
          // Apply highlights first, then make CTA bold to stand out
          const highlightedText = applyHighlights(block.text, block.highlights);
          renderedParts.push(convertToBold(highlightedText));
        }
        break;

      case 'hashtags':
        if (block.items && block.items.length > 0) {
          // Apply highlights to hashtags, join on one line
          const highlightedHashtags = block.items.map(tag => {
            const properTag = tag.startsWith('#') ? tag : `#${tag}`;
            return applyHighlights(properTag, block.highlights);
          });
          const hashtagLine = highlightedHashtags.join(' ');
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
          const highlightedText = applyHighlights(block.text, block.highlights);
          renderedParts.push(highlightedText);
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