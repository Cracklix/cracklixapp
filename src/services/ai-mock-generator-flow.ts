'use client';

import { generateStrictBilingualArtifacts } from '@/ai/flows/ai-mock-generator-flow';

/**
 * PRODUCTION BRIDGE: Neural Forge v12
 * Maps UI configuration to Genkit Server Actions and normalizes artifact schema.
 */
export async function forgeNeuralArtifacts(params: {
  exam: string;
  count: number;
  difficulty: string;
  topic: string;
}) {
  try {
    const questions = await generateStrictBilingualArtifacts({
      instruction: `Generate ${params.count} high-yield MCQs for the ${params.exam} exam cycle. Focus specifically on the topic of ${params.topic}. Ensure Raavi-compliant Punjabi and standard board-level difficulty.`,
      exam: params.exam,
      subjects: [params.topic],
      count: params.count,
      difficulty: params.difficulty
    });

    // Normalize Flow Schema to AI Studio UI Schema
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
  } catch (error) {
    console.error("Forge Bridge Failure:", error);
    throw error;
  }
}
