'use client';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { geminiModel } from '@/lib/gemini';

/**
 * Service to generate high-yield explanations for mock questions.
 */
export async function getQuestionExplanation(question: string, correctAnswer: string, subject: string) {
  const prompt = `
    You are an expert CRACKLIX Tutor. Explain this question for a student preparing for Punjab Govt Exams.
    
    Subject: ${subject}
    Question: ${question}
    Correct Answer: ${correctAnswer}
    
    Provide:
    1. The core concept behind the question.
    2. A step-by-step logical breakdown.
    3. A "Short Trick" or mnemonic if applicable for faster solving.
    4. Why common alternative choices might be wrong.
    
    Format with clear Markdown.
  `;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

/**
 * Service to predict exam readiness based on performance data.
 */
export async function predictExamReadiness(analytics: any) {
  const prompt = `
    Analyze the following performance metrics and predict the student's exam readiness for Punjab State Exams.
    Data: ${JSON.stringify(analytics)}
    
    Give a score (0-100) and 3 tactical areas for improvement.
  `;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}
