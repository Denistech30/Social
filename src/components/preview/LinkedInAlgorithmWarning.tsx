import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Check, X, Wand2, Lightbulb } from 'lucide-react';
import { analyzeForLinkedIn, optimizeForLinkedIn } from '../../lib/linkedin-analyzer';

interface LinkedInAlgorithmWarningProps {
  text: string;
  onOptimize: (optimizedText: string) => void;
}

export default function LinkedInAlgorithmWarning({ text, onOptimize }: LinkedInAlgorithmWarningProps) {
  const [linkedInMode, setLinkedInMode] = useState(false);
  const analysis = analyzeForLinkedIn(text);

  if (!text || text.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      {!linkedInMode && analysis.reachScore < 70 && (
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                LinkedIn Algorithm Warning
                <span className="px-2 py-0.5 bg-orange-200 text-orange-900 text-xs font-bold rounded">
                  {analysis.reachScore}% Reach
                </span>
              </h4>
              <p className="text-sm text-orange-800 mb-3">
                Your current formatting may reduce post reach by <strong>60-80%</strong>. 
                The LinkedIn algorithm penalizes heavy Unicode formatting as low-quality content.
              </p>

              {/* Issues Found */}
              <div className="space-y-1 mb-3">
                {analysis.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-orange-700">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setLinkedInMode(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                type="button"
              >
                Enable LinkedIn-Safe Mode
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LinkedIn-Safe Mode Active */}
      {linkedInMode && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">LinkedIn-Safe Mode Active</span>
            </div>
            <button
              onClick={() => setLinkedInMode(false)}
              className="text-sm text-green-700 hover:text-green-800"
              type="button"
            >
              Disable
            </button>
          </div>

          {/* Applied Optimizations */}
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-gray-700">Applied Optimizations:</h5>
            <ul className="space-y-2">
              <OptimizationItem 
                checked={analysis.formattingPercentage <= 20}
                label="Limited formatting to 20% of text"
                value={`${Math.round(analysis.formattingPercentage)}%`}
              />
              <OptimizationItem 
                checked={analysis.charCount >= 800 && analysis.charCount <= 1000}
                label="Character count in optimal range"
                value={`${analysis.charCount}/1000`}
              />
              <OptimizationItem 
                checked={analysis.hashtagCount <= 5}
                label="Hashtags within safe limit"
                value={`${analysis.hashtagCount}/5`}
              />
              <OptimizationItem 
                checked={!analysis.hasExternalLink}
                label="No external links in post body"
                value={analysis.hasExternalLink ? "Remove link" : "Good!"}
              />
              <OptimizationItem 
                checked={!analysis.hasEngagementBait}
                label="No engagement bait phrases"
                value={analysis.hasEngagementBait ? "Found" : "Clean"}
              />
            </ul>
          </div>

          {/* Reach Prediction */}
          <div className="p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Estimated Reach</span>
              <span className={`text-2xl font-bold ${
                analysis.reachScore >= 80 ? 'text-green-600' :
                analysis.reachScore >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {analysis.reachScore}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  analysis.reachScore >= 80 ? 'bg-green-500' :
                  analysis.reachScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${analysis.reachScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {analysis.reachScore >= 80 
                ? '✓ Excellent! Your post should perform well.'
                : analysis.reachScore >= 60
                ? '⚠ Good, but could be optimized further.'
                : '⛔ Poor reach expected. Please optimize.'}
            </p>
          </div>

          {/* Auto-Optimize Button */}
          {analysis.reachScore < 80 && (
            <button
              onClick={() => {
                const optimized = optimizeForLinkedIn(text);
                onOptimize(optimized);
              }}
              className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Optimize for LinkedIn
            </button>
          )}
        </div>
      )}

      {/* LinkedIn Best Practices Panel */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          LinkedIn 2025 Best Practices
        </h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
            <span><strong>Length:</strong> 800-1000 characters (sweet spot for engagement)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
            <span><strong>Hashtags:</strong> Use 3-5 maximum (6+ triggers spam filter)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
            <span><strong>Formatting:</strong> Bold only headlines, avoid heavy styling</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold flex-shrink-0">•</span>
            <span><strong>Links:</strong> Add in first comment, not post body (-34% reach)</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

// Helper component for optimization checklist
function OptimizationItem({ checked, label, value }: { checked: boolean; label: string; value: string }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        {checked ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <X className="w-4 h-4 text-red-600" />
        )}
        <span className={checked ? 'text-green-700' : 'text-red-700'}>
          {label}
        </span>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
        checked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    </li>
  );
}
