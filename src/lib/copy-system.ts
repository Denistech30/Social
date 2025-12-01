/**
 * Multi-tier copy system with 3 fallback methods
 * Solves: "Copy button doesn't work on Android", "Shows question marks"
 */

import type { CopyFormat, CopyResult } from '../types';
import { stripFormatting } from './unicode-transforms';

export async function smartCopy(
  text: string,
  format: CopyFormat = 'unicode'
): Promise<CopyResult> {
  // Prepare different formats
  const formats = {
    unicode: text,
    plain: stripFormatting(text),
    html: convertToHTML(text),
    markdown: convertToMarkdown(text),
  };

  const textToCopy = formats[format];

  // Method 1: Modern Clipboard API with multiple MIME types
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const clipboardItems: Record<string, Blob> = {
        'text/plain': new Blob([formats.plain], { type: 'text/plain' }),
      };

      // Add Unicode text
      if (format === 'unicode') {
        clipboardItems['text/plain'] = new Blob([formats.unicode], { type: 'text/plain' });
      }

      const clipboardItem = new ClipboardItem(clipboardItems);
      await navigator.clipboard.write([clipboardItem]);

      return { success: true, method: 'modern', format };
    }
  } catch (error) {
    console.warn('Modern clipboard API failed, trying standard method:', error);
  }

  // Method 2: Standard Clipboard API (simpler)
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
      return { success: true, method: 'standard', format };
    }
  } catch (error) {
    console.warn('Standard clipboard API failed, trying legacy method:', error);
  }

  // Method 3: Legacy execCommand (for older browsers)
  return execCommandCopy(textToCopy, format);
}

function execCommandCopy(text: string, format: CopyFormat): CopyResult {
  const textarea = document.createElement('textarea');

  // Style textarea to be invisible but accessible
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');

  document.body.appendChild(textarea);

  try {
    // Select the text
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    // Execute copy command
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    return {
      success: successful,
      method: successful ? 'legacy' : 'failed',
      format
    };
  } catch (error) {
    document.body.removeChild(textarea);
    return { success: false, method: 'failed', format };
  }
}

// Convert to HTML with proper tags
function convertToHTML(text: string): string {
  let html = text;
  html = html.replace(/\n/g, '<br>');
  return `<div>${html}</div>`;
}

// Convert to Markdown
function convertToMarkdown(text: string): string {
  return text;
}
