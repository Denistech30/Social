import React, { useState } from 'react';
import { 
  Zap, 
  Target, 
  MessageSquare, 
  Palette, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { adaptForAllPlatforms, getPlatformRecommendations } from '../utils/platformFormatter';
import { predictEngagement } from '../utils/engagementPredictor';
import { adjustTone, type ToneType } from '../utils/toneAdjuster';
import { generateMultipleCaptions, type CaptionOptions } from '../utils/captionGenerator';
import { getTemplatesByIndustry, type ContentTemplate } from '../utils/contentTemplates';

interface AdvancedAIFeaturesProps {
  text: string;
  onTextChange: (newText: string) => void;
  selectedHashtags: string[];
}

const AdvancedAIFeatures: React.FC<AdvancedAIFeaturesProps> = ({ 
  text, 
  onTextChange, 
  selectedHashtags 
}) => {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [platformAdaptations, setPlatformAdaptations] = useState<any>(null);
  const [engagementScore, setEngagementScore] = useState<any>(null);
  const [toneAdjustments, setToneAdjustments] = useState<any>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const features = [
    {
      id: 'platform-formatter',
      name: 'Multi-Platform Formatter',
      icon: <Target className="w-4 h-4" />,
      description: 'Auto-adapt content for different social platforms',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'engagement-predictor',
      name: 'Engagement Predictor',
      icon: <Zap className="w-4 h-4" />,
      description: 'Score content likelihood to get engagement',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'tone-adjuster',
      name: 'Tone Adjuster',
      icon: <Palette className="w-4 h-4" />,
      description: 'Convert between professional/casual/friendly tones',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'caption-generator',
      name: 'Caption Generator',
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'Create captions from keywords or topics',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'content-templates',
      name: 'Content Templates',
      icon: <FileText className="w-4 h-4" />,
      description: 'AI-generated post templates for different industries',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  const handleFeatureClick = async (featureId: string) => {
    if (activeFeature === featureId) {
      setActiveFeature(null);
      return;
    }

    setActiveFeature(featureId);
    setIsProcessing(true);

    try {
      switch (featureId) {
        case 'platform-formatter':
          if (text.trim()) {
            const adaptations = adaptForAllPlatforms(text, selectedHashtags);
            const recommendations = getPlatformRecommendations(text);
            setPlatformAdaptations({ adaptations, recommendations });
          }
          break;

        case 'engagement-predictor':
          if (text.trim()) {
            const score = predictEngagement(text, selectedHashtags);
            setEngagementScore(score);
          }
          break;

        case 'tone-adjuster':
          if (text.trim()) {
            const tones: ToneType[] = ['professional', 'casual', 'friendly', 'enthusiastic'];
            const adjustments: any = {};
            tones.forEach(tone => {
              adjustments[tone] = adjustTone(text, tone);
            });
            setToneAdjustments(adjustments);
          }
          break;

        case 'caption-generator':
          const keywords = text.split(/\s+/).filter(w => w.length > 2).slice(0, 5);
          if (keywords.length > 0) {
            const options: CaptionOptions = {
              keywords,
              tone: 'friendly',
              platform: 'instagram',
              includeHashtags: true,
              includeEmojis: true,
              includeCTA: true
            };
            const captions = generateMultipleCaptions(options, 3);
            setGeneratedCaptions(captions);
          }
          break;

        case 'content-templates':
          // This will be handled in the UI
          break;
      }
    } catch (error) {
      console.error('Error processing feature:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!text.trim()) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Advanced AI Features</h3>
        </div>
        <p className="text-gray-500 text-sm">Start typing to unlock powerful AI-powered content optimization tools!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Advanced AI Features</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => handleFeatureClick(feature.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              activeFeature === feature.id
                ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/20'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-md`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 text-sm">{feature.name}</h4>
              </div>
              {activeFeature === feature.id ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <p className="text-xs text-gray-600">{feature.description}</p>
          </button>
        ))}
      </div>

      {isProcessing && (
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      )}

      {/* Platform Formatter Results */}
      {activeFeature === 'platform-formatter' && platformAdaptations && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Platform Adaptations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(platformAdaptations.adaptations).map(([platform, adaptation]: [string, any]) => (
              <div key={platform} className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-blue-800 capitalize">{platform}</h5>
                  <button
                    onClick={() => copyToClipboard(adaptation.content)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm text-blue-700 mb-2 max-h-20 overflow-y-auto">
                  {adaptation.content}
                </div>
                {adaptation.warnings.length > 0 && (
                  <div className="text-xs text-orange-600 mt-2">
                    ⚠️ {adaptation.warnings[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Predictor Results */}
      {activeFeature === 'engagement-predictor' && engagementScore && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Engagement Analysis</h4>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200/50">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-green-800">Overall Score</span>
              <span className="text-2xl font-bold text-green-600">{engagementScore.overall}/100</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {Object.entries(engagementScore.breakdown).map(([key, score]: [string, any]) => (
                <div key={key} className="text-center">
                  <div className="text-xs text-green-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="text-sm font-semibold text-green-700">{Math.round(score)}</div>
                </div>
              ))}
            </div>
            {engagementScore.suggestions.length > 0 && (
              <div>
                <div className="text-sm font-medium text-green-800 mb-2">Suggestions:</div>
                <ul className="text-xs text-green-700 space-y-1">
                  {engagementScore.suggestions.slice(0, 3).map((suggestion: string, index: number) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tone Adjuster Results */}
      {activeFeature === 'tone-adjuster' && toneAdjustments && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Tone Variations</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(toneAdjustments).map(([tone, adjustment]: [string, any]) => (
              <div key={tone} className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-purple-800 capitalize">{tone}</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTextChange(adjustment.adjustedContent)}
                      className="text-purple-600 hover:text-purple-700 p-1"
                      title="Apply this tone"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(adjustment.adjustedContent)}
                      className="text-purple-600 hover:text-purple-700 p-1"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-purple-700 mb-2 max-h-20 overflow-y-auto">
                  {adjustment.adjustedContent}
                </div>
                <div className="text-xs text-purple-600">
                  Confidence: {adjustment.confidence}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Caption Generator Results */}
      {activeFeature === 'caption-generator' && generatedCaptions.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Generated Captions</h4>
          <div className="space-y-3">
            {generatedCaptions.map((caption, index) => (
              <div key={index} className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-orange-800">Caption {index + 1}</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTextChange(caption.caption)}
                      className="text-orange-600 hover:text-orange-700 p-1"
                      title="Use this caption"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(caption.caption)}
                      className="text-orange-600 hover:text-orange-700 p-1"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-orange-700 mb-2">
                  {caption.caption}
                </div>
                {caption.hashtags.length > 0 && (
                  <div className="text-xs text-orange-600">
                    Suggested hashtags: {caption.hashtags.map((tag: string) => `#${tag}`).join(' ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Templates */}
      {activeFeature === 'content-templates' && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 mb-3">Content Templates</h4>
          <div className="bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl p-4 border border-pink-200/50">
            <p className="text-sm text-pink-700 mb-3">
              Select an industry to see relevant content templates:
            </p>
            <div className="flex flex-wrap gap-2">
              {['business', 'technology', 'lifestyle', 'fitness', 'food', 'travel', 'creative'].map((industry) => (
                <button
                  key={industry}
                  className="px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-xs rounded-lg font-medium transition-colors capitalize"
                  onClick={() => {
                    const templates = getTemplatesByIndustry(industry);
                    if (templates.length > 0) {
                      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                      onTextChange(randomTemplate.example);
                    }
                  }}
                >
                  {industry}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIFeatures;
