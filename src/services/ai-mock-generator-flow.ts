
'use client';

import { generateStrictBilingualArtifacts } from '@/ai/flows/ai-mock-generator-flow';

/**
 * PRODUCTION BRIDGE: Neural Forge v12
 * Implements a Hardened Retry System with MAX_RETRIES = 2 and AbortSignal support.
 * Prevents infinite recursive loops in catch blocks.
 */
export async function forgeNeuralArtifacts(params: {
  exam: string;
  count: number;
  difficulty: string;
  topic: string;
}, signal?: AbortSignal) {
  let retryCount = 0;
  const MAX_RETRIES = 2;

  async function execute(): Promise<any> {
    if (signal?.aborted) {
      throw new Error("Operation aborted by user signal.");
    }

    try {
      const questions = await generateStrictBilingualArtifacts({
        instruction: `Generate ${params.count} high-yield MCQs for the ${params.exam} exam cycle. Focus specifically on the topic of ${params.topic}. Ensure Raavi-compliant Punjabi and standard board-level difficulty.`,
        exam: params.exam,
        subjects: [params.topic],
        count: params.count,
        difficulty: params.difficulty
      });

      // Map Artifacts to UI Schema
      return {
        questions: questions.map(q => ({
          questionEnglish: q.questionEn,
          questionPunjabi: q.questionPa,
          optionsEnglish: q.options.map(o => o.en),
          optionsPunjabi: q.options.map(o => o.pa),
          correctAnswer: q.options[q.correctAnswer].en,
          explanationEnglish: q.solutionEn,
          explanationPunjabi: q.solutionPa,
          subject: q.subject || params.topic,
          difficulty: q.difficulty || params.difficulty
        }))
      };
    } catch (error: any) {
      console.error(`Neural Forge Attempt ${retryCount} failed:`, error);

      // Check for abort signal again inside catch
      if (signal?.aborted) throw new Error("Aborted");

      const isRetryable = error?.status === 429 || error?.status === 503 || error?.message?.includes("RESOURCE_EXHAUSTED");

      if (isRetryable && retryCount < MAX_RETRIES) {
        retryCount++;
        // Explicit Delay before recursive call
        await new Promise(resolve => setTimeout(resolve, 3000));
        return execute(); // Limited recursion
      }
      
      // Stop recursion and bubble up the error
      throw error;
    }
  }

  return execute();
}
