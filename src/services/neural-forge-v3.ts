'use client';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';

/**
 * PRODUCTION NEURAL FORGE V3 ORCHESTRATOR
 * Features: Batch Synthesis, Retry Logic, and Raavi Normalization.
 */

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
  explanationEn: z.string(),
  explanationPa: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeEstimate: z.number().default(45)
});

const ForgeInputSchema = z.object({
  instruction: z.string(),
  exam: z.string(),
  count: z.number().max(10),
  difficulty: z.string().optional(),
  language: z.string().optional()
});

const forgePrompt = ai.definePrompt({
  name: 'neuralForgeV3Synthesis',
  input: { schema: ForgeInputSchema },
  output: { schema: z.object({ questions: z.array(QuestionArtifactSchema) }) },
  prompt: `You are India's most advanced competitive exam mock generator.
Synthesize {{{count}}} high-yield, bilingual artifacts for: {{{exam}}}.

INSTRUCTIONS:
1. FOCUS: {{{instruction}}}
2. BILINGUAL: English and Raavi-compliant Punjabi are MANDATORY.
3. QUALITY: CorrectAnswer must be index 0-3. NEVER leave Punjabi blank.
4. FORMAT: Return ONLY valid JSON matching the schema.`,
});

export async function executeForgeBatch(config: any, onProgress: (msg: string) => void) {
  const { exam, instruction, totalCount } = config;
  const batchSize = 5;
  const totalBatches = Math.ceil(totalCount / batchSize);
  let allArtifacts: any[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const currentBatchCount = Math.min(batchSize, totalCount - i * batchSize);
    onProgress(`Synthesizing batch ${i + 1}/${totalBatches}...`);

    try {
      const { output } = await forgePrompt({
        exam,
        instruction,
        count: currentBatchCount
      });

      if (output?.questions) {
        allArtifacts = [...allArtifacts, ...output.questions];
        onProgress(`Batch ${i + 1} stabilized. Injection pending...`);
      }
    } catch (err: any) {
      if (err.message.includes('429')) {
        onProgress("AI Gateway Overload. Initiating recovery wait (45s)...");
        await new Promise(r => setTimeout(r, 45000));
        i--; // Retry this batch
        continue;
      }
      throw err;
    }
  }

  return allArtifacts;
}

export async function publishMockFromArtifacts(artifacts: any[], config: any) {
  const batch = writeBatch(db);
  const mockRef = doc(collection(db, "mocks"));
  
  const mockData = {
    id: mockRef.id,
    title: config.title || `${config.exam} AI Mock - ${new Date().toLocaleDateString()}`,
    exam: config.exam,
    totalQuestions: artifacts.length,
    duration: config.duration || Math.round(artifacts.length * 1.2),
    negativeMarking: config.negativeMarking || 0.25,
    accessType: config.accessType || 'pass_plus',
    status: 'published',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    attemptCount: 0,
    languageMode: 'bilingual'
  };

  batch.set(mockRef, mockData);

  artifacts.forEach((q, idx) => {
    const qRef = doc(db, "mocks", mockRef.id, "questions", `q_${idx}`);
    batch.set(qRef, {
      ...q,
      id: qRef.id,
      order: idx,
      createdAt: Date.now()
    });

    const bankRef = doc(collection(db, "questions"));
    batch.set(bankRef, {
      ...q,
      status: 'published',
      source: 'NEURAL_FORGE_V3',
      createdAt: Date.now()
    });
  });

  await batch.commit();
  return mockRef.id;
}
