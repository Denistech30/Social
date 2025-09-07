// Content Templates - AI-generated post templates for different industries
// Free implementation with customizable templates

export interface ContentTemplate {
  id: string;
  name: string;
  industry: string;
  type: 'announcement' | 'question' | 'tip' | 'story' | 'promotion' | 'educational';
  template: string;
  placeholders: string[];
  example: string;
  platforms: string[];
}

export const contentTemplates: ContentTemplate[] = [
  // Business & Entrepreneurship
  {
    id: 'business-announcement',
    name: 'Business Announcement',
    industry: 'business',
    type: 'announcement',
    template: '🎉 Excited to announce {announcement}!\n\nThis {achievement} represents {impact} for our {audience}.\n\n{details}\n\nWhat do you think about this development?',
    placeholders: ['announcement', 'achievement', 'impact', 'audience', 'details'],
    example: '🎉 Excited to announce our new product launch!\n\nThis milestone represents a major breakthrough for our customers.\n\nAfter months of development, we\'re ready to revolutionize the industry.\n\nWhat do you think about this development?',
    platforms: ['linkedin', 'twitter', 'facebook']
  },
  {
    id: 'business-tip',
    name: 'Business Tip',
    industry: 'business',
    type: 'tip',
    template: '💡 {tip_category} Tip:\n\n{main_tip}\n\nWhy this works:\n• {reason_1}\n• {reason_2}\n• {reason_3}\n\nTry this and let me know how it goes!',
    placeholders: ['tip_category', 'main_tip', 'reason_1', 'reason_2', 'reason_3'],
    example: '💡 Productivity Tip:\n\nTime-block your calendar for deep work sessions.\n\nWhy this works:\n• Eliminates decision fatigue\n• Reduces context switching\n• Increases focus quality\n\nTry this and let me know how it goes!',
    platforms: ['linkedin', 'twitter', 'instagram']
  },

  // Technology
  {
    id: 'tech-educational',
    name: 'Tech Educational',
    industry: 'technology',
    type: 'educational',
    template: '🔧 {topic} Explained:\n\n{definition}\n\nKey benefits:\n✅ {benefit_1}\n✅ {benefit_2}\n✅ {benefit_3}\n\nReal-world application: {example}\n\nQuestions about {topic}?',
    placeholders: ['topic', 'definition', 'benefit_1', 'benefit_2', 'benefit_3', 'example'],
    example: '🔧 Machine Learning Explained:\n\nAI systems that learn patterns from data without explicit programming.\n\nKey benefits:\n✅ Automated decision making\n✅ Pattern recognition\n✅ Predictive analytics\n\nReal-world application: Recommendation systems like Netflix suggestions.\n\nQuestions about Machine Learning?',
    platforms: ['linkedin', 'twitter', 'youtube']
  },

  // Health & Fitness
  {
    id: 'fitness-motivation',
    name: 'Fitness Motivation',
    industry: 'fitness',
    type: 'story',
    template: '💪 {workout_type} Update:\n\n{achievement} today! {details}\n\nRemember: {motivational_message}\n\nProgress isn\'t always linear, but consistency is key.\n\nWhat\'s your fitness win today? 👇',
    placeholders: ['workout_type', 'achievement', 'details', 'motivational_message'],
    example: '💪 Strength Training Update:\n\nHit a new personal record today! Deadlifted 20lbs more than last month.\n\nRemember: Small improvements compound over time.\n\nProgress isn\'t always linear, but consistency is key.\n\nWhat\'s your fitness win today? 👇',
    platforms: ['instagram', 'tiktok', 'facebook']
  },

  // Food & Cooking
  {
    id: 'food-recipe',
    name: 'Recipe Share',
    industry: 'food',
    type: 'educational',
    template: '🍳 {dish_name} Recipe:\n\nIngredients:\n• {ingredient_1}\n• {ingredient_2}\n• {ingredient_3}\n\nQuick steps:\n1. {step_1}\n2. {step_2}\n3. {step_3}\n\nPro tip: {cooking_tip}\n\nTry it and tag me! 📸',
    placeholders: ['dish_name', 'ingredient_1', 'ingredient_2', 'ingredient_3', 'step_1', 'step_2', 'step_3', 'cooking_tip'],
    example: '🍳 Avocado Toast Recipe:\n\nIngredients:\n• 2 slices sourdough bread\n• 1 ripe avocado\n• Salt and pepper\n\nQuick steps:\n1. Toast bread until golden\n2. Mash avocado with fork\n3. Spread and season\n\nPro tip: Add a squeeze of lemon to prevent browning!\n\nTry it and tag me! 📸',
    platforms: ['instagram', 'tiktok', 'youtube']
  },

  // Travel
  {
    id: 'travel-story',
    name: 'Travel Experience',
    industry: 'travel',
    type: 'story',
    template: '✈️ {destination} Adventures:\n\n{experience_description}\n\nHighlights:\n🌟 {highlight_1}\n🌟 {highlight_2}\n🌟 {highlight_3}\n\nTravel tip: {travel_tip}\n\nWhere should I explore next? 🗺️',
    placeholders: ['destination', 'experience_description', 'highlight_1', 'highlight_2', 'highlight_3', 'travel_tip'],
    example: '✈️ Tokyo Adventures:\n\nJust spent an incredible week exploring Japan\'s vibrant capital city!\n\nHighlights:\n🌟 Cherry blossoms in Ueno Park\n🌟 Authentic ramen in Shibuya\n🌟 Sunrise at Senso-ji Temple\n\nTravel tip: Get a JR Pass for unlimited train travel!\n\nWhere should I explore next? 🗺️',
    platforms: ['instagram', 'facebook', 'youtube']
  },

  // Creative & Art
  {
    id: 'creative-process',
    name: 'Creative Process',
    industry: 'creative',
    type: 'story',
    template: '🎨 Creative Process:\n\n{project_description}\n\nMy approach:\n1️⃣ {step_1}\n2️⃣ {step_2}\n3️⃣ {step_3}\n\nBiggest challenge: {challenge}\nBiggest lesson: {lesson}\n\nWhat\'s your creative process like?',
    placeholders: ['project_description', 'step_1', 'step_2', 'step_3', 'challenge', 'lesson'],
    example: '🎨 Creative Process:\n\nWorking on a new logo design for a sustainable fashion brand.\n\nMy approach:\n1️⃣ Research brand values and competitors\n2️⃣ Sketch multiple concepts by hand\n3️⃣ Refine digitally with feedback loops\n\nBiggest challenge: Balancing minimalism with meaning\nBiggest lesson: Sometimes less really is more\n\nWhat\'s your creative process like?',
    platforms: ['instagram', 'linkedin', 'twitter']
  },

  // General/Lifestyle
  {
    id: 'lifestyle-reflection',
    name: 'Life Reflection',
    industry: 'lifestyle',
    type: 'story',
    template: '✨ {time_period} Reflection:\n\n{main_insight}\n\nWhat I learned:\n💭 {lesson_1}\n💭 {lesson_2}\n💭 {lesson_3}\n\nGrateful for: {gratitude}\n\nWhat\'s one thing you\'re grateful for today?',
    placeholders: ['time_period', 'main_insight', 'lesson_1', 'lesson_2', 'lesson_3', 'gratitude'],
    example: '✨ Monthly Reflection:\n\nThis month taught me the power of small, consistent actions.\n\nWhat I learned:\n💭 Progress beats perfection every time\n💭 Community support accelerates growth\n💭 Self-care isn\'t selfish, it\'s essential\n\nGrateful for: The amazing people who inspire me daily\n\nWhat\'s one thing you\'re grateful for today?',
    platforms: ['instagram', 'facebook', 'linkedin']
  },

  // Question/Engagement Templates
  {
    id: 'question-poll',
    name: 'Engagement Poll',
    industry: 'general',
    type: 'question',
    template: '🤔 Quick Question:\n\n{question_setup}\n\nOption A: {option_a}\nOption B: {option_b}\n\n{context_or_reason}\n\nDrop your choice in the comments! 👇\n\n{additional_question}',
    placeholders: ['question_setup', 'option_a', 'option_b', 'context_or_reason', 'additional_question'],
    example: '🤔 Quick Question:\n\nWhat\'s your preferred work style?\n\nOption A: Deep focus blocks\nOption B: Frequent short breaks\n\nI\'ve been experimenting with both and curious about your experience!\n\nDrop your choice in the comments! 👇\n\nWhat productivity hack changed your life?',
    platforms: ['instagram', 'linkedin', 'facebook', 'twitter']
  }
];

