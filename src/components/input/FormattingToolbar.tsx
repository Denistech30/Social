import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, Smile } from 'lucide-react';
import FormatButton from './FormatButton';
import HeadingDropdown from './HeadingDropdown';
import type { FormatType } from '../../types';

interface FormattingToolbarProps {
  onFormat: (type: FormatType) => void;
  onEmojiClick: () => void;
}

export default function FormattingToolbar({ onFormat, onEmojiClick }: FormattingToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
      {/* Group 1: Text Styles */}
      <div className="flex items-center gap-1">
        <FormatButton
          icon={Bold}
          label="Bold"
          tooltip="Bold"
          onClick={() => onFormat('bold')}
          shortcut="Ctrl+B"
        />
        <FormatButton
          icon={Italic}
          label="Italic"
          tooltip="Italic"
          onClick={() => onFormat('italic')}
          shortcut="Ctrl+I"
        />
        <FormatButton
          icon={Underline}
          label="Underline"
          tooltip="Underline"
          onClick={() => onFormat('underline')}
          shortcut="Ctrl+U"
        />
        <FormatButton
          icon={Strikethrough}
          label="Strike"
          tooltip="Strikethrough"
          onClick={() => onFormat('strikethrough')}
        />
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Group 2: Headings Dropdown */}
      <HeadingDropdown 
        onSelect={(level) => {
          if (level) onFormat(`heading-${level}` as FormatType);
        }} 
      />

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Group 3: Lists */}
      <div className="flex items-center gap-1">
        <FormatButton
          icon={List}
          label="Bullet"
          tooltip="Bullet List"
          onClick={() => onFormat('bullet-list')}
        />
        <FormatButton
          icon={ListOrdered}
          label="Number"
          tooltip="Numbered List"
          onClick={() => onFormat('numbered-list')}
        />
      </div>

      {/* Vertical Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Group 4: Extras */}
      <div className="flex items-center gap-1">
        <FormatButton
          icon={Smile}
          label="Emoji"
          tooltip="Add Emoji"
          onClick={onEmojiClick}
        />
      </div>
    </div>
  );
}
