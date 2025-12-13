import { useState } from 'react';
import { 
  Bold, 
  Italic, 
  List, 
  MoreHorizontal, 
  ChevronDown,
  Underline,
  Strikethrough,
  Heading1,
  Smile,
  ListOrdered,
  Eraser,
  Undo2,
  Redo2,
  Save
} from 'lucide-react';
import MobileFormatButton from './MobileFormatButton';
import type { FormatType } from '../../types';

interface MobileFormattingToolbarProps {
  onFormat: (type: FormatType) => void;
  onEmojiClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onStripFormatting: () => void;
  onSaveDraft?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges?: boolean;
}

export default function MobileFormattingToolbar({
  onFormat,
  onEmojiClick,
  onUndo,
  onRedo,
  onStripFormatting,
  onSaveDraft,
  canUndo,
  canRedo,
  hasUnsavedChanges = false,
}: MobileFormattingToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Fixed bottom toolbar */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)'
        }}
      >
        {/* Primary Buttons Row - Always Visible */}
        <div className="flex items-center gap-2 p-2 overflow-x-auto scrollbar-hide">
          <MobileFormatButton
            icon={<Bold className="w-5 h-5" />}
            label="Bold"
            onClick={() => onFormat('bold')}
          />
          <MobileFormatButton
            icon={<Italic className="w-5 h-5" />}
            label="Italic"
            onClick={() => onFormat('italic')}
          />
          <MobileFormatButton
            icon={<List className="w-5 h-5" />}
            label="List"
            onClick={() => onFormat('bullet-list')}
          />
          <MobileFormatButton
            icon={<Smile className="w-5 h-5" />}
            label="Emoji"
            onClick={onEmojiClick}
          />

          {/* More Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="min-w-[56px] h-12 px-3 flex flex-col items-center justify-center gap-0.5 bg-gray-100 rounded-lg active:bg-gray-200 transition-colors touch-manipulation"
            aria-label={expanded ? 'Show less options' : 'Show more options'}
            type="button"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-700" />
            ) : (
              <MoreHorizontal className="w-5 h-5 text-gray-700" />
            )}
            <span className="text-[10px] font-medium text-gray-700">
              {expanded ? 'Less' : 'More'}
            </span>
          </button>
        </div>

        {/* Expanded Options */}
        {expanded && (
          <div className={`p-2 pt-0 grid gap-2 border-t border-gray-100 ${onSaveDraft ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <MobileFormatButton
              icon={<Underline className="w-5 h-5" />}
              label="Underline"
              onClick={() => onFormat('underline')}
            />
            <MobileFormatButton
              icon={<Strikethrough className="w-5 h-5" />}
              label="Strike"
              onClick={() => onFormat('strikethrough')}
            />
            <MobileFormatButton
              icon={<Heading1 className="w-5 h-5" />}
              label="Header"
              onClick={() => onFormat('heading-1')}
            />
            <MobileFormatButton
              icon={<ListOrdered className="w-5 h-5" />}
              label="Numbers"
              onClick={() => onFormat('numbered-list')}
            />
            <MobileFormatButton
              icon={<Eraser className="w-5 h-5" />}
              label="Clear"
              onClick={onStripFormatting}
            />
            {onSaveDraft && (
              <button
                onClick={onSaveDraft}
                disabled={!hasUnsavedChanges}
                className={`min-w-[56px] h-12 px-3 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors touch-manipulation ${
                  hasUnsavedChanges
                    ? 'bg-blue-50 border-2 border-blue-300 text-blue-700'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
                type="button"
              >
                <Save className="w-5 h-5" />
                <span className="text-[10px] font-medium">Save</span>
              </button>
            )}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`min-w-[56px] h-12 px-3 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors touch-manipulation ${
                canUndo 
                  ? 'bg-white border-2 border-gray-300 text-gray-700' 
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}
              type="button"
            >
              <Undo2 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Undo</span>
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`min-w-[56px] h-12 px-3 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors touch-manipulation ${
                canRedo 
                  ? 'bg-white border-2 border-gray-300 text-gray-700' 
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }`}
              type="button"
            >
              <Redo2 className="w-5 h-5" />
              <span className="text-[10px] font-medium">Redo</span>
            </button>
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind toolbar */}
      <div className="h-20 md:hidden" />
    </>
  );
}
