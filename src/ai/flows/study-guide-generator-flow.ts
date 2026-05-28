'use server';
/**
 * @fileOverview AI Study Guide Generator flow.
 *
 * Generates structured, high-yield study materials for specific topics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StudyGuideInputSchema = z.object({
  topic: z.string().describe('The topic to generate a study guide for.'),
  exam: z.string().describe('The target exam (e.g., Punjab Police SI, PPSC PCS).'),
});
export type StudyGuideInput = z.infer<typeof StudyGuideInputSchema>;

const StudyGuideOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyFacts: z.array(z.string()),
  frequentlyAskedQuestions: z.array(z.object({
    q: z.string(),
    a: z.string()
  })),
  revisionTricks: z.array(z.string()),
});
export type StudyGuideOutput = z.infer<typeof StudyGuideOutputSchema>;

export async function generateStudyGuide(input: StudyGuideInput): Promise<StudyGuideOutput> {
  return studyGuideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'studyGuidePrompt',
  input: { schema: StudyGuideInputSchema },
  output: { schema: StudyGuideOutputSchema },
  prompt: `You are the CRACKLIX Content Architect. 

Generate a high-yield, structured study guide for the topic: {{{topic}}}
Target Exam: {{{exam}}}

The guide should be concise and focused on what is actually tested in Punjab government exams.
Include:
- A brief summary.
- Key facts/dates/figures (very important for Punjab GK).
- 3-5 frequently asked questions with clear answers.
- Revision tricks or mnemonics.

Respond as a JSON object matching the output schema.`,
});

const studyGuideFlow = ai.defineFlow(
  {
    name: 'studyGuideFlow',
    inputSchema: StudyGuideInputSchema,
    outputSchema: StudyGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);