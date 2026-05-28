'use server';
/**
 * @fileOverview AI Mock Generator Flow v5.
 * Generates full-scale, structured, nested bilingual mocks for institutional use.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionContentSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  explanation: z.string().optional(),
});

const NestedQuestionSchema = z.object({
  en: QuestionContentSchema,
  pa: QuestionContentSchema,
  correctAnswer: z.string().describe("Exact text match of the correct option in English."),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string().describe("The admin's instruction for the mock generation."),
  exam: z.string().optional(),
  count: z.number().default(10).describe("Total questions to generate."),
  difficulty: z.enum(['easy', 'medium', 'hard', 'balanced']).default('balanced'),
  language: z.enum(['en', 'pa', 'bilingual']).default('bilingual'),
  sourceMode: z.enum(['ai', 'bank', 'hybrid']).default('ai'),
});
export type MockGeneratorInput = z.infer<typeof MockGeneratorInputSchema>;

const MockGeneratorOutputSchema = z.object({
  title: z.string(),
  exam: z.string(),
  duration: z.number(),
  negativeMarking: z.number(),
  structure: z.array(z.object({
    subject: z.string(),
    count: z.number(),
    weightage: z.number()
  })),
  questions: z.array(NestedQuestionSchema),
  summary: z.string().describe("Brief summary of the generated simulation."),
});
export type MockGeneratorOutput = z.infer<typeof MockGeneratorOutputSchema>;

export async function generateAILogic(input: MockGeneratorInput): Promise<MockGeneratorOutput> {
  return aiMockGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockGeneratorPromptV5',
  input: { schema: MockGeneratorInputSchema },
  output: { schema: MockGeneratorOutputSchema },
  prompt: `You are the CRACKLIX Enterprise Exam Architect. 

Your mission is to generate a high-yield, production-grade mock test based on:
"{{{prompt}}}"

Settings:
- Institutional Board: {{{exam}}}
- Artifact Count: {{{count}}}
- Complexity Profile: {{{difficulty}}}
- Linguistic Mode: {{{language}}}
- Generation Protocol: {{{sourceMode}}}

STRICT ENTERPRISE REQUIREMENTS:
1. NESTED SCHEMA: Use the nested { en, pa } structure for every question, option set, and explanation.
2. PUNJABI FIDELITY: Ensure Gurmukhi (Raavi font) is academic and formal.
3. SYLLABUS WEIGHTAGE: If creating a full mock for boards like PSSSB or Punjab Police, split subjects accurately (e.g., Punjab GK 30%, Reasoning 20%, etc.).
4. VALIDATION: Every question MUST have 4 options and a correctAnswer that matches the English version exactly.
5. EXPLANATIONS: Provide step-by-step rationalization in both languages.

Format the output strictly as a JSON object matching the MockGeneratorOutputSchema.`,
});

const aiMockGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMockGeneratorFlowV5',
    inputSchema: MockGeneratorInputSchema,
    outputSchema: MockGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Neural Synthesis failed to forge simulation payload.");
    return output;
  }
);
