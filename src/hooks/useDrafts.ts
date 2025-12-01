import { useState, useEffect } from 'react';
import type { Draft } from '../types';
import { loadDrafts, saveDraft, deleteDraft as deleteDraftFromStorage } from '../lib/storage';

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const addDraft = (content: string, platform: string, formattedContent: string) => {
    const preview = content.slice(0, 50);
    saveDraft({ content, platform, preview, formattedContent });
    setDrafts(loadDrafts());
  };

  const deleteDraft = (id: string) => {
    deleteDraftFromStorage(id);
    setDrafts(loadDrafts());
  };

  const refreshDrafts = () => {
    setDrafts(loadDrafts());
  };

  return { drafts, addDraft, deleteDraft, refreshDrafts };
}
