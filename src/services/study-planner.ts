import { geminiModel } from "@/lib/gemini";

export async function createStudyPlan(exam: string, days: number) {
  const prompt = `
Create a comprehensive Punjab Government exam study plan.

Target Exam: ${exam}
Duration: ${days} days

Provide a structured response including:
1. Daily subject-wise targets.
2. A mock test schedule.
3. Specific focus areas based on recent exam trends.
4. A revision strategy for the final 20% of time.

Use a professional, encouraging tone.
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}