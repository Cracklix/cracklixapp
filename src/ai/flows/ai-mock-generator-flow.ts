'use server';
/**
 * CRACKLIX NEURAL ENGINE v3.0
 * Advanced multi-stage question synthesis with institutional bilingual validation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

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
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25),
});

const GeneratorInputSchema = z.object({
  jobId: z.string(),
  exam: z.string(),
  subjects: z.array(z.string()),
  topics: z.string().optional(),
  count: z.number().max(20),
  difficulty: z.string(),
  languageMode: z.enum(['english', 'punjabi', 'bilingual']).default('bilingual'),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
  confidenceScore: z.number(),
  synthesisNotes: z.string().optional(),
});

/**
 * Streams a log message to the Firestore job document.
 */
async function streamLog(jobId: string, message: string) {
  await db.collection('ai_generation_jobs').doc(jobId).update({
    logs: FieldValue.arrayUnion(`[${new Date().toLocaleTimeString()}] ${message}`),
    lastLog: message,
    updatedAt: Date.now(),
  });
}

export async function generateBilingualBatch(input: z.infer<typeof GeneratorInputSchema>) {
  const { jobId, exam, subjects, topics, count, difficulty, languageMode } = input;

  await streamLog(jobId, `Initializing neural synthesis for ${count} artifacts...`);

  const prompt = ai.definePrompt({
    name: `neural_forge_v3_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v3.0 (Institutional Tier).
    Synthesize a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} exam.

    TARGET CONFIGURATION:
    - SUBJECTS: {{{subjects}}}
    - FOCUS TOPICS: {{{topics}}}
    - COMPLEXITY: {{{difficulty}}}
    - LANGUAGE MODE: {{{languageMode}}}
    
    STRICT INSTITUTIONAL PROTOCOL:
    1. BILINGUAL DEPTH: If mode is bilingual or punjabi, use Raavi-compliant Gurmukhi.
    2. OPTION DISTINCTNESS: Ensure options are plausible and distinct.
    3. MARKING ACCURACY: Correct answer text MUST match the English option exactly.
    4. EXPLANATION LOGIC: Provide a step-by-step derivation for both languages.

    Respond ONLY with a valid JSON object matching the output schema.`,
  });

  try {
    await streamLog(jobId, "Executing neural synthesis via Gemini 1.5 Pro...");
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("Neural Link Failure: AI failed to produce structured artifacts.");
    }

    await streamLog(jobId, `Synthesis complete. Validating ${output.questions.length} artifacts against schema...`);

    // Validation & Injection
    const batch = db.batch();
    const questionsCol = db.collection('questions');

    output.questions.forEach((q) => {
      const qRef = questionsCol.doc();
      const questionData = {
        ...q,
        id: qRef.id,
        status: 'published',
        source: 'NEURAL_FORGE_V3',
        jobId: jobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
        pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      };
      batch.set(qRef, questionData);
    });

    await batch.commit();
    await streamLog(jobId, `Batch synchronized with Global Atomic Bank successfully.`);

    return output.questions;
  } catch (error: any) {
    await streamLog(jobId, `CRITICAL SYSTEM ERROR: ${error.message}`);
    throw error;
  }
}

export async function createGenerationJob(data: any) {
  const jobRef = db.collection('ai_generation_jobs').doc();
  const jobId = jobRef.id;

  const job = {
    id: jobId,
    status: 'pending',
    config: data,
    progress: 0,
    logs: [`[${new Date().toLocaleTimeString()}] Job initialized in Neural Link buffer.`],
    totalQuestions: data.count,
    generatedCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await jobRef.set(job);
  return jobId;
}
