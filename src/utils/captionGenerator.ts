// Caption Generator - Create captions from keywords or topics
// Free implementation with template-based generation

export interface CaptionOptions {
  keywords: string[];
  tone: 'professional' | 'casual' | 'friendly' | 'enthusiastic';
  platform: 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'facebook';
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export interface GeneratedCaption {
  caption: string;
  hashtags: string[];
  confidence: number;
  category: string;
}

// Caption templates organized by category and tone
const captionTemplates: Record<string, Record<string, string[]>> = {
  business: {
    professional: [
      "Excited to share insights on {topic}. {detail} has been instrumental in driving {outcome}.",
      "Key learnings from {topic}: {insight}. This approach has proven effective for {audience}.",
      "Reflecting on {topic} and its impact on {industry}. {observation} continues to shape our strategy.",
      "Today's focus: {topic}. {actionable_insight} for sustainable growth."
    ],
    casual: [
      "Just learned something cool about {topic}! {insight} - who knew?",
      "Been thinking about {topic} lately. {observation} is pretty interesting!",
      "Quick thoughts on {topic}: {insight}. What's your take?",
      "Love how {topic} is changing {industry}. {detail} is game-changing!"
    ],
    friendly: [
      "Hope everyone's having a great day! Wanted to share some thoughts on {topic}. {insight} - would love to hear your experiences!",
      "Hi friends! Been exploring {topic} and found {insight}. Anyone else working on this?",
      "Sharing some {topic} insights that might help! {detail} has been a game-changer for me.",
      "Hey everyone! Quick question about {topic} - {insight}. What are your thoughts?"
    ],
    enthusiastic: [
      "OMG! Just discovered something amazing about {topic}! {insight} is absolutely incredible!",
      "Can't contain my excitement about {topic}! {detail} is revolutionizing everything!",
      "This is HUGE! {topic} insights that will blow your mind: {insight}!",
      "SO pumped to share this {topic} breakthrough! {observation} is changing the game!"
    ]
  },
  
  lifestyle: {
    professional: [
      "Prioritizing {topic} has significantly improved my {outcome}. {insight} for sustainable wellness.",
      "Implementing {topic} strategies for better {result}. {observation} proves consistency matters.",
      "Research shows {topic} contributes to {benefit}. {actionable_tip} for optimal results."
    ],
    casual: [
      "Been really into {topic} lately! {insight} has made such a difference.",
      "Anyone else obsessed with {topic}? {observation} is so true!",
      "My {topic} journey update: {insight}. Loving the progress!",
      "Quick {topic} tip: {actionable_advice}. Game changer!"
    ],
    friendly: [
      "Hope you're all taking care of yourselves! {topic} has been helping me {benefit}. {insight} - try it out!",
      "Sharing my {topic} experience because it might help someone! {observation} made all the difference.",
      "Hey beautiful humans! {topic} reminder: {insight}. You've got this!",
      "Just wanted to share some {topic} love! {actionable_tip} - hope it helps your day!"
    ],
    enthusiastic: [
      "OBSESSED with my {topic} journey! {insight} is absolutely life-changing!",
      "Can we talk about how amazing {topic} is?! {observation} has me so excited!",
      "This {topic} transformation is INCREDIBLE! {benefit} beyond my wildest dreams!",
      "I'm literally glowing from {topic}! {insight} - you NEED to try this!"
    ]
  },
  
  food: {
    professional: [
      "Exploring {topic} cuisine and its cultural significance. {insight} demonstrates the artistry behind traditional cooking methods.",
      "Today's culinary focus: {topic}. {technique} elevates the dining experience through {detail}.",
      "Analyzing {topic} trends in modern gastronomy. {observation} reflects evolving consumer preferences."
    ],
    casual: [
      "Made some amazing {topic} today! {insight} totally changed the flavor.",
      "Trying out {topic} recipes and wow! {observation} makes such a difference.",
      "Anyone else love {topic}? {tip} is my secret ingredient!",
      "Weekend cooking: {topic} edition! {insight} was a game changer."
    ],
    friendly: [
      "Hope everyone's eating well! Just tried {topic} and wanted to share: {insight}. Let me know if you try it!",
      "Sharing my {topic} adventure! {observation} made it so much better. Recipe in comments!",
      "Hey food lovers! {topic} tip: {actionable_advice}. Happy cooking!",
      "Made some {topic} for the family today. {insight} - the kids actually loved it!"
    ],
    enthusiastic: [
      "OMG this {topic} is INCREDIBLE! {insight} blew my mind!",
      "I'm OBSESSED with this {topic} recipe! {observation} is pure magic!",
      "This {topic} is absolutely DIVINE! {technique} creates the most amazing {result}!",
      "GUYS! This {topic} hack will change your life! {insight} is everything!"
    ]
  },
  
  fitness: {
    professional: [
      "Incorporating {topic} into training protocols shows measurable improvements in {outcome}. {insight} for optimal performance.",
      "Research indicates {topic} enhances {benefit}. {technique} methodology proves most effective.",
      "Today's training focus: {topic}. {observation} demonstrates the importance of progressive overload."
    ],
    casual: [
      "Crushed my {topic} workout today! {insight} really helped push through.",
      "Been working on {topic} lately. {observation} is so true!",
      "Quick {topic} update: {progress}. Feeling stronger every day!",
      "Anyone else doing {topic}? {tip} has been a game changer!"
    ],
    friendly: [
      "Hope everyone's staying active! {topic} has been amazing for me. {insight} - give it a try!",
      "Sharing my {topic} journey because motivation helps! {observation} keeps me going.",
      "Hey fitness friends! {topic} reminder: {encouragement}. You're stronger than you think!",
      "Just finished an awesome {topic} session! {insight} - remember to listen to your body!"
    ],
    enthusiastic: [
      "CRUSHED my {topic} workout! {insight} had me feeling UNSTOPPABLE!",
      "This {topic} program is AMAZING! {progress} beyond what I imagined!",
      "I'm SO pumped about {topic}! {observation} is absolutely incredible!",
      "BEST {topic} session EVER! {achievement} - I'm on cloud nine!"
    ]
  }
};

// Emojis for different categories and contexts
const categoryEmojis: Record<string, string[]> = {
  business: ['💼', '📈', '🎯', '💡', '🚀', '⭐', '🔥', '💪'],
  lifestyle: ['✨', '🌟', '💫', '🌸', '🦋', '🌺', '💖', '🌈'],
  food: ['🍳', '👨‍🍳', '🥘', '😋', '🔥', '✨', '👌', '💯'],
  fitness: ['💪', '🔥', '⚡', '🏋️‍♀️', '🎯', '💯', '🚀', '⭐'],
  travel: ['✈️', '🌍', '📸', '🗺️', '🎒', '🌟', '💫', '🌅'],
  creative: ['🎨', '✨', '💡', '🖌️', '📸', '🌟', '💫', '🔥'],
  general: ['✨', '💫', '🌟', '💖', '🔥', '💯', '🎉', '😊']
};

// Call-to-action templates by platform
const ctaTemplates: Record<string, string[]> = {
  instagram: [
    'Double tap if you agree! ❤️',
    'Save this for later! 📌',
    'What do you think? Comment below! 👇',
    'Tag someone who needs this!',
    'Share your experience in the comments!'
  ],
  twitter: [
    'What\'s your take?',
    'Thoughts?',
    'Agree or disagree?',
    'Share your experience!',
    'Join the conversation!'
  ],
  linkedin: [
    'What are your thoughts on this?',
    'I\'d love to hear your perspective.',
    'Share your experience in the comments.',
    'What strategies have worked for you?',
    'Let\'s discuss in the comments.'
  ],
  tiktok: [
    'Drop a 🔥 if you agree!',
    'Which one are you? Comment below!',
    'Try this and let me know!',
    'Duet this with your version!',
    'Save this for later!'
  ],
  facebook: [
    'What do you think?',
    'Share your thoughts!',
    'Tag someone who needs this!',
    'Have you experienced this too?',
    'Let\'s discuss!'
  ]
};

// Detect category from keywords
function detectCategory(keywords: string[]): string {
  const categoryKeywords: Record<string, string[]> = {
    business: ['business', 'startup', 'entrepreneur', 'strategy', 'leadership', 'growth', 'success', 'productivity'],
    lifestyle: ['lifestyle', 'wellness', 'health', 'mindfulness', 'self-care', 'balance', 'happiness', 'motivation'],
    food: ['food', 'recipe', 'cooking', 'chef', 'kitchen', 'meal', 'delicious', 'taste'],
    fitness: ['fitness', 'workout', 'gym', 'exercise', 'training', 'health', 'strength', 'cardio'],
    travel: ['travel', 'adventure', 'explore', 'journey', 'vacation', 'wanderlust', 'destination'],
    creative: ['art', 'design', 'creative', 'photography', 'music', 'writing', 'artistic']
  };

  const keywordString = keywords.join(' ').toLowerCase();
  
  for (const [category, categoryWords] of Object.entries(categoryKeywords)) {
    if (categoryWords.some(word => keywordString.includes(word))) {
      return category;
    }
  }
  
  return 'general';
}

// Generate caption from keywords and options
export function generateCaption(options: CaptionOptions): GeneratedCaption {
  const category = detectCategory(options.keywords);
  const templates = captionTemplates[category]?.[options.tone] || captionTemplates.general?.[options.tone] || [];
  
  if (templates.length === 0) {
    return {
      caption: `Excited to share thoughts on ${options.keywords.join(', ')}!`,
      hashtags: [],
      confidence: 30,
      category: 'general'
    };
  }

  // Select random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Fill template with keywords
  let caption = fillCaptionTemplate(template, options.keywords);
  
  // Add emojis if requested
  if (options.includeEmojis) {
    caption = addEmojisToCaption(caption, category);
  }
  
  // Add call-to-action if requested
  if (options.includeCTA) {
    const ctas = ctaTemplates[options.platform] || ctaTemplates.instagram;
    const randomCTA = ctas[Math.floor(Math.random() * ctas.length)];
    caption += `\n\n${randomCTA}`;
  }
  
  // Generate relevant hashtags
  const hashtags = options.includeHashtags ? generateRelevantHashtags(options.keywords, category, options.platform) : [];
  
  return {
    caption,
    hashtags,
    confidence: 85,
    category
  };
}

// Fill template placeholders with keywords
function fillCaptionTemplate(template: string, keywords: string[]): string {
  const placeholders = template.match(/{[^}]+}/g) || [];
  let filledTemplate = template;
  
