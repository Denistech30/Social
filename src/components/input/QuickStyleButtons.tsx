import { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { StyleType, QuickStyle } from '../../types';

interface QuickStyleButtonsProps {
  onApply: (style: StyleType) => void;
}

const styles: QuickStyle[] = [
  { id: 'bold-serif', label: 'Bold Serif', example: '𝗬𝗼𝘂𝗿 𝗧𝗲𝘅𝘁' },
  { id: 'italic', label: 'Italic', example: '𝘠𝘰𝘶𝘳 𝘛𝘦𝘹𝘵' },
  { id: 'script', label: 'Script', example: '𝒴ℴ𝓊𝓇 𝒯ℯ𝓍𝓉' },
  { id: 'circle', label: 'Circle', example: 'Ⓨⓞⓤⓡ Ⓣⓔⓧⓣ' },
  { id: 'fraktur', label: 'Fraktur', example: '𝔜𝔬𝔲𝔯 𝔗𝔢𝔵𝔱' },
  { id: 'monospace', label: 'Monospace', example: '𝚈𝚘𝚞𝚛 𝚃𝚎𝚡𝚝' },
];

export default function QuickStyleButtons({ onApply }: QuickStyleButtonsProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleStyles = expanded ? styles : styles.slice(0, 4);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Quick Styles
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
          type="button"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>See All</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 gap-2">
        {visibleStyles.map((style) => (
          <button
            key={style.id}
            onClick={() => onApply(style.id)}
            className="p-3 text-left rounded-lg border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 hover:shadow-md transition-all duration-200 group"
            type="button"
          >
            <div className="text-xs font-medium text-gray-600 mb-1">
              {style.label}
            </div>
            <div className="text-sm text-gray-900 mb-1">
              {style.example}
            </div>
            <div className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Click to apply →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