// Get templates by industry
export function getTemplatesByIndustry(industry: string): ContentTemplate[] {
  return contentTemplates.filter(template => 
    template.industry === industry || template.industry === 'general'
  );
}

// Get templates by type
export function getTemplatesByType(type: string): ContentTemplate[] {
  return contentTemplates.filter(template => template.type === type);
}

// Fill template with user data
export function fillTemplate(template: ContentTemplate, data: Record<string, string>): string {
  let filledTemplate = template.template;
  
  template.placeholders.forEach(placeholder => {
    const value = data[placeholder] || `[${placeholder}]`;
    const regex = new RegExp(`{${placeholder}}`, 'g');
    filledTemplate = filledTemplate.replace(regex, value);
  });
  
  return filledTemplate;
}

// Generate random template content
export function generateRandomContent(template: ContentTemplate): string {
  const randomData: Record<string, string> = {};
  
  // Sample data for different placeholder types
  const sampleData: Record<string, string[]> = {
    // Business
    announcement: ['our Series A funding', 'a strategic partnership', 'our new office opening', 'our team expansion'],
    achievement: ['milestone', 'breakthrough', 'success', 'accomplishment'],
    impact: ['tremendous value', 'significant benefits', 'positive change', 'meaningful progress'],
    audience: ['customers', 'community', 'industry', 'stakeholders'],
    
    // Tips and advice
    tip_category: ['Productivity', 'Leadership', 'Marketing', 'Growth', 'Strategy'],
    main_tip: ['Focus on one task at a time', 'Set clear boundaries', 'Invest in relationships', 'Measure what matters'],
    
    // Technology
    topic: ['Artificial Intelligence', 'Blockchain', 'Cloud Computing', 'Cybersecurity', 'Data Science'],
    benefit_1: ['Increased efficiency', 'Cost reduction', 'Better accuracy', 'Scalable solutions'],
    benefit_2: ['Improved user experience', 'Real-time insights', 'Automated processes', 'Enhanced security'],
    benefit_3: ['Future-proof technology', 'Competitive advantage', 'Innovation catalyst', 'Data-driven decisions'],
    
    // Fitness
    workout_type: ['Strength Training', 'Cardio Session', 'Yoga Practice', 'HIIT Workout'],
    fitness_achievement: ['Completed my toughest workout', 'Hit a new personal record', 'Tried a new exercise', 'Pushed through mental barriers'],
    
    // General
    time_period: ['Weekly', 'Monthly', 'Quarterly', 'This Week', 'This Month'],
    gratitude: ['supportive friends and family', 'new opportunities', 'good health', 'personal growth']
  };
  
  template.placeholders.forEach(placeholder => {
    if (sampleData[placeholder]) {
      const options = sampleData[placeholder];
      randomData[placeholder] = options[Math.floor(Math.random() * options.length)];
    } else {
      randomData[placeholder] = `[${placeholder}]`;
    }
  });
  
  return fillTemplate(template, randomData);
}

