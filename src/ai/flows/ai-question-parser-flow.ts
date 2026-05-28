
'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Optimized for Chunk-based processing (Single page or segment).
 * Supports Multimodal Vision input for diagrams and tables.
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
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isMath: z.boolean().default(false),
});

const QuestionParserInputSchema = z.object({
  rawText: z.string().optional().describe("Raw text from OCR if available."),
  photoDataUri: z.string().optional().describe("Image of the page segment for Vision-based parsing."),
  preferredSubject: z.string().optional(),
});
export type QuestionParserInput = z.infer<typeof QuestionParserInputSchema>;

const QuestionParserOutputSchema = z.object({
  questions: z.array(QuestionSchema),
  diSets: z.array(z.object({
    passage: z.string().describe("The common passage or context for the DI set."),
    tableData: z.string().optional().describe("Markdown or JSON string representing table data."),
    questions: z.array(QuestionSchema),
  })).optional(),
  detectedLanguage: z.enum(['en', 'pa', 'mixed']).default('en'),
  confidenceScore: z.number().describe("0-1 score of parsing accuracy."),
});
export type QuestionParserOutput = z.infer<typeof QuestionParserOutputSchema>;

export async function parseQuestionsAi(input: QuestionParserInput): Promise<QuestionParserOutput> {
  return aiQuestionParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'universalQuestionParserPrompt',
  input: { schema: QuestionParserInputSchema },
  output: { schema: QuestionParserOutputSchema },
  prompt: `You are the CRACKLIX Chunk Ingestion Engine. 

Analyze the provided input (Page Image or Segment Text) from a Punjab competitive exam paper.

{{#if photoDataUri}}IMAGE CONTENT: {{media url=photoDataUri}}{{/if}}
{{#if rawText}}RAW TEXT SEGMENT: {{{rawText}}}{{/if}}

INSTRUCTIONS:
1. FOCUS: Extract EVERY question present in this segment. Do not stop after a few.
2. DETECT MODE: 
   - If English-only, provide English fields and clear Punjabi fields.
   - If Bilingual (English + Punjabi), pair them correctly. Ensure Raavi-style Punjabi.
3. MATH/QUANT: Represent fractions, roots, and symbols clearly in markdown or text.
4. DI SUPPORT: Group related questions into 'diSets' if a passage or table is present.
5. CLEANUP: Fix OCR artifacts. Ensure 'Correct Answer' matches one of the extracted options.

Respond with a complete JSON array of detected artifacts.`,
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
