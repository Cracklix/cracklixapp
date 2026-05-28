import { geminiModel } from "@/lib/gemini";

export async function generateQuestions(topic: string) {
  const prompt = `
Generate 5 high-yield Punjab Government exam MCQs for the topic: ${topic}.

Format each question with:
- Question text
- 4 clear options (A, B, C, D)
- The correct answer
- A detailed explanation in simple English/Punjabi context.

Make them relevant for PPSC and PSSSB exams.
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}