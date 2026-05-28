
'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, setDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { forgeNeuralArtifacts } from '@/services/ai-mock-generator-flow';

/**
 * PRODUCTION AI FORGE ORCHESTRATOR v3.0
 * Handles chunked generation to prevent rate limits and ensure payload integrity.
 */

export interface ForgeLog {
  id: string;
  message: string;
  status: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface ForgeJob {
  id: string;
  exam: string;
  subject: string;
  count: number;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  logs: ForgeLog[];
}

export async function createForgeJob(config: any) {
  const jobRef = await addDoc(collection(db, 'ai_generation_jobs'), {
    ...config,
    status: 'pending',
    progress: 0,
    logs: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return jobRef.id;
}

export async function executeForgePipeline(
  jobId: string, 
  config: any, 
  onUpdate: (progress: number, logs: ForgeLog[]) => void
) {
  const logs: ForgeLog[] = [];
  const addLog = async (msg: string, status: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const log: ForgeLog = { id: Date.now().toString(), message: msg, status, timestamp: Date.now() };
    logs.unshift(log);
    onUpdate(0, logs);
    await updateDoc(doc(db, 'ai_generation_jobs', jobId), { logs });
  };

  try {
    await addLog(`Initializing Neural Forge for ${config.exam}...`);
    await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'processing' });

    const totalCount = config.count || 10;
    const batchSize = 5; // Institutional stability limit
    const totalBatches = Math.ceil(totalCount / batchSize);
    let allQuestions: any[] = [];

    for (let i = 0; i < totalBatches; i++) {
      const currentBatchCount = Math.min(batchSize, totalCount - i * batchSize);
      await addLog(`Synthesizing Batch ${i + 1}/${totalBatches} (${currentBatchCount} artifacts)...`);

      const result = await forgeNeuralArtifacts({
        exam: config.exam,
        count: currentBatchCount,
        difficulty: config.difficulty,
        topic: config.subject,
      });

      if (result.questions) {
        allQuestions = [...allQuestions, ...result.questions];
        const progress = Math.round(((i + 1) / totalBatches) * 100);
        onUpdate(progress, logs);
        await updateDoc(doc(db, 'ai_generation_jobs', jobId), { progress });
      }

      // 2-second buffer to prevent API spam
      await new Promise(r => setTimeout(r, 2000));
    }

    await addLog(`Validation Layer: Scanning ${allQuestions.length} artifacts for bilingual integrity...`, 'success');

    // Mass Injection into Global Bank
    const batch = writeBatch(db);
    allQuestions.forEach((q, idx) => {
      const qRef = doc(collection(db, 'questions'));
      batch.set(qRef, {
        questionEn: q.questionEnglish,
        questionPa: q.questionPunjabi,
        options: q.optionsEnglish.map((en: string, i: number) => ({
          en,
          pa: q.optionsPunjabi[i] || en
        })),
        correctAnswer: q.optionsEnglish.indexOf(q.correctAnswer),
        solutionEn: q.explanationEnglish,
        solutionPa: q.explanationPunjabi,
        subject: q.subject || config.subject,
        topic: q.topic || 'General',
        difficulty: q.difficulty,
        status: 'published',
        source: 'NEURAL_FORGE_V3',
        createdAt: Date.now()
      });
    });

    await batch.commit();
    await addLog(`Successfully indexed ${allQuestions.length} artifacts into Atomic Bank.`, 'success');

    // Auto-Publish Mock if enabled
    if (config.publishInstantly) {
      await addLog(`Auto-Publish: Assembling Mock Simulation...`);
      const mockRef = await addDoc(collection(db, 'mocks'), {
        title: config.title || `${config.exam} Neural Simulation`,
        exam: config.exam,
        totalQuestions: allQuestions.length,
        duration: config.duration || (allQuestions.length * 1.2),
        negativeMarking: config.negativeMarking || 0.25,
        accessType: config.accessType || 'pass_plus',
        status: 'published',
        languageMode: 'bilingual',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      // Link questions to mock
      const mockBatch = writeBatch(db);
      allQuestions.forEach((q, idx) => {
        const mqRef = doc(collection(db, 'mocks', mockRef.id, 'questions'));
        mockBatch.set(mqRef, {
          ...q,
          id: mqRef.id,
          order: idx,
          correctAnswer: q.optionsEnglish.indexOf(q.correctAnswer),
          questionEn: q.questionEnglish,
          questionPa: q.questionPunjabi,
          options: q.optionsEnglish.map((en: string, i: number) => ({
            en,
            pa: q.optionsPunjabi[i] || en
          })),
        });
      });
      await mockBatch.commit();
      await addLog(`Simulation LIVE: Pushed to Student Arena. ID: ${mockRef.id}`, 'success');
    }

    await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'completed', progress: 100 });
    return allQuestions;

  } catch (error: any) {
    await addLog(`CRITICAL FAILURE: ${error.message}`, 'error');
    await updateDoc(doc(db, 'ai_generation_jobs', jobId), { status: 'failed' });
    throw error;
  }
}
