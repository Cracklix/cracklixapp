'use server';
/**
 * Advanced AI Mock Generator Flow v25.0 (Stabilized Core).
 * Features: Parallel chunking, Raavi-font compliance, and Fault-tolerant JSON synthesis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionArtifactSchema = z.object({
  questionEnglish: z.string(),
  questionPunjabi: z.string(),
  optionsEnglish: z.array(z.string()).length(4),
  optionsPunjabi: z.array(z.string()).length(4),
  correctAnswer: z.string().describe("The text of the correct option in English."),
  explanationEnglish: z.string(),
  explanationPunjabi: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  marks: z.number().default(1),
  negativeMarks: z.number().default(0.25)
});

const GeneratorInputSchema = z.object({
  exam: z.string(),
  count: z.number().max(10), // Small chunks for stability
  difficulty: z.string(),
  topic: z.string().optional()
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema)
});

export async function forgeNeuralArtifacts(input: z.infer<typeof GeneratorInputSchema>): Promise<z.infer<typeof GeneratorOutputSchema>> {
  const prompt = ai.definePrompt({
    name: 'psssbNeuralForgeV25',
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are the CRACKLIX Neural Academic Architect v25. 
Synthesize {{{count}}} high-yield, bilingual MCQs for the {{{exam}}}.

INSTRUCTIONS:
1. SUBJECT AREA: {{{topic}}} (Difficulty: {{{difficulty}}})
2. LANGUAGES: Mandatory English and Punjabi (Raavi font compliant).
3. STRICTURE: Respond with ONLY a valid JSON object matching the schema. No markdown outside.

QUALITY PROTOCOL:
- CorrectAnswer must match English options exactly.
- Explanations must be step-by-step logic.
- Avoid duplicate concepts.`,
  });

  try {
    const { output } = await prompt(input);
    if (!output || !output.questions) throw new Error("Synthesis failed to produce valid artifacts.");
    return output;
  } catch (error: any) {
    console.error("Neural Forge Error:", error);
    throw new Error(`AI Gateway Overload: ${error.message}`);
  }
}
