import { GoogleGenAI, GenerateContentResponse, CountTokensResponse, EmbedContentResponse, GenerateImagesResponse, Operations, Operation } from "@google/genai"; // Import necessary types
import { GEMINI_API_KEY } from "./constants"; // Ensure GEMINI_API_KEY is defined here or in .env


export interface ModelInfo {
	name?: string; // e.g., "models/gemini-pro" - though we strip the "models/" prefix
	displayName?: string;
	supportedActions?: string[]; // e.g., ["generateContent", "countTokens"]
};


export function createGeminiClient(): GoogleGenAI{
	if (!GEMINI_API_KEY) {
		throw new Error("GEMINI_API_KEY is not set in constants.ts or your environment.");
	}
	// Initialize with options if needed, e.g., transport, headers
	return new GoogleGenAI({
		// vertexai: false,
		apiKey: GEMINI_API_KEY
	});
};

// Fetch list of all models available
async function fetchModelsAndMethods(): Promise<ModelInfo[]>{
	const ai = createGeminiClient();

	try {
		const models = await ai.models.list({ config: { pageSize: 100 } });

		const result: ModelInfo[] = [];

		for await (const model of models){
			// Filter out models without a name or supported actions if they aren't useful for completion
			if (model.name && model.supportedActions && model.supportedActions.length > 0) {
				result.push({
					name: model.name.replace("models/", ""), // Clean up the name prefix
					displayName: model.displayName,
					supportedActions: model.supportedActions
				});
			}
		}

		return result;
	} catch (error) {
		console.error("Error listing Gemini models:", error);
		throw error; // Re-throw to be caught by the API route handler
	}
};

// --- Helper functions for specific API calls ---
// These functions handle the specific argument structure for each method

/**
 * Calls the generateContent method.
 * @param modelName - The name of the model to use.
 * @param query - The text query string.
 * @returns The text response from the model.
 */
async function callGenerateContent(modelName: string, query: string): Promise<string> {
    const ai = createGeminiClient();
     console.log(`[GeminiClient] Calling generateContent for model "${modelName}" with query: "${query}"`);
    const result: GenerateContentResponse = await ai.models.generateContent({
        model: modelName,
        contents: [{ text: query }], // Ensure contents is an array of ContentPart
    });

     // Access the text result safely
    const textResponse = (result as any)?.response?.text ?? (result as any)?.text;

    if (textResponse === undefined) {
        console.warn("[GeminiClient] generateContent response did not contain text:", result);
        throw new Error("Failed to extract text from Gemini generateContent response.");
    }

    return textResponse;
}

/**
 * Calls the countTokens method.
 * @param modelName - The name of the model to use.
 * @param query - The text query string.
 * @returns The total number of tokens.
 */
async function callCountTokens(modelName: string, query: string): Promise<number> {
    const ai = createGeminiClient();
     console.log(`[GeminiClient] Calling countTokens for model "${modelName}" with query: "${query}"`);
    const response: CountTokensResponse = await ai.models.countTokens({
        model: modelName,
        contents: [{ text: query }], // Ensure contents is an array of ContentPart
    });

    if (response?.totalTokens === undefined) {
        console.warn("[GeminiClient] countTokens response did not contain totalTokens:", response);
        throw new Error("Failed to extract totalTokens from Gemini countTokens response.");
    }

    return response.totalTokens;
}

/**
 * Calls the embedContent method.
 * @param modelName - The name of the model to use.
 * @param query - The text query string.
 * @returns The embedding values.
 */
async function callEmbedContent(modelName: string, query: string): Promise<number[]> {
     const ai = createGeminiClient();
      console.log(`[GeminiClient] Calling embedContent for model "${modelName}" with query: "${query}"`);
     // Note: embedContent expects a single 'content' parameter, which can be string or Content | Content[]
     // Mapping our simple string query to the content parameter directly.
    const response: EmbedContentResponse = await ai.models.embedContent({
        model: modelName,
        contents: [{ text: query }], // Pass query as array of ContentPart
    });

    if (!response?.embeddings?.[0]?.values || response.embeddings[0].values.length === 0) {
        console.warn("[GeminiClient] embedContent response did not contain embedding values:", response);
        throw new Error("Failed to extract embedding values from Gemini embedContent response.");
    }

    return response.embeddings[0].values;
}

/**
 * Calls the generateImages method.
 * @param modelName - The name of the model to use.
 * @param query - The text prompt string.
 * @returns The base64 string of the generated image.
 */
async function callGenerateImages(modelName: string, query: string): Promise<string> {
     const ai = createGeminiClient();
      console.log(`[GeminiClient] Calling generateImages for model "${modelName}" with prompt: "${query}"`);
     // The prompt comes from our 'query' input. Add basic config if needed.
    const response: GenerateImagesResponse = await ai.models.generateImages({
        model: modelName, // Should be an Imagen model name like 'imagen-3.0-generate-002'
        prompt: query,
        config: {
            numberOfImages: 1, // Requesting one image based on your example
            // includeRaiReason: true, // Optionally include safety reasons
        },
    });

    const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;

    if (!imageBytes) {
        console.warn("[GeminiClient] generateImages response did not contain imageBytes:", response);
         // Check for safety ratings if available
        const safetyRatings = (response as any)?.generatedImages?.[0]?.safetyRatings;
         if(safetyRatings && safetyRatings.length > 0) {
             console.warn("Image generation blocked by safety filters:", safetyRatings);
             throw new Error(`Image generation blocked. Safety reasons: ${JSON.stringify(safetyRatings)}`);
         }
        throw new Error("Failed to generate image or extract image bytes.");
    }

    return imageBytes; // This is the Base64 string
}

// Helper for delay function used in polling
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export all helper functions you want to use in your routes
export {
    fetchModelsAndMethods,
    callGenerateContent,
    callCountTokens,
    callEmbedContent,
    callGenerateImages,
};