import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient } from "@/lib/geminiClient";
import { GEMINI_API_KEY } from "@/lib/constants";
import { fetchModelsAndMethods } from "@/lib/geminiClient";

// Helper function to parse the code string
function parseCodeString(code: string): {
  provider?: string;
  modelName?: string;
  methodName?: string;
  query?: string;
  error?: string;
} {
  // Expected format: Provider.ModelName.Method("Query String")
  // Using a regex to capture parts. This regex assumes a single argument string
  // enclosed in single or double quotes, potentially with whitespace.
  const regex = /^\s*(\w+)\.(\w+)\.(\w+)\(\s*(["'])(.*?)\4\s*\)\s*$/;
  const match = code.match(regex);

  if (match) {
    const [, provider, modelName, methodName, , query] = match; // Note the empty slot for the quote character group

    // Basic validation (can be extended)
    if (!provider || !modelName || !methodName || query === undefined) {
         return { error: "Invalid code format. Expected Provider.ModelName.Method(\"Query\")" };
    }

    return { provider, modelName, methodName, query };
  } else {
    return { error: "Invalid code format. Expected Provider.ModelName.Method(\"Query\")" };
  }
}


export async function POST(req: NextRequest) {
  // Expect the entire code string from the editor
  const { codeString } = await req.json();

  if (!codeString) {
      return NextResponse.json({ error: "No code string provided" }, { status: 400 });
  }

  const parsed = parseCodeString(codeString);

  if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { provider, modelName, methodName, query } = parsed;

  // --- Handle different providers ---
  switch (provider) {
    case "Gemini":
      if (!GEMINI_API_KEY) {
           return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
      }
      if (!modelName) {
           return NextResponse.json({ error: "Model name is required." }, { status: 400 });
      }
      const ai = createGeminiClient(); // Create client specifically for Gemini

      try {
        let result;

        // --- Handle Gemini methods ---
        switch (methodName) {
          case "generateContent":
            // Assuming generateContent is the correct method name based on geminiClient.ts usage
            // and the query is the 'contents'
            result = await ai.models.generateContent({
              model: modelName, // Use the extracted modelName
              contents: [{ text: query as string }],  // Ensure correct ContentListUnion format
            });
            // The structure of the result might vary, access text safely
            const textResponse = (result as any)?.response?.text || (result as any)?.text;
            if (textResponse !== undefined) {
                 return NextResponse.json({ response: textResponse });
            } else {
                 console.warn("Unexpected Gemini generateContent response structure:", result);
                 return NextResponse.json({ error: "Failed to extract text response from Gemini API." }, { status: 500 });
            }


          // Add more Gemini methods here later (e.g., countTokens, embedContent)
          // case "countTokens":
          //   // ... handle countTokens API call
          //   break;

          default:
            return NextResponse.json({ error: `Gemini method "${methodName}" not supported` }, { status: 400 });
        }

      } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        // Attempt to extract a more specific error message if available
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: `Failed to call Gemini API: ${errorMessage}` }, { status: 500 });
      }

    // Add more providers here later (e.g., "OpenAI", "Claude")
    // case "OpenAI":
    //   // ... handle OpenAI API calls
    //   break;

    default:
      return NextResponse.json({ error: `Model provider "${provider}" not supported` }, { status: 400 });
  }
}

export async function GET() {
  try {
    // This GET handler still fetches Gemini models for the frontend to use in autocompletion
    const models = await fetchModelsAndMethods();
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}


