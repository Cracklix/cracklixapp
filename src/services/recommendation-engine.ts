
'use client';

/**
 * AI Recommendation Engine
 * Analyzes performance data to suggest specific focus areas.
 */

export function getRecommendations(analytics: any) {
  const weakTopics = analytics.weakTopics || [];
  
  return {
    recommendedMocks: weakTopics.map((topic: string) => ({
      topic,
      priority: "high",
      description: `Targeted session for ${topic} based on previous inaccuracies.`
    })),
    overallInsight: weakTopics.length > 0 
      ? `You're struggling with ${weakTopics.join(', ')}. Try focused mock tests.` 
      : "Great work! Your performance is consistent across subjects."
  };
}
