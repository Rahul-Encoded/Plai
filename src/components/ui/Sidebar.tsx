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

  useEffect(() => {
    async function loadModels() {
      const data = await fetchModelsAndMethods();
      setModels(data);

      if (data.length > 0) {
        setSelectedModel(data[0].name ?? "");
        setSelectedMethod(
          data[0].supportedActions && data[0].supportedActions.length > 0
            ? data[0].supportedActions[0]
            : ""
        );
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
      >
        {models.map((model) => (
          <option key={model.name} value={model.name}>
            {model.displayName}
          </option>
        ))}
      </select>

      <h2 className="text-lg font-semibold">Select Method</h2>
      <select
        className="w-full p-2 border rounded"
        value={selectedMethod}
        onChange={(e) => setSelectedMethod(e.target.value)}
      >
        {models
          .find((m) => m.name === selectedModel)
          ?.supportedActions?.map((method) => (
            <option key={method} value={method}>
              {method}
            </option>
          ))}
      </select>
			<Button onClick={handleRun}>Run</Button>
    </div>
  );
}

export default Sidebar;
