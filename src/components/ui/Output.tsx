"use client";

interface OutputProps {
  output: string;
}

function Output({ output }: OutputProps) {
  return (
    <div className="border border-primary/35 p-4 rounded-md bg-secondary/10 text-sm whitespace-pre-wrap min-h-[80px]">
      {output || "Your output will appear here..."}
    </div>
  );
}

export default Output;
