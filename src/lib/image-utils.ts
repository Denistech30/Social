/**
 * Image utility functions for the Image Editor
 */

/**
 * Resize image if it's too large for optimal performance
 * @param imageDataUrl - The original image data URL
 * @param maxDimension - Maximum width or height (default: 1600px)
 * @returns Promise<string> - Resized image data URL
 */
export function resizeImageIfNeeded(imageDataUrl: string, maxDimension: number = 1600): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const { width, height } = img;
      
      // Check if resizing is needed
      if (width <= maxDimension && height <= maxDimension) {
        resolve(imageDataUrl);
        return;
      }

      // Calculate new dimensions
      const scale = Math.min(maxDimension / width, maxDimension / height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);

      // Create canvas for resizing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageDataUrl);
        return;
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      // Draw resized image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to data URL
      const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve(resizedDataUrl);
    };

    img.onerror = () => {
      resolve(imageDataUrl);
    };

    img.src = imageDataUrl;
  });
}

/**
 * Generate a filename for the edited image
 * @param prefix - Filename prefix (default: 'textcraft-post')
 * @returns string - Generated filename
 */
export function generateImageFilename(prefix: string = 'textcraft-post'): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-');
  return `${prefix}-${timestamp}.jpg`;
}

/**
 * Convert blob to data URL
 * @param blob - The blob to convert
 * @returns Promise<string> - Data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download blob as file
 * @param blob - The blob to download
 * @param filename - The filename for download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}