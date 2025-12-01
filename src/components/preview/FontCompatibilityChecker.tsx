import { useState } from 'react';
import { Smartphone, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { testPlatformCompatibility, getCompatibilitySummary } from '../../lib/compatibility-checker';

interface FontCompatibilityCheckerProps {
  text: string;
}

export default function FontCompatibilityChecker({ text }: FontCompatibilityCheckerProps) {
  const [expanded, setExpanded] = useState(false);
  const compatibility = testPlatformCompatibility(text);
  const { avgSupport, hasIssues } = getCompatibilitySummary(text);

  return (
    <div className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
        type="button"
      >
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <div className="text-left">
            <h4 className="text-sm font-semibold text-gray-700">
              Platform Compatibility
            </h4>
            <p className="text-xs text-gray-500">
              {avgSupport}% average support across platforms
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 bg-white border-2 border-gray-200 rounded-xl space-y-3">
          {/* Platform List */}
          <div className="space-y-2">
            {compatibility.map((platform) => (
              <div 
                key={platform.platform}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                {/* Platform Info */}
                <div className="flex items-center gap-3 flex-1">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {platform.platformName}
                    </div>
                    {platform.issues.length > 0 && (
                      <div className="text-xs text-gray-500 truncate">
                        {platform.issues[0]}
                      </div>
                    )}
                  </div>
                </div>

                {/* Support Status */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {platform.compatible ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {platform.supportPercentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        {platform.supportPercentage}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Warning for Issues */}
          {hasIssues && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900 mb-2">
                    Compatibility Issues Detected
                  </p>
                  <ul className="space-y-1">
                    {compatibility
                      .filter(c => !c.compatible)
                      .map(c => (
                        <li key={c.platform} className="text-xs text-yellow-800">
                          • <strong>{c.platformName}:</strong> {c.issues.join(', ')}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
            <strong>💡 Why this matters:</strong> Some platforms may not display certain Unicode characters correctly, showing white boxes (□) or question marks (?) instead. Always test on your target platform first.
          </div>
        </div>
      )}
    </div>
  );
}
