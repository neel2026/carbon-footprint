import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenAI } from '@google/genai';

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'reply with a tiny JSON { "status": "ok" }',
    });
    console.log("Response text:", response.text);
  } catch (error) {
    console.error("SDK Error:", error);
  }
}
run();
