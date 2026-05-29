'use server';

/**
 * NEURAL FORGE V3 - BATCH ORCHESTRATOR (Hardened)
 * Corrected for Genkit 1.x syntax.
 * Strictly Server-Side to prevent async_hooks errors in browser.
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
  count: z.number().max(5), // Hard Batch limit
  difficulty: z.string()
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema)
});

/**
 * Primary Server Action for AI Synthesis.
 * Never hit this in a while(true) loop.
 */
export async function forgeNeuralArtifacts(input: z.infer<typeof GeneratorInputSchema>) {
  let retryCount = 0;
  const MAX_RETRIES = 2;

  const neuralForgePrompt = ai.definePrompt({
    name: `neuralForgePromptV4_${Date.now()}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Forge v4, an elite academic architect for Punjab Government exams.
Generate exactly {{{count}}} high-fidelity, bilingual (English & Punjabi) MCQs for: {{{exam}}}.

Syllabus Context: {{#each subjects}}{{{this}}}{{#if @last}}{{else}}, {{/if}}{{/each}}.
Difficulty: {{{difficulty}}}.

STRICT RULES:
1. Every artifact MUST have parallel English and Raavi-compliant Punjabi.
2. If Punjabi is unavailable, faithfully translate the English. Do NOT leave blank.
3. Solutions must include a logical path and an "Elite Speed Trick".
4. Instruction: {{{instruction}}}

Return ONLY valid JSON.`
  });

  while (retryCount <= MAX_RETRIES) {
    try {
      const { output } = await neuralForgePrompt(input);
      
      if (!output || !output.questions || output.questions.length === 0) {
        throw new Error("AI core returned empty signals.");
      }

      return output.questions;

    } catch (error: any) {
      console.error(`[Neural Forge] Batch failure (Attempt ${retryCount}):`, error.message);
      
      // Handle Quota/Throttle specifically
      const isRetryable = error.status === 429 || error.message?.includes("quota") || error.message?.includes("exhausted");
      
      if (isRetryable && retryCount < MAX_RETRIES) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        continue;
      }
      
      throw new Error(error.message || "Neural core saturated. Please wait 60 seconds.");
    }
  }
  
  throw new Error("Maximum retry threshold exceeded.");
}
