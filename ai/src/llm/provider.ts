import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded for standalone execution
const rootDir = path.resolve(__dirname, "../../../");
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(rootDir, ".env.local") });
dotenv.config();

export function getLLM(temperature = 0.2): BaseChatModel {
  const provider = (process.env.LLM_PROVIDER || "gemini").toLowerCase();
  
  if (provider === "openai") {
    const openAiKey = process.env.OPENAI_API_KEY;
    if (!openAiKey || openAiKey.trim() === "" || openAiKey.startsWith("YOUR_")) {
      throw new Error("Missing Environment Variable: OPENAI_API_KEY is not configured.");
    }
    try {
      const { ChatOpenAI } = require("@langchain/openai");
      const model = process.env.OPENAI_MODEL || "gpt-4o";
      return new ChatOpenAI({
        openAIApiKey: openAiKey,
        modelName: model,
        temperature,
      });
    } catch (err: any) {
      throw new Error("Gemini API Error (OpenAI Integration): " + err.message);
    }
  }

  // Gemini (Default)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("YOUR_")) {
    throw new Error("Missing Environment Variable: GEMINI_API_KEY is not configured.");
  }
  
  const model = process.env.GEMINI_MODEL || "gemini-2.5-pro";

  try {
    return new ChatGoogleGenerativeAI({
      apiKey,
      modelName: model,
      temperature,
      maxRetries: 1,
    }) as any;
  } catch (err: any) {
    throw new Error("Gemini API Error: " + err.message);
  }
}
