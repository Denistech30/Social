import { Type, AlertTriangle } from 'lucide-react';
import { stripFormatting } from '../../lib/unicode-transforms';

interface CharacterCounterProps {
  text: string;
  platformLimit: number;
  platformName: string;
}

export default function CharacterCounter({ text, platformLimit, platformName }: CharacterCounterProps) {
  // Calculate both counts
  const plainTextCount = stripFormatting(text).length;
  const unicodeCount = [...text].length; // Proper Unicode character count
  const percentage = (unicodeCount / platformLimit) * 100;

  // Determine status
  const getStatus = () => {
    if (percentage < 80) return { 
      color: 'green', 
      text: 'text-green-600', 
      bg: 'bg-green-500', 
      border: 'border-green-200',
      bgLight: 'bg-white',
      status: '✓ Good length' 
    };
    if (percentage < 95) return { 
      color: 'yellow', 
      text: 'text-yellow-600', 
      bg: 'bg-yellow-500', 
      border: 'border-yellow-200',
      bgLight: 'bg-yellow-50',
      status: '⚠ Getting long' 
    };
    return { 
      color: 'red', 
      text: 'text-red-600', 
      bg: 'bg-red-500', 
      border: 'border-red-200',
      bgLight: 'bg-red-50',
      status: '⛔ Too long!' 
    };
  };

  const status = getStatus();
  const isOverLimit = unicodeCount > platformLimit;
  const remaining = platformLimit - unicodeCount;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${status.border} ${isOverLimit ? 'bg-red-50' : status.bgLight}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Type className={`w-5 h-5 ${status.text}`} />
          <span className="text-sm font-semibold text-gray-700">
            Counts against limit: Formatted (Unicode)
          </span>
        </div>
        <div className={`text-xl font-bold ${status.text}`}>
          {unicodeCount.toLocaleString()} / {platformLimit.toLocaleString()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3 relative">
        <div 
          className={`h-full transition-all duration-300 ${status.bg}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {/* Marker at 80% warning threshold */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
          style={{ left: '80%' }}
        />
      </div>

      {/* Info Row */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-gray-600">
          Plain: {plainTextCount.toLocaleString()}
        </span>
        <span className={`font-medium ${status.text}`}>
          {status.status}
        </span>
      </div>

      {/* Remaining Characters */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">
          Remaining:
        </span>
        <span className={`font-bold ${
          remaining < 0 ? 'text-red-600' : 
          remaining < 20 ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {remaining}
        </span>
      </div>

      {/* Over Limit Warning */}
      {isOverLimit && (
        <div className="mt-3 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-800">
              <div className="font-semibold">Character Limit Exceeded!</div>
              <p className="mt-1">
                Your text is {Math.abs(remaining)} characters over the {platformName} limit. 
                You need to remove {Math.abs(remaining)} characters before posting.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Unicode vs Plain Text Explainer */}
      {unicodeCount !== plainTextCount && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
          <span className="font-semibold">💡 Why two counts?</span> Unicode formatting uses more characters than plain text. 
          Some platforms count Unicode differently.
        </div>
      )}
    </div>
  );
}
