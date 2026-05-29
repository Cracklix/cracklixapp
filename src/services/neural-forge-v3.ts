'use client';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, writeBatch, increment, getDoc, getDocs, query, where, limit } from 'firebase/firestore';

/**
 * CRACKLIX MASTER NEURAL CORE v4
 * Advanced adaptive batch synthesis with bilingual validation and fallback logic.
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
  timeEstimate: z.number().default(45),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25)
});

const ForgeInputSchema = z.object({
  instruction: z.string(),
  exam: z.string(),
  count: z.number().max(10),
  difficulty: z.string().optional(),
  subject: z.string().optional()
});

const forgePrompt = ai.definePrompt({
  name: 'neuralCoreV4Synthesis',
  input: { schema: ForgeInputSchema },
  output: { schema: z.object({ questions: z.array(QuestionArtifactSchema) }) },
  prompt: `You are the CRACKLIX Master Neural Core. 
Synthesize {{{count}}} high-yield, bilingual artifacts for: {{{exam}}}.

INSTRUCTIONS:
1. SYLLABUS: Follow official board patterns for {{{exam}}}.
2. CONTEXT: Focus on {{{subject}}} - {{{instruction}}}.
3. BILINGUAL: English and Raavi-compliant Punjabi are MANDATORY.
4. QUALITY: 
   - CorrectAnswer must be index 0-3.
   - NEVER leave Punjabi blank. If translation is tricky, provide formal Raavi Gurmukhi.
   - Solutions must be step-by-step logic.
5. FORMAT: Return ONLY valid JSON matching the schema.`,
});

export async function executeForgeBatch(config: any, onProgress: (msg: string) => void) {
  const { exam, instruction, totalCount, subject } = config;
  const batchSize = 5;
  const totalBatches = Math.ceil(totalCount / batchSize);
  let allArtifacts: any[] = [];

  for (let i = 0; i < totalBatches; i++) {
    const currentBatchCount = Math.min(batchSize, totalCount - i * batchSize);
    onProgress(`Neural Core: Synthesizing segment ${i + 1}/${totalBatches}...`);

    try {
      const { output } = await forgePrompt({
        exam,
        instruction,
        subject,
        count: currentBatchCount
      });

      if (output?.questions) {
        // Validation Layer
        const validBatch = output.questions.filter(q => 
          q.questionPa && q.questionPa.length > 5 && 
          !q.questionPa.includes('undefined') &&
          q.solutionPa && q.solutionPa.length > 5
        );

        if (validBatch.length < currentBatchCount) {
          onProgress("Signal Deviation Detected. Regenerating segment...");
          i--; // Retry batch
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        allArtifacts = [...allArtifacts, ...validBatch];
        onProgress(`Segment ${i + 1} stabilized. Validated ${validBatch.length} artifacts.`);
      }
    } catch (err: any) {
      if (err.message.includes('429')) {
        onProgress("Neural Link Saturated. Switching AI Node in 45s...");
        await new Promise(r => setTimeout(r, 45000));
        i--; continue;
      }
      throw err;
    }
    
    // Throttle for stability
    if (i < totalBatches - 1) await new Promise(r => setTimeout(r, 1500));
  }

  return allArtifacts;
}

export async function publishMockFromArtifacts(artifacts: any[], config: any) {
  const batch = writeBatch(db);
  const mockRef = doc(collection(db, "mocks"));
  
  const mockData = {
    id: mockRef.id,
    title: config.title || `${config.exam} Simulation - ${new Date().toLocaleDateString()}`,
    exam: config.exam,
    totalQuestions: artifacts.length,
    duration: config.duration || Math.round(artifacts.length * 1.2),
    negativeMarking: config.negativeMarking || 0.25,
    totalMarks: artifacts.reduce((acc, q) => acc + (q.marks || 1), 0),
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

    // Mirror to Global Atomic Bank
    const bankRef = doc(collection(db, "questions"));
    batch.set(bankRef, {
      ...q,
      status: 'published',
      source: 'NEURAL_CORE_V4',
      createdAt: Date.now()
    });
  });

  await batch.commit();
  return mockRef.id;
}
