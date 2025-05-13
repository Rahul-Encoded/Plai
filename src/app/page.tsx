"use client";
import Sidebar from "@/components/ui/Sidebar";
import Snippet from "@/components/ui/Snippet";
import { useState } from "react";

interface SnippetData {
  id: number;
  model: string; 
  method: string; 
}

export default function Home() {
  const [snippets, setSnippets] = useState<SnippetData[]>([]);

  // Function to handle the 'Insert Cell' action from the sidebar
  const handleInsertCell = () => {
    const id = Date.now(); // Simple unique ID
    // Add a new snippet with default placeholder values when the button is clicked
    const newSnippet: SnippetData = {
      id,
      model: "Default Model", // Placeholder
      method: "defaultMethod()", // Placeholder
    };
    setSnippets((prevSnippets) => [...prevSnippets, newSnippet]);
  };

  return (
    <main className="py-8">
      {/*container to center the content */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 border-r border-primary/50 pr-4">
            {/* Use the new Sidebar component and pass the handleInsertCell function */}
            <Sidebar onInsertCell={handleInsertCell} />
          </div>
          <div className="lg:col-span-9">
            {/* Still map and render Snippet components based on the state */}
            {snippets.map((s) => (
              <Snippet key={s.id} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
