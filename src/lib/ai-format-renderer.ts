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

export interface FormattedPost {
  platform: string;
  blocks: FormatBlock[];
}

export interface FormatResponse {
  results: FormattedPost[];
}

/**
 * Processes markdown stars (**text**) and converts to Unicode bold
 */
function processMarkdownStars(text: string): string {
  // Replace **text** with Unicode bold text
  return text.replace(/\*\*([^*]+)\*\*/g, (_, content) => {
    return convertToBold(content);
  });
}

/**
 * Applies highlights to a text string (legacy support)
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
          // Process markdown stars first, then apply highlights (if any), then extra bold for main headings
          let processedText = processMarkdownStars(block.text);
          processedText = applyHighlights(processedText, block.highlights);
          renderedParts.push(convertToExtraBold(processedText.toUpperCase()));
        }
        break;

      case 'subheading':
        if (block.text) {
          // Process markdown stars first, then apply highlights, then bold with underline for subheadings
          let processedText = processMarkdownStars(block.text);
          processedText = applyHighlights(processedText, block.highlights);
          renderedParts.push(addUnderline(convertToBold(processedText)));
        }
        break;

      case 'paragraph':
        if (block.text) {
          // Process markdown stars first, then apply highlights to paragraphs
          let processedText = processMarkdownStars(block.text);
          processedText = applyHighlights(processedText, block.highlights);
          renderedParts.push(processedText);
        }
        break;

      case 'bullets':
        if (block.items && block.items.length > 0) {
          // Process markdown stars and apply highlights to each bullet item
          const bulletList = block.items.map(item => {
            let processedItem = processMarkdownStars(item);
            processedItem = applyHighlights(processedItem, block.highlights);
            return `• ${processedItem}`;
          }).join('\n');
          renderedParts.push(bulletList);
        }
        break;

      case 'numbered':
        if (block.items && block.items.length > 0) {
          // Process markdown stars and apply highlights to each numbered item
          const numberedList = block.items.map((item, index) => {
            let processedItem = processMarkdownStars(item);
            processedItem = applyHighlights(processedItem, block.highlights);
            return `${index + 1}. ${processedItem}`;
          }).join('\n');
          renderedParts.push(numberedList);
        }
        break;

      case 'cta':
        if (block.text) {
          // Process markdown stars first, then apply highlights, then make CTA bold
          let processedText = processMarkdownStars(block.text);
          processedText = applyHighlights(processedText, block.highlights);
          renderedParts.push(convertToBold(processedText));
        }
        break;

      case 'hashtags':
        if (block.items && block.items.length > 0) {
          // Process markdown stars and apply highlights to hashtags
          const highlightedHashtags = block.items.map(tag => {
            const properTag = tag.startsWith('#') ? tag : `#${tag}`;
            let processedTag = processMarkdownStars(properTag);
            return applyHighlights(processedTag, block.highlights);
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
          let processedText = processMarkdownStars(block.text);
          processedText = applyHighlights(processedText, block.highlights);
          renderedParts.push(processedText);
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
  text: string
): Promise<FormatResponse> {
  const response = await fetch('/api/format', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}