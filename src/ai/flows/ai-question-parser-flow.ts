
'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Optimized for Chunk-based processing (Single page or segment).
 * Redesigned for 100% extraction accuracy and DI/Table support.
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
  prompt: `You are the CRACKLIX High-Yield Ingestion Engine. 

Analyze this document chunk (Page Image) from a Punjab competitive exam paper.

IMAGE CONTENT: {{media url=photoDataUri}}
{{#if rawText}}SUPPLEMENTAL TEXT: {{{rawText}}}{{/if}}

STRICT INSTRUCTIONS:
1. MANDATORY EXTRACTION: You MUST extract EVERY question visible. Do not summarize. 
2. STRUCTURE: Map questions to the schema. If a question is bilingual, pair the English and Punjabi text.
3. DATA INTERPRETATION: If you see a table or a passage followed by 3-5 questions, group them into a 'diSet'. 
4. MATH/QUANT: Use LaTeX-style notation for equations. Detect if a question is 'isMath'.
5. PUNJABI: Ensure Punjabi text is Raavi-font compliant.
6. QUALITY: Fix obvious OCR artifacts. Ensure 'correctAnswer' is an exact match for one of the options.

Respond as a JSON object matching the output schema.`,
});

const aiQuestionParserFlow = ai.defineFlow(
  {
    name: 'aiQuestionParserFlow',
    inputSchema: QuestionParserInputSchema,
    outputSchema: QuestionParserOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to generate a response for this chunk.");
    return output;
  }
);
