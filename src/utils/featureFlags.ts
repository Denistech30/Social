/**
 * Feature flags and localStorage utilities for QR onboarding
 * Handles SSR safety and localStorage access
 */

// QR feature localStorage keys
export const QR_STORAGE_KEYS = {
  QR_SEEN: 'textcraft_qr_seen',
  QR_TOOLTIP_SEEN: 'textcraft_qr_tooltip_seen',
  QR_COPY_NUDGE_COUNT: 'textcraft_qr_copy_nudge_count',
} as const;

/**
 * Safely get value from localStorage with SSR protection
 */
function getStorageValue(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.warn(`Failed to read from localStorage (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Safely set value in localStorage with SSR protection
 */
function setStorageValue(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn(`Failed to write to localStorage (${key}):`, error);
  }
}

/**
 * Check if user has seen QR feature (clicked button or dismissed badge)
 */
export function hasSeenQRFeature(): boolean {
  return getStorageValue(QR_STORAGE_KEYS.QR_SEEN) === '1';
}

/**
 * Mark QR feature as seen (user clicked button or dismissed badge)
 */
export function markQRFeatureAsSeen(): void {
  setStorageValue(QR_STORAGE_KEYS.QR_SEEN, '1');
}

/**
 * Check if user has seen the QR tooltip
 */
export function hasSeenQRTooltip(): boolean {
  return getStorageValue(QR_STORAGE_KEYS.QR_TOOLTIP_SEEN) === '1';
}

/**
 * Mark QR tooltip as seen
 */
export function markQRTooltipAsSeen(): void {
  setStorageValue(QR_STORAGE_KEYS.QR_TOOLTIP_SEEN, '1');
}

/**
 * Get current copy nudge count
 */
export function getCopyNudgeCount(): number {
  const count = getStorageValue(QR_STORAGE_KEYS.QR_COPY_NUDGE_COUNT, '0');
  return parseInt(count, 10) || 0;
}

/**
 * Increment copy nudge count
 */
export function incrementCopyNudgeCount(): number {
  const currentCount = getCopyNudgeCount();
  const newCount = currentCount + 1;
  setStorageValue(QR_STORAGE_KEYS.QR_COPY_NUDGE_COUNT, newCount.toString());
  return newCount;
}

/**
 * Check if copy nudge should be shown
 * Show max 3 times OR until user opens QR once
 */
export function shouldShowCopyNudge(): boolean {
  if (hasSeenQRFeature()) return false;
  return getCopyNudgeCount() < 3;
}

/**
 * Track GA4 events for QR feature
 */
export function trackQREvent(eventName: string, parameters?: Record<string, any>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  
  try {
    window.gtag('event', eventName, {
      event_category: 'qr_feature',
      ...parameters,
    });
  } catch (error) {
    console.warn(`Failed to track QR event (${eventName}):`, error);
  }
}

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}