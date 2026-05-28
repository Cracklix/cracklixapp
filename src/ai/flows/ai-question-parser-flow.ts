'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Redesigned for Atomic Classification and 15-Subject Mapping.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question_en: z.string(),
  question_pa: z.string().optional(),
  options_en: z.array(z.string()).length(4),
  options_pa: z.array(z.string()).length(4).optional(),
  correctAnswer: z.string().describe("The exact text of the correct option in English."),
  explanation_en: z.string().optional(),
  explanation_pa: z.string().optional(),
  subject: z.enum([
    'Punjab GK', 'Quant', 'Reasoning', 'English', 'Punjabi', 
    'Computer', 'Current Affairs', 'General Science', 'History', 
    'Polity', 'Geography', 'Agriculture', 'Static GK', 
    'Law/Constitution', 'Environment'
  ]),
  topic: z.string().describe("Specific sub-topic e.g. 'Percentage' for Quant or 'Rivers' for Punjab GK."),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isMath: z.boolean().default(false),
});

const QuestionParserInputSchema = z.object({
  rawText: z.string().optional().describe("Raw text for parsing (e.g. from ChatGPT or OCR)."),
  photoDataUri: z.string().optional().describe("Image for Vision-based parsing."),
  preferredSubject: z.string().optional(),
});
export type QuestionParserInput = z.infer<typeof QuestionParserInputSchema>;

const QuestionParserOutputSchema = z.object({
  questions: z.array(QuestionSchema),
  confidenceScore: z.number().describe("0-1 score of parsing accuracy."),
});
export type QuestionParserOutput = z.infer<typeof QuestionParserOutputSchema>;

export async function parseQuestionsAi(input: QuestionParserInput): Promise<QuestionParserOutput> {
  return aiQuestionParserFlow(input);
}

const aiQuestionParserFlow = ai.defineFlow(
  {
    name: 'aiQuestionParserFlow',
    inputSchema: QuestionParserInputSchema,
    outputSchema: QuestionParserOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'universalQuestionParserPrompt',
      input: { schema: QuestionParserInputSchema },
      output: { schema: QuestionParserOutputSchema },
      prompt: `You are the CRACKLIX Ingestion Engine. 

Parse the following content and extract EVERY single question as structured JSON.

CONTENT:
{{#if photoDataUri}}IMAGE CONTENT PROVIDED{{/if}}
{{#if rawText}}TEXT CONTENT: {{{rawText}}}{{/if}}

STRICT INSTRUCTIONS:
1. CLASSIFICATION: Map each question to one of the 15 core subjects: Punjab GK, Quant, Reasoning, English, Punjabi, Computer, Current Affairs, General Science, History, Polity, Geography, Agriculture, Static GK, Law/Constitution, Environment.
2. TOPIC: Detect a specific sub-topic (e.g., 'Bhakra Dam', 'Profit & Loss', 'Raavi Grammar').
3. BILINGUAL: If the source is bilingual, preserve both English and Punjabi (Raavi font style).
4. QUALITY: Fix OCR errors. Ensure correctAnswer exactly matches one of the options.

{{#if photoDataUri}}Vision input processing active...{{media url=photoDataUri}}{{/if}}`,
    });

    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to extract questions.");
    return output;
  }
);
