'use server';
/**
 * @fileOverview CRACKLIX AI Tutor flow.
 * 
 * This flow acts as a specialized tutor for Punjab Government exam students, 
 * answering questions on Punjab GK, Reasoning, English, Math, and Current Affairs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiTutorInputSchema = z.object({
  message: z.string().describe("The student's question or doubt."),
  context: z.string().optional().describe("Additional context like current topic or quiz question."),
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
  prompt: `You are the CRACKLIX AI Tutor, an expert mentor for students preparing for Punjab Government exams (PPSC, PSSSB, Punjab Police, etc.).

Your goal is to provide clear, concise, and accurate explanations for student doubts.

Guidelines:
- If context is provided, use it to tailor your answer.
- Focus strictly on subjects relevant to Punjab exams: Punjab GK, History, Geography, Reasoning, Quant, English, and Current Affairs.
- Use simple, encouraging language.
- Format your response with clear Markdown (bolding, lists) for readability.

Student Question: {{{message}}}
{{#if context}}Context: {{{context}}}{{/if}}

Respond as a JSON object matching the output schema.`,
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
