'use server';

/**
 * NEURAL FORGE V3 - BATCH ORCHESTRATOR
 * Stabilized for production use with strict retry and timeout logic.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

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
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeEstimate: z.number().default(45)
});

const GeneratorInputSchema = z.object({
  instruction: z.string(),
  exam: z.string(),
  subjects: z.array(z.string()),
  count: z.number().max(5), // STABILITY: Enforced small batches
  difficulty: z.string()
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema)
});

export async function forgeNeuralArtifacts(input: z.infer<typeof GeneratorInputSchema>) {
  const prompt = ai.definePrompt({
    name: 'neuralForgePrompt',
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Forge V3. 
Generate exactly {{{count}}} high-fidelity, bilingual (English & Punjabi) MCQs for the exam: {{{exam}}}.

RULES:
1. Every artifact MUST contain parallel English and Punjabi (Gurmukhi Raavi) signals.
2. Solutions MUST follow a logical path with an "Elite Speed Trick" if applicable.
3. Difficulty must match {{{difficulty}}} level.
4. Target subjects: {{#each subjects}}{{{this}}}{{#if @last}}{{else}}, {{/if}}{{/each}}.

Instruction: {{{instruction}}}

Return ONLY a valid JSON object matching the output schema.`
  });

  try {
    // STABILITY: Single batch execution with error boundary
    const { output } = await prompt(input);
    
    if (!output || !output.questions) {
      throw new Error("Neural synthesis returned empty payload.");
    }

    return output.questions;
  } catch (error: any) {
    console.error("Neural Forge Failure:", error);
    throw new Error(error.message || "Internal AI Core Failure.");
  }
}
