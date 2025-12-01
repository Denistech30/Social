import { MoreHorizontal, Heart, MessageCircle, Share2 } from 'lucide-react';

interface PreviewCardProps {
  text: string;
  platformName: string;
}

export default function PreviewCard({ text, platformName }: PreviewCardProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Live Preview
      </label>

      <div className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Mock Social Media Post Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          {/* Profile Picture */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex-shrink-0" />
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">Your Name</div>
            <div className="text-xs text-gray-500">2 hours ago · {platformName}</div>
          </div>

          {/* More Options */}
          <button className="p-1 hover:bg-gray-100 rounded-full" type="button">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Post Content */}
        <div className="p-4 min-h-[200px]">
          {text ? (
            <div 
              className="text-base leading-relaxed text-gray-900 whitespace-pre-wrap break-words"
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                lineHeight: '1.6',
                wordBreak: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {text}
            </div>
          ) : (
            <div className="text-gray-400 italic text-center py-12">
              Your formatted text will appear here...
            </div>
          )}
        </div>

        {/* Mock Interaction Buttons */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-6 text-gray-600">
          <button className="flex items-center gap-2 text-sm hover:text-red-600 transition-colors" type="button">
            <Heart className="w-5 h-5" />
            <span>Like</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors" type="button">
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-green-600 transition-colors" type="button">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
