import { useState } from 'react';
import { TestTube, ChevronRight, AlertCircle, Copy, Check, ExternalLink, Lightbulb } from 'lucide-react';
import { smartCopy } from '../../lib/copy-system';

interface TestBeforePostProps {
  text: string;
  platformId: string;
  platformName: string;
}

const platformUrls: Record<string, string> = {
  twitter: 'https://twitter.com/compose/tweet',
  instagram: 'https://www.instagram.com/',
  linkedin: 'https://www.linkedin.com/feed/',
  facebook: 'https://www.facebook.com/',
  tiktok: 'https://www.tiktok.com/upload',
  threads: 'https://www.threads.net/',
};

export default function TestBeforePost({ text, platformId, platformName }: TestBeforePostProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyForTesting = async () => {
    const result = await smartCopy(text, 'unicode');
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenPlatform = () => {
    const url = platformUrls[platformId];
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all duration-200"
        type="button"
      >
        <div className="flex items-center gap-3">
          <TestTube className="w-5 h-5 text-purple-600" />
          <div className="text-left">
            <span className="font-semibold text-purple-900">
              Test on Actual Platform
            </span>
            <p className="text-xs text-purple-700 mt-0.5">
              Preview before posting live
            </p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-purple-600 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Instructions */}
      {expanded && (
        <div className="p-4 bg-white border-2 border-purple-200 rounded-xl space-y-4">
          {/* Warning Banner */}
          <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-purple-900">
                <strong>Important:</strong> Always test formatting in a draft before posting publicly. 
                Some platforms may display Unicode differently than our preview.
              </div>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">
              How to Test Safely:
            </h4>
            
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  1
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Copy your formatted text</strong> using the button below
                  </p>
                  <button
                    onClick={handleCopyForTesting}
                    disabled={!text || copied}
                    className={`w-full h-10 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                    type="button"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied for Testing!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy for Testing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  2
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Open {platformName}</strong> in a new tab
                  </p>
                  <button
                    onClick={handleOpenPlatform}
                    className="w-full h-10 px-4 border-2 border-green-500 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                    type="button"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open {platformName}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  3
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700">
                    <strong>Paste into a draft post</strong> to see exactly how it will look. 
                    DO NOT post publicly yet!
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm font-bold flex items-center justify-center">
                  4
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-gray-700">
                    <strong>Check everything looks correct</strong>, then post it live. 
                    If something looks wrong, come back and adjust.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-900">
              <Lightbulb className="w-4 h-4" />
              <span>Pro Tips:</span>
            </div>
            <ul className="space-y-1 text-xs text-blue-800 pl-6">
              <li className="list-disc">
                Most platforms let you save drafts - use this to test safely
              </li>
              <li className="list-disc">
                Check on mobile AND desktop if possible - formatting may differ
              </li>
              <li className="list-disc">
                If you see boxes (□) or question marks (?), the platform doesn't support that formatting
              </li>
              <li className="list-disc">
                When in doubt, use less formatting - simple is often better
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
