import React, { useState, useEffect } from 'react';
import { analyzeText, enhanceForEngagement, enhanceReadability, type TextAnalysis } from '../utils/textAnalyzer';
import { Sparkles, TrendingUp, BookOpen, Heart, Zap, CheckCircle } from 'lucide-react';

interface AIEnhancerProps {
  text: string;
  onTextChange: (newText: string) => void;
}

const AIEnhancer: React.FC<AIEnhancerProps> = ({ text, onTextChange }) => {
  const [analysis, setAnalysis] = useState<TextAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (text.trim()) {
      setIsAnalyzing(true);
      // Debounce analysis to avoid excessive calculations
      const timer = setTimeout(() => {
        const result = analyzeText(text);
        setAnalysis(result);
        setIsAnalyzing(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setAnalysis(null);
      setIsAnalyzing(false);
    }
  }, [text]);

  const handleEnhanceEngagement = () => {
    const enhanced = enhanceForEngagement(text);
    onTextChange(enhanced);
  };

  const handleEnhanceReadability = () => {
    const enhanced = enhanceReadability(text);
    onTextChange(enhanced);
  };

  const getReadabilityLabel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Very Easy', color: 'text-green-600' };
    if (score >= 60) return { label: 'Easy', color: 'text-emerald-600' };
    if (score >= 40) return { label: 'Moderate', color: 'text-yellow-600' };
    if (score >= 20) return { label: 'Hard', color: 'text-orange-600' };
    return { label: 'Very Hard', color: 'text-red-600' };
  };

  const getSentimentLabel = (score: number): { label: string; color: string; icon: React.ReactNode } => {
    if (score > 20) return { 
      label: 'Positive', 
      color: 'text-green-600', 
      icon: <Heart className="w-4 h-4" /> 
    };
    if (score < -20) return { 
      label: 'Negative', 
      color: 'text-red-600', 
      icon: <Heart className="w-4 h-4" /> 
    };
    return { 
      label: 'Neutral', 
      color: 'text-gray-600', 
      icon: <Heart className="w-4 h-4" /> 
    };
  };

  if (!text.trim()) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Text Enhancer</h3>
        </div>
        <p className="text-gray-500 text-sm">Start typing to get AI-powered suggestions and analysis!</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI Text Enhancer</h3>
        </div>
        
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
        >
          {showSuggestions ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center gap-2 text-gray-500 mb-4">
          <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-sm">Analyzing text...</span>
        </div>
      ) : analysis && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 text-center border border-blue-200/50">
              <div className="text-2xl font-bold text-blue-600 mb-1">{analysis.wordCount}</div>
              <div className="text-xs text-blue-600/80 font-medium">Words</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 text-center border border-green-200/50">
              <div className="text-2xl font-bold text-green-600 mb-1">{Math.round(analysis.readabilityScore)}</div>
              <div className="text-xs text-green-600/80 font-medium">Readability</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 text-center border border-purple-200/50">
              <div className="flex items-center justify-center gap-1 mb-1">
                {getSentimentLabel(analysis.sentimentScore).icon}
                <span className="text-sm font-bold text-purple-600">
                  {getSentimentLabel(analysis.sentimentScore).label}
                </span>
              </div>
              <div className="text-xs text-purple-600/80 font-medium">Sentiment</div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 text-center border border-orange-200/50">
              <div className="text-2xl font-bold text-orange-600 mb-1">{analysis.sentenceCount}</div>
              <div className="text-xs text-orange-600/80 font-medium">Sentences</div>
            </div>
          </div>

          {/* Enhancement Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleEnhanceEngagement}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-105"
            >
              <TrendingUp className="w-4 h-4" />
              Boost Engagement
            </button>
            
            <button
              onClick={handleEnhanceReadability}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
            >
              <BookOpen className="w-4 h-4" />
              Improve Readability
            </button>
          </div>

          {/* Detailed Suggestions */}
          {showSuggestions && (
            <div className="space-y-4">
              {analysis.engagementTips.length > 0 && (
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-emerald-800">Engagement Tips</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.engagementTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.suggestions.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Writing Suggestions</h4>
                  </div>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-blue-700">
                        <CheckCircle className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Readability Details */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-4 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-gray-800">Readability Analysis</h4>
                </div>
                <div className="text-sm text-gray-700">
                  <p className="mb-2">
                    <span className="font-medium">Reading Level:</span>{' '}
                    <span className={getReadabilityLabel(analysis.readabilityScore).color}>
                      {getReadabilityLabel(analysis.readabilityScore).label}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Higher scores indicate easier reading. Aim for 60+ for social media content.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AIEnhancer;
