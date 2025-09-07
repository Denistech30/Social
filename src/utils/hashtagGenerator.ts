// Smart Hashtag Generator - Free Implementation
// Context-aware hashtag suggestions with platform optimization

export interface HashtagSuggestion {
  tag: string;
  relevance: number;
  category: string;
  platforms: Platform[];
  popularity: 'trending' | 'popular' | 'niche';
}

export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook';

export interface HashtagDatabase {
  [category: string]: {
    keywords: string[];
    hashtags: {
      tag: string;
      popularity: 'trending' | 'popular' | 'niche';
      platforms: Platform[];
    }[];
  };
}

// Comprehensive hashtag database organized by categories
const hashtagDB: HashtagDatabase = {
  business: {
    keywords: ['business', 'entrepreneur', 'startup', 'company', 'corporate', 'professional', 'work', 'career', 'success', 'growth', 'strategy', 'leadership', 'management', 'finance', 'marketing', 'sales'],
    hashtags: [
      { tag: 'business', popularity: 'popular', platforms: ['linkedin', 'twitter', 'instagram'] },
      { tag: 'entrepreneur', popularity: 'popular', platforms: ['linkedin', 'twitter', 'instagram'] },
      { tag: 'startup', popularity: 'trending', platforms: ['twitter', 'linkedin'] },
      { tag: 'success', popularity: 'popular', platforms: ['linkedin', 'instagram', 'twitter'] },
      { tag: 'leadership', popularity: 'popular', platforms: ['linkedin', 'twitter'] },
      { tag: 'businesstips', popularity: 'popular', platforms: ['linkedin', 'twitter'] },
      { tag: 'entrepreneurlife', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'hustle', popularity: 'trending', platforms: ['instagram', 'twitter', 'tiktok'] },
      { tag: 'mindset', popularity: 'trending', platforms: ['instagram', 'linkedin', 'tiktok'] },
      { tag: 'motivation', popularity: 'popular', platforms: ['instagram', 'linkedin', 'twitter'] }
    ]
  },
  
  technology: {
    keywords: ['tech', 'technology', 'ai', 'artificial intelligence', 'software', 'coding', 'programming', 'developer', 'app', 'digital', 'innovation', 'data', 'cloud', 'mobile', 'web', 'internet'],
    hashtags: [
      { tag: 'tech', popularity: 'popular', platforms: ['twitter', 'linkedin', 'instagram'] },
      { tag: 'ai', popularity: 'trending', platforms: ['twitter', 'linkedin'] },
      { tag: 'artificialintelligence', popularity: 'trending', platforms: ['linkedin', 'twitter'] },
      { tag: 'coding', popularity: 'popular', platforms: ['twitter', 'instagram', 'tiktok'] },
      { tag: 'programming', popularity: 'popular', platforms: ['twitter', 'linkedin'] },
      { tag: 'developer', popularity: 'popular', platforms: ['twitter', 'linkedin'] },
      { tag: 'innovation', popularity: 'popular', platforms: ['linkedin', 'twitter'] },
      { tag: 'digitaltransformation', popularity: 'trending', platforms: ['linkedin', 'twitter'] },
      { tag: 'machinelearning', popularity: 'trending', platforms: ['twitter', 'linkedin'] },
      { tag: 'blockchain', popularity: 'popular', platforms: ['twitter', 'linkedin'] }
    ]
  },

  lifestyle: {
    keywords: ['life', 'lifestyle', 'health', 'fitness', 'wellness', 'food', 'travel', 'fashion', 'beauty', 'home', 'family', 'friends', 'love', 'happiness', 'inspiration', 'motivation'],
    hashtags: [
      { tag: 'lifestyle', popularity: 'popular', platforms: ['instagram', 'tiktok', 'facebook'] },
      { tag: 'life', popularity: 'popular', platforms: ['instagram', 'twitter', 'facebook'] },
      { tag: 'wellness', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'selfcare', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'mindfulness', popularity: 'popular', platforms: ['instagram', 'linkedin'] },
      { tag: 'inspiration', popularity: 'popular', platforms: ['instagram', 'twitter', 'facebook'] },
      { tag: 'positivevibes', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'grateful', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'blessed', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'goodvibes', popularity: 'trending', platforms: ['instagram', 'tiktok'] }
    ]
  },

  fitness: {
    keywords: ['fitness', 'workout', 'gym', 'exercise', 'health', 'training', 'muscle', 'cardio', 'strength', 'yoga', 'running', 'sport', 'athlete'],
    hashtags: [
      { tag: 'fitness', popularity: 'popular', platforms: ['instagram', 'tiktok', 'twitter'] },
      { tag: 'workout', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'gym', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'fitnessmotivation', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'healthylifestyle', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'training', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'strongnotskinny', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'fitspo', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'gains', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'nopainnogain', popularity: 'popular', platforms: ['instagram', 'twitter'] }
    ]
  },

  food: {
    keywords: ['food', 'cooking', 'recipe', 'meal', 'delicious', 'tasty', 'restaurant', 'chef', 'kitchen', 'dinner', 'lunch', 'breakfast', 'healthy', 'vegan', 'vegetarian'],
    hashtags: [
      { tag: 'food', popularity: 'popular', platforms: ['instagram', 'tiktok', 'facebook'] },
      { tag: 'foodie', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'delicious', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'yummy', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'cooking', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'recipe', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'homemade', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'foodporn', popularity: 'trending', platforms: ['instagram'] },
      { tag: 'instafood', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'healthyfood', popularity: 'trending', platforms: ['instagram', 'tiktok'] }
    ]
  },

  travel: {
    keywords: ['travel', 'vacation', 'trip', 'adventure', 'explore', 'journey', 'destination', 'wanderlust', 'beach', 'mountain', 'city', 'culture', 'photography'],
    hashtags: [
      { tag: 'travel', popularity: 'popular', platforms: ['instagram', 'tiktok', 'facebook'] },
      { tag: 'wanderlust', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'adventure', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'explore', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'vacation', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'travelgram', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'instatravel', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'backpacking', popularity: 'niche', platforms: ['instagram', 'twitter'] },
      { tag: 'digitalnomad', popularity: 'trending', platforms: ['instagram', 'twitter', 'linkedin'] },
      { tag: 'bucketlist', popularity: 'popular', platforms: ['instagram', 'twitter'] }
    ]
  },

  creative: {
    keywords: ['art', 'creative', 'design', 'photography', 'music', 'writing', 'artist', 'creative', 'inspiration', 'aesthetic', 'beautiful', 'artistic'],
    hashtags: [
      { tag: 'art', popularity: 'popular', platforms: ['instagram', 'tiktok', 'twitter'] },
      { tag: 'creative', popularity: 'popular', platforms: ['instagram', 'linkedin', 'twitter'] },
      { tag: 'design', popularity: 'popular', platforms: ['instagram', 'linkedin', 'twitter'] },
      { tag: 'photography', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'artist', popularity: 'popular', platforms: ['instagram', 'tiktok'] },
      { tag: 'creativity', popularity: 'popular', platforms: ['instagram', 'linkedin'] },
      { tag: 'aesthetic', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'artoftheday', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'instaart', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'handmade', popularity: 'popular', platforms: ['instagram', 'facebook'] }
    ]
  },

  general: {
    keywords: ['day', 'today', 'moment', 'time', 'new', 'amazing', 'awesome', 'great', 'love', 'happy', 'fun', 'good', 'best', 'nice', 'cool'],
    hashtags: [
      { tag: 'love', popularity: 'popular', platforms: ['instagram', 'facebook', 'twitter'] },
      { tag: 'happy', popularity: 'popular', platforms: ['instagram', 'facebook', 'tiktok'] },
      { tag: 'instagood', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'photooftheday', popularity: 'popular', platforms: ['instagram'] },
      { tag: 'amazing', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'awesome', popularity: 'popular', platforms: ['instagram', 'twitter'] },
      { tag: 'fun', popularity: 'popular', platforms: ['instagram', 'tiktok', 'facebook'] },
      { tag: 'smile', popularity: 'popular', platforms: ['instagram', 'facebook'] },
      { tag: 'mood', popularity: 'trending', platforms: ['instagram', 'tiktok'] },
      { tag: 'vibes', popularity: 'trending', platforms: ['instagram', 'tiktok'] }
    ]
  }
};

