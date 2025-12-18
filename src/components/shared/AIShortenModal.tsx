import { useState } from 'react';
import { X, Wand2, Copy, Check, AlertTriangle, Loader2, Lightbulb } from 'lucide-react';

interface AIShortenModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  platform: string;
  platformLimit: number;
  onReplace: (newText: string) => void;
}

interface ShortenOptions {
  keepHashtags: boolean;
  keepCTA: boolean;
  tone: 'neutral' | 'friendly' | 'professional';
}

interface ShortenResponse {
  result: string;
  charCount: number;
}

interface ErrorResponse {
  error: string;
  suggestions?: string[];
}

export default function AIShortenModal({ 
  open, 
  onOpenChange, 
  text, 
  platform, 
  platformLimit, 
  onReplace 
}: AIShortenModalProps) {
  const [options, setOptions] = useState<ShortenOptions>({
    keepHashtags: true,
    keepCTA: true,
    tone: 'neutral'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [resultCharCount, setResultCharCount] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const currentCharCount = [...text].length;
  const overBy = currentCharCount - platformLimit;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setResult('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          platform: platform.toLowerCase(),
          limit: platformLimit,
          options
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;
        setError(errorData.error);
        if (errorData.suggestions) {
          setSuggestions(errorData.suggestions);
        }
        return;
      }

      const successData = data as ShortenResponse;
      setResult(successData.result);
      setResultCharCount(successData.charCount);
    } catch (err) {
      console.error('AI Shorten Error:', err);
      setError('Failed to connect to AI service. Please check your internet connection and try again.');
      setSuggestions([
        'Remove emojis and extra punctuation',
        'Shorten hashtags or move them to comments',
        'Remove filler words like "really", "very", "just"',
        'Use abbreviations where appropriate',
        'Split into multiple posts if needed'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleReplace = () => {
    if (!result) return;
    onReplace(result);
    onOpenChange(false);
  };

  const handleClose = () => {
    setResult('');
    setError('');
    setSuggestions([]);
    setCopied(false);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Shorten for {platform}</h3>
              <p className="text-sm text-gray-600">Rewrite your post to fit the character limit</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close AI shorten modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Current Status */}
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-semibold text-red-900">Over Character Limit</span>
            </div>
            <div className="text-sm text-red-800">
              <p>Current: <span className="font-bold">{currentCharCount}</span> characters</p>
              <p>Limit: <span className="font-bold">{platformLimit}</span> characters</p>
              <p>Over by: <span className="font-bold text-red-600">{overBy}</span> characters</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Rewriting Options</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.keepHashtags}
                  onChange={(e) => setOptions(prev => ({ ...prev, keepHashtags: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Keep hashtags</span>
              </label>

              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options.keepCTA}
                  onChange={(e) => setOptions(prev => ({ ...prev, keepCTA: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">Keep call-to-action</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={options.tone}
                onChange={(e) => setOptions(prev => ({ ...prev, tone: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="neutral">Neutral</option>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full h-12 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              loading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating rewrite...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Generate Rewrite</span>
              </>
            )}
          </button>

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-green-900">AI Suggestion</h5>
                  <div className="text-sm text-green-700">
                    <span className="font-bold">{resultCharCount}</span> / {platformLimit} chars
                    <span className="ml-2 text-green-600">
                      ({platformLimit - resultCharCount} remaining)
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white border border-green-300 rounded-lg text-sm font-mono whitespace-pre-wrap break-words">
                  {result}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReplace}
                  className="flex-1 h-12 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Replace My Draft</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="h-12 px-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-red-900 mb-1">AI Shortening Failed</h5>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>

              {suggestions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h6 className="text-sm font-semibold text-blue-900">Manual Shortening Tips</h6>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}