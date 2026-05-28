
'use server';
/**
 * @fileOverview AI Content Assistant for Admins.
 * Helps draft high-quality bilingual questions and explanations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ContentAssistantInputSchema = z.object({
  topic: z.string().describe("The subject or topic to generate content for."),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().default(1).describe("Number of questions to draft."),
});
export type ContentAssistantInput = z.infer<typeof ContentAssistantInputSchema>;

const ContentAssistantOutputSchema = z.object({
  questions: z.array(z.object({
    question_en: z.string(),
    question_pa: z.string(),
    options_en: z.array(z.string()),
    options_pa: z.array(z.string()),
    correctAnswer: z.string(),
    explanation_en: z.string(),
    explanation_pa: z.string(),
    subject: z.string(),
  })),
});
export type ContentAssistantOutput = z.infer<typeof ContentAssistantOutputSchema>;

export async function draftAiContent(input: ContentAssistantInput): Promise<ContentAssistantOutput> {
  return aiContentAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentAssistantPrompt',
  input: { schema: ContentAssistantInputSchema },
  output: { schema: ContentAssistantOutputSchema },
  prompt: `You are the CRACKLIX Academic Architect. 

Generate {{{count}}} high-yield, bilingual (English & Punjabi) MCQs for the topic: {{{topic}}}.
Difficulty: {{{difficulty}}}.

The questions MUST be tailored for Punjab Government exams (PPSC, PSSSB).
Include clear, step-by-step explanations in both languages.
The Punjabi (Gurmukhi) must be formal and exam-accurate (Raavi font style).

Respond as a JSON object matching the output schema.`,
});

const aiContentAssistantFlow = ai.defineFlow(
  {
    name: 'aiContentAssistantFlow',
    inputSchema: ContentAssistantInputSchema,
    outputSchema: ContentAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
