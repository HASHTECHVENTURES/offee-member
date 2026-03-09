import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
  }
  return new GoogleGenerativeAI(apiKey);
}

/** Use Gemini 2.0 Flash for AI dashboard and execution insights */
export function getGeminiFlashModel() {
  const genAI = getGeminiClient();
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}
