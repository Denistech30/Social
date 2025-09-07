// Engagement Predictor - Score content likelihood to get engagement
// Free implementation with scoring algorithms

export interface EngagementScore {
  overall: number;
  breakdown: {
    readability: number;
    emotional: number;
    structure: number;
    callToAction: number;
    timing: number;
    hashtags: number;
  };
  predictions: {
    likes: 'low' | 'medium' | 'high';
    comments: 'low' | 'medium' | 'high';
    shares: 'low' | 'medium' | 'high';
  };
  suggestions: string[];
}

export interface EngagementFactors {
  hasQuestion: boolean;
  hasEmojis: boolean;
  hasCallToAction: boolean;
  hasNumbers: boolean;
  hasPersonalStory: boolean;
  hasHashtags: boolean;
  wordCount: number;
  sentenceCount: number;
  exclamationCount: number;
  questionCount: number;
}

// Analyze content for engagement factors
export function analyzeEngagementFactors(content: string, hashtags: string[] = []): EngagementFactors {
  const hasQuestion = content.includes('?');
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu.test(content);
  
  // Call-to-action phrases
  const ctaPhrases = [
    'comment', 'share', 'like', 'follow', 'subscribe', 'click', 'join', 'try',
    'what do you think', 'let me know', 'tell me', 'tag someone', 'double tap',
    'save this', 'check out', 'swipe up', 'link in bio'
  ];
  const hasCallToAction = ctaPhrases.some(phrase => 
    content.toLowerCase().includes(phrase)
  );
  
  const hasNumbers = /\d/.test(content);
  
  // Personal story indicators
  const personalIndicators = ['i', 'my', 'me', 'personal', 'story', 'experience', 'journey'];
  const hasPersonalStory = personalIndicators.some(indicator => 
    content.toLowerCase().includes(indicator)
  );
  
  const hasHashtags = hashtags.length > 0;
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const exclamationCount = (content.match(/!/g) || []).length;
  const questionCount = (content.match(/\?/g) || []).length;

  return {
    hasQuestion,
    hasEmojis,
    hasCallToAction,
    hasNumbers,
    hasPersonalStory,
    hasHashtags,
    wordCount,
    sentenceCount,
    exclamationCount,
    questionCount
  };
}

// Calculate readability score for engagement
function calculateReadabilityScore(factors: EngagementFactors): number {
  let score = 50; // Base score
  
  // Optimal word count (50-150 words for social media)
  if (factors.wordCount >= 50 && factors.wordCount <= 150) {
    score += 20;
  } else if (factors.wordCount < 50) {
    score += 10; // Short can be good too
  } else if (factors.wordCount > 200) {
    score -= 15; // Too long
  }
  
  // Sentence structure
  const avgWordsPerSentence = factors.wordCount / Math.max(factors.sentenceCount, 1);
  if (avgWordsPerSentence >= 8 && avgWordsPerSentence <= 20) {
    score += 15; // Good sentence length
  } else if (avgWordsPerSentence > 25) {
    score -= 10; // Too complex
  }
  
  return Math.max(0, Math.min(100, score));
}

// Calculate emotional engagement score
function calculateEmotionalScore(factors: EngagementFactors): number {
  let score = 30; // Base score
  
  if (factors.hasEmojis) score += 20;
  if (factors.hasPersonalStory) score += 25;
  if (factors.exclamationCount > 0) score += 10;
  if (factors.exclamationCount > 3) score -= 5; // Too many exclamations
  
  return Math.max(0, Math.min(100, score));
}

