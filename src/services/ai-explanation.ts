
'use client';

import { geminiModel } from '@/lib/gemini';

/**
 * Service to generate high-yield explanations for mock questions.
 * Optimized for National Level competitive exams.
 */
export async function getQuestionExplanation(question: string, correctAnswer: string, subject: string, examType?: string) {
  const prompt = `
    You are an expert CRACKLIX National Tutor. Explain this question for a candidate preparing for ${examType || 'Competitive Exams'}.
    
    Subject: ${subject}
    Question: ${question}
    Correct Answer: ${correctAnswer}
    
    Provide:
    1. The core concept behind the question (Theoretical basis).
    2. A step-by-step logical breakdown (The standard path).
    3. An "Elite Speed Trick" or mnemonic (For the top 1% candidates).
    4. Related PYQ Context (Mention if this pattern appeared in recent years).
    
    Format with clear Markdown.
  `;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

/**
 * Service to predict exam readiness based on performance data.
 */
export async function predictExamReadiness(analytics: any, exam: string = 'General') {
  const prompt = `
    Analyze the following performance metrics for the ${exam} exam.
    Data: ${JSON.stringify(analytics)}
    
    Provide:
    1. A Selection Probability Score (0-100).
    2. 3 tactical focus areas.
    3. A motivational brief from the "Elite Panel".
  `;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}
