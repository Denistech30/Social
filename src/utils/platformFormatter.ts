// Multi-Platform Formatter - Auto-adapt content for different social platforms
// Free implementation with platform-specific optimization

export type SocialPlatform = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook' | 'youtube';

export interface PlatformLimits {
  maxLength: number;
  maxHashtags: number;
  recommendedHashtags: number;
  supportsEmojis: boolean;
  supportsLinks: boolean;
  supportsLineBreaks: boolean;
  tone: 'professional' | 'casual' | 'creative';
}

export interface PlatformContent {
  platform: SocialPlatform;
  content: string;
  hashtags: string[];
  callToAction?: string;
  warnings: string[];
}

// Platform specifications and limits
const platformSpecs: Record<SocialPlatform, PlatformLimits> = {
  twitter: {
    maxLength: 280,
    maxHashtags: 2,
    recommendedHashtags: 1,
    supportsEmojis: true,
    supportsLinks: true,
    supportsLineBreaks: false,
    tone: 'casual'
  },
  instagram: {
    maxLength: 2200,
    maxHashtags: 30,
    recommendedHashtags: 8,
    supportsEmojis: true,
    supportsLinks: false,
    supportsLineBreaks: true,
    tone: 'creative'
  },
  linkedin: {
    maxLength: 3000,
    maxHashtags: 5,
    recommendedHashtags: 3,
    supportsEmojis: true,
    supportsLinks: true,
    supportsLineBreaks: true,
    tone: 'professional'
  },
  tiktok: {
    maxLength: 300,
    maxHashtags: 10,
    recommendedHashtags: 5,
    supportsEmojis: true,
    supportsLinks: false,
    supportsLineBreaks: false,
    tone: 'casual'
  },
  facebook: {
    maxLength: 63206,
    maxHashtags: 3,
    recommendedHashtags: 2,
    supportsEmojis: true,
    supportsLinks: true,
    supportsLineBreaks: true,
    tone: 'casual'
  },
  youtube: {
    maxLength: 5000,
    maxHashtags: 15,
    recommendedHashtags: 5,
    supportsEmojis: true,
    supportsLinks: true,
    supportsLineBreaks: true,
    tone: 'casual'
  }
};

// Platform-specific call-to-actions
const platformCTAs: Record<SocialPlatform, string[]> = {
  twitter: [
    "What's your take?",
    "Thoughts?",
    "Agree or disagree?",
    "Share your experience!",
    "Join the conversation!"
  ],
  instagram: [
    "Double tap if you agree! ❤️",
    "Save this for later! 📌",
    "Share with someone who needs this!",
    "What do you think? Comment below! 👇",
    "Tag a friend who would love this!"
  ],
  linkedin: [
    "What are your thoughts on this?",
    "I'd love to hear your perspective.",
    "Share your experience in the comments.",
    "What strategies have worked for you?",
    "Let's discuss in the comments."
  ],
  tiktok: [
    "Drop a 🔥 if you agree!",
    "Which one are you? Comment below!",
    "Try this and let me know how it goes!",
    "Duet this with your version!",
    "Save this for later!"
  ],
  facebook: [
    "What do you think about this?",
    "Share your thoughts in the comments!",
    "Tag someone who needs to see this!",
    "Have you experienced this too?",
    "Let's discuss!"
  ],
  youtube: [
    "Let me know in the comments what you think!",
    "Don't forget to like and subscribe!",
    "What would you like to see next?",
    "Share this video if it helped you!",
    "Hit the notification bell for more content!"
  ]
};

