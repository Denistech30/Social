import { X } from 'lucide-react';
import type { Draft } from '../../types';
import DraftCard from './DraftCard';
import EmptyState from './EmptyState';

interface DraftsSidebarProps {
  isOpen: boolean;
  drafts: Draft[];
  onClose: () => void;
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (id: string) => void;
}

export default function DraftsSidebar({
  isOpen,
  drafts,
  onClose,
  onLoadDraft,
  onDeleteDraft,
}: DraftsSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">My Drafts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close drafts"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {drafts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onLoad={onLoadDraft}
                  onDelete={onDeleteDraft}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
