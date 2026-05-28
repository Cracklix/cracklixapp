import { geminiModel } from "@/lib/gemini";

export async function analyzeResume(text: string) {
  const prompt = `
Analyze the following resume content for eligibility and competitiveness in Punjab Government job applications.

Resume Text:
${text}

Provide:
1. A compatibility score (0-100).
2. Key strengths identified.
3. Critical gaps or weaknesses.
4. 3 specific improvements to make it "government-ready".
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}