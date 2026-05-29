'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * CRACKLIX MASTER NEURAL CORE v4
 * Advanced adaptive batch synthesis with bilingual validation.
 * Run strictly on server to avoid Node.js module issues in browser.
 */

const QuestionArtifactSchema = z.object({
  questionEn: z.string(),
  questionPa: z.string(),
  options: z.array(z.object({
    en: z.string(),
    pa: z.string()
  })).length(4),
  correctAnswer: z.number().min(0).max(3),
  solutionEn: z.string(),
  solutionPa: z.string(),
  explanationEn: z.string(),
  explanationPa: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeEstimate: z.number().default(45),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25)
});

const ForgeInputSchema = z.object({
  instruction: z.string(),
  exam: z.string(),
  count: z.number().max(10),
  difficulty: z.string().optional(),
  subject: z.string().optional()
});

const forgePrompt = ai.definePrompt({
  name: 'neuralCoreV4Synthesis',
  input: { schema: ForgeInputSchema },
  output: { schema: z.object({ questions: z.array(QuestionArtifactSchema) }) },
  prompt: `You are the CRACKLIX Master Neural Core. 
Synthesize {{{count}}} high-yield, bilingual artifacts for: {{{exam}}}.

INSTRUCTIONS:
1. SYLLABUS: Follow official board patterns for {{{exam}}}.
2. CONTEXT: Focus on {{{subject}}} - {{{instruction}}}.
3. BILINGUAL: English and Raavi-compliant Punjabi are MANDATORY.
4. QUALITY: 
   - CorrectAnswer must be index 0-3.
   - NEVER leave Punjabi blank. If translation is tricky, provide formal Raavi Gurmukhi.
   - Solutions must be step-by-step logic.
5. FORMAT: Return ONLY valid JSON matching the schema.`,
});

export async function synthesizeNeuralBatch(config: {
  instruction: string;
  exam: string;
  count: number;
  difficulty?: string;
  subject?: string;
}) {
  try {
    const { output } = await forgePrompt(config);

    if (!output || !output.questions) {
      throw new Error("Neural Link Failure: No artifacts synthesized.");
    }

    // Validation Layer
    const validBatch = output.questions.filter(q => 
      q.questionPa && q.questionPa.length > 5 && 
      !q.questionPa.includes('undefined') &&
      q.solutionPa && q.solutionPa.length > 5
    );

    return validBatch;
  } catch (err: any) {
    console.error("Neural Synthesis Error:", err);
    throw err;
  }
}
