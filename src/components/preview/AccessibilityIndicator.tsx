import { CheckCircle2, AlertCircle, AlertTriangle, XCircle, Info, Wand2 } from 'lucide-react';

interface AccessibilityIndicatorProps {
  text: string;
  onGeneratePlain?: () => void;
}

interface AccessibilityStatus {
  status: 'excellent' | 'good' | 'fair' | 'poor';
  icon: typeof CheckCircle2;
  message: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  progressColor: string;
}

function calculateAccessibilityScore(text: string): number {
  let score = 100;

  if (!text || text.length === 0) return 100;

  const problematicRanges: [number, number][] = [
    [0x1D400, 0x1D7FF],
    [0x24B6, 0x24EA],
    [0xFF01, 0xFF5E],
    [0x1F100, 0x1F1FF],
  ];

  let formattedCharCount = 0;

  for (const char of text) {
    const code = char.codePointAt(0) || 0;
    for (const [start, end] of problematicRanges) {
      if (code >= start && code <= end) {
        formattedCharCount++;
        break;
      }
    }
  }

  const totalChars = text.length;
  if (totalChars === 0) return 100;

  const formattingPercentage = (formattedCharCount / totalChars) * 100;

  if (formattingPercentage > 50) {
    score -= 70;
  } else if (formattingPercentage > 30) {
    score -= 50;
  } else if (formattingPercentage > 10) {
    score -= 25;
  } else if (formattingPercentage > 0) {
    score -= 10;
  }

  const lines = text.split('\n');
  if (lines.length > 1) score += 5;

  return Math.max(0, Math.min(100, score));
}

function getAccessibilityStatus(score: number): AccessibilityStatus {
  if (score >= 80) {
    return {
      status: 'excellent',
      icon: CheckCircle2,
      message: '✓ Excellent! Your text is accessible to screen readers.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconColor: 'text-green-600',
      progressColor: 'bg-green-500',
    };
  }

  if (score >= 60) {
    return {
      status: 'good',
      icon: AlertCircle,
      message: '⚠️ Good, but some formatting may cause issues for screen readers.',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700',
      iconColor: 'text-yellow-600',
      progressColor: 'bg-yellow-500',
    };
  }

  if (score >= 40) {
    return {
      status: 'fair',
      icon: AlertTriangle,
      message: '⚠️ Fair. Heavy formatting will be difficult for screen readers.',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-600',
      progressColor: 'bg-orange-500',
    };
  }

  return {
    status: 'poor',
    icon: XCircle,
    message: '❌ Poor. This text is not accessible to screen readers.',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500',
  };
}

export default function AccessibilityIndicator({ text, onGeneratePlain }: AccessibilityIndicatorProps) {
  const score = calculateAccessibilityScore(text);
  const status = getAccessibilityStatus(score);
  const StatusIcon = status.icon;

  return (
    <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${status.borderColor} ${status.bgColor}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-5 h-5 ${status.iconColor}`} />
          <span className="text-sm font-semibold text-gray-700">
            Accessibility Score
          </span>
        </div>
        <div className={`text-3xl font-bold ${status.textColor}`}>
          {score}<span className="text-lg">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
        <div 
          className={`h-full transition-all duration-500 ${status.progressColor}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Status Message */}
      <p className={`text-sm font-medium mb-3 ${status.textColor}`}>
        {status.message}
      </p>

      {/* Action Button for Low Scores */}
      {score < 60 && onGeneratePlain && (
        <button 
          onClick={onGeneratePlain}
          className="w-full py-2.5 px-4 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all flex items-center justify-center gap-2"
          type="button"
        >
          <Wand2 className="w-4 h-4" />
          Generate Accessible Version
        </button>
      )}

      {/* Educational Info */}
      <div className="mt-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200">
        <details className="text-xs text-gray-700">
          <summary className="font-semibold cursor-pointer mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Why accessibility matters
          </summary>
          <div className="space-y-2 pl-6">
            <p>
              <strong>Screen readers</strong> used by visually impaired users cannot properly interpret Unicode formatted text. 
              This means your message may be unreadable to millions of users.
            </p>
            <p>
              <strong>Best practice:</strong> Use formatting sparingly (headlines only) or provide a plain text alternative.
            </p>
            <p className="text-blue-600 font-medium">
              15% of the global population has some form of disability. Making your content accessible is good ethics and good business.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
