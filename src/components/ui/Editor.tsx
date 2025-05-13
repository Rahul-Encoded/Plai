"use client";

import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

function CodeEditor({ value, onChange }: EditorProps) {
  const { resolvedTheme } = useTheme();

  const monacoThemeName = resolvedTheme === "dark" ? "vs-dark" : "vs-light";

  useEffect(() => {
    // Optional: Add custom autocomplete here later
  }, []);

  return (
    <div className="h-[200px] border border-primary/35 rounded-md overflow-hidden">
      <Editor
        height="100%"
        language="python"
        theme={monacoThemeName}
        value={value}
        onChange={(newValue) => onChange(newValue || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}

export default CodeEditor;
