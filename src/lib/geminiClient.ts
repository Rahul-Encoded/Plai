import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./constants"; // Ensure GEMINI_API_KEY is defined here or in .env

export interface ModelInfo {
  name?: string; 
  displayName?: string;
  supportedActions?: string[]; 
}

export function createGeminiClient(): GoogleGenAI {
  if (!GEMINI_API_KEY) {
    // Throw an error immediately if the key is missing
    throw new Error(
      "GEMINI_API_KEY is not set in constants.ts or your environment."
    );
  }
  return new GoogleGenAI({
    // vertexai: false, // Assuming direct API, not Vertex AI endpoint
    apiKey: GEMINI_API_KEY,
  });
}

// Fetch list of all models available
export async function fetchModelsAndMethods(): Promise<ModelInfo[]> {
  const ai = createGeminiClient(); // This might throw if key is missing

  // Add retry logic or better error handling if needed for network issues
  try {
    // list() returns an AsyncIterable. Use a higher pageSize to fetch more at once.
    const models = await ai.models.list({ config: { pageSize: 50 } }); // Increased page size

    const result: ModelInfo[] = [];

    // Iterate through the AsyncIterable
    for await (const model of models) {
      // Filter out models without a name or display name if they aren't useful
      if (model.name) {
        result.push({
          name: model.name.replace("models/", ""), // Clean up the name prefix
          displayName: model.displayName,
          supportedActions: model.supportedActions, // Array of strings
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error listing Gemini models:", error);
    throw error; // Re-throw to be caught by the API route handler
  }
}
