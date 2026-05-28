'use server';
/**
 * @fileOverview AI OCR Doubt Solver flow.
 *
 * Solves questions from images (photos of books, screens, or handwritten notes).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OcrSolverInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a question, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userPrompt: z.string().optional().describe('Optional context or specific query from the user.'),
});
export type OcrSolverInput = z.infer<typeof OcrSolverInputSchema>;

const OcrSolverOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the image.'),
  solution: z.string().describe('The step-by-step solution to the identified question.'),
  subject: z.string().describe('The subject area of the question (e.g., Punjab GK, Math).'),
  keyConcepts: z.array(z.string()).describe('List of key concepts involved in the question.'),
});
export type OcrSolverOutput = z.infer<typeof OcrSolverOutputSchema>;

export async function solveOcrQuestion(input: OcrSolverInput): Promise<OcrSolverOutput> {
  return ocrSolverFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ocrSolverPrompt',
  input: { schema: OcrSolverInputSchema },
  output: { schema: OcrSolverOutputSchema },
  prompt: `You are the CRACKLIX Expert AI Doubt Solver. 

I have provided an image of a question from a Punjab Government exam preparation book or paper.

Image: {{media url=photoDataUri}}
{{#if userPrompt}}User Context: {{{userPrompt}}}{{/if}}

Please perform the following:
1. Extract the text of the question from the image.
2. Identify the subject (Punjab GK, Quant, Reasoning, English, or Current Affairs).
3. Provide a clear, step-by-step solution.
4. List the key concepts the student should review to master this type of question.

Format your response as a JSON object matching the output schema.`,
});

const ocrSolverFlow = ai.defineFlow(
  {
    name: 'ocrSolverFlow',
    inputSchema: OcrSolverInputSchema,
    outputSchema: OcrSolverOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);