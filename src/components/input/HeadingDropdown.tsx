import { useState } from 'react';
import { ChevronDown, Heading1, Heading2, Heading3, Heading4, Type } from 'lucide-react';

interface HeadingDropdownProps {
  onSelect: (level: 1 | 2 | 3 | 4 | null) => void;
}

const headings = [
  { value: null, label: 'Normal', icon: Type },
  { value: 1, label: 'Heading 1', icon: Heading1 },
  { value: 2, label: 'Heading 2', icon: Heading2 },
  { value: 3, label: 'Heading 3', icon: Heading3 },
  { value: 4, label: 'Heading 4', icon: Heading4 },
] as const;

export default function HeadingDropdown({ onSelect }: HeadingDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<typeof headings[number]>(headings[0]);

  const handleSelect = (heading: typeof headings[number]) => {
    setSelected(heading);
    setIsOpen(false);
    if (heading.value !== null) {
      onSelect(heading.value);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-3 rounded-lg flex items-center gap-2 bg-white border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 transition-all duration-200"
        type="button"
      >
        <span className="text-gray-500">#</span>
        <span>{selected.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 min-w-[160px]">
            {headings.map((heading) => {
              const Icon = heading.icon;
              return (
                <button
                  key={heading.label}
                  onClick={() => handleSelect(heading)}
                  className="w-full px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-100 transition-colors flex items-center gap-2 text-left"
                  type="button"
                >
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span>{heading.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
