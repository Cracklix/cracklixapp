
'use server';
/**
 * @fileOverview AI Mock Interview Simulator.
 * Conducts structured interviews for high-level Punjab Govt posts (PCS, SI).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const InterviewSimInputSchema = z.object({
  role: z.string().describe("The post being interviewed for."),
  currentQuestion: z.string().optional().describe("The question currently being asked."),
  userResponse: z.string().optional().describe("The user's response to the last question."),
  history: z.array(z.object({
    role: z.enum(['ai', 'user']),
    text: z.string()
  })).optional().default([]),
});
export type InterviewSimInput = z.infer<typeof InterviewSimInputSchema>;

const InterviewSimOutputSchema = z.object({
  aiQuestion: z.string().describe("The next question from the panel."),
  feedback: z.string().optional().describe("Brief feedback on the last answer."),
  score: z.number().optional().describe("Score for the last answer (1-10)."),
  isComplete: z.boolean().default(false).describe("Whether the interview session is finished."),
});
export type InterviewSimOutput = z.infer<typeof InterviewSimOutputSchema>;

export async function conductMockInterview(input: InterviewSimInput): Promise<InterviewSimOutput> {
  return interviewSimFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interviewSimPrompt',
  input: { schema: InterviewSimInputSchema },
  output: { schema: InterviewSimOutputSchema },
  prompt: `You are a senior panel member at the Punjab Public Service Commission (PPSC).
You are interviewing a candidate for the role of: {{{role}}}.

{{#if userResponse}}
Last Question: {{{currentQuestion}}}
Candidate Response: {{{userResponse}}}
Analyze the response for domain knowledge (Punjab Admin/GK) and leadership. Provide a score and brief feedback.
{{else}}
Start the interview by introducing yourself and asking a high-impact first question.
{{/if}}

History:
{{#each history}}
- {{role}}: {{text}}
{{/each}}

Be professional, authoritative, and focused on Punjab governance. 
If the interview has reached a logical end (after 5-6 questions), set isComplete to true.`,
});

const interviewSimFlow = ai.defineFlow(
  {
    name: 'interviewSimFlow',
    inputSchema: InterviewSimInputSchema,
    outputSchema: InterviewSimOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
