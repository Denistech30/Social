import { FileText } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-base font-medium text-gray-600 mb-1">No drafts saved yet</p>
      <p className="text-sm text-gray-400">Drafts are saved automatically every 10 seconds</p>
    </div>
  );
}
