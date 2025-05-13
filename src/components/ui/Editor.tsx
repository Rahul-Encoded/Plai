"use client";

import { useEffect, useRef, useState, useContext } from "react"; // Import useContext
import Editor, { type Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useTheme } from "next-themes";
import { ModelProviderContext } from "../Contexts/ModelProviderContext"; // Import Context
import { ModelProviders } from "@/lib/constants"; // Import supported providers

interface ModelInfo {
  name?: string;
  displayName?: string;
  supportedActions?: string[];
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  // Removed 'models' prop as component now fetches internally based on the user's provided code
}

// === Monaco Environment Setup ===
// This must be done BEFORE the editor component is mounted
// and tells Monaco where to find its worker scripts.
// It needs to be guarded to run only in the browser.
// Ensure your Next.js config (like next.config.js) copies these workers
// from node_modules/monaco-editor/esm/vs/base/worker/workerMain.js etc.
// to your public/monaco-workers directory.
if (typeof window !== "undefined") {
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
      let workerUrl = "editor.worker.js"; // Default editor worker

      if (label === "json") {
        workerUrl = "json.worker.js";
      } else if (label === "css" || label === "less" || label === "scss") {
        workerUrl = "css.worker.js";
      } else if (
        label === "html" ||
        label === "handlebars" ||
        label === "razor"
      ) {
        workerUrl = "html.worker.js";
      } else if (label === "typescript" || label === "javascript") {
        // Python mode might still benefit from or require the TS worker
        workerUrl = "ts.worker.js";
      }

      // Construct the URL relative to the public directory where workers are copied
      // Assuming workers are in public/monaco-workers/
      // Use window.location.origin for robustness
      return new URL(
        `/monaco-workers/${workerUrl}`,
        window.location.origin
      ).toString();
    },
  };
}
// === End Monaco Environment Setup ===

