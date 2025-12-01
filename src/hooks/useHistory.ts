import { useState, useCallback } from 'react';

interface UseHistoryOptions {
  maxHistory?: number;
}

export function useHistory<T>(initialValue: T, options: UseHistoryOptions = {}) {
  const { maxHistory = 50 } = options;
  
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const current = history[currentIndex];

  const push = useCallback((value: T) => {
    setHistory(prev => {
      // Remove any future history if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new value
      newHistory.push(value);
      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1));
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return current;
  }, [currentIndex, history, current]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return current;
  }, [currentIndex, history, current]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    current,
    push,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
