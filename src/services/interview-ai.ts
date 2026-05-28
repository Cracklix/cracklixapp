import { geminiModel } from "@/lib/gemini";

export async function mockInterview(role: string) {
  const prompt = `
You are a senior panel member at the Punjab Public Service Commission (PPSC).

Conduct a mock interview for the role of: ${role}.

Your goal is to evaluate the candidate on:
- Domain knowledge (Punjab GK, Administration).
- Situation-based leadership.
- Communication skills.

Start by introducing yourself and asking the first question. Wait for input (simulation).
`;

  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}