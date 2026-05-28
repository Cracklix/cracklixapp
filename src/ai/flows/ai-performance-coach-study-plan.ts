'use server';
/**
 * @fileOverview An AI Performance Coach flow that analyzes quiz results and generates a personalized study plan.
 *
 * - aiPerformanceCoachStudyPlan - A function that handles the study plan generation process.
 * - AiPerformanceCoachStudyPlanInput - The input type for the aiPerformanceCoachStudyPlan function.
 * - AiPerformanceCoachStudyPlanOutput - The return type for the aiPerformanceCoachStudyPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiPerformanceCoachStudyPlanInputSchema = z.object({
  studentName: z.string().describe("The name of the student."),
  subject: z.string().describe("The subject of the quiz."),
  quizResults: z.array(
    z.object({
      question: z.string().describe("The quiz question."),
      correctAnswer: z.string().describe("The correct answer to the question."),
      userAnswer: z.string().describe("The answer provided by the user."),
      isCorrect: z.boolean().describe("Whether the user's answer was correct or not."),
      topic: z.string().optional().describe("The specific topic the question belongs to (optional)."),
    })
  ).describe("An array of objects, each representing a quiz question and the student's performance."),
});
export type AiPerformanceCoachStudyPlanInput = z.infer<typeof AiPerformanceCoachStudyPlanInputSchema>;

const AiPerformanceCoachStudyPlanOutputSchema = z.object({
  identifiedWeaknesses: z.array(z.string()).describe("A list of key areas or topics where the student struggled."),
  recommendedTopics: z.array(z.string()).describe("A list of specific topics the student should focus on reviewing."),
  studyActivities: z.array(
    z.object({
      type: z.enum(["read", "practice", "watch", "review"]).describe("The type of study activity (e.g., read, practice, watch, review)."),
      description: z.string().describe("A detailed description of the study activity."),
      resource: z.string().optional().describe("A suggested resource for the activity (e.g., chapter, practice problem set, video link)."),
    })
  ).describe("A list of recommended study activities with descriptions and resources."),
  personalizedMessage: z.string().describe("An encouraging and personalized message for the student."),
});
export type AiPerformanceCoachStudyPlanOutput = z.infer<typeof AiPerformanceCoachStudyPlanOutputSchema>;

export async function aiPerformanceCoachStudyPlan(input: AiPerformanceCoachStudyPlanInput): Promise<AiPerformanceCoachStudyPlanOutput> {
  return aiPerformanceCoachStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPerformanceCoachStudyPlanPrompt',
  input: { schema: AiPerformanceCoachStudyPlanInputSchema },
  output: { schema: AiPerformanceCoachStudyPlanOutputSchema },
  prompt: `You are an AI Performance Coach. Your task is to analyze a student's quiz results and generate a personalized study plan to help them improve.

Student Name: {{{studentName}}}
Subject: {{{subject}}}

Quiz Results:
{{#each quizResults}}
- Question: {{{question}}}
  Correct Answer: {{{correctAnswer}}}
  User Answer: {{{userAnswer}}}
  Status: {{#if isCorrect}}Correct{{else}}Incorrect{{/if}}{{#if topic}} (Topic: {{{topic}}}){{/if}}
{{/each}}

Based on these quiz results, identify the student's weaknesses, recommend specific topics for review, suggest concrete study activities with potential resources, and provide a personalized, encouraging message.

Structure your response strictly as a JSON object matching the output schema.`,
});

const aiPerformanceCoachStudyPlanFlow = ai.defineFlow(
  {
    name: 'aiPerformanceCoachStudyPlanFlow',
    inputSchema: AiPerformanceCoachStudyPlanInputSchema,
    outputSchema: AiPerformanceCoachStudyPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