// Get template suggestions based on content
export function suggestTemplates(content: string): ContentTemplate[] {
  const suggestions: ContentTemplate[] = [];
  const lowerContent = content.toLowerCase();
  
  // Analyze content for keywords and suggest relevant templates
  const keywords = {
    business: ['business', 'startup', 'company', 'entrepreneur', 'strategy', 'growth'],
    technology: ['tech', 'ai', 'software', 'code', 'data', 'digital'],
    fitness: ['workout', 'gym', 'fitness', 'health', 'exercise', 'training'],
    food: ['food', 'recipe', 'cooking', 'meal', 'kitchen', 'chef'],
    travel: ['travel', 'trip', 'vacation', 'adventure', 'explore', 'journey'],
    creative: ['art', 'design', 'creative', 'photography', 'music', 'writing']
  };
  
  // Find matching industries
  const matchingIndustries: string[] = [];
  Object.entries(keywords).forEach(([industry, words]) => {
    if (words.some(word => lowerContent.includes(word))) {
      matchingIndustries.push(industry);
    }
  });
  
  // Get templates for matching industries
  matchingIndustries.forEach(industry => {
    suggestions.push(...getTemplatesByIndustry(industry).slice(0, 2));
  });
  
  // If no matches, suggest general templates
  if (suggestions.length === 0) {
    suggestions.push(...getTemplatesByIndustry('general').slice(0, 3));
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}