// Extract keywords from text
export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Remove common stop words
  const stopWords = new Set([
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
    'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
    'her', 'its', 'our', 'their', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'shall', 'a', 'an'
  ]);

  return words.filter(word => !stopWords.has(word));
}

// Find relevant hashtags based on keywords
export function findRelevantHashtags(keywords: string[]): HashtagSuggestion[] {
  const suggestions: HashtagSuggestion[] = [];
  const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

  // Search through all categories
  Object.entries(hashtagDB).forEach(([category, data]) => {
    // Check if any keywords match this category
    const matchingKeywords = data.keywords.filter(keyword => 
      keywordSet.has(keyword) || 
      keywords.some(k => k.includes(keyword) || keyword.includes(k))
    );

    if (matchingKeywords.length > 0) {
      // Add hashtags from this category
      data.hashtags.forEach(hashtag => {
        const relevance = matchingKeywords.length / data.keywords.length * 100;
        suggestions.push({
          tag: hashtag.tag,
          relevance,
          category,
          platforms: hashtag.platforms,
          popularity: hashtag.popularity
        });
      });
    }
  });

  // Sort by relevance and remove duplicates
  const uniqueSuggestions = suggestions.reduce((acc, current) => {
    const existing = acc.find(item => item.tag === current.tag);
    if (!existing || existing.relevance < current.relevance) {
      return [...acc.filter(item => item.tag !== current.tag), current];
    }
    return acc;
  }, [] as HashtagSuggestion[]);

  return uniqueSuggestions.sort((a, b) => b.relevance - a.relevance);
}