// Adapt content for specific platform
export function adaptContentForPlatform(
  originalContent: string,
  platform: SocialPlatform,
  selectedHashtags: string[] = []
): PlatformContent {
  const specs = platformSpecs[platform];
  const warnings: string[] = [];
  let adaptedContent = originalContent;
  let finalHashtags = [...selectedHashtags];

  // Platform-specific content adaptations
  switch (platform) {
    case 'twitter':
      adaptedContent = adaptForTwitter(originalContent, specs, warnings);
      break;
    case 'instagram':
      adaptedContent = adaptForInstagram(originalContent, specs, warnings);
      break;
    case 'linkedin':
      adaptedContent = adaptForLinkedIn(originalContent, specs, warnings);
      break;
    case 'tiktok':
      adaptedContent = adaptForTikTok(originalContent, specs, warnings);
      break;
    case 'facebook':
      adaptedContent = adaptForFacebook(originalContent, specs, warnings);
      break;
    case 'youtube':
      adaptedContent = adaptForYouTube(originalContent, specs, warnings);
      break;
  }

  // Limit hashtags based on platform
  if (finalHashtags.length > specs.maxHashtags) {
    finalHashtags = finalHashtags.slice(0, specs.maxHashtags);
    warnings.push(`Limited to ${specs.maxHashtags} hashtags for ${platform}`);
  }

  // Check content length
  const hashtagString = finalHashtags.map(tag => `#${tag}`).join(' ');
  const totalLength = adaptedContent.length + (hashtagString ? hashtagString.length + 2 : 0);
  
  if (totalLength > specs.maxLength) {
    warnings.push(`Content may be too long for ${platform} (${totalLength}/${specs.maxLength} chars)`);
  }

  // Add random CTA
  const ctas = platformCTAs[platform];
  const randomCTA = ctas[Math.floor(Math.random() * ctas.length)];

  return {
    platform,
    content: adaptedContent,
    hashtags: finalHashtags,
    callToAction: randomCTA,
    warnings
  };
}

function adaptForTwitter(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Remove line breaks for Twitter
  adapted = adapted.replace(/\n+/g, ' ').trim();

  // Shorten if too long
  if (adapted.length > specs.maxLength - 50) { // Leave room for hashtags
    adapted = adapted.substring(0, specs.maxLength - 50) + '...';
    warnings.push('Content truncated for Twitter character limit');
  }

  // Make it more conversational
  adapted = makeMoreCasual(adapted);

  return adapted;
}

function adaptForInstagram(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Add more emojis for Instagram
  adapted = addEmojis(adapted);

  // Break into shorter paragraphs
  adapted = adapted.replace(/\. /g, '.\n\n');

  // Make it more engaging
  adapted = makeMoreEngaging(adapted);

  return adapted;
}

function adaptForLinkedIn(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Make more professional
  adapted = makeProfessional(adapted);

  // Add professional insights
  if (adapted.length < 500) {
    adapted += '\n\nKey takeaway: This highlights the importance of strategic thinking in today\'s dynamic environment.';
  }

  return adapted;
}

function adaptForTikTok(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Make it shorter and punchier
  adapted = adapted.replace(/\n+/g, ' ').trim();
  
  if (adapted.length > 200) {
    adapted = adapted.substring(0, 200) + '...';
    warnings.push('Content shortened for TikTok');
  }

  // Add trending language
  adapted = addTrendyLanguage(adapted);

  return adapted;
}

function adaptForFacebook(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Keep it conversational and friendly
  adapted = makeMoreCasual(adapted);

  // Add community feel
  if (!adapted.includes('?')) {
    adapted += ' What do you think?';
  }

  return adapted;
}

function adaptForYouTube(content: string, specs: PlatformLimits, warnings: string[]): string {
  let adapted = content;

  // Add video context
  adapted = 'In this video: ' + adapted;

  // Add engagement hooks
  adapted += '\n\n⏰ Timestamps:\n0:00 Introduction\n0:30 Main content\n\n👍 Like this video if it helped you!';

  return adapted;
}

// Helper functions for tone adjustment
function makeMoreCasual(text: string): string {
  return text
    .replace(/\bvery\b/g, 'super')
    .replace(/\bexcellent\b/g, 'awesome')
    .replace(/\bimportant\b/g, 'key')
    .replace(/\bsignificant\b/g, 'big')
    .replace(/\butilize\b/g, 'use');
}

