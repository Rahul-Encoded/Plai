import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  const { model, method, query } = await req.json();
  const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI_API_KEY });

  try {
    let result;

    if (method === "generateText") {
      result = await ai.models.generateContent({
        model: model,
        contents: query,
      });
      return Response.json({ response: result.text });
    }

    // Add more methods later like web_search, image generation, etc.
    return Response.json({ error: "Method not supported" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to call Gemini API" });
  }
}
