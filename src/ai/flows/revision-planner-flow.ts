
'use server';
/**
 * @fileOverview AI Revision Planner flow.
 *
 * Generates structured revision plans based on student performance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RevisionPlannerInputSchema = z.object({
  studentName: z.string(),
  analytics: z.any().describe("JSON containing weak topics and accuracy scores."),
  targetExam: z.string().optional().default("Punjab Police SI"),
});
export type RevisionPlannerInput = z.infer<typeof RevisionPlannerInputSchema>;

const RevisionPlannerOutputSchema = z.object({
  revisionSchedule: z.array(z.object({
    day: z.string(),
    topic: z.string(),
    activity: z.string(),
    duration: z.string()
  })),
  priorityTopics: z.array(z.string()),
  coachAdvice: z.string(),
});
export type RevisionPlannerOutput = z.infer<typeof RevisionPlannerOutputSchema>;

export async function generateRevisionPlan(input: RevisionPlannerInput): Promise<RevisionPlannerOutput> {
  return revisionPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'revisionPlannerPrompt',
  input: { schema: RevisionPlannerInputSchema },
  output: { schema: RevisionPlannerOutputSchema },
  prompt: `You are the CRACKLIX AI Strategist. 

Create a high-impact revision plan for {{{studentName}}} who is preparing for the {{{targetExam}}}.

Data Context:
{{{analytics}}}

The plan should focus heavily on their identified weak topics. 
Include:
1. A 7-day revision schedule.
2. A list of 3-5 priority topics they must master.
3. Tactical coach advice on how to improve speed and accuracy.

Format as a strict JSON object.`,
});

const revisionPlannerFlow = ai.defineFlow(
  {
    name: 'revisionPlannerFlow',
    inputSchema: RevisionPlannerInputSchema,
    outputSchema: RevisionPlannerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
