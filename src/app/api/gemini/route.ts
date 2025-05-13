import { NextRequest, NextResponse } from "next/server";
// Import the specific helper functions from your geminiClient
import {
  fetchModelsAndMethods, // Used by GET
  callGenerateContent,
  callCountTokens,
  callEmbedContent,
  callGenerateImages, // Import the new helper
} from "@/lib/geminiClient";

// Helper function to parse the code string (keep as is)
function parseCodeString(code: string): {
  provider?: string;
  modelName?: string;
  methodName?: string;
  query?: string; // Note: query will be a string here
  error?: string;
} {
  // Expected format: Provider.ModelName.Method("Query String") or Provider.ModelName.Method('Query String')
  // Regex allows hyphens and dots in the model name part ([\w.-]+)
  // Regex Explanation:
  // ^\s*           - Start of string, optional whitespace
  // (\w+)          - Capture Group 1: Provider name (one or more word chars - letters, digits, _)
  // \.             - Literal dot
  // ([\w.-]+)      - Capture Group 2: Model name (one or more word chars, dots, or hyphens) - FIX HERE
  // \.             - Literal dot
  // (\w+)          - Capture Group 3: Method name (one or more word chars) - Assumes method names don't have dots/hyphens before the paren
  // \(             - Literal opening parenthesis
  // \s*            - Optional whitespace
  // (["'])        - Capture Group 4: The quote character (either " or ')
  // (.*?)          - Capture Group 5: The query content (any characters, non-greedily)
  // \4             - Backreference to Capture Group 4 (matches the closing quote)
  // \s*            - Optional whitespace
  // $              - End of string
  const regex = /^\s*(\w+)\.([\w.-]+)\.(\w+)\(\s*(["'])(.*?)\4\s*\)\s*$/;
  const match = code.match(regex);

  if (match) {
    const [, provider, modelName, methodName, , query] = match;

    if (!provider || !modelName || !methodName || query === undefined) {
      return { error: "Parsing resulted in missing parts." };
    }
    return { provider, modelName, methodName, query };
  } else {
    return {
      error:
        'Invalid code format. Expected Provider.ModelName.Method("Query String")',
    };
  }
}

export async function POST(req: NextRequest) {
  const { codeString } = await req.json();

  if (!codeString) {
    return NextResponse.json(
      { error: "No code string provided" },
      { status: 400 }
    );
  }

  const parsed = parseCodeString(codeString);

  if (parsed.error) {
    console.error("Code parsing error:", parsed.error);
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { provider, modelName, methodName, query } = parsed;

  // Basic validation for required parts after parsing
  if (!provider || !modelName || !methodName || query === undefined) {
    console.error("Parsed code missing required parts:", {
      provider,
      modelName,
      methodName,
      query,
    });
    return NextResponse.json(
      { error: "Internal parsing error: Required parts missing." },
      { status: 500 }
    );
  }

  // --- Handle different providers ---
  switch (provider) {
    case "Gemini":
      // You could add a check here to see if the modelName is valid for Gemini
      // based on the fetched models, but relying on the API call to fail is also an option.

      try {
        let responseData;

        // --- Route to the specific Gemini method helper ---
        switch (methodName) {
          case "generateContent":
            responseData = await callGenerateContent(modelName, query);
            // The response from the helper is already the text string
            return NextResponse.json({ response: responseData }); // Wrap in 'response' key for consistency

          case "countTokens":
            responseData = await callCountTokens(modelName, query);
            // The response from the helper is the token count (number)
            return NextResponse.json({
              response: `Token count: ${responseData}`,
            }); // Format as a string

          case "embedContent":
            responseData = await callEmbedContent(modelName, query);
            // The response from the helper is the embedding array (number[])
            // Stringify the array for displaying in the text output
            return NextResponse.json({
              response: `Embedding: [${responseData
                .slice(0, 5)
                .join(", ")}... (${responseData.length} values)]`,
            }); // Show first few + count

          case "generateImages":
            // Note: This method requires an Imagen model like 'imagen-3.0-generate-002'
            responseData = await callGenerateImages(modelName, query);
            // The response from the helper is the Base64 image string
            // In a text output, displaying base64 isn't great.
            // You might return it as a specific data type for a different frontend component.
            // For now, indicate success and perhaps return a truncated string.
            // return NextResponse.json({ response: `Image generated (Base64): ${responseData.substring(0, 50)}...` });
            // OR, if you want to try displaying it as an image in the frontend Output (requires Output component changes):
            // return NextResponse.json({ imageBase64: responseData, type: 'image/png' }); // Or whatever type Imagen returns

            // Let's just confirm success for now in the text output:
            return NextResponse.json({
              response: `Image generated successfully for model "${modelName}". (Base64 output omitted)`,
            });

          // Add more Gemini methods here later
          // case "someOtherMethod":
          //   // Call another specific helper:
          //   // responseData = await callSomeOtherMethod(modelName, query);
          //   // return NextResponse.json({ response: formatOtherResponse(responseData) });

          default:
            console.warn(
              `Gemini method "${methodName}" not supported in backend.`
            );
            return NextResponse.json(
              { error: `Gemini method "${methodName}" not supported` },
              { status: 400 }
            );
        }
      } catch (error) {
        // Catch any errors thrown by the helper functions or API calls
        console.error(`Error calling Gemini method "${methodName}":`, error);
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const hasResponse =
          typeof error === "object" &&
          error !== null &&
          "response" in error &&
          typeof (error as any).response === "object" &&
          (error as any).response !== null &&
          "data" in (error as any).response;
        const apiErrorDetails = hasResponse
          ? ` Details: ${JSON.stringify(
              (error as { response: { data: unknown } }).response.data
            )}`
          : "";
        return NextResponse.json(
          {
            error: `Failed to call Gemini API method "${methodName}": ${errorMessage}${apiErrorDetails}`,
          },
          { status: 500 }
        );
      }

    // Add more providers here later (e.g., "OpenAI", "Claude")
    // case "OpenAI":
    //   // ... handle OpenAI API calls - requires a separate client and different method calls
    //   // e.g., openai.chat.completions.create({ model: modelName, messages: [{ role: "user", content: query }] });
    //   // You would create similar helper functions like callOpenAIChat, callOpenAIEmbedding etc.
    //   break;

    default:
      console.warn(`Model provider "${provider}" not supported in backend.`);
      return NextResponse.json(
        { error: `Model provider "${provider}" not supported` },
        { status: 400 }
      );
  }
}

// Keep the GET function as is for fetching models for frontend completion
export async function GET() {
  console.log("Received GET request for models.");
  try {
    const models = await fetchModelsAndMethods();
    console.log(`Fetched ${models.length} models successfully.`);
    return NextResponse.json(models);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
