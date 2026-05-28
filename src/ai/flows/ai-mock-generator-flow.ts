'use server';
/**
 * Advanced AI Mock Generator Flow v12.0 (Production Core).
 * Optimized for stability, chunking, and strict JSON schema validation.
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
  estimatedTimeSeconds: z.number().default(45),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
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
 * Robust Batch Question Generator with Strict JSON Output.
 * This prompt is designed to minimize 'Service Unavailable' errors by being concise.
 */
export async function generateQuestionBatch(input: MockGeneratorInput): Promise<z.infer<typeof MockBatchOutputSchema>> {
  const prompt = ai.definePrompt({
    name: 'aiMockBatchGeneratorV12',
    input: { schema: MockGeneratorInputSchema },
    output: { schema: MockBatchOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v12. 
Generate a focused batch of {{{count}}} high-fidelity recruitment artifacts for the {{{exam}}}.

INSTRUCTIONS:
1. SUBJECT AREA: {{{prompt}}}
2. LANGUAGE: {{{language}}} (If 'en_pa', use English and Punjabi. Punjabi MUST be Raavi-compliant).
3. COMPLEXITY: {{{difficulty}}}
4. STRICTURE: Respond with ONLY a valid JSON object matching the schema. No markdown outside the JSON.

QUALITY PROTOCOL:
- Options must be distinct.
- Explanation must explain the logic step-by-step.
- The 'correctAnswer' must match the text in 'optionsEnglish' exactly.`,
  });

  try {
    const { output } = await prompt(input);
    if (!output || !output.questions) {
      throw new Error("Batch synthesis failed to produce a valid artifact array.");
    }
    return output;
  } catch (error: any) {
    console.error("Genkit Flow Error:", error);
    throw new Error(`AI Engine Overload: ${error.message}. Retrying via fallback chunker.`);
  }
}

export async function generateAILogic(input: MockGeneratorInput) {
  // Safe wrapper for smaller batches
  return await generateQuestionBatch({
    ...input,
    count: Math.min(input.count, 5) 
  });
}
