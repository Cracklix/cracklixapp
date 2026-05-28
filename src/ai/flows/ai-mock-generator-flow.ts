'use server';
/**
 * CRACKLIX NEURAL FORGE v12 Core
 * Advanced instruction-driven synthesis with bilingual payload enforcement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionArtifactSchema = z.object({
  question_en: z.string(),
  question_pa: z.string(),
  options_en: z.array(z.string()).length(4),
  options_pa: z.array(z.string()).length(4),
  correctAnswer: z.string().describe("The exact text of the correct option in English."),
  explanation_en: z.string(),
  explanation_pa: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const GeneratorInputSchema = z.object({
  jobId: z.string(),
  exam: z.string(),
  subjects: z.array(z.string()),
  count: z.number().max(10),
  difficulty: z.string(),
  instruction: z.string().optional(),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
  confidenceScore: z.number(),
});

export async function generateBilingualArtifacts(input: z.infer<typeof GeneratorInputSchema>) {
  const prompt = ai.definePrompt({
    name: `neural_forge_v12_engine_${input.jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Forge v12. Synthesize {{{count}}} high-fidelity MCQs for the {{{exam}}}.

REQUIREMENTS:
1. BILINGUAL PAYLOAD: Every question MUST include BOTH English and Raavi-compliant Punjabi.
2. CORRECTNESS: The correctAnswer text must match one of the options_en values EXACTLY.
3. LOGICAL PATH: Provide deep step-by-step explanations in both languages.
4. CUSTOM INSTRUCTION: {{{instruction}}}

Respond ONLY with a valid JSON object matching the output schema.`,
  });

  try {
    const { output } = await prompt(input);
    if (!output || !output.questions) throw new Error("Synthesis failed.");

    return output.questions.map(q => ({
      ...q,
      en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
      pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      status: 'published'
    }));
  } catch (error: any) {
    console.error("Neural Synthesis Error:", error);
    throw error;
  }
}