  const keywordPool = [...keywords];
  const usedKeywords = new Set<string>();
  
  placeholders.forEach(placeholder => {
    const key = placeholder.slice(1, -1); // Remove { }
    
    let replacement = '';
    
    // Try to find unused keyword first
    const availableKeywords = keywordPool.filter(k => !usedKeywords.has(k));
    
    if (availableKeywords.length > 0) {
      replacement = availableKeywords[Math.floor(Math.random() * availableKeywords.length)];
      usedKeywords.add(replacement);
    } else {
      // Fallback to any keyword
      replacement = keywordPool[Math.floor(Math.random() * keywordPool.length)] || 'this topic';
    }
    
    // Generate contextual content based on placeholder type
    switch (key) {
      case 'topic':
        replacement = keywords[0] || 'this topic';
        break;
      case 'insight':
        replacement = `${replacement} offers valuable perspectives`;
        break;
      case 'observation':
        replacement = `the impact of ${replacement}`;
        break;
      case 'detail':
        replacement = `working with ${replacement}`;
        break;
      case 'outcome':
        replacement = 'positive results';
        break;
      case 'benefit':
        replacement = 'significant improvements';
        break;
      default:
        // Use keyword as-is for other placeholders
        break;
    }
    
    filledTemplate = filledTemplate.replace(placeholder, replacement);
  });
  
