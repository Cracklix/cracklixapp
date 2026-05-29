'use server';

/**
 * NEURAL FORGE V3 - BATCH ORCHESTRATOR
 * Stabilized for production use with strict retry and timeout logic.
 * Corrected for Genkit 1.x syntax.
 * Isolate Node.js modules from client-side bundle.
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
  count: z.number().max(5), 
  difficulty: z.string()
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema)
});

const neuralForgePrompt = ai.definePrompt({
  name: 'neuralForgePromptV3',
  input: { schema: GeneratorInputSchema },
  output: { schema: GeneratorOutputSchema },
  prompt: `You are the CRACKLIX Neural Forge V3, an expert exam architect.
Generate exactly {{{count}}} high-fidelity, bilingual (English & Punjabi) MCQs for the exam: {{{exam}}}.

STRICT RULES:
1. Every artifact MUST contain parallel English and Punjabi (Gurmukhi Raavi) signals.
2. Punjabi (questionPa) MUST be Raavi-compliant Gurmukhi.
3. If Punjabi is unavailable, do NOT leave it blank; translate the English text faithfully.
4. Solutions MUST follow a logical path with an "Elite Speed Trick" if applicable.
5. Difficulty: {{{difficulty}}}.
6. Target subjects: {{#each subjects}}{{{this}}}{{#if @last}}{{else}}, {{/if}}{{/each}}.

Instruction: {{{instruction}}}

Return ONLY a valid JSON object matching the output schema.`
});

export async function forgeNeuralArtifacts(input: z.infer<typeof GeneratorInputSchema>) {
  let retries = 0;
  const MAX_RETRIES = 2;

  while (retries <= MAX_RETRIES) {
    try {
      const { output } = await neuralForgePrompt(input);
      
      if (!output || !output.questions || output.questions.length === 0) {
        throw new Error("Neural synthesis returned empty payload.");
      }

      return output.questions;

    } catch (error: any) {
      console.error(`Neural Forge Attempt ${retries} failed:`, error.message);
      
      const isRetryable = 
        error.message?.includes("429") || 
        error.message?.includes("quota") || 
        error.message?.includes("Resource exhausted") ||
        error.status === 429;
      
      if (isRetryable && retries < MAX_RETRIES) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      throw new Error(error.message || "AI Core Failure. Please wait 30 seconds and retry.");
    }
  }
  
  throw new Error("AI Core saturated. Please try a smaller batch or wait 1 minute.");
}
