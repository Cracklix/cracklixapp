'use server';
/**
 * @fileOverview AI Mock Generator Flow v7.
 * Advanced Neural Architect for multi-subject, sectional, and multi-language Punjab/State exams.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArtifactSchema = z.object({
  questionEnglish: z.string().optional(),
  questionPunjabi: z.string().optional(),
  questionHindi: z.string().optional(),
  optionAEnglish: z.string().optional(),
  optionAPunjabi: z.string().optional(),
  optionAHindi: z.string().optional(),
  optionBEnglish: z.string().optional(),
  optionBPunjabi: z.string().optional(),
  optionBHindi: z.string().optional(),
  optionCEnglish: z.string().optional(),
  optionCPunjabi: z.string().optional(),
  optionCHindi: z.string().optional(),
  optionDEnglish: z.string().optional(),
  optionDPunjabi: z.string().optional(),
  optionDHindi: z.string().optional(),
  correctAnswer: z.string().describe("Letter A, B, C, or D"),
  explanationEnglish: z.string().optional(),
  explanationPunjabi: z.string().optional(),
  explanationHindi: z.string().optional(),
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
  descriptionSecondary: z.string().optional(),
  isQualifying: z.boolean().default(false),
  questionCount: z.number(),
  questions: z.array(ArtifactSchema),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string().describe("The user's conversational instruction."),
  exam: z.string(),
  mode: z.enum(['full', 'sectional', 'subject', 'chapter', 'quiz', 'pyq', 'speed', 'marathon', 'revision', 'typing', 'omr']).default('full'),
  count: z.number().default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'balanced', 'adaptive']).default('balanced'),
  language: z.enum(['en', 'pa', 'hi', 'en_pa', 'en_hi']).default('en_pa'),
  sourceMode: z.enum(['ai', 'bank', 'hybrid']).default('ai'),
  customTime: z.number().optional(),
  negativeMarking: z.number().default(0.25),
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
  syllabusCoverage: z.number().describe("Percentage of syllabus covered."),
});
export type MockGeneratorOutput = z.infer<typeof MockGeneratorOutputSchema>;

export async function generateAILogic(input: MockGeneratorInput): Promise<MockGeneratorOutput> {
  return aiMockGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockGeneratorPromptV7',
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
Negative Marking: {{{negativeMarking}}}

EXAM DATABASE RULES (PUNJAB/STATE):
- PSSSB Group A/B: Pattern consists of Part A (Punjabi Qualifying, 50Q) and Part B (Scoring, 100Q). Split Part B as: GK(25), Reasoning(25), PB History(17), Punjabi(13), English(12), ICT(8).
- Punjab Police (SI/Constable): Focus on General Awareness, Logical Reasoning, and Digital Literacy.
- Technical (PSPCL/PSTCL JE): Technical Subject (80Q) + Aptitude (40Q).
- Teaching (PSTET/CTET): Child Development & Pedagogy (CDP) mandatory.
- Language: Punjabi MUST be formal Gurmukhi (Raavi font). Hindi MUST be formal Devanagari.

STRICT TECHNICAL REQUIREMENTS:
1. LINGUISTIC FIDELITY: 
   - If 'en_pa': Populate BOTH questionEnglish/Punjabi, option...English/Punjabi, and explanationEnglish/Punjabi.
   - If 'en_hi': Populate BOTH questionEnglish/Hindi, option...English/Hindi, and explanationEnglish/Hindi.
   - If 'en', 'pa', or 'hi': Populate ONLY the respective fields.
2. NO DUPLICATES: Questions must be unique and contextually accurate.
3. EXPLANATIONS: Deep, step-by-step logical rationalization in all selected languages.
4. CORRECT ANSWER: Must match the letter 'A', 'B', 'C', or 'D'.
5. SECTIONS: Organize into logical sections matching the board's official 2024 pattern.

Format strictly as a JSON object matching the MockGeneratorOutputSchema.`,
});

const aiMockGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMockGeneratorFlowV7',
    inputSchema: MockGeneratorInputSchema,
    outputSchema: MockGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Neural synthesis protocol breached. No payload returned.");
    return output;
  }
);
