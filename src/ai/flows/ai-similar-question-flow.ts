
'use server';
/**
 * @fileOverview AI Similar Question Generator.
 * Takes a reference question and generates variants to expand the bank.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SimilarQuestionInputSchema = z.object({
  referenceQuestion: z.object({
    question_en: z.string(),
    question_pa: z.string(),
    options_en: z.array(z.string()),
    options_pa: z.array(z.string()),
    correctAnswer: z.string(),
    subject: z.string(),
    topic: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }),
  count: z.number().default(1),
});
export type SimilarQuestionInput = z.infer<typeof SimilarQuestionInputSchema>;

const SimilarQuestionOutputSchema = z.object({
  variants: z.array(z.object({
    question_en: z.string(),
    question_pa: z.string(),
    options_en: z.array(z.string()).length(4),
    options_pa: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    explanation_en: z.string(),
    explanation_pa: z.string(),
    subject: z.string(),
    topic: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    qualityScore: z.number(),
  })),
});
export type SimilarQuestionOutput = z.infer<typeof SimilarQuestionOutputSchema>;

export async function generateVariants(input: SimilarQuestionInput): Promise<SimilarQuestionOutput> {
  return aiSimilarQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSimilarQuestionPrompt',
  input: { schema: SimilarQuestionInputSchema },
  output: { schema: SimilarQuestionOutputSchema },
  prompt: `You are the CRACKLIX Content Architect. 

I am providing a reference MCQ used in Punjab Government exams.
Reference: {{{referenceQuestion.question_en}}} ({{{referenceQuestion.subject}}})

Generate {{{count}}} new, high-quality MCQs that are similar in concept but use different data, scenarios, or angles.
Requirements:
1. Bilingual: English and Gurmukhi (Raavi style).
2. Difficulty: Maintain or slightly vary from {{{referenceQuestion.difficulty}}}.
3. Logic: Ensure explanations are deep and educational.
4. Accuracy: The correct answer MUST be one of the options.

Format strictly as JSON.`,
});

const aiSimilarQuestionFlow = ai.defineFlow(
  {
    name: 'aiSimilarQuestionFlow',
    inputSchema: SimilarQuestionInputSchema,
    outputSchema: SimilarQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
