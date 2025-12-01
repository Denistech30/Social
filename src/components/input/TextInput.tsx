import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { TextSelection } from '../../types';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelectionChange?: (selection: TextSelection) => void;
}

export interface TextInputRef {
  focus: () => void;
  getSelection: () => TextSelection;
  setSelection: (start: number, end: number) => void;
}

const TextInput = forwardRef<TextInputRef, TextInputProps>(({ 
  value, 
  onChange, 
  onSelectionChange 
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    getSelection: () => {
      const textarea = textareaRef.current;
      if (!textarea) return { start: 0, end: 0, text: '' };
      return {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        text: value.substring(textarea.selectionStart, textarea.selectionEnd),
      };
    },
    setSelection: (start: number, end: number) => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(start, end);
      }
    },
  }));

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 600) + 'px';
    }
  }, [value]);

  const handleSelectionChange = () => {
    if (textareaRef.current && onSelectionChange) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      onSelectionChange({
        start: selectionStart,
        end: selectionEnd,
        text: value.substring(selectionStart, selectionEnd),
      });
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor="text-input" className="block text-sm font-semibold text-gray-700 mb-1">
          Your Text
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Type or paste your text below, then use formatting tools to style it
        </p>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder="Write your social media post here..."
          className="w-full min-h-[300px] max-h-[600px] px-6 py-4 text-lg leading-relaxed border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-y placeholder:text-gray-400"
          style={{ 
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '18px',
            lineHeight: '1.6',
          }}
          aria-label="Text input area"
        />
        
        {/* Character count indicator */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm pointer-events-none">
          {value.length} characters
        </div>
      </div>
    </div>
  );
});

TextInput.displayName = 'TextInput';

export default TextInput;
