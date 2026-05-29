
'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Redesigned for Hybrid OCR (Text + Vision) and Multi-Language Extraction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question_en: z.string(),
  question_pa: z.string().optional(),
  question_hi: z.string().optional(),
  options_en: z.array(z.string()).length(4),
  options_pa: z.array(z.string()).length(4).optional(),
  options_hi: z.array(z.string()).length(4).optional(),
  correctAnswer: z.string().describe("The exact text of the correct option in English."),
  explanation_en: z.string().optional(),
  explanation_pa: z.string().optional(),
  explanation_hi: z.string().optional(),
  subject: z.string().describe("Map to core subjects e.g. 'Punjab GK', 'CDP', 'Quant', 'Reasoning'"),
  topic: z.string().describe("Specific sub-topic e.g. 'Percentage' or 'Sikh Empire'"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isMath: z.boolean().default(false),
  hasDiagram: z.boolean().default(false),
});

const QuestionParserInputSchema = z.object({
  rawText: z.string().optional().describe("Raw OCR text for context."),
  photoDataUri: z.string().optional().describe("Image for High-Res Vision parsing of diagrams/equations."),
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
      name: 'hybridQuestionParserPrompt',
      input: { schema: QuestionParserInputSchema },
      output: { schema: QuestionParserOutputSchema },
      prompt: `You are the CRACKLIX Neural Ingestion Engine. 

Parse the provided content and extract EVERY question as structured JSON.

CONTENT CONTEXT:
{{#if photoDataUri}}IMAGE PROVIDED FOR VISION ANALYSIS{{/if}}
{{#if rawText}}OCR HINT TEXT: {{{rawText}}}{{/if}}

STRICT INSTRUCTIONS:
1. HYBRID ANALYSIS: If photoDataUri is provided, use it as the primary source for MATH EQUATIONS and REASONING DIAGRAMS. Use rawText as a hint to fix typos.
2. BILINGUAL MAPPING: Populate question_pa if Punjabi is detected. Punjabi must be Raavi-compliant Gurmukhi. Always provide an English translation.
3. MATH & FIGURES: Detect if a question relies on an image/diagram. Set hasDiagram to true. For math, convert image-based equations to standard text.
4. CLASSIFICATION: Map to Punjab GK, Reasoning, Quant, etc.
5. QUALITY: Filter out headers, page numbers, and unrelated text.

{{#if photoDataUri}}Vision input processing active...{{media url=photoDataUri}}{{/if}}`,
    });

    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to extract artifacts.");
    return output;
  }
);
