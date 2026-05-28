
'use server';
/**
 * @fileOverview CRACKLIX AI Tutor flow.
 * 
 * Specialized for Punjab Government exams with Bilingual support.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiTutorInputSchema = z.object({
  message: z.string().describe("The student's question or doubt."),
  context: z.string().optional().describe("Additional context like current topic or quiz question."),
  language: z.enum(['en', 'pa']).default('en').describe("Preferred response language."),
});
export type AiTutorInput = z.infer<typeof AiTutorInputSchema>;

const AiTutorOutputSchema = z.object({
  reply: z.string().describe("The AI tutor's response in markdown format."),
  suggestedTopics: z.array(z.string()).optional().describe("Related topics the student might find useful."),
});
export type AiTutorOutput = z.infer<typeof AiTutorOutputSchema>;

export async function askAiTutor(input: AiTutorInput): Promise<AiTutorOutput> {
  return aiTutorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorPrompt',
  input: { schema: AiTutorInputSchema },
  output: { schema: AiTutorOutputSchema },
  prompt: `You are the CRACKLIX AI Tutor, the elite mentor for Punjab Government exam students.

Your goal is to provide clear, concise, and accurate explanations.

Guidelines:
- LANGUAGE: You MUST respond in {{language}} (English if 'en', Punjabi (Gurmukhi) if 'pa').
- FOCUS: Strictly Punjab Govt Exams (PPSC, PSSSB, Punjab Police, Patwari, Master Cadre, etc.).
- Tone: Professional, encouraging, and authoritative on Punjab GK.
- Format: Clear Markdown.

Student Question: {{{message}}}
{{#if context}}Context: {{{context}}}{{/if}}

Respond strictly in the requested language ({{language}}).`,
});

const aiTutorFlow = ai.defineFlow(
  {
    name: 'aiTutorFlow',
    inputSchema: AiTutorInputSchema,
    outputSchema: AiTutorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
