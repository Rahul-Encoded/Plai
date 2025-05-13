"use client";

import { fetchModelsAndMethods, ModelInfo } from "@/lib/geminiClient";
import React, { useEffect, useState } from "react";
import { Button } from "./button";

interface SidebarProps {
  onSelect: (model: string, method: string) => void;
}

function Sidebar({ onSelect }: SidebarProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadModels() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/gemini");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data: ModelInfo[] = await response.json();

        setModels(data);

        if (data.length > 0) {
          setSelectedModel(data[0].name ?? "");
          setSelectedMethod(
            data[0].supportedActions && data[0].supportedActions.length > 0
              ? data[0].supportedActions[0]
              : ""
          );
        }
      } catch (err) {
        console.error("Failed to load models:", err);
        setError("Failed to load models. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    loadModels();
  }, []);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const modelName = e.target.value;
    const model = models.find((m) => m.name === modelName);
    setSelectedModel(modelName);
    if (
      model &&
      model.supportedActions?.length &&
      model.supportedActions.length > 0
    ) {
      setSelectedMethod(model.supportedActions[0]);
    }
  };

  const handleRun = () => {
    onSelect(selectedModel, selectedMethod);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Select Model</h2>
      <select
        className="w-full p-2 border rounded"
        value={selectedModel}
        onChange={handleModelChange}
        disabled={isLoading || error !== null}
      >
        {models.map((model) => (
          <option key={model.name} value={model.name} className="bg-secondary">
            {model.displayName}
          </option>
        ))}
      </select>

      <h2 className="text-lg font-semibold">Select Method</h2>
      <select
        className="w-full p-2 border rounded"
        value={selectedMethod}
        onChange={(e) => setSelectedMethod(e.target.value)}
        disabled={isLoading || error !== null}
      >
        {models
          .find((m) => m.name === selectedModel)
          ?.supportedActions?.map((method) => (
            <option key={method} value={method} className="bg-secondary">
              {method}
            </option>
          ))}
      </select>
      <Button onClick={handleRun}>Insert a cell</Button>
    </div>
  );
}

export default Sidebar;
