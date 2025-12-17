import type { Draft } from '../types';

const STORAGE_KEY = 'textcraft-drafts';
const MAX_DRAFTS = 10;

export function saveDraft(draft: Omit<Draft, 'id' | 'timestamp'>): void {
  try {
    const existingDrafts = loadDrafts();
    
    // Check if there's a recent draft with similar content (within last 5 minutes)
    // to update instead of creating a new one
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentDraftIndex = existingDrafts.findIndex(d => 
      d.timestamp > fiveMinutesAgo && 
      d.platform === draft.platform
    );

    if (recentDraftIndex !== -1) {
      // Update existing recent draft
      existingDrafts[recentDraftIndex] = {
        ...existingDrafts[recentDraftIndex],
        content: draft.content,
        formattedContent: draft.formattedContent,
        preview: draft.preview,
        timestamp: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDrafts));
    } else {
      // Create new draft
      const newDraft: Draft = {
        ...draft,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      
      const updatedDrafts = [newDraft, ...existingDrafts].slice(0, MAX_DRAFTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
    }
  } catch (error) {
    console.error('Failed to save draft:', error);
    // If storage is full, try removing oldest draft
    try {
      const existingDrafts = loadDrafts();
      if (existingDrafts.length > 0) {
        existingDrafts.pop(); // Remove oldest
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDrafts));
        // Try saving again
        saveDraft(draft);
      }
    } catch (retryError) {
      throw new Error('Unable to save draft. Storage is full.');
    }
  }
}

export function loadDrafts(): Draft[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const drafts = JSON.parse(stored);
    // Convert timestamp strings back to Date objects
    return drafts.map((draft: any) => ({
      ...draft,
      timestamp: new Date(draft.timestamp),
    }));
  } catch (error) {
    console.error('Failed to load drafts:', error);
    return [];
  }
}

export function deleteDraft(id: string): void {
  try {
    const drafts = loadDrafts();
    const filtered = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete draft:', error);
    throw new Error('Unable to delete draft.');
  }
}

export function getDraft(id: string): Draft | null {
  const drafts = loadDrafts();
  return drafts.find((draft) => draft.id === id) || null;
}

export function clearAllDrafts(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveNewDraft(draft: Omit<Draft, 'id' | 'timestamp'>): void {
  try {
    const existingDrafts = loadDrafts();
    
    // Always create a new draft (no update logic)
    const newDraft: Draft = {
      ...draft,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    const updatedDrafts = [newDraft, ...existingDrafts].slice(0, MAX_DRAFTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDrafts));
  } catch (error) {
    console.error('Failed to save new draft:', error);
    // If storage is full, try removing oldest draft
    try {
      const existingDrafts = loadDrafts();
      if (existingDrafts.length > 0) {
        existingDrafts.pop(); // Remove oldest
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDrafts));
        // Try saving again
        saveNewDraft(draft);
      }
    } catch (retryError) {
      throw new Error('Unable to save draft. Storage is full.');
    }
  }
}
