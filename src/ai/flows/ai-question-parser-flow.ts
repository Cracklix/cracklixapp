'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Optimized for English, Punjabi, Math, and Data Interpretation (DI) layouts.
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
  photoDataUri: z.string().optional().describe("Image of the page for Vision-based parsing."),
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
  prompt: `You are the CRACKLIX Universal Ingestion Engine. 

Analyze the provided input (Text or Image) from a competitive exam paper (PPSC, PSSSB, or National level).

{{#if photoDataUri}}IMAGE CONTENT: {{media url=photoDataUri}}{{/if}}
{{#if rawText}}RAW OCR TEXT: {{{rawText}}}{{/if}}

INSTRUCTIONS:
1. DETECT MODE: 
   - If the content is English-only, provide English question fields and clear the Punjabi fields.
   - If Bilingual (English + Punjabi), pair them correctly.
   - If Math/Quant, ensure fractions and symbols are represented clearly in text/markdown.
2. DI SUPPORT: Detect Data Interpretation sets (Passages/Tables followed by multiple questions). Group them into 'diSets'.
3. ACCURACY: Detect 'Correct Answer' precisely. If it's not explicitly marked, infer it or set a low confidence score.
4. CLEANUP: Fix artifacts like "PunJab" -> "Punjab" or "0" -> "O".
5. RAAVI COMPLIANCE: Any Punjabi text must be formal Gurmukhi (Raavi style).

Return a strict JSON object matching the output schema.`,
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
