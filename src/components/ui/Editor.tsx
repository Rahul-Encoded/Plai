// Editor.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react"; // Import Monaco type only
import * as monaco from "monaco-editor"; // Keep this import for monaco types and objects
import { useTheme } from "next-themes";

interface ModelInfo {
  name?: string;
  displayName?: string;
  supportedActions?: string[];
}

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  // Removed 'models' prop as component now fetches internally based on the user's provided code
  // models: ModelInfo[];
}

// === Monaco Environment Setup ===
// This must be done BEFORE the editor component is mounted
// and tells Monaco where to find its worker scripts.
// It needs to be guarded to run only in the browser.
if (typeof window !== 'undefined') {
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorkerUrl: function (_moduleId: string, label: string) {
      let workerUrl = './editor.worker.js'; // Default editor worker

      if (label === 'json') {
        workerUrl = './json.worker.js';
      } else if (label === 'css' || label === 'less' || label === 'scss') {
        workerUrl = './css.worker.js';
      } else if (label === 'html' || label === 'handlebars' || label === 'razor') {
        workerUrl = './html.worker.js';
      } else if (label === 'typescript' || label === 'javascript') {
        // Python mode might still benefit from or require the TS worker
        workerUrl = './ts.worker.js';
      }

      // Construct the URL relative to the public directory where workers are copied
      // Assuming workers are in public/monaco-workers/
      return new URL(`/monaco-workers/${workerUrl}`, window.location.origin).toString();
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
  const [models, setModels] = useState<ModelInfo[]>([]); // State to hold fetched models

  // Store editor and monaco instances when the editor mounts
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monacoInstance: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
  };

  // Fetch models and methods from API
  useEffect(() => {
    async function loadModels() {
      try {
        const response = await fetch("/api/gemini");
        if (!response.ok) {
            const errorData = await response.json();
             throw new Error(errorData.error || `Failed to fetch models, status: ${response.status}`);
        }

        const data: ModelInfo[] = await response.json();
        setModels(data);
      } catch (error) {
        console.error("Error fetching models:", error);
        // Optionally set an error state to display in the UI
      }
    }

    loadModels();
  }, []); // Empty dependency array: fetch only once on mount

  // Register custom completion provider when models change or monaco is ready
  useEffect(() => {
    const monacoInstance = monacoRef.current; // Get the monaco instance from ref

    // Ensure we have models and the monaco instance
    if (!models.length || !monacoInstance) {
        // Dispose existing provider if models become empty or monaco isn't ready
        if (completionProviderRef.current) {
            completionProviderRef.current.dispose();
            completionProviderRef.current = null;
        }
        return;
    }

    // Dispose any existing provider before registering a new one
    if (completionProviderRef.current) {
      completionProviderRef.current.dispose();
      completionProviderRef.current = null;
    }

    // Extract unique method names from all supported actions across all models
    const uniqueMethods = Array.from(
        new Set(
            models.flatMap(model => model.supportedActions || []).filter(action => typeof action === 'string' && action.length > 0)
        )
    ).sort(); // Sort alphabetically for better presentation

    // --- Autocompletion Logic ---
    // This implementation focuses on suggesting methods when typing within a potential API call.
    // It's simplified compared to nested `Gemini.model.method` completion,
    // which is more complex and error-prone with simple text matching.
    // This will suggest method names globally when typing (e.g., typing "generateC" suggests "generateContent").

    const provider = monacoInstance.languages.registerCompletionItemProvider("python", {
      // Removed triggerCharacters for simpler global suggestion on typing
      // triggerCharacters: [".", '"', "'"],

      provideCompletionItems: (modelMonaco, position) => {
        // Get the word before the cursor
        const word = modelMonaco.getWordUntilPosition(position);
        const range = new monacoInstance.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);

        // Provide suggestions for unique methods
        const suggestions: monaco.languages.CompletionItem[] = uniqueMethods.map(method => ({
          label: method, // The text displayed in the suggestion list
          kind: monacoInstance.languages.CompletionItemKind.Method, // Icon/type displayed next to suggestion
          insertText: `${method}(`, // Text inserted: method name followed by opening parenthesis
          detail: "Gemini API Method", // Small text next to label
          documentation: `Calls the ${method} method.`, // Optional documentation
          range: range, // The range to replace (the word being typed)
          command: { // Optional: Command to move cursor inside the parenthesis
              id: 'editor.action.triggerSuggest', // Re-trigger suggest after inserting '('
              title: 'Trigger Suggest'
          },
        }));

        // You could add logic here to suggest 'Gemini' or model names if needed,
        // but the simple global method suggestion is less complex and likely sufficient
        // for getting started.
        // Example: To suggest 'Gemini' when user types 'G':
        // if ('Gemini'.startsWith(word.text)) {
        //    suggestions.push({
        //        label: 'Gemini',
        //        kind: monacoInstance.languages.CompletionItemKind.Keyword, // Or Namespace
        //        insertText: 'Gemini',
        //        range: range,
        //    });
        // }


        return { suggestions: suggestions };
      },
    });

    // Store the disposable
    completionProviderRef.current = provider;

    // Cleanup function: Dispose the provider when the effect re-runs or component unmounts
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose();
        completionProviderRef.current = null;
      }
    };
  }, [models]); // Re-run this effect if the 'models' prop changes or is initially loaded

  return (
    <div className="h-[200px] border border-primary/35 rounded-md overflow-hidden">
      <Editor
        height="100%"
        language="python" // Language where autocompletion applies
        theme={monacoThemeName}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        onMount={handleEditorDidMount} // Capture editor and monaco instances
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          // suggestOnTriggerCharacters: true, // Keep default or remove, not needed with simple provider
        }}
      />
    </div>
  );
}

export default CodeEditor;