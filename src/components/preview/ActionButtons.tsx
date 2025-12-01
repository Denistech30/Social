import { useState } from 'react';
import { Copy, Save, X, Check, Loader2, Info } from 'lucide-react';
import { smartCopy } from '../../lib/copy-system';
import type { CopyFormat } from '../../types';
import { useResponsive } from '../../hooks/useResponsive';

interface ActionButtonsProps {
  text: string;
  onSave: () => void;
  onClear: () => void;
}

export default function ActionButtons({ text, onSave, onClear }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [copyMethod, setCopyMethod] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showFormats, setShowFormats] = useState(false);
  const { isMobile } = useResponsive();

  const handleCopy = async (format: CopyFormat = 'unicode') => {
    if (!text) return;

    const result = await smartCopy(text, format);

    if (result.success) {
      setCopied(true);
      setCopyMethod(result.method);
      setTimeout(() => {
        setCopied(false);
        setShowFormats(false);
      }, 2000);
    } else {
      // Show manual copy fallback
      setShowFormats(true);
    }
  };

  const handleSave = async () => {
    if (!text) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Primary Copy Button */}
      <button
        onClick={() => handleCopy('unicode')}
        disabled={!text}
        className={`w-full h-12 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
          copied 
            ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30' 
            : 'bg-green-500 hover:bg-green-600 shadow-green-500/30 active:scale-95'
        } disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none`}
        type="button"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copy Formatted Text</span>
          </>
        )}
      </button>

      {/* Alternative Format Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleCopy('plain')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy Plain
        </button>
        <button
          onClick={() => handleCopy('html')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy HTML
        </button>
        <button
          onClick={() => handleCopy('markdown')}
          disabled={!text}
          className="flex-1 h-10 px-4 text-sm font-medium bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          Copy MD
        </button>
      </div>

      {/* Mobile/Fallback Manual Copy */}
      {(showFormats || (isMobile && copied && copyMethod === 'failed')) && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">
                {isMobile 
                  ? "Tap and hold the text below to copy manually:"
                  : "Select and copy the text below:"}
              </p>
              <div className="p-3 bg-white border border-blue-300 rounded-lg text-sm font-mono select-all break-all max-h-32 overflow-y-auto">
                {text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success feedback with method used */}
      {copied && copyMethod !== 'failed' && (
        <div className="p-2 bg-green-50 rounded-lg text-xs text-green-800 text-center">
          ✓ Copied using {copyMethod} method
        </div>
      )}

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!text || saving}
          className="flex-1 h-12 px-6 rounded-xl font-medium flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">Save Draft</span>
            </>
          )}
        </button>

        <button
          onClick={onClear}
          disabled={!text}
          className="h-12 px-4 rounded-xl flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          type="button"
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    </div>
  );
}
