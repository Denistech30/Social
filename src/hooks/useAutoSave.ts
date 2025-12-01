import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  onSave: () => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutoSave({ onSave, delay = 10000, enabled = true }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onSave();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onSave, delay, enabled]);
}
