
'use server';
/**
 * CRACKLIX NEURAL FORGE v12 Core
 * Advanced instruction-driven synthesis with strict JSON payload enforcement.
 * Now migrating to OpenAI GPT-4o-mini for superior structural stability.
 */

import { openai } from '@/lib/openai';
import { z } from 'zod';

const QuestionOptionSchema = z.object({
  en: z.string(),
  pa: z.string(),
});

const QuestionArtifactSchema = z.object({
  questionEn: z.string(),
  questionPa: z.string(),
  options: z.array(QuestionOptionSchema).length(4),
  correctAnswer: z.number().min(0).max(3),
  solutionEn: z.string(),
  solutionPa: z.string(),
  subject: z.string(),
  topic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeEstimate: z.number().default(45),
});

const GeneratorInputSchema = z.object({
  instruction: z.string(),
  exam: z.string(),
  subjects: z.array(z.string()),
  count: z.number().max(10),
  difficulty: z.string(),
});

const GeneratorOutputSchema = z.object({
  questions: z.array(QuestionArtifactSchema),
});

export async function generateStrictBilingualArtifacts(input: z.infer<typeof GeneratorInputSchema>) {
  const systemPrompt = `
You are India's most advanced competitive exam mock generator.
Generate ONLY valid JSON matching the provided schema.

RULES:
1. Every question MUST have:
- English question (questionEn)
- Punjabi question (questionPa)
- English options (options.en)
- Punjabi options (options.pa)
- correct answer index 0-3 (correctAnswer)
- Detailed English solution (solutionEn)
- Detailed Punjabi solution (solutionPa)
- difficulty
- subject
- topic

2. NEVER leave Punjabi fields blank. If Punjabi translation is unavailable, copy the English text into those fields.
3. Solutions MUST be step-by-step and logical. Include "Elite Speed Tricks" if applicable.
4. Distractors (wrong options) must be realistic.
5. Match the level of ${input.exam}.

Respond ONLY with a valid JSON object matching the schema.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(input) }
      ],
      response_format: { type: "json_object" }
    });

    const response = JSON.parse(completion.choices[0].message.content || "{}");
    const validated = GeneratorOutputSchema.parse(response);
    return validated.questions;

  } catch (error: any) {
    console.error("Neural Synthesis Error:", error);
    throw error;
  }
}
