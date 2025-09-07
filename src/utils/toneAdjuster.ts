// Tone Adjuster - Convert between professional/casual/friendly tones
// Free implementation with tone transformation algorithms

export type ToneType = 'professional' | 'casual' | 'friendly' | 'enthusiastic' | 'formal';

export interface ToneAdjustment {
  originalTone: ToneType;
  targetTone: ToneType;
  adjustedContent: string;
  confidence: number;
  changes: string[];
}

// Word mappings for different tones
const toneTransformations: Record<ToneType, {
  replacements: Record<string, string>;
  additions: string[];
  removals: string[];
  patterns: { from: RegExp; to: string }[];
}> = {
  professional: {
    replacements: {
      'awesome': 'excellent',
      'super': 'very',
      'great': 'outstanding',
      'cool': 'innovative',
      'stuff': 'content',
      'thing': 'element',
      'guys': 'team',
      'hey': 'hello',
      'gonna': 'going to',
      'wanna': 'want to',
      'can\'t': 'cannot',
      'won\'t': 'will not',
      'don\'t': 'do not',
      'isn\'t': 'is not'
    },
    additions: [
      'I would like to',
      'Please consider',
      'I believe that',
      'In my opinion',
      'It is important to note'
    ],
    removals: ['lol', 'omg', 'btw', 'tbh', 'ngl'],
    patterns: [
      { from: /!{2,}/g, to: '.' },
      { from: /\?{2,}/g, to: '?' }
    ]
  },
  
  casual: {
    replacements: {
      'excellent': 'awesome',
      'outstanding': 'great',
      'innovative': 'cool',
      'utilize': 'use',
      'demonstrate': 'show',
      'facilitate': 'help',
      'implement': 'do',
      'cannot': 'can\'t',
      'will not': 'won\'t',
      'do not': 'don\'t',
      'is not': 'isn\'t'
    },
    additions: [
      'Just',
      'Pretty',
      'Really',
      'Actually',
      'Basically'
    ],
    removals: [],
    patterns: [
      { from: /\. Furthermore,/g, to: '. Also,' },
      { from: /\. Additionally,/g, to: '. Plus,' }
    ]
  },
  
  friendly: {
    replacements: {
      'you should': 'you might want to',
      'you must': 'you could',
      'it is necessary': 'it would be great',
      'required': 'helpful',
      'mandatory': 'recommended'
    },
    additions: [
      'Hope this helps!',
      'Let me know if you need anything!',
      'Feel free to reach out!',
      'Happy to help!',
      'Thanks for reading!'
    ],
    removals: [],
    patterns: [
      { from: /\bI think\b/g, to: 'I feel' },
      { from: /\bIn conclusion\b/g, to: 'To wrap up' }
    ]
  },
  
  enthusiastic: {
    replacements: {
      'good': 'amazing',
      'nice': 'fantastic',
      'okay': 'awesome',
      'fine': 'perfect',
      'interesting': 'incredible'
    },
    additions: [
      'Exciting!',
      'Can\'t wait!',
      'This is amazing!',
      'So pumped!',
      'Love this!'
    ],
    removals: [],
    patterns: [
      { from: /\./g, to: '!' },
      { from: /!{3,}/g, to: '!!' }
    ]
  },
  
  formal: {
    replacements: {
      'get': 'obtain',
      'show': 'demonstrate',
      'help': 'assist',
      'use': 'utilize',
      'start': 'commence',
      'end': 'conclude',
      'buy': 'purchase',
      'sell': 'distribute'
    },
    additions: [
      'Please be advised',
      'It should be noted',
      'For your consideration',
      'Respectfully',
      'Thank you for your attention'
    ],
    removals: ['lol', 'omg', 'hey', 'hi there'],
    patterns: [
      { from: /!/g, to: '.' },
      { from: /\?{2,}/g, to: '?' }
    ]
  }
};

// Detect current tone of content
export function detectTone(content: string): { tone: ToneType; confidence: number } {
  const lowerContent = content.toLowerCase();
  const scores: Record<ToneType, number> = {
    professional: 0,
    casual: 0,
    friendly: 0,
    enthusiastic: 0,
    formal: 0
  };
  
  // Professional indicators
  const professionalWords = ['utilize', 'demonstrate', 'implement', 'facilitate', 'optimize', 'strategic', 'comprehensive'];
  const professionalCount = professionalWords.filter(word => lowerContent.includes(word)).length;
  scores.professional += professionalCount * 10;
  
  // Casual indicators
  const casualWords = ['awesome', 'cool', 'stuff', 'gonna', 'wanna', 'can\'t', 'don\'t'];
  const casualCount = casualWords.filter(word => lowerContent.includes(word)).length;
  scores.casual += casualCount * 10;
  
  // Friendly indicators
  const friendlyWords = ['hope', 'feel free', 'happy to', 'let me know', 'thanks'];
  const friendlyCount = friendlyWords.filter(word => lowerContent.includes(word)).length;
  scores.friendly += friendlyCount * 10;
  
  // Enthusiastic indicators
  const exclamationCount = (content.match(/!/g) || []).length;
  const enthusiasticWords = ['amazing', 'incredible', 'fantastic', 'excited', 'love'];
  const enthusiasticCount = enthusiasticWords.filter(word => lowerContent.includes(word)).length;
  scores.enthusiastic += (exclamationCount * 5) + (enthusiasticCount * 8);
  
  // Formal indicators
  const formalWords = ['obtain', 'commence', 'conclude', 'purchase', 'respectfully', 'consideration'];
  const formalCount = formalWords.filter(word => lowerContent.includes(word)).length;
  scores.formal += formalCount * 10;
  
  // Find highest scoring tone
  const maxScore = Math.max(...Object.values(scores));
  const detectedTone = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as ToneType || 'casual';
  
  // Calculate confidence based on score difference
  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = maxScore > 0 ? Math.min(100, (maxScore - sortedScores[1]) * 2 + 50) : 30;
  
  return { tone: detectedTone, confidence };
}

