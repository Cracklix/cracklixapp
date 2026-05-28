'use server';
/**
 * @fileOverview AI Mock Generator Flow.
 * Generates full-scale, structured, bilingual mocks based on conversational prompts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionSchema = z.object({
  question_en: z.string(),
  question_pa: z.string(),
  options_en: z.array(z.string()).length(4),
  options_pa: z.array(z.string()).length(4),
  correctAnswer: z.string().describe("Exact text match of the correct option in English."),
  explanation_en: z.string(),
  explanation_pa: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string().describe("The admin's instruction for the mock generation."),
  exam: z.string().optional(),
  count: z.number().default(10).describe("Total questions to generate."),
  difficulty: z.enum(['easy', 'medium', 'hard', 'balanced']).default('balanced'),
  language: z.enum(['en', 'pa', 'bilingual']).default('bilingual'),
});
export type MockGeneratorInput = z.infer<typeof MockGeneratorInputSchema>;

const MockGeneratorOutputSchema = z.object({
  title: z.string(),
  exam: z.string(),
  structure: z.array(z.object({
    subject: z.string(),
    count: z.number(),
    weightage: z.number()
  })),
  questions: z.array(QuestionSchema),
  summary: z.string().describe("Brief summary of what was generated."),
});
export type MockGeneratorOutput = z.infer<typeof MockGeneratorOutputSchema>;

export async function generateAILogic(input: MockGeneratorInput): Promise<MockGeneratorOutput> {
  return aiMockGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockGeneratorPrompt',
  input: { schema: MockGeneratorInputSchema },
  output: { schema: MockGeneratorOutputSchema },
  prompt: `You are the CRACKLIX National Exam Architect. 

Your mission is to generate a professional, high-yield mock test based on the following instructions:
"{{{prompt}}}"

Settings:
- Exam Board: {{{exam}}}
- Target Count: {{{count}}}
- Difficulty Strategy: {{{difficulty}}}
- Language Mode: {{{language}}}

STRICT INSTRUCTIONS:
1. SYLLABUS ACCURACY: Use official patterns for Punjab State Exams (PPSC, PSSSB, Punjab Police).
2. BILINGUAL FIDELITY: Ensure the Punjabi (Raavi font style) is accurate and formal.
3. STRUCTURE: Decide on a subject split if none is provided (e.g. for PSSSB Clerk: 30% GK, 20% Math, 20% Reasoning, 15% English, 15% Punjabi).
4. VALIDATION: Every question MUST have 4 options and 1 clear correctAnswer that matches an English option exactly.
5. QUALITY: Provide deep explanations in both languages.

Format the output strictly as a JSON object matching the MockGeneratorOutputSchema.`,
});

const aiMockGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMockGeneratorFlow',
    inputSchema: MockGeneratorInputSchema,
    outputSchema: MockGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("AI Synthesis failed to produce a valid response.");
    return output;
  }
);
