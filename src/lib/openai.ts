
import OpenAI from "openai";

/**
 * PRODUCTION OPENAI CLIENT
 * Configured for high-stakes bilingual MCQ synthesis.
 */
export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY || "",
  dangerouslyAllowBrowser: true, // Only for prototype; in production, use server-side routes
});
