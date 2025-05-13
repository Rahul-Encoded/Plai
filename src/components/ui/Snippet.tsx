"use client";

import { useState, useEffect } from "react"; // Import useEffect
import CodeEditor from "./Editor";
import { Button } from "./button";
import Output from "./Output";
import { ModelProviderContext } from "../Contexts/ModelProviderContext";
import { ModelProviders } from "@/lib/constants";

function Snippet() {
  const [modelProvider, setModelProvider] = useState<string>(
    ModelProviders[0] || "Gemini"
  ); // Default to the first provider
  // Initial code based on the selected provider
  const [code, setCode] = useState<string>(modelProvider);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update initial code when the model provider changes
  useEffect(() => {
    setCode(`${modelProvider}`);
  }, [modelProvider]);

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput("Editor is empty.");
      return;
    }

    setIsLoading(true);
    setOutput("Running..."); // Provide immediate feedback

    try {
      // Send the entire code string to the API
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set headers correctly
        },
        body: JSON.stringify({ codeString: code }), // Send code as codeString
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle HTTP errors (e.g., 400, 500)
        const errorMsg = data.error || `HTTP error! status: ${res.status}`;
        setOutput(`Error: ${errorMsg}`);
        console.error("API Error:", data);
      } else {
        // Handle successful API response (response or specific error from backend)
        setOutput(data.response || data.error || "No output received.");
      }
    } catch (error) {
      // Handle network errors or exceptions during fetch
      console.error("Fetch Error:", error);
      setOutput(
        `Request failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelProviderName = e.target.value;
    setModelProvider(modelProviderName);
    // The useEffect hook will update the code state based on the new provider
  };

  return (
    <div className="my-6 space-y-2 border p-4 rounded-md bg-secondary/15 backdrop-blur-3xl hover:scale-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200 ease-in-out">
      <label
        htmlFor="modelProviderSelect"
        className="block text-sm font-medium text-foreground/80"
      >
        Select Provider:
      </label>
      <select
        id="modelProviderSelect"
        className="w-full p-2 border rounded-md bg-secondary text-foreground border-primary/35 focus:ring-primary focus:border-primary"
        value={modelProvider}
        onChange={handleModelChange}
        disabled={isLoading} // Disable dropdown while running
      >
        {ModelProviders.map((provider) => (
          <option key={provider} value={provider}>
            {provider}
          </option>
        ))}
      </select>
      {/* Provide the context value to the editor */}
      <ModelProviderContext.Provider
        value={{ modelProvider, setModelProvider }}
      >
        <CodeEditor value={code} onChange={setCode}></CodeEditor>
      </ModelProviderContext.Provider>
      <div className="flex items-center gap-2">
        <Button onClick={handleRun} disabled={isLoading}>
          {isLoading ? "Running..." : "Run"}
        </Button>
      </div>
      <Output output={output}></Output>
    </div>
  );
}

export default Snippet;
