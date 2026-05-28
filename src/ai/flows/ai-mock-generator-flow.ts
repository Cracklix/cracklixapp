'use server';
/**
 * @fileOverview AI Mock Generator Flow v6.
 * Advanced Neural Architect for multi-subject, sectional, and bilingual Punjab exams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArtifactSchema = z.object({
  questionEnglish: z.string(),
  questionPunjabi: z.string(),
  optionAEnglish: z.string(),
  optionAPunjabi: z.string(),
  optionBEnglish: z.string(),
  optionBPunjabi: z.string(),
  optionCEnglish: z.string(),
  optionCPunjabi: z.string(),
  optionDEnglish: z.string(),
  optionDPunjabi: z.string(),
  correctAnswer: z.string().describe("Letter A, B, C, or D"),
  explanationEnglish: z.string(),
  explanationPunjabi: z.string(),
  subject: z.string(),
  chapter: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
  tags: z.array(z.string()).default([]),
});

const SectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isQualifying: z.boolean().default(false),
  questionCount: z.number(),
  questions: z.array(ArtifactSchema),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string().describe("The user's conversational instruction."),
  exam: z.string(),
  mode: z.enum(['full', 'sectional', 'subject', 'chapter', 'quiz', 'pyq', 'speed', 'marathon', 'revision']).default('full'),
  count: z.number().default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'balanced', 'adaptive']).default('balanced'),
  language: z.enum(['en', 'pa', 'bilingual']).default('bilingual'),
  sourceMode: z.enum(['ai', 'bank', 'hybrid']).default('ai'),
});
export type MockGeneratorInput = z.infer<typeof MockGeneratorInputSchema>;

const MockGeneratorOutputSchema = z.object({
  title: z.string(),
  exam: z.string(),
  pattern: z.string().describe("Brief description of the exam pattern detected."),
  duration: z.number().describe("Total time in minutes."),
  negativeMarking: z.number(),
  sections: z.array(SectionSchema),
  summary: z.string().describe("AI overview of the generated simulation blueprint."),
});
export type MockGeneratorOutput = z.infer<typeof MockGeneratorOutputSchema>;

export async function generateAILogic(input: MockGeneratorInput): Promise<MockGeneratorOutput> {
  return aiMockGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockGeneratorPromptV6',
  input: { schema: MockGeneratorInputSchema },
  output: { schema: MockGeneratorOutputSchema },
  prompt: `You are the CRACKLIX Enterprise Exam Architect. Your mission is to forge a high-fidelity mock test.

USER COMMAND: "{{{prompt}}}"

CONTEXT:
Board/Exam: {{{exam}}}
Generation Mode: {{{mode}}}
Target Count: {{{count}}}
Complexity Profile: {{{difficulty}}}
Linguistic Fidelity: {{{language}}}

EXAM DATABASE RULES:
- PSSSB Group A (Excise/Senior Asst): Part A (Punjabi Qualifying, 50Q) and Part B (Scoring, 100Q). Split Part B as: GK(25), Reasoning(25), PB History(17), Punjabi(13), English(12), ICT(8).
- Punjab Police (SI/Constable): Heavy focus on General Awareness, Logical Reasoning, and Digital Literacy.
- Teaching (PSTET/CTET): Child Development & Pedagogy (CDP) is mandatory.
- Language: Punjabi MUST be formal Gurmukhi (Raavi font style).
- Valid Options: 4 options for every MCQ.

STRICT TECHNICAL REQUIREMENTS:
1. NO DUPLICATES: Questions must be unique and contextually accurate.
2. BILINGUAL PAYLOAD: Populate BOTH English and Punjabi fields if bilingual mode is active.
3. EXPLANATIONS: Deep, step-by-step logical rationalization in both languages.
4. CORRECT ANSWER: Must match the letter 'A', 'B', 'C', or 'D'.
5. SECTIONS: Organize questions into logical sections matching the board's pattern.

Format strictly as a JSON object matching the MockGeneratorOutputSchema.`,
});

const aiMockGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMockGeneratorFlowV6',
    inputSchema: MockGeneratorInputSchema,
    outputSchema: MockGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Neural synthesis protocol breached. No payload returned.");
    return output;
  }
);