// Adjust content to target tone
export function adjustTone(content: string, targetTone: ToneType): ToneAdjustment {
  const { tone: originalTone, confidence } = detectTone(content);
  
  if (originalTone === targetTone) {
    return {
      originalTone,
      targetTone,
      adjustedContent: content,
      confidence,
      changes: ['Content already matches target tone']
    };
  }
  
  let adjustedContent = content;
  const changes: string[] = [];
  const transformations = toneTransformations[targetTone];
  
  // Apply word replacements
  Object.entries(transformations.replacements).forEach(([from, to]) => {
    const regex = new RegExp(`\\b${from}\\b`, 'gi');
    if (regex.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(regex, to);
      changes.push(`Replaced "${from}" with "${to}"`);
    }
  });
  
  // Apply pattern transformations
  transformations.patterns.forEach(({ from, to }) => {
    if (from.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(from, to);
      changes.push(`Applied ${targetTone} formatting patterns`);
    }
  });
  
  // Remove unwanted words
  transformations.removals.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(adjustedContent)) {
      adjustedContent = adjustedContent.replace(regex, '');
      changes.push(`Removed informal word "${word}"`);
    }
  });
  
  // Add tone-appropriate elements
  if (targetTone === 'friendly' && !content.includes('!') && !content.includes('?')) {
    const friendlyEnding = transformations.additions[Math.floor(Math.random() * transformations.additions.length)];
    adjustedContent += ` ${friendlyEnding}`;
    changes.push('Added friendly closing');
  }
  
  // Clean up extra spaces
  adjustedContent = adjustedContent.replace(/\s+/g, ' ').trim();
  
  return {
    originalTone,
    targetTone,
    adjustedContent,
    confidence,
    changes: changes.length > 0 ? changes : ['Minor tone adjustments applied']
  };
}

// Get tone recommendations based on platform
export function getToneRecommendations(platform: string): {
  recommended: ToneType;
  alternatives: ToneType[];
  reason: string;
} {
  const recommendations: Record<string, { recommended: ToneType; alternatives: ToneType[]; reason: string }> = {
    linkedin: {
      recommended: 'professional',
      alternatives: ['formal', 'friendly'],
      reason: 'Professional tone builds credibility and trust with business audience'
    },
    twitter: {
      recommended: 'casual',
      alternatives: ['enthusiastic', 'friendly'],
      reason: 'Casual tone fits Twitter\'s conversational nature and character limits'
    },
    instagram: {
      recommended: 'friendly',
      alternatives: ['enthusiastic', 'casual'],
      reason: 'Friendly tone encourages engagement and builds community'
    },
    tiktok: {
      recommended: 'enthusiastic',
      alternatives: ['casual', 'friendly'],
      reason: 'Enthusiastic tone matches TikTok\'s energetic and creative environment'
    },
    facebook: {
      recommended: 'friendly',
      alternatives: ['casual', 'professional'],
      reason: 'Friendly tone works well for Facebook\'s diverse, personal network'
    },
    youtube: {
      recommended: 'enthusiastic',
      alternatives: ['friendly', 'casual'],
      reason: 'Enthusiastic tone keeps viewers engaged throughout longer content'
    }
  };
  
  return recommendations[platform] || recommendations.instagram;
}

// Bulk tone adjustment for multiple tones
export function adjustToMultipleTones(content: string, targetTones: ToneType[]): Record<ToneType, ToneAdjustment> {
  const results: Record<ToneType, ToneAdjustment> = {} as Record<ToneType, ToneAdjustment>;
  
  targetTones.forEach(tone => {
    results[tone] = adjustTone(content, tone);
  });
  
  return results;
}

// Get tone examples
export function getToneExamples(): Record<ToneType, string> {
  return {
    professional: "I am pleased to announce our new product launch. This innovative solution will significantly enhance our clients' operational efficiency.",
    casual: "Hey everyone! Just launched our awesome new product. It's gonna make your life so much easier!",
    friendly: "Hi there! I'm excited to share our new product with you. I think you'll really love how it helps with your daily tasks. Let me know what you think!",
    enthusiastic: "OMG! Our incredible new product is finally here!! This is going to be absolutely AMAZING for everyone! Can't wait for you to try it! 🎉",
    formal: "We are honored to present our latest product offering. This comprehensive solution has been meticulously designed to address the sophisticated requirements of our esteemed clientele."
  };
}
