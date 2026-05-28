'use server';
/**
 * @fileOverview AI Recommendation flow that provides personalized study advice based on analytics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiRecommendationInputSchema = z.object({
  analyticsData: z.any().describe("The student's performance analytics (JSON)."),
  studentName: z.string().describe("The name of the student."),
});
export type AiRecommendationInput = z.infer<typeof AiRecommendationInputSchema>;

const AiRecommendationOutputSchema = z.object({
  weakTopics: z.array(z.string()).describe("Topics the student should focus on."),
  dailyTarget: z.string().describe("A specific target for today."),
  strategy: z.string().describe("A high-level revision strategy."),
  motivation: z.string().describe("An encouraging message."),
});
export type AiRecommendationOutput = z.infer<typeof AiRecommendationOutputSchema>;

export async function getAiRecommendations(input: AiRecommendationInput): Promise<AiRecommendationOutput> {
  return aiRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRecommendationPrompt',
  input: { schema: AiRecommendationInputSchema },
  output: { schema: AiRecommendationOutputSchema },
  prompt: `Analyze the following student performance data and provide a personalized learning roadmap.

Student: {{{studentName}}}
Data: {{{analyticsData}}}

Suggest specific weak topics to review, set a concrete daily target, provide a revision strategy, and end with a motivational note.

Respond as a JSON object matching the output schema.`,
});

const aiRecommendationFlow = ai.defineFlow(
  {
    name: 'aiRecommendationFlow',
    inputSchema: AiRecommendationInputSchema,
    outputSchema: AiRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
