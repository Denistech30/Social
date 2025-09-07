// Free AI Text Enhancement Utilities
// No paid APIs required - all client-side processing

export interface TextAnalysis {
  readabilityScore: number;
  sentimentScore: number;
  wordCount: number;
  sentenceCount: number;
  suggestions: string[];
  engagementTips: string[];
}

export interface Enhancement {
  type: 'grammar' | 'engagement' | 'readability' | 'tone';
  original: string;
  suggestion: string;
  reason: string;
}

// Simple readability calculator (Flesch Reading Ease)
export function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.max(0, Math.min(100, score));
}

function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;
  
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;

  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  // Handle silent 'e'
  if (word.endsWith('e')) count--;
  
  return Math.max(1, count);
}

// Simple sentiment analysis using word lists
export function analyzeSentiment(text: string): number {
  const positiveWords = [
    'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'incredible',
    'love', 'perfect', 'wonderful', 'best', 'beautiful', 'happy', 'excited', 'thrilled',
    'success', 'win', 'achieve', 'breakthrough', 'celebrate', 'proud', 'grateful'
  ];

  const negativeWords = [
    'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'disgusting',
    'disappointed', 'frustrated', 'angry', 'sad', 'upset', 'fail', 'problem',
    'issue', 'difficult', 'struggle', 'worry', 'stress', 'concern'
  ];

  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
    if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
  });

  const totalEmotionalWords = positiveCount + negativeCount;
  if (totalEmotionalWords === 0) return 0; // Neutral

  return ((positiveCount - negativeCount) / totalEmotionalWords) * 100;
}

// Generate engagement optimization suggestions
export function getEngagementTips(text: string): string[] {
  const tips: string[] = [];
  const lowerText = text.toLowerCase();

  // Check for questions
  if (!text.includes('?')) {
    tips.push('Add a question to encourage engagement');
  }

  // Check for emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
  if (!emojiRegex.test(text)) {
    tips.push('Consider adding relevant emojis to increase visual appeal');
  }

  // Check for call-to-action words
  const ctaWords = ['comment', 'share', 'like', 'follow', 'subscribe', 'click', 'join', 'try'];
  const hasCTA = ctaWords.some(word => lowerText.includes(word));
  if (!hasCTA) {
    tips.push('Add a call-to-action to drive engagement');
  }

  // Check length for different platforms
  if (text.length > 280) {
    tips.push('Consider shortening for Twitter (280 character limit)');
  }

  if (text.length < 50) {
    tips.push('Consider adding more detail for better engagement');
  }

  // Check for personal pronouns
  const personalWords = ['i', 'my', 'me', 'we', 'our', 'you', 'your'];
  const hasPersonal = personalWords.some(word => lowerText.includes(word));
  if (!hasPersonal) {
    tips.push('Make it more personal with "you", "I", or "we"');
  }

  return tips;
}

// Generate writing improvement suggestions
export function getWritingSuggestions(text: string): Enhancement[] {
  const suggestions: Enhancement[] = [];

  // Check for passive voice
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am'];
  const sentences = text.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().split(/\s+/);
    const hasPassive = passiveIndicators.some(indicator => 
      words.includes(indicator) && words.includes('by')
    );
    
    if (hasPassive && sentence.trim()) {
      suggestions.push({
        type: 'grammar',
        original: sentence.trim(),
        suggestion: 'Consider using active voice for more impact',
        reason: 'Active voice is more engaging and direct'
      });
    }
  });

  // Check for weak words
  const weakWords = ['very', 'really', 'quite', 'rather', 'somewhat', 'pretty'];
  weakWords.forEach(weak => {
    if (text.toLowerCase().includes(weak)) {
      suggestions.push({
        type: 'tone',
        original: weak,
        suggestion: 'Use a stronger, more specific word',
        reason: 'Removes filler words for clearer communication'
      });
    }
  });

  // Check for repetitive words
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordCount: { [key: string]: number } = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  Object.entries(wordCount).forEach(([word, count]) => {
    if (count > 3) {
      suggestions.push({
        type: 'readability',
        original: word,
        suggestion: 'Consider using synonyms to avoid repetition',
        reason: 'Variety keeps readers engaged'
      });
    }
  });

  return suggestions;
}

// Main analysis function
export function analyzeText(text: string): TextAnalysis {
  if (!text.trim()) {
    return {
      readabilityScore: 0,
      sentimentScore: 0,
      wordCount: 0,
      sentenceCount: 0,
      suggestions: [],
      engagementTips: []
    };
  }

  const readabilityScore = calculateReadability(text);
  const sentimentScore = analyzeSentiment(text);
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const suggestions = getWritingSuggestions(text).map(s => s.suggestion);
  const engagementTips = getEngagementTips(text);

  return {
    readabilityScore,
    sentimentScore,
    wordCount,
    sentenceCount,
    suggestions,
    engagementTips
  };
}

// Text enhancement functions
export function enhanceForEngagement(text: string): string {
  let enhanced = text;

  // Add question if none exists
  if (!enhanced.includes('?') && enhanced.length > 20) {
    enhanced += '\n\nWhat do you think?';
  }

  // Suggest power words
  const powerWords = {
    'good': 'amazing',
    'bad': 'terrible',
    'big': 'massive',
    'small': 'tiny',
    'nice': 'fantastic',
    'ok': 'perfect'
  };

  Object.entries(powerWords).forEach(([weak, strong]) => {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    enhanced = enhanced.replace(regex, strong);
  });

  return enhanced;
}

export function enhanceReadability(text: string): string {
  let enhanced = text;

  // Break long sentences
  const sentences = enhanced.split(/\.\s+/);
  const improvedSentences = sentences.map(sentence => {
    if (sentence.split(/\s+/).length > 20) {
      // Try to split at conjunctions
      const conjunctions = [' and ', ' but ', ' or ', ' so ', ' because '];
      for (const conj of conjunctions) {
        if (sentence.includes(conj)) {
          return sentence.replace(conj, `.${conj.charAt(1).toUpperCase()}${conj.slice(2)}`);
        }
      }
    }
    return sentence;
  });

  return improvedSentences.join('. ');
}
