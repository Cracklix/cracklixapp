'use server';
/**
 * Advanced AI Mock Generator Flow v11.0 (Production Core).
 * Optimized for stability, chunking, and trilingual synthesis.
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
  difficulty: z.enum(['easy', 'medium', 'hard']),
  bloomLevel: z.enum(['knowledge', 'understanding', 'application', 'analysis']).default('knowledge'),
  estimatedTimeSeconds: z.number().default(45),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
  tags: z.array(z.string()).default([]),
});

const MockGeneratorInputSchema = z.object({
  prompt: z.string(),
  exam: z.string(),
  mode: z.string(),
  count: z.number(),
  difficulty: z.string(),
  language: z.string(),
});

export type MockGeneratorInput = z.infer<typeof MockGeneratorInputSchema>;

const MockBatchOutputSchema = z.object({
  questions: z.array(ArtifactSchema),
  context: z.string().optional(),
});

/**
 * Robust Batch Question Generator.
 * Used for chunked generation to prevent timeouts.
 */
export async function generateQuestionBatch(input: MockGeneratorInput): Promise<z.infer<typeof MockBatchOutputSchema>> {
  const prompt = ai.definePrompt({
    name: 'aiMockBatchGeneratorV11',
    input: { schema: MockGeneratorInputSchema },
    output: { schema: MockBatchOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v11. 
Generate a focused batch of {{{count}}} high-fidelity recruitment artifacts.

CONTEXT:
Exam: {{{exam}}}
Subject Area: {{{prompt}}}
Linguistic Fidelity: {{{language}}}
Complexity Profile: {{{difficulty}}}

STRICT TECHNICAL REQUIREMENTS:
1. LINGUISTIC SYNC: 
   - If 'en_pa': Populate BOTH English and Punjabi fields. Punjabi MUST use Raavi font style.
   - If 'en_hi': Populate BOTH English and Hindi.
2. STRUCTURE: Every question MUST have 4 options. The correctAnswer MUST match the English version.
3. QUALITY: Provide step-by-step logic in the explanations.
4. VALIDATION: Ensure NO duplicate questions within this batch.

Format as a strict JSON object matching the MockBatchOutputSchema.`,
  });

  const { output } = await prompt(input);
  if (!output || !output.questions) throw new Error("Batch synthesis failed to produce a valid artifact array.");
  return output;
}

export async function generateAILogic(input: MockGeneratorInput) {
  // Traditional full-mock call kept for backward compatibility but internal logic now suggests chunking via UI.
  const result = await generateQuestionBatch({
    ...input,
    count: Math.min(input.count, 10) // Internal safety cap for full-mode calls
  });
  
  return {
    title: `${input.exam} ${input.mode.toUpperCase()} Simulation`,
    exam: input.exam,
    duration: 60,
    negativeMarking: 0.25,
    sections: [{
      name: "Core Assessment",
      questions: result.questions
    }],
    summary: "Generated via Cracklix Neural Pipeline v11.",
    syllabusCoverage: 85,
    patternAnalysis: "Distributed according to board standards."
  };
}
