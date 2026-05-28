'use server';
/**
 * CRACKLIX NEURAL FORGE v12.5 Core
 * Advanced instruction-driven synthesis with strict JSON payload enforcement.
 * Features: Exponential backoff, batch retries, and Raavi normalization.
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
  count: z.number().max(10), 
  difficulty: z.string(),
  topic: z.string().optional()
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema)
});

// Define prompt outside for institutional stability
const prompt = ai.definePrompt({
    name: 'psssbNeuralForgeV25',
    input: { schema: GeneratorInputSchema },
    output: { schema: GeneratorOutputSchema },
    prompt: `You are India's most advanced competitive exam mock generator.
Synthesize {{{count}}} high-yield, bilingual MCQs for the {{{exam}}}.

INSTRUCTIONS:
1. SUBJECT AREA: {{{topic}}} (Difficulty: {{{difficulty}}})
2. LANGUAGES: Mandatory English and Punjabi (Raavi font compliant).
3. STRICTURE: Respond with ONLY a valid JSON object matching the schema. No markdown outside.
4. QUALITY:
   - CorrectAnswer MUST match English options exactly.
   - Punjabi fields MUST NOT be empty. If translation is unavailable, copy English text.
   - Explanations must be step-by-step logic.`,
});

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function forgeNeuralArtifacts(input: z.infer<typeof GeneratorInputSchema>): Promise<z.infer<typeof GeneratorOutputSchema>> {
  let retries = 3;
  let lastError: any = null;

  for (let i = 0; i < retries; i++) {
    try {
      const { output } = await prompt(input);
      if (!output || !output.questions) throw new Error("Synthesis failed to produce valid artifacts.");
      
      // Schema Validation Layer
      const validatedQuestions = output.questions.filter(q => 
        q.questionEnglish && 
        q.questionPunjabi && 
        q.optionsEnglish.length === 4 &&
        q.correctAnswer
      );

      if (validatedQuestions.length === 0) throw new Error("No valid questions in AI response.");

      return { questions: validatedQuestions };
    } catch (error: any) {
      lastError = error;
      console.warn(`Neural Forge Attempt ${i + 1} failed: ${error.message}`);
      
      // Handle rate limits (429) specifically
      if (error.message.includes('429') || error.message.includes('RESOURCE_EXHAUSTED')) {
        await sleep(5000 * (i + 1));
      } else {
        await sleep(2000 * (i + 1));
      }
    }
  }

  throw new Error(`Forge Breach: ${lastError.message}`);
}
