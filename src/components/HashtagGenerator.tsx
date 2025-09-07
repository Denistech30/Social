import React, { useState, useEffect } from 'react';
import { Hash, Copy, TrendingUp, Target, Sparkles, Check } from 'lucide-react';
import { 
  generateHashtags, 
  generateHashtagsForPlatform,
  type HashtagSuggestion, 
  type Platform 
} from '../utils/hashtagGenerator';

interface HashtagGeneratorProps {
  text: string;
  onHashtagsChange: (hashtags: string[]) => void;
}

const HashtagGenerator: React.FC<HashtagGeneratorProps> = ({ text, onHashtagsChange }) => {
  const [suggestions, setSuggestions] = useState<HashtagSuggestion[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [selectedHashtags, setSelectedHashtags] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const platforms: { key: Platform | 'all'; name: string; icon: string; color: string }[] = [
    { key: 'all', name: 'All Platforms', icon: '🌐', color: 'bg-gray-500' },
    { key: 'instagram', name: 'Instagram', icon: '📸', color: 'bg-pink-500' },
    { key: 'twitter', name: 'Twitter', icon: '🐦', color: 'bg-blue-500' },
    { key: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
    { key: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { key: 'facebook', name: 'Facebook', icon: '👥', color: 'bg-blue-600' }
  ];

  useEffect(() => {
    if (text.trim()) {
      setIsGenerating(true);
      const timer = setTimeout(() => {
        let newSuggestions: HashtagSuggestion[];
        
        if (selectedPlatform === 'all') {
          newSuggestions = generateHashtags(text, 15);
        } else {
          newSuggestions = generateHashtagsForPlatform(text, selectedPlatform, 12);
        }
        
        setSuggestions(newSuggestions);
        setIsGenerating(false);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsGenerating(false);
    }
  }, [text, selectedPlatform]);

  const handleHashtagToggle = (hashtag: string) => {
    const newSelected = new Set(selectedHashtags);
    if (newSelected.has(hashtag)) {
      newSelected.delete(hashtag);
    } else {
      newSelected.add(hashtag);
    }
    setSelectedHashtags(newSelected);
    onHashtagsChange(Array.from(newSelected));
  };

  const handleSelectAll = () => {
    const allTags = suggestions.slice(0, 10).map(s => s.tag);
    setSelectedHashtags(new Set(allTags));
    onHashtagsChange(allTags);
  };

  const handleClearAll = () => {
    setSelectedHashtags(new Set());
    onHashtagsChange([]);
  };

  const copyHashtagsToClipboard = async () => {
    const hashtagString = Array.from(selectedHashtags).map(tag => `#${tag}`).join(' ');
    try {
      await navigator.clipboard.writeText(hashtagString);
    } catch (err) {
      console.error('Failed to copy hashtags:', err);
    }
  };

  const getPlatformRecommendation = (platforms: Platform[]): string => {
    if (platforms.length === 1) return platforms[0];
    if (platforms.includes('instagram') && platforms.includes('tiktok')) return 'Visual platforms';
    if (platforms.includes('linkedin') && platforms.includes('twitter')) return 'Professional';
    return 'Multi-platform';
  };

  const getPopularityColor = (popularity: string): string => {
    switch (popularity) {
      case 'trending': return 'text-red-600 bg-red-50 border-red-200';
      case 'popular': return 'text-green-600 bg-green-50 border-green-200';
      case 'niche': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPopularityIcon = (popularity: string) => {
    switch (popularity) {
      case 'trending': return <TrendingUp className="w-3 h-3" />;
      case 'popular': return <Target className="w-3 h-3" />;
      case 'niche': return <Sparkles className="w-3 h-3" />;
      default: return <Hash className="w-3 h-3" />;
    }
  };

  if (!text.trim()) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Hash className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Smart Hashtag Generator</h3>
        </div>
        <p className="text-gray-500 text-sm">Start typing to get AI-powered hashtag suggestions!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Hash className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Smart Hashtag Generator</h3>
        </div>
        
        {selectedHashtags.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{selectedHashtags.size} selected</span>
            <button
              onClick={copyHashtagsToClipboard}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          </div>
        )}
      </div>

      {/* Platform Selection */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">Platform:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.key}
              onClick={() => setSelectedPlatform(platform.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedPlatform === platform.key
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{platform.icon}</span>
              {platform.name}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Check className="w-3 h-3" />
            Select Top 10
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm">Generating hashtags...</span>
        </div>
      )}

      {/* Hashtag Suggestions */}
      {suggestions.length > 0 && !isGenerating && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.tag}-${index}`}
                onClick={() => handleHashtagToggle(suggestion.tag)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedHashtags.has(suggestion.tag)
                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/20'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">#{suggestion.tag}</span>
                    {selectedHashtags.has(suggestion.tag) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPopularityColor(suggestion.popularity)}`}>
                    {getPopularityIcon(suggestion.popularity)}
                    {suggestion.popularity}
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-medium">Category:</span> {suggestion.category}
                </div>
                
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Best for:</span> {getPlatformRecommendation(suggestion.platforms)}
                </div>
                
                <div className="mt-2 bg-gray-200 rounded-full h-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(suggestion.relevance, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform-specific tips */}
          {selectedPlatform !== 'all' && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">💡</span>
                </div>
                <h4 className="font-semibold text-blue-800">
                  {platforms.find(p => p.key === selectedPlatform)?.name} Tips
                </h4>
              </div>
              <p className="text-sm text-blue-700">
                {selectedPlatform === 'instagram' && 'Use 5-10 hashtags for best engagement. Mix popular and niche tags.'}
                {selectedPlatform === 'twitter' && 'Limit to 1-2 hashtags. Focus on trending topics.'}
                {selectedPlatform === 'linkedin' && 'Use 3-5 professional hashtags. Avoid overly casual tags.'}
                {selectedPlatform === 'tiktok' && 'Mix trending and niche hashtags. Use 3-5 for best reach.'}
                {selectedPlatform === 'facebook' && 'Use 1-2 broad hashtags. Less important than other platforms.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* No suggestions message */}
      {suggestions.length === 0 && !isGenerating && text.trim() && (
        <div className="text-center py-8">
          <Hash className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No hashtag suggestions found for this content.</p>
          <p className="text-sm text-gray-400 mt-1">Try adding more descriptive words to your text.</p>
        </div>
      )}
    </div>
  );
};

export default HashtagGenerator;