// Generate platform-specific hashtags
export function generateHashtagsForPlatform(
  text: string, 
  platform: Platform, 
  maxCount: number = 10
): HashtagSuggestion[] {
  const keywords = extractKeywords(text);
  const allSuggestions = findRelevantHashtags(keywords);
  
  // Filter for platform and apply platform-specific rules
  let platformSuggestions = allSuggestions.filter(suggestion => 
    suggestion.platforms.includes(platform)
  );

  // Platform-specific optimizations
  switch (platform) {
    case 'twitter':
      // Twitter: Prefer trending and popular hashtags, limit to 2-3
      platformSuggestions = platformSuggestions
        .filter(s => s.popularity === 'trending' || s.popularity === 'popular')
        .slice(0, Math.min(maxCount, 3));
      break;
      
    case 'instagram':
      // Instagram: Mix of popular and niche, up to 30 but recommend 5-10
      platformSuggestions = platformSuggestions.slice(0, Math.min(maxCount, 10));
      break;
      
    case 'linkedin':
      // LinkedIn: Professional hashtags, 3-5 max
      platformSuggestions = platformSuggestions
        .filter(s => ['business', 'technology', 'creative'].includes(s.category))
        .slice(0, Math.min(maxCount, 5));
      break;
      
    case 'tiktok':
      // TikTok: Trending hashtags, mix of popular and niche
      platformSuggestions = platformSuggestions
        .sort((a, b) => {
          if (a.popularity === 'trending' && b.popularity !== 'trending') return -1;
          if (b.popularity === 'trending' && a.popularity !== 'trending') return 1;
          return b.relevance - a.relevance;
        })
        .slice(0, Math.min(maxCount, 8));
      break;
      
    case 'facebook':
      // Facebook: Broader hashtags, less important
      platformSuggestions = platformSuggestions
        .filter(s => s.popularity === 'popular')
        .slice(0, Math.min(maxCount, 5));
      break;
  }

  return platformSuggestions;
}

// Generate general hashtag suggestions
export function generateHashtags(text: string, maxCount: number = 15): HashtagSuggestion[] {
  const keywords = extractKeywords(text);
  const suggestions = findRelevantHashtags(keywords);
  
  // Mix of trending, popular, and niche hashtags
  const trending = suggestions.filter(s => s.popularity === 'trending').slice(0, 3);
  const popular = suggestions.filter(s => s.popularity === 'popular').slice(0, 8);
  const niche = suggestions.filter(s => s.popularity === 'niche').slice(0, 4);
  
  return [...trending, ...popular, ...niche].slice(0, maxCount);
}

// Get trending hashtags by category
export function getTrendingHashtags(category?: string): HashtagSuggestion[] {
  const trending: HashtagSuggestion[] = [];
  
  const categoriesToCheck = category ? [category] : Object.keys(hashtagDB);
  
  categoriesToCheck.forEach(cat => {
    if (hashtagDB[cat]) {
      hashtagDB[cat].hashtags
        .filter(h => h.popularity === 'trending')
        .forEach(hashtag => {
          trending.push({
            tag: hashtag.tag,
            relevance: 100,
            category: cat,
            platforms: hashtag.platforms,
            popularity: hashtag.popularity
          });
        });
    }
  });
  
  return trending;
}
