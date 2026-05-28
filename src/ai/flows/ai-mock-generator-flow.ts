'use server';
/**
 * CRACKLIX NEURAL ENGINE v2.0
 * Advanced multi-stage question synthesis with bilingual validation.
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
});

const GeneratorInputSchema = z.object({
  jobId: z.string(),
  exam: z.string(),
  subject: z.string(),
  topic: z.string().optional(),
  count: z.number().max(10),
  difficulty: z.string(),
  language: z.string().default('en_pa'),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
  confidenceScore: z.number(),
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
  const { jobId, exam, subject, topic, count, difficulty } = input;

  await streamLog(jobId, `Initializing synthesis for ${count} artifacts...`);

  const prompt = ai.definePrompt({
    name: `forge_v2_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v2.0.
    Generate a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} exam.

    CRITICAL SPECIFICATIONS:
    - SUBJECT: {{{subject}}}
    - FOCUS AREA: {{{topic}}}
    - COMPLEXITY: {{{difficulty}}}
    - LANGUAGES: Mandatory English and Punjabi (Raavi Font/Unicode compliant).
    
    QUALITY PROTOCOL:
    1. OPTIONS: Must be distinct and plausible.
    2. CORRECT ANSWER: Must match the English option text exactly.
    3. PUNJABI: Use formal, exam-standard Gurmukhi.
    4. EXPLANATION: Step-by-step logical derivation.

    Respond ONLY with a valid JSON object matching the output schema.`,
  });

  try {
    await streamLog(jobId, "Executing neural synthesis via Gemini 1.5 Pro...");
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("AI failed to produce structured artifacts.");
    }

    await streamLog(jobId, `Synthesis complete. Validating ${output.questions.length} artifacts...`);

    // Validation & Injection
    const batch = db.batch();
    const questionsCol = db.collection('questions');

    output.questions.forEach((q, idx) => {
      const qRef = questionsCol.doc();
      const questionData = {
        ...q,
        id: qRef.id,
        status: 'published',
        source: 'AI_FORGE_V2',
        jobId: jobId,
        createdAt: Date.now(),
        en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
        pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      };
      batch.set(qRef, questionData);
    });

    await batch.commit();
    await streamLog(jobId, `Batch synchronized with Global Atomic Bank.`);

    return output.questions;
  } catch (error: any) {
    await streamLog(jobId, `CRITICAL ERROR: ${error.message}`);
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
    logs: [`[${new Date().toLocaleTimeString()}] Job queued in Neural Link.`],
    totalQuestions: data.count,
    generatedCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await jobRef.set(job);
  return jobId;
}
