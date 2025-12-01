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
  canUndo: boolean;
  canRedo: boolean;
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
  canUndo,
  canRedo,
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
          canUndo={canUndo}
          canRedo={canRedo}
        />
      )}

      {/* Quick Style Buttons */}
      <QuickStyleButtons onApply={onQuickStyle} />
    </div>
  );
}
