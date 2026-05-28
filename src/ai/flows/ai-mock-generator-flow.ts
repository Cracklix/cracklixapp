
'use server';
/**
 * NEURAL FORGE CORE v12 (Enterprise Generative Engine)
 * Robust bilingual artifact synthesis with instruction-driven branching.
 * Features: Batch Synthesis, Raavi Punjabi Enforcement, and Automated Logical Paths.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionArtifactSchema = z.object({
  question_en: z.string().describe("High-fidelity English question text."),
  question_pa: z.string().describe("Precise Raavi-compliant Gurmukhi translation. DO NOT omit."),
  options_en: z.array(z.string()).length(4).describe("4 distinct English options."),
  options_pa: z.array(z.string()).length(4).describe("4 Punjabi options matching English indices exactly."),
  correctAnswer: z.string().describe("The exact English text of the correct option."),
  explanation_en: z.string().describe("Deep logical derivation in English."),
  explanation_pa: z.string().describe("Logical derivation in Punjabi."),
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
  customInstruction: z.string().optional().describe("Admin-provided natural language rules."),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
  confidenceScore: z.number().min(0).max(1),
});

/**
 * NEURAL SYNTHESIS PIPELINE
 * Orchestrates GenAI calls with strict instruction following and bilingual enforcement.
 */
export async function generateBilingualBatch(input: z.infer<typeof GeneratorInputSchema>) {
  const { jobId, exam, subjects, count, difficulty, languageMode, customInstruction } = input;

  const prompt = ai.definePrompt({
    name: `neural_forge_v12_orchestrator_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX NEURAL FORGE v12, an elite academic architect for Punjab Government Exams.

OBJECTIVE:
Synthesize a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} Board.

OPERATIONAL PARAMETERS:
1. BILINGUAL PAYLOAD: Every question MUST include both English and Raavi-compliant Gurmukhi Punjabi. Never return empty Punjabi fields.
2. CORRECTNESS: The correctAnswer text must match one of the options_en values EXACTLY.
3. LOGICAL DERIVATION: Provide detailed step-by-step explanations for both languages.
4. SYLLABUS CONTEXT: Focus on Subjects: {{{subjects}}}. Difficulty Level: {{{difficulty}}}.
5. CUSTOM INSTRUCTIONS: {{{customInstruction}}}

Respond ONLY with a valid JSON object matching the output schema.`,
  });

  try {
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("Neural Pulse Failed: malformed payload received from LLM.");
    }

    // High-Fidelity Data Normalization
    const sanitizedQuestions = output.questions.map(q => ({
      ...q,
      // Nested structure for CBT Engine v32 compatibility
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
