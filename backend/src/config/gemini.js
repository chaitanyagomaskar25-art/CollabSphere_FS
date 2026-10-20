
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  throw new Error("API_KEY is missing from your backend .env file.");
}

export const ai = new GoogleGenAI({
  apiKey,
});