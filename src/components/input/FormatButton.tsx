import { LucideIcon } from 'lucide-react';

interface FormatButtonProps {
  icon: LucideIcon;
  label: string;
  tooltip: string;
  onClick: () => void;
  active?: boolean;
  shortcut?: string;
}

export default function FormatButton({ 
  icon: Icon, 
  label, 
  tooltip, 
  onClick, 
  active = false,
  shortcut 
}: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
        {tooltip}
        {shortcut && <span className="ml-1 text-gray-400">({shortcut})</span>}
      </div>
    </button>
  );
}
