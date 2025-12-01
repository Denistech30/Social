import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  onSave: () => void;
  delay?: number;
  enabled?: boolean;
  content: string; // Track content to detect actual changes
}

export function useAutoSave({ onSave, delay = 30000, enabled = true, content }: UseAutoSaveOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedContentRef = useRef<string>('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip first render to avoid saving empty content
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled) return;

    // Don't save if content hasn't changed since last save
    if (content === lastSavedContentRef.current) return;

    // Don't save empty content
    if (!content.trim()) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      // Double-check content has changed before saving
      if (content !== lastSavedContentRef.current && content.trim()) {
        lastSavedContentRef.current = content;
        onSave();
      }
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, enabled]); // Removed onSave from dependencies to prevent re-triggering
}
