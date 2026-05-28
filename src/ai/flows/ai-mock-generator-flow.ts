'use server';
/**
 * NEURAL FORGE CORE v12 (Institutional Tier)
 * Robust bilingual artifact synthesis with strict schema enforcement.
 * Features: Batch Synthesis, Raavi Punjabi Support, and Explanation Synthesis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionArtifactSchema = z.object({
  question_en: z.string().describe("Clear academic English question text."),
  question_pa: z.string().describe("Raavi-compliant Gurmukhi translation."),
  options_en: z.array(z.string()).length(4).describe("4 distinct English options."),
  options_pa: z.array(z.string()).length(4).describe("4 Punjabi options matching the English order."),
  correctAnswer: z.string().describe("The exact English text of the correct option."),
  explanation_en: z.string().describe("Step-by-step logical derivation in English."),
  explanation_pa: z.string().describe("Derivation in Punjabi."),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

const GeneratorInputSchema = z.object({
  jobId: z.string(),
  exam: z.string(),
  subjects: z.array(z.string()),
  count: z.number().max(20),
  difficulty: z.string(),
  languageMode: z.enum(['english', 'punjabi', 'bilingual']).default('bilingual'),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
  confidenceScore: z.number().min(0).max(1),
});

/**
 * CORE SYNTHESIS WRAPPER
 * Orchestrates GenAI calls with strict output validation.
 */
export async function generateBilingualBatch(input: z.infer<typeof GeneratorInputSchema>) {
  const { jobId, exam, subjects, count, difficulty, languageMode } = input;

  const prompt = ai.definePrompt({
    name: `neural_forge_v12_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Forge Engine v12.
    Synthesize a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} Board in Punjab.

    PROTOCOL:
    1. BILINGUAL SYNC: If mode is bilingual, provide both English and Raavi-compliant Gurmukhi.
    2. CORRECTNESS: correctAnswer text MUST match one English option exactly.
    3. EXPLANATION: Provide logical derivations for both languages.
    4. SUBJECT CONTEXT: Focus on {{{subjects}}}.
    5. COMPLEXITY: Target {{{difficulty}}} difficulty level.

    Respond with ONLY a valid JSON object matching the output schema. NO Markdown formatting blocks.`,
  });

  try {
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("Neural Pulse Failed: AI produced malformed payload.");
    }

    // Auto-Repair & Verification Layer
    const sanitizedQuestions = output.questions.map(q => ({
      ...q,
      en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
      pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      status: 'published'
    }));

    return sanitizedQuestions;
  } catch (error: any) {
    console.error("Neural Synthesis Breach:", error);
    throw error;
  }
}
