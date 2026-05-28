
'use server';
/**
 * @fileOverview AI Question Parser Flow.
 * Extracts structured bilingual MCQs from raw OCR text or study material.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionParserInputSchema = z.object({
  rawText: z.string().describe("The raw text extracted from a PDF or image."),
  preferredSubject: z.string().optional().describe("Hint for the subject context."),
});
export type QuestionParserInput = z.infer<typeof QuestionParserInputSchema>;

const QuestionParserOutputSchema = z.object({
  questions: z.array(z.object({
    question_en: z.string(),
    question_pa: z.string(),
    options_en: z.array(z.string()).length(4),
    options_pa: z.array(z.string()).length(4),
    correctAnswer: z.string().describe("The exact text of the correct option in English."),
    explanation_en: z.string(),
    explanation_pa: z.string(),
    subject: z.string(),
    topic: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
  })),
});
export type QuestionParserOutput = z.infer<typeof QuestionParserOutputSchema>;

export async function parseQuestionsAi(input: QuestionParserInput): Promise<QuestionParserOutput> {
  return aiQuestionParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiQuestionParserPrompt',
  input: { schema: QuestionParserInputSchema },
  output: { schema: QuestionParserOutputSchema },
  prompt: `You are the CRACKLIX Ingestion AI. 

Analyze the following raw text and extract all multiple choice questions.
For every question, you MUST provide a bilingual version:
1. English: Standard academic English.
2. Punjabi: Formal Gurmukhi (Raavi style) as used in PPSC/PSSSB exams.

{{#if preferredSubject}}Subject Hint: {{{preferredSubject}}}{{/if}}

Raw Text:
{{{rawText}}}

Instructions:
- If the text is only in one language, translate it to the other to make it bilingual.
- Ensure the 'correctAnswer' field matches one of the 'options_en' exactly.
- Identify the most likely subject (Punjab GK, Math, Reasoning, etc.) and difficulty.
- Format strictly as JSON.`,
});

const aiQuestionParserFlow = ai.defineFlow(
  {
    name: 'aiQuestionParserFlow',
    inputSchema: QuestionParserInputSchema,
    outputSchema: QuestionParserOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
