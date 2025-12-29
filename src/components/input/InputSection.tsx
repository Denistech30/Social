import { useRef } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import TextInput, { TextInputRef } from './TextInput';
import FormattingToolbar from './FormattingToolbar';
import QuickActions from './QuickActions';
import QuickStyleButtons from './QuickStyleButtons';
import { useResponsive } from '../../hooks/useResponsive';
import type { FormatType, TextSelection, StyleType } from '../../types';

interface InputSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSelectionChange: (selection: TextSelection) => void;
  onFormat: (type: FormatType) => void;
  onQuickStyle: (style: StyleType) => void;
  onEmojiClick: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onStripFormatting: () => void;
  onMakeAccessible?: () => void;
  onSaveDraft?: () => void;
  onSaveNewDraft?: () => void;
  onAIFormat?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges?: boolean;
  isAIFormatting?: boolean;
}

export default function InputSection({
  inputText,
  onInputChange,
  onSelectionChange,
  onFormat,
  onQuickStyle,
  onEmojiClick,
  onUndo,
  onRedo,
  onStripFormatting,
  onMakeAccessible,
  onSaveDraft,
  onSaveNewDraft,
  onAIFormat,
  canUndo,
  canRedo,
  hasUnsavedChanges = false,
  isAIFormatting = false,
}: InputSectionProps) {
  const { isMobile } = useResponsive();
  const textInputRef = useRef<TextInputRef>(null);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Formatting Toolbar - Desktop Only */}
      {!isMobile && (
        <FormattingToolbar 
          onFormat={onFormat} 
          onEmojiClick={onEmojiClick} 
        />
      )}

      {/* How it works micro-copy */}
      <div className="flex items-center justify-center px-4 -mt-2 mb-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide text-center leading-relaxed bg-gray-50/50 px-4 py-2 rounded-full border border-gray-200/50">
          Type or paste your text → Format with the toolbar → Copy and paste into your favorite platform
        </p>
      </div>

      {/* Text Input Area */}
      <TextInput
        ref={textInputRef}
        value={inputText}
        onChange={onInputChange}
        onSelectionChange={onSelectionChange}
      />

      {/* AI Format Button */}
      {onAIFormat && (
        <div className="flex justify-center">
          <button
            onClick={onAIFormat}
            disabled={!inputText.trim() || isAIFormatting}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              !inputText.trim() || isAIFormatting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
            type="button"
          >
            {isAIFormatting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Formatting…</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>AI Format</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Quick Undo/Redo Actions - Desktop Only */}
      {!isMobile && (
        <QuickActions
          onUndo={onUndo}
          onRedo={onRedo}
          onStripFormatting={onStripFormatting}
          onMakeAccessible={onMakeAccessible}
          onSaveDraft={onSaveDraft}
          onSaveNewDraft={onSaveNewDraft}
          canUndo={canUndo}
          canRedo={canRedo}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      )}

      {/* Quick Style Buttons */}
      <QuickStyleButtons onApply={onQuickStyle} />
    </div>
  );
}
