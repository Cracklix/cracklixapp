'use server';
/**
 * CRACKLIX NEURAL ENGINE v4.0 (Enterprise Gateway)
 * Rebuilt for high-fidelity bilingual question synthesis with deep validation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const QuestionArtifactSchema = z.object({
  question_en: z.string().describe("Clear, academic English question text."),
  question_pa: z.string().describe("Formal Raavi-compliant Punjabi translation."),
  options_en: z.array(z.string()).length(4).describe("4 distinct English options."),
  options_pa: z.array(z.string()).length(4).describe("4 corresponding Punjabi options."),
  correctAnswer: z.string().describe("The exact text of the correct option in English (MUST match one of options_en)."),
  explanation_en: z.string().describe("Step-by-step logical derivation in English."),
  explanation_pa: z.string().describe("Logical derivation in Punjabi."),
  subject: z.string().describe("Core exam subject mapping."),
  topic: z.string().describe("Specific syllabus sub-topic."),
  difficulty: z.enum(['easy', 'medium', 'hard']),
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
  confidenceScore: z.number().describe("AI's self-assessment of fact accuracy (0-1)."),
});

async function streamLog(jobId: string, message: string) {
  try {
    await db.collection('ai_generation_jobs').doc(jobId).update({
      logs: FieldValue.arrayUnion(`[${new Date().toLocaleTimeString()}] ${message}`),
      lastLog: message,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error("Log Stream Error:", e);
  }
}

export async function generateBilingualBatch(input: z.infer<typeof GeneratorInputSchema>) {
  const { jobId, exam, subjects, count, difficulty, languageMode } = input;

  const prompt = ai.definePrompt({
    name: `neural_forge_v4_${jobId}`,
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v4.0 (Institutional Tier).
    Synthesize a high-fidelity batch of {{{count}}} MCQs for the {{{exam}}} exam in Punjab.

    CONFIGURATION:
    - SUBJECTS: {{{subjects}}}
    - COMPLEXITY: {{{difficulty}}}
    - LANGUAGE: {{{languageMode}}}
    
    PROTOCOL:
    1. BILINGUAL DEPTH: If mode is bilingual, use Raavi-compliant Gurmukhi.
    2. OPTION DISTINCTNESS: Ensure options are plausible and distinct.
    3. MARKING ACCURACY: correctAnswer text MUST match the English option exactly.
    4. EXPLANATION LOGIC: Provide a step-by-step derivation for both languages.

    Respond ONLY with a valid JSON object matching the output schema. No Markdown.`,
  });

  try {
    await streamLog(jobId, `Initializing synthesis for ${count} artifacts in ${subjects.join(', ')}...`);
    
    const { output } = await prompt(input);

    if (!output || !output.questions) {
      throw new Error("Neural Link Failure: AI failed to produce structured artifacts.");
    }

    await streamLog(jobId, `Synthesis complete. Injecting ${output.questions.length} artifacts to Global Bank...`);

    const batch = db.batch();
    const questionsCol = db.collection('questions');

    output.questions.forEach((q) => {
      const qRef = questionsCol.doc();
      const questionData = {
        ...q,
        id: qRef.id,
        status: 'published',
        source: 'NEURAL_FORGE_V4',
        jobId: jobId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        en: { question: q.question_en, options: q.options_en, explanation: q.explanation_en },
        pa: { question: q.question_pa, options: q.options_pa, explanation: q.explanation_pa },
      };
      batch.set(qRef, questionData);
    });

    await batch.commit();
    await streamLog(jobId, `Artifacts indexed successfully. Quality: ${(output.confidenceScore * 100).toFixed(1)}%`);

    return output.questions;
  } catch (error: any) {
    await streamLog(jobId, `CRITICAL GATEWAY ERROR: ${error.message}`);
    throw error;
  }
}
