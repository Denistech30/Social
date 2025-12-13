import { useRef } from 'react';
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
  canUndo: boolean;
  canRedo: boolean;
  hasUnsavedChanges?: boolean;
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
  canUndo,
  canRedo,
  hasUnsavedChanges = false,
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

      {/* Quick Undo/Redo Actions - Desktop Only */}
      {!isMobile && (
        <QuickActions
          onUndo={onUndo}
          onRedo={onRedo}
          onStripFormatting={onStripFormatting}
          onMakeAccessible={onMakeAccessible}
          onSaveDraft={onSaveDraft}
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
