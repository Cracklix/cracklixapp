'use server';
/**
 * @fileOverview Universal AI Question Parser Flow.
 * Redesigned for Multi-Language Support (EN, HI, PA) and National Exam Mapping.
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
  subject: z.string().describe("Map to core subjects e.g. 'Punjab GK', 'Child Development & Pedagogy', 'Quant', 'EVS'"),
  topic: z.string().describe("Specific sub-topic e.g. 'Percentage' or 'Growth & Development'"),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  isMath: z.boolean().default(false),
});

const QuestionParserInputSchema = z.object({
  rawText: z.string().optional().describe("Raw text for parsing."),
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
      prompt: `You are the CRACKLIX National Ingestion Engine. 

Parse the following content and extract EVERY single question as structured JSON.

CONTENT:
{{#if photoDataUri}}IMAGE CONTENT PROVIDED{{/if}}
{{#if rawText}}TEXT CONTENT: {{{rawText}}}{{/if}}

STRICT INSTRUCTIONS:
1. MULTI-LANGUAGE: If the source is Hindi, populate question_hi/options_hi. If Punjabi, populate question_pa/options_pa. Always provide an English translation if missing in source.
2. CLASSIFICATION: Map questions to subjects like: Punjab GK, Child Development & Pedagogy, EVS, Quant, Reasoning, English, Punjabi, Hindi, Social Science.
3. TOPIC: Detect specific chapters (e.g., 'Piaget's Theory', 'Sikh Empire', 'Trigonometry').
4. QUALITY: Fix OCR errors. Ensure correctAnswer exactly matches the English version of the option.

{{#if photoDataUri}}Vision input processing active...{{media url=photoDataUri}}{{/if}}`,
    });

    const { output } = await prompt(input);
    if (!output) throw new Error("AI failed to extract questions.");
    return output;
  }
);
