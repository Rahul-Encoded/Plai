'use client';
import Editor from '@monaco-editor/react';
import { useEffect } from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const autocompleteSnippet = `
# Example:
Google.GeminiPro.generateText("Explain quantum computing.")
`;

export default function CodeEditor({ value, onChange }: Props) {
    useEffect(() => {
        // Optional: Add custom autocomplete provider
    }, []);

    return (
        <div className="h-[400px] border rounded-md overflow-hidden">
            <Editor
                height="100%"
                language="python"
                theme="vs-dark"
                value={value || autocompleteSnippet}
                onChange={(value) => onChange(value || '')}
            />
        </div>
    );
}