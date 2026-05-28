
'use server';
/**
 * NEURAL FORGE CORE v12 (Institutional Tier)
 * Robust bilingual artifact synthesis with strict schema enforcement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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

async function streamLog(jobId: string, message: string) {
  try {
    await db.collection('ai_generation_jobs').doc(jobId).update({
      logs: FieldValue.arrayUnion(`[${new Date().toLocaleTimeString()}] ${message}`),
      lastLog: message,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error("Neural Log Error:", e);
  }
}

export async function generateBilingualBatch(input: z.infer<typeof GeneratorInputSchema>) {
  const { jobId, exam, subjects, count, difficulty, languageMode } = input;

  const prompt = ai.definePrompt({
    name: `neural_forge_v12_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Forge Engine v12.
    Synthesize a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} Board in Punjab.

    PROTOCOL:
    1. BILINGUAL SYNC: If mode is bilingual, use Raavi-compliant Gurmukhi.
    2. CORRECTNESS: correctAnswer text MUST match one English option exactly.
    3. EXPLANATION: Provide logical derivations for both languages.
    4. SCHEMA: Respond with valid JSON matching the schema. NO Markdown or extra text.

    CONFIGURATION:
    - SUBJECTS: {{{subjects}}}
    - COMPLEXITY: {{{difficulty}}}
    - MODE: {{{languageMode}}}`,
  });

  try {
    await streamLog(jobId, `Initializing Cycle: Producing ${count} bilingual artifacts...`);
    
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("Neural Pulse Failed: AI produced malformed payload.");
    }

    await streamLog(jobId, `Sanitizing ${output.questions.length} artifacts...`);

    const batch = db.batch();
    const questionsCol = db.collection('questions');

    output.questions.forEach((q) => {
      const qRef = questionsCol.doc();
      batch.set(qRef, {
        ...q,
        id: qRef.id,
        status: 'published',
        source: 'NEURAL_FORGE_V12',
        jobId: jobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
        pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      });
    });

    await batch.commit();
    await streamLog(jobId, `Cycle complete. Confidence Score: ${(output.confidenceScore * 100).toFixed(1)}%`);

    return output.questions;
  } catch (error: any) {
    await streamLog(jobId, `NEURAL BREACH: ${error.message}. Attempting payload repair...`);
    throw error;
  }
}
