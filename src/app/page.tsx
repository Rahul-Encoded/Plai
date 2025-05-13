"use client";

import Sidebar from "@/components/ui/Sidebar";
import Snippet from "@/components/ui/Snippet";
import Image from "next/image";
import { useState } from "react";

interface SnippetData {
  id: number;
  model: string;
  method: string;
}

export default function Home() {
  const [snippets, setSnippets] = useState<SnippetData[]>([]);
  const [currentModel, setCurrentModel] = useState("");
  const [currentMethod, setCurrentMethod] = useState("");

  const addSnippet = () => {
    if (!currentModel || !currentMethod) return;
    const id = Date.now();
    setSnippets([
      ...snippets,
      { id, model: currentModel, method: currentMethod },
    ]);
  };

  const handleModelMethodSelect = (model: string, method: string) => {
    setCurrentModel(model);
    setCurrentMethod(method);
    addSnippet();
  };

  return (
    <main className="py-8">
      {/*container to center the content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 border-r border-primary/50 pr-4">
            <Sidebar onSelect={handleModelMethodSelect}></Sidebar>
          </div>
          <div className="lg:col-span-9">
            {snippets.map((s) => (
              <Snippet key={s.id} model={s.model} method={s.method} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
