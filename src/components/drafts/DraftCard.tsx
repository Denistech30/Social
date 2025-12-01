import { Trash2, Clock } from 'lucide-react';
import type { Draft } from '../../types';

interface DraftCardProps {
  draft: Draft;
  onLoad: (draft: Draft) => void;
  onDelete: (id: string) => void;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function DraftCard({ draft, onLoad, onDelete }: DraftCardProps) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
      <div onClick={() => onLoad(draft)}>
        <p className="text-sm text-gray-900 mb-2 line-clamp-2">
          {draft.preview}...
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <Clock className="w-3 h-3" />
          <span>{draft.platform}</span>
          <span>•</span>
          <span>{formatTimeAgo(draft.timestamp)}</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(draft)}
          className="flex-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
        >
          Load
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(draft.id);
          }}
          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          aria-label="Delete draft"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
