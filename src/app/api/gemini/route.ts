import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, fetchModelsAndMethods } from "@/lib/geminiClient";

export async function POST(req: NextRequest) {
  const { model, method, query } = await req.json();
  const ai = createGeminiClient();

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

export async function GET() {
  try {
    const models = await fetchModelsAndMethods();
    return NextResponse.json(models); // Use NextResponse.json in App Router
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    ); // Return error with status code
  }
}
