'use server';
/**
 * @fileOverview Advanced AI Mock Generator Flow v8 (Enterprise Grade).
 * Engineered for high-fidelity trilingual (EN, PA, HI) Punjab recruitment simulations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ArtifactSchema = z.object({
  questionEnglish: z.string(),
  questionPunjabi: z.string().optional(),
  questionHindi: z.string().optional(),
  
  optionsEnglish: z.array(z.string()).length(4),
  optionsPunjabi: z.array(z.string()).length(4).optional(),
  optionsHindi: z.array(z.string()).length(4).optional(),
  
  correctAnswer: z.string().describe("The exact text of the correct option in English."),
  
  explanationEnglish: z.string(),
  explanationPunjabi: z.string().optional(),
  explanationHindi: z.string().optional(),
  
  subject: z.string(),
  topic: z.string(),
  chapter: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  bloomLevel: z.enum(['knowledge', 'understanding', 'application', 'analysis']).default('knowledge'),
  estimatedTimeSeconds: z.number().default(45),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
  tags: z.array(z.string()).default([]),
});

const SectionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  isQualifying: z.boolean().default(false),
  questions: z.array(ArtifactSchema),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string().describe("Conversational instruction from the admin."),
  exam: z.string(),
  mode: z.enum(['full', 'sectional', 'subject', 'chapter', 'quiz', 'pyq', 'speed', 'marathon', 'revision']).default('full'),
  count: z.number().default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'balanced', 'adaptive']).default('balanced'),
  language: z.enum(['en', 'pa', 'hi', 'en_pa', 'en_hi']).default('en_pa'),
  negativeMarking: z.number().default(0.25),
  customTime: z.number().optional(),
});
export type MockGeneratorInput = z.infer<typeof MockGeneratorInputSchema>;

const MockGeneratorOutputSchema = z.object({
  title: z.string(),
  exam: z.string(),
  duration: z.number(),
  negativeMarking: z.number(),
  sections: z.array(SectionSchema),
  summary: z.string(),
  syllabusCoverage: z.number().describe("0-100 score of syllabus coverage."),
  patternAnalysis: z.string().describe("AI's reasoning for this specific exam structure."),
});
export type MockGeneratorOutput = z.infer<typeof MockGeneratorOutputSchema>;

export async function generateAILogic(input: MockGeneratorInput): Promise<MockGeneratorOutput> {
  return aiMockGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMockGeneratorPromptV8',
  input: { schema: MockGeneratorInputSchema },
  output: { schema: MockGeneratorOutputSchema },
  prompt: `You are the CRACKLIX Neural Academic Architect. Your mission is to forge a high-fidelity recruitment simulation.

COMMAND: "{{{prompt}}}"

CONTEXT:
Board/Exam: {{{exam}}}
Generation Mode: {{{mode}}}
Target Count: {{{count}}}
Complexity Profile: {{{difficulty}}}
Linguistic Fidelity: {{{language}}}

INSTITUTIONAL SYLLABUS RULES (PUNJAB STATE):
- PSSSB Group A/B (Excise, Senior Asst): Part A (Punjabi Qualifying, 50Q) + Part B (Scoring, 100Q). Split Part B: GK(25), Reasoning(25), PB History(17), Punjabi(13), English(12), ICT(8).
- Punjab Police SI/Constable: Focus on Law, Logical Reasoning, Current Affairs, and Digital Literacy.
- Technical (PSPCL/PSTCL): Technical Cadre Subject (80Q) + Aptitude (40Q).
- Teaching (PSTET/CTET): Focus on Child Development & Pedagogy (CDP) + Language logic.

STRICT TECHNICAL REQUIREMENTS:
1. LINGUISTIC SYNC: 
   - If 'en_pa': You MUST populate BOTH questionEnglish/Punjabi, optionsEnglish/Punjabi, and explanationEnglish/Punjabi.
   - If 'en_hi': You MUST populate BOTH questionEnglish/Hindi, optionsEnglish/Hindi, and explanationEnglish/Hindi.
   - Use Raavi font style for Punjabi.
2. QUESTION QUALITY: Every question must have exactly 4 unique options. The correctAnswer must match the English version of the option.
3. EXPLANATIONS: Provide deep, step-by-step logical rationalization in all selected languages.
4. BALANCING: If mode is 'full', ensure a balanced mix of difficulty and syllabus nodes.
5. NO DUPLICATES: Ensure high entropy between questions.

Format strictly as a JSON object matching the MockGeneratorOutputSchema.`,
});

const aiMockGeneratorFlow = ai.defineFlow(
  {
    name: 'aiMockGeneratorFlowV8',
    inputSchema: MockGeneratorInputSchema,
    outputSchema: MockGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error("Neural synthesis failed to produce a valid payload.");
    return output;
  }
);
