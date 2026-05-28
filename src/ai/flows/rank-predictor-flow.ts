
'use server';
/**
 * @fileOverview AI Rank Predictor flow.
 * Analyzes performance data to predict selection probability in competitive exams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RankPredictorInputSchema = z.object({
  studentName: z.string(),
  examType: z.string().describe("Target exam like Punjab Police SI, PPSC PCS"),
  averageAccuracy: z.number(),
  mocksAttempted: z.number(),
  topicPerformance: z.any().describe("JSON mapping of topics to accuracy"),
});
export type RankPredictorInput = z.infer<typeof RankPredictorInputSchema>;

const RankPredictorOutputSchema = z.object({
  probability: z.number().describe("Percentage probability of selection (0-100)"),
  predictedRankRange: z.string().describe("Estimated rank range"),
  keyWeaknesses: z.array(z.string()),
  strategicAdvice: z.string().describe("Tactical advice to improve rank"),
  motivation: z.string(),
});
export type RankPredictorOutput = z.infer<typeof RankPredictorOutputSchema>;

export async function predictSelectionRank(input: RankPredictorInput): Promise<RankPredictorOutput> {
  return rankPredictorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rankPredictorPrompt',
  input: { schema: RankPredictorInputSchema },
  output: { schema: RankPredictorOutputSchema },
  prompt: `You are the CRACKLIX National Rank Strategist. 

Analyze the candidate's data for the {{{examType}}} exam in Punjab.

Student: {{{studentName}}}
Accuracy: {{{averageAccuracy}}}%
Mocks: {{{mocksAttempted}}}
Data: {{{topicPerformance}}}

Based on current trends and historical cutoff data for Punjab State Exams:
1. Estimate the selection probability.
2. Provide a realistic predicted rank range (e.g. 100-500).
3. Identify 3 critical weaknesses that could prevent selection.
4. Give a high-impact strategy for the next 30 days.

Respond as a JSON object matching the output schema.`,
});

const rankPredictorFlow = ai.defineFlow(
  {
    name: 'rankPredictorFlow',
    inputSchema: RankPredictorInputSchema,
    outputSchema: RankPredictorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