// Calculate structure score
function calculateStructureScore(factors: EngagementFactors, content: string): number {
  let score = 40; // Base score
  
  // Has clear structure (line breaks, lists, etc.)
  if (content.includes('\n')) score += 15;
  if (/•|·|\*|\d+\./.test(content)) score += 15; // Has lists
  if (factors.hasNumbers) score += 10; // Numbers grab attention
  
  // Good opening
  const firstWords = content.split(' ').slice(0, 3).join(' ').toLowerCase();
  const strongOpeners = ['did you know', 'here\'s', 'imagine', 'what if', 'today i'];
  if (strongOpeners.some(opener => firstWords.includes(opener))) {
    score += 15;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Calculate call-to-action score
function calculateCTAScore(factors: EngagementFactors): number {
  let score = 20; // Base score
  
  if (factors.hasQuestion) score += 30;
  if (factors.hasCallToAction) score += 25;
  if (factors.questionCount > 1) score += 10; // Multiple questions
  
  return Math.max(0, Math.min(100, score));
}

// Calculate timing score (based on content characteristics)
function calculateTimingScore(content: string): number {
  let score = 50; // Base score
  
  const lowerContent = content.toLowerCase();
  
  // Trending topics boost
  const trendingKeywords = [
    'ai', 'sustainability', 'remote work', 'mental health', 'productivity',
    'innovation', 'digital transformation', 'wellness', 'mindfulness'
  ];
  
  const trendingMatches = trendingKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  ).length;
  
  score += trendingMatches * 10;
  
  // Seasonal relevance (simplified)
  const currentMonth = new Date().getMonth();
  const seasonalKeywords = {
    0: ['resolution', 'new year', 'fresh start'], // January
    1: ['love', 'valentine', 'relationship'], // February
    2: ['spring', 'growth', 'renewal'], // March
    // Add more seasonal keywords as needed
  };
  
  const currentSeasonalKeywords = seasonalKeywords[currentMonth as keyof typeof seasonalKeywords] || [];
  const seasonalMatches = currentSeasonalKeywords.filter(keyword => 
    lowerContent.includes(keyword)
  ).length;
  
  score += seasonalMatches * 15;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate hashtag score
function calculateHashtagScore(hashtags: string[]): number {
  let score = 30; // Base score
  
  if (hashtags.length === 0) return 20;
  
  // Optimal hashtag count varies by platform, but 3-8 is generally good
  if (hashtags.length >= 3 && hashtags.length <= 8) {
    score += 40;
  } else if (hashtags.length >= 1 && hashtags.length <= 2) {
    score += 25;
  } else if (hashtags.length > 10) {
    score -= 10; // Too many hashtags can look spammy
  }
  
  // Bonus for variety in hashtag types
  const hashtagTypes = {
    branded: hashtags.filter(tag => tag.length > 10).length,
    popular: hashtags.filter(tag => ['love', 'instagood', 'photooftheday'].includes(tag)).length,
    niche: hashtags.filter(tag => tag.length < 8).length
  };
  
  if (hashtagTypes.branded > 0 && hashtagTypes.popular > 0) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

// Main engagement prediction function
export function predictEngagement(content: string, hashtags: string[] = []): EngagementScore {
  const factors = analyzeEngagementFactors(content, hashtags);
  
  const breakdown = {
    readability: calculateReadabilityScore(factors),
    emotional: calculateEmotionalScore(factors),
    structure: calculateStructureScore(factors, content),
    callToAction: calculateCTAScore(factors),
    timing: calculateTimingScore(content),
    hashtags: calculateHashtagScore(hashtags)
  };
  
  // Calculate weighted overall score
  const weights = {
    readability: 0.15,
    emotional: 0.25,
    structure: 0.15,
    callToAction: 0.20,
    timing: 0.10,
    hashtags: 0.15
  };
  
  const overall = Object.entries(breakdown).reduce((sum, [key, score]) => {
    return sum + (score * weights[key as keyof typeof weights]);
  }, 0);
  
  // Predict engagement levels
  const predictions = {
    likes: overall >= 75 ? 'high' as const : overall >= 50 ? 'medium' as const : 'low' as const,
    comments: factors.hasQuestion && factors.hasCallToAction ? 'high' as const : 
              factors.hasQuestion || factors.hasCallToAction ? 'medium' as const : 'low' as const,
    shares: factors.hasPersonalStory && breakdown.emotional > 70 ? 'high' as const :
            breakdown.structure > 60 ? 'medium' as const : 'low' as const
  };
  
  // Generate suggestions
  const suggestions: string[] = [];
  
  if (breakdown.readability < 60) {
    suggestions.push('Simplify your language and shorten sentences');
  }
  
  if (breakdown.emotional < 50) {
    suggestions.push('Add more emotional elements like personal stories or emojis');
  }
  
  if (breakdown.callToAction < 60) {
    suggestions.push('Include a clear call-to-action or question');
  }
  
  if (!factors.hasEmojis) {
    suggestions.push('Add relevant emojis to increase visual appeal');
  }
  
  if (hashtags.length < 3) {
    suggestions.push('Use 3-8 relevant hashtags to increase discoverability');
  }
  
  if (factors.wordCount > 200) {
    suggestions.push('Consider shortening your content for better engagement');
  }
  
  if (!factors.hasQuestion && !factors.hasCallToAction) {
    suggestions.push('Ask a question to encourage comments and interaction');
  }
  
  return {
    overall: Math.round(overall),
    breakdown,
    predictions,
    suggestions
  };
}

// Get engagement tips based on platform
export function getPlatformEngagementTips(platform: string): string[] {
  const tips: Record<string, string[]> = {
    instagram: [
      'Use 8-10 hashtags for optimal reach',
      'Post high-quality visuals',
      'Include a call-to-action in your caption',
      'Use Instagram Stories for behind-the-scenes content',
      'Engage with your audience in comments'
    ],
    twitter: [
      'Keep tweets under 280 characters',
      'Use 1-2 relevant hashtags',
      'Tweet during peak hours (9am-10am, 7pm-9pm)',
      'Include images or GIFs for higher engagement',
      'Participate in trending conversations'
    ],
    linkedin: [
      'Share professional insights and experiences',
      'Use 3-5 industry-relevant hashtags',
      'Post longer-form content (1000+ characters)',
      'Include a professional headshot',
      'Engage meaningfully with others\' posts'
    ],
    tiktok: [
      'Keep captions short and punchy',
      'Use trending sounds and effects',
      'Post consistently at the same times',
      'Jump on trending challenges',
      'Use 3-5 trending hashtags'
    ],
    facebook: [
      'Share personal stories and experiences',
      'Use minimal hashtags (1-2)',
      'Post when your audience is most active',
      'Include engaging visuals',
      'Ask questions to spark conversation'
    ]
  };
  
  return tips[platform] || tips.instagram;
}