  return filledTemplate;
}

// Add emojis to caption
function addEmojisToCaption(caption: string, category: string): string {
  const emojis = categoryEmojis[category] || categoryEmojis.general;
  const selectedEmojis = emojis.slice(0, 2); // Use 2 emojis max
  
  // Add emoji at the beginning
  if (selectedEmojis.length > 0) {
    caption = `${selectedEmojis[0]} ${caption}`;
  }
  
  // Sometimes add emoji at the end
  if (selectedEmojis.length > 1 && Math.random() > 0.5) {
    caption += ` ${selectedEmojis[1]}`;
  }
  
  return caption;
}

// Generate hashtags based on keywords and category
function generateRelevantHashtags(keywords: string[], category: string, platform: string): string[] {
  const hashtags: string[] = [];
  
  // Add keyword-based hashtags
  keywords.forEach(keyword => {
    const cleanKeyword = keyword.replace(/\s+/g, '').toLowerCase();
    if (cleanKeyword.length > 2) {
      hashtags.push(cleanKeyword);
    }
  });
  
  // Add category-specific hashtags
  const categoryHashtags: Record<string, string[]> = {
    business: ['business', 'entrepreneur', 'success', 'growth', 'leadership'],
    lifestyle: ['lifestyle', 'wellness', 'selfcare', 'mindfulness', 'positivevibes'],
    food: ['food', 'foodie', 'cooking', 'recipe', 'delicious'],
    fitness: ['fitness', 'workout', 'health', 'motivation', 'strong'],
    travel: ['travel', 'adventure', 'explore', 'wanderlust', 'journey'],
    creative: ['creative', 'art', 'design', 'inspiration', 'artistic']
  };
  
  const categoryTags = categoryHashtags[category] || [];
  hashtags.push(...categoryTags.slice(0, 3));
  
  // Add platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    instagram: ['instagood', 'photooftheday', 'love'],
    twitter: ['trending', 'thoughts', 'discussion'],
    linkedin: ['professional', 'networking', 'career'],
    tiktok: ['fyp', 'viral', 'trending'],
    facebook: ['community', 'share', 'connect']
  };
  
  const platformTags = platformHashtags[platform] || [];
  hashtags.push(...platformTags.slice(0, 2));
  
  // Remove duplicates and limit count
  const uniqueHashtags = [...new Set(hashtags)];
  return uniqueHashtags.slice(0, 8);
}

// Generate multiple caption variations
export function generateMultipleCaptions(options: CaptionOptions, count: number = 3): GeneratedCaption[] {
  const captions: GeneratedCaption[] = [];
  
  for (let i = 0; i < count; i++) {
    const caption = generateCaption(options);
    captions.push({
      ...caption,
      caption: caption.caption + (i > 0 ? ` (Variation ${i + 1})` : '')
    });
  }
  
  return captions;
}

// Generate caption from topic string
export function generateCaptionFromTopic(
  topic: string, 
  platform: string = 'instagram', 
  tone: string = 'friendly'
): GeneratedCaption {
  const keywords = topic.split(/\s+/).filter(word => word.length > 2);
  
  const options: CaptionOptions = {
    keywords,
    tone: tone as any,
    platform: platform as any,
    includeHashtags: true,
    includeEmojis: true,
    includeCTA: true
  };
  
  return generateCaption(options);
}