function makeProfessional(text: string): string {
  return text
    .replace(/\bawesome\b/g, 'excellent')
    .replace(/\bsuper\b/g, 'very')
    .replace(/\bgreat\b/g, 'outstanding')
    .replace(/\bcool\b/g, 'innovative')
    .replace(/\bstuff\b/g, 'content');
}

function makeMoreEngaging(text: string): string {
  // Add question words and engagement hooks
  if (!text.includes('?') && !text.includes('!')) {
    text += ' What\'s your experience with this?';
  }
  return text;
}

function addEmojis(text: string): string {
  const emojiMap: Record<string, string> = {
    'success': 'success 🎉',
    'great': 'great ✨',
    'awesome': 'awesome 🔥',
    'love': 'love ❤️',
    'new': 'new ✨',
    'amazing': 'amazing 🤩',
    'perfect': 'perfect 💯',
    'excited': 'excited 🎊'
  };

  let result = text;
  Object.entries(emojiMap).forEach(([word, replacement]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    result = result.replace(regex, replacement);
  });

  return result;
}

function addTrendyLanguage(text: string): string {
  return text
    .replace(/\bvery good\b/g, 'fire')
    .replace(/\bamazing\b/g, 'iconic')
    .replace(/\bawesome\b/g, 'slaps')
    .replace(/\bgreat\b/g, 'hits different');
}

// Get all platform adaptations at once
export function adaptForAllPlatforms(
  content: string,
  selectedHashtags: string[] = []
): Record<SocialPlatform, PlatformContent> {
  const platforms: SocialPlatform[] = ['twitter', 'instagram', 'linkedin', 'tiktok', 'facebook', 'youtube'];
  const adaptations: Record<SocialPlatform, PlatformContent> = {} as Record<SocialPlatform, PlatformContent>;

  platforms.forEach(platform => {
    adaptations[platform] = adaptContentForPlatform(content, platform, selectedHashtags);
  });

  return adaptations;
}

// Get platform recommendations
export function getPlatformRecommendations(content: string): {
  platform: SocialPlatform;
  score: number;
  reason: string;
}[] {
  const recommendations = [];
  const wordCount = content.split(/\s+/).length;
  const hasQuestions = content.includes('?');
  const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/gu.test(content);
  const isProfessional = /\b(business|professional|strategy|leadership|corporate)\b/i.test(content);
  const isVisual = /\b(photo|image|video|visual|look|see|watch)\b/i.test(content);

  // Twitter - good for short, conversational content
  recommendations.push({
    platform: 'twitter',
    score: wordCount < 30 ? 90 : Math.max(20, 90 - wordCount),
    reason: wordCount < 30 ? 'Perfect length for Twitter' : 'May need shortening for Twitter'
  });

  // Instagram - good for visual, engaging content
  recommendations.push({
    platform: 'instagram',
    score: (isVisual ? 40 : 0) + (hasEmojis ? 30 : 0) + (hasQuestions ? 20 : 0) + 10,
    reason: isVisual ? 'Great for visual storytelling' : 'Add visuals for better Instagram performance'
  });

  // LinkedIn - good for professional content
  recommendations.push({
    platform: 'linkedin',
    score: (isProfessional ? 50 : 0) + (wordCount > 50 ? 30 : 0) + 20,
    reason: isProfessional ? 'Perfect for professional audience' : 'Consider adding business insights'
  });

  // TikTok - good for short, trendy content
  recommendations.push({
    platform: 'tiktok',
    score: (wordCount < 20 ? 40 : 0) + (hasEmojis ? 30 : 0) + (!isProfessional ? 20 : 0) + 10,
    reason: wordCount < 20 ? 'Great for TikTok captions' : 'Keep it short and trendy for TikTok'
  });

  return recommendations.sort((a, b) => b.score - a.score);
}