function CodeEditor({ value, onChange }: EditorProps) {
  const { resolvedTheme } = useTheme();
  const monacoThemeName = resolvedTheme === "dark" ? "vs-dark" : "vs-light";
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null); // Ref to store the monaco instance
  const completionProviderRef = useRef<monaco.IDisposable | null>(null); // Ref to store the disposable provider
  const [geminiModels, setGeminiModels] = useState<ModelInfo[]>([]); // State to hold fetched Gemini models

  // Consume the context to get the current model provider selected in Snippet
  const { modelProvider } = useContext(ModelProviderContext);

  // Store editor and monaco instances when the editor mounts
  const handleEditorDidMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
  };

  // Fetch models for supported providers (currently only Gemini)
  useEffect(() => {
    async function loadModels() {
      console.log("[Editor] Fetching models...");
      if (ModelProviders.includes("Gemini")) {
        try {
          const response = await fetch("/api/gemini");
          if (!response.ok) {
            const errorData = await response.json();
            console.error("[Editor] API Response Error:", errorData);
            throw new Error(
              errorData.error ||
                `Failed to fetch Gemini models, status: ${response.status}`
            );
          }

          const data: ModelInfo[] = await response.json();
          console.log("[Editor] Successfully fetched Gemini models:", data);
          setGeminiModels(data);
        } catch (error) {
          console.error("[Editor] Error fetching Gemini models:", error);
          setGeminiModels([]); // Clear models on error
        }
      }
      // Add fetching logic for other providers here later
    }

    loadModels();
  }, []); // Empty dependency array: fetch only once on mount

  // Register custom completion provider when models change or monaco is ready
  useEffect(() => {
    const monacoInstance = monacoRef.current;

    if (!monacoInstance) {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
        completionProviderRef.current = null;
      }
      console.log("[Editor] Monaco instance not ready, disposing provider.");
      return;
    }

    // Dispose any existing provider before registering a new one
    if (completionProviderRef.current) {
      console.log("[Editor] Disposing existing completion provider.");
      completionProviderRef.current.dispose();
      completionProviderRef.current = null;
    }

    console.log("[Editor] Registering new completion provider.");

    const provider = monacoInstance.languages.registerCompletionItemProvider(
      "python",
      {
        triggerCharacters: [".", "("],

        provideCompletionItems: (modelMonaco, position) => {
          const textUntilPosition = modelMonaco.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Determine the word at the cursor to calculate the replacement range
          const wordAtPosition = modelMonaco.getWordUntilPosition(position);
          // The range should cover the text from the start of the current "word"
          // up to the cursor position. This is the text we want to replace
          // *or* insert at if the word is empty (e.g. after typing a dot).
          const range = new monacoInstance.Range(
            position.lineNumber,
            wordAtPosition.startColumn,
            position.lineNumber,
            position.column
          );

          const trimmedText = textUntilPosition.trim();
          const lastDotIndex = trimmedText.lastIndexOf(".");
          const lastOpenParenIndex = trimmedText.lastIndexOf("(");

          console.log(
            `[Editor] Providing completions at line ${position.lineNumber}, col ${position.column}. Text: "${trimmedText}", lastDot: ${lastDotIndex}, lastParen: ${lastOpenParenIndex}`
          );

          // Case 1: Typing the Provider Name (no dot yet)
          if (lastDotIndex === -1) {
            console.log("[Editor] Context 1: Typing Provider.");
            const potentialProviderName = trimmedText;

            const providerSuggestions: monaco.languages.CompletionItem[] =
              ModelProviders.filter((p) =>
                p.toLowerCase().startsWith(potentialProviderName.toLowerCase())
              ).map((providerName) => ({
                label: providerName,
                kind: monacoInstance.languages.CompletionItemKind.Class,
                insertText: `${providerName}.`, // Insert name + dot
                detail: "AI Model Provider",
                range: range, // Replace the text being typed
                command: {
                  id: "editor.action.triggerSuggest",
                  title: "Trigger Suggest",
                }, // Trigger models suggestions after '.'
              }));
            console.log(
              `[Editor] Generated Provider suggestions: ${providerSuggestions.length}`
            );
            return { suggestions: providerSuggestions };
          }

          // Case 2: Typing Model Name (after the first dot, before method dot/paren)
          // This happens if the last dot is the *first* dot, AND the cursor is after it, OR
          // if the cursor is after the last dot AND that dot is NOT followed by an open parenthesis.
          // We need to correctly identify the provider name as the part before the first dot.

          const firstDotIndex = trimmedText.indexOf("."); // Find the actual first dot

          if (
            firstDotIndex > -1 &&
            (lastDotIndex === firstDotIndex ||
              (lastDotIndex > firstDotIndex &&
                lastOpenParenIndex < lastDotIndex))
          ) {
            // If lastDotIndex === firstDotIndex: "Provider." or "Provider.partial"
            // If lastDotIndex > firstDotIndex && lastOpenParenIndex < lastDotIndex: "Provider.Model.partial" where Model contains dots
            // This logic is still a bit fragile. Let's simplify the parsing again.

            // Simpler Parsing: Find the last significant dot.
            // A dot is significant if it's not part of a string or number (which our simple format avoids)
            // and it determines the "level" (provider.model.method).

            // Find the index of the dot that separates the Model from the potential Method.
            // This is the LAST dot *before* any open parenthesis.
            
            if (lastOpenParenIndex > lastDotIndex) {
              // If a '(' exists after the last dot, the last dot found isn't the method separator.
              // We are inside the arguments, no suggestions here.
              console.log("[Editor] Context: Inside Method Arguments.");
              return { suggestions: [] };
            }

            // If we are here, we are either typing the Provider, Model, or Method name.
            // The *lastDotIndex* is the separator between the current level and the previous.

            // Find the index of the dot that separates the Provider from the Model.
            // This is the FIRST dot in the string.
            const providerDotIndex = trimmedText.indexOf(".");

            // Determine the current level:
            // - No dot: Provider level
            // - One dot (lastDotIndex === firstDotIndex): Model level
            // - Two or more dots (lastDotIndex > firstDotIndex): Method level

            if (lastDotIndex === -1) {
              // Handled by Case 1 above
              // console.log("[Editor] Context 1: Typing Provider (via refined logic). Should not happen here.");
              return { suggestions: [] }; // Already handled
            }

            if (lastDotIndex === providerDotIndex) {
              // There is only ONE dot found in the text.
              // This implies we are at the Model level. E.g. "Gemini." or "Gemini.ge"
              console.log("[Editor] Context 2: Typing Model Name.");
              const provider = trimmedText.substring(0, providerDotIndex); // Text before the dot
              const potentialModel = trimmedText.substring(
                providerDotIndex + 1
              ); // Text after the dot

              console.log(
                `[Editor] Model suggestion context: { provider: "${provider}", potentialModel: "${potentialModel}" }`
              );

              if (provider === "Gemini") {
                console.log("[Editor] Looking for Gemini models.");
                const modelSuggestions: monaco.languages.CompletionItem[] =
                  geminiModels
                    .filter((model) =>
                      model.name
                        ?.toLowerCase()
                        .startsWith(potentialModel.toLowerCase())
                    )
                    .map((model) => ({
                      label: model.name || model.displayName || "Unknown Model",
                      kind: monacoInstance.languages.CompletionItemKind.Field,
                      // Replace the text from the start of the potential model name
                      // This range is from the character *after* the first dot to the cursor
                      range: new monacoInstance.Range(
                        position.lineNumber,
                        providerDotIndex + 2,
                        position.lineNumber,
                        position.column
                      ),
                      insertText: `${model.name}.`, // Insert model name + dot
                      detail: model.displayName || "Gemini Model",
                      documentation: `Model: ${model.name}`,
                      command: {
                        id: "editor.action.triggerSuggest",
                        title: "Trigger Suggest",
                      }, // Trigger methods after '.'
                    }));
                console.log(
                  `[Editor] Generated Gemini Model suggestions: ${modelSuggestions.length}`
                );
                return { suggestions: modelSuggestions };
              }
              return { suggestions: [] }; // Not Gemini provider
            } else {
              // lastDotIndex > providerDotIndex
              // There is more than one dot. The LAST dot separates Model and Method.
              // The FIRST dot separates Provider and Model.
              // Text before first dot = Provider
              // Text between first and last dot = Model Name (potentially contains dots)
              // Text after last dot = Potential Method Name

              console.log("[Editor] Context 3: Typing Method Name.");
              const provider = trimmedText.substring(0, providerDotIndex); // Before first dot
              const model = trimmedText.substring(
                providerDotIndex + 1,
                lastDotIndex
              ); // Between first and last dot
              const potentialMethod = trimmedText.substring(lastDotIndex + 1); // After last dot

              console.log(
                `[Editor] Method suggestion context: { provider: "${provider}", model: "${model}", potentialMethod: "${potentialMethod}" }`
              );

              if (provider === "Gemini") {
                console.log(
                  `[Editor] Looking for methods for Gemini model: "${model}" with preamble "${potentialMethod}"`
                );
                const modelInfo = geminiModels.find((m) => m.name === model);

                if (
                  modelInfo &&
                  modelInfo.supportedActions &&
                  modelInfo.supportedActions.length > 0
                ) {
                  console.log(
                    "[Editor] Found model and supported actions:",
                    modelInfo.supportedActions
                  );
                  const methodSuggestions: monaco.languages.CompletionItem[] =
                    modelInfo.supportedActions
                      .filter(
                        (action) =>
                          typeof action === "string" &&
                          action.length > 0 &&
                          action
                            .toLowerCase()
                            .startsWith(potentialMethod.toLowerCase())
                      )
                      .map((method) => ({
                        label: method,
                        kind: monacoInstance.languages.CompletionItemKind
                          .Method,
                        insertText: `${method}(`, // Insert method name + parenthesis
                        detail: `Gemini Method for ${model}`,
                        documentation: `Calls the ${method} method on model ${model}.`,
                        // Replace the text from the start of the potential method name
                        // This range is from the character *after* the last dot to the cursor
                        range: new monacoInstance.Range(
                          position.lineNumber,
                          lastDotIndex + 2,
                          position.lineNumber,
                          position.column
                        ),
                      }));
                  console.log(
                    `[Editor] Generated Method suggestions: ${methodSuggestions.length}`
                  );
                  return { suggestions: methodSuggestions };
                } else {
                  console.log(
                    "[Editor] Model not found, or no supported actions for this model."
                  );
                }
              }
              return { suggestions: [] }; // Return empty if not Gemini or no model/actions found
            }
          }

          // If none of the specific contexts (Provider, Model, Method) matched based on dots/parens
          console.log("[Editor] No specific completion context matched.");
          return { suggestions: [] };
        },
      }
    );

    // Cleanup function: Dispose the provider when the effect re-runs or component unmounts
    completionProviderRef.current = provider;

    return () => {
      if (completionProviderRef.current) {
        console.log("[Editor] Cleaning up completion provider.");
        completionProviderRef.current.dispose();
        completionProviderRef.current = null;
      }
    };
  }, [monacoRef.current, geminiModels, modelProvider]);

  return (
    <div className="h-[200px] border border-primary/35 rounded-md">
      <Editor
        height="100%"
        language="python" // Setting language helps with basic syntax highlighting
        theme={monacoThemeName}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          suggestOnTriggerCharacters: true,
          snippetSuggestions: "none",
          quickSuggestions: true,
          acceptSuggestionOnEnter: "on",
          acceptSuggestionOnCommitCharacter: true, // Accept on characters like '('
        }}
      />
    </div>
  );
}

export default CodeEditor;
