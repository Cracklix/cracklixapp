'use server';
/**
 * @fileOverview Enterprise AI Question Parser Flow.
 * Optimized for messy, bilingual Punjab exam PDFs with layout awareness.
 * 
 * - parseQuestionsAi - Extracts structured atomic MCQs from raw OCR text.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionParserInputSchema = z.object({
  rawText: z.string().describe("The raw text extracted from a PDF or image."),
  preferredSubject: z.string().optional().describe("Hint for the subject context."),
  sourceMetadata: z.string().optional().describe("Context like exam name or year."),
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
    confidenceScore: z.number().describe("AI confidence in the extraction (0-1)"),
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
  prompt: `You are the CRACKLIX Core Ingestion Engine. 

Analyze the following raw OCR text which originates from a Punjab Government Exam paper (PPSC/PSSSB).
Text is often messy, contains watermarks, headers, and footer noise.

INPUT DATA:
{{{rawText}}}

{{#if preferredSubject}}SUBJECT HINT: {{{preferredSubject}}}{{/if}}
{{#if sourceMetadata}}METADATA: {{{sourceMetadata}}}{{/if}}

INSTRUCTIONS:
1. LAYOUT DETECTION: Ignore headers, page numbers, and instructions. Focus on MCQ blocks.
2. BILINGUAL PAIRING: Detect English questions and their corresponding Punjabi (Gurmukhi) translations. 
   - If only one language is present, you MUST generate the translation yourself in Raavi font style.
3. OPTION DETECTION: Detect options in patterns like (A, B, C, D), (1, 2, 3, 4), or (a, b, c, d).
4. CLEANUP: Fix common OCR artifacts (e.g. 'PunJab' -> 'Punjab', '0' -> 'O').
5. QUALITY: Assign a confidence score based on how clear the question-answer mapping was.

Structure your response as a strict JSON object matching the output schema.`,
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
