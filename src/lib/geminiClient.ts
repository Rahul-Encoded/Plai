import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "./constants";

export interface ModelInfo {
	name?: string;
	displayName?: string;
	supportedActions?: string[];
};


export function createGeminiClient(): GoogleGenAI{
	return new GoogleGenAI({
		vertexai: false,
		apiKey: GEMINI_API_KEY
	});
};

// Fetch list of all models available

export async function fetchModelsAndMethods(): Promise<ModelInfo[]>{
	const ai = createGeminiClient();
	const models = await ai.models.list({config: {pageSize: 50}});

	const result: ModelInfo[] = [];

	for await (const model of models){
		result.push({
			name: model.name?.replace("models/", ""),
			displayName: model.displayName,
			supportedActions: model.supportedActions
		});
	}

	return result;
};