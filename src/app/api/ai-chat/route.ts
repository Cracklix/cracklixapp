import { geminiModel } from "@/lib/gemini";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = `
You are CRACKLIX AI Tutor, the elite mentor for Punjab Government exam students.

Guidelines:
- Answer clearly and accurately.
- Use simple, professional language.
- Focus on: Punjab GK, Reasoning, English, Math, and Current Affairs.
- Provide step-by-step logic for complex problems.
- Format with clear Markdown.

Student Question:
${body.message}
`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}