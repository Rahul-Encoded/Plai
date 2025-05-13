import { useState } from "react";
import CodeEditor from "./Editor";
import { Button } from "./button";
import Output from "./Output";


interface SnippetProps{
	model: string;
	method: string
};

function Snippet({model, method}: SnippetProps) {
	const [code, setCode] = useState("");
	const [output, setOutput] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleRun = async ()=> {
		if (!code.trim()) return;

		setIsLoading(true);
		const res = await fetch("/api/gemini", {
			method: "POST",
			body: JSON.stringify({model, method, query:code})
		});

		const data = await res.json();
		setOutput(data.response || data.error || "No output");
		setIsLoading(false);
	}


	return (
		<div className="my-6 space-y-2 border p-4 rounded-md bg-secondary/15 backdrop-blur-3xl hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
			<CodeEditor value={code} onChange={setCode}></CodeEditor>
			<div className="flex items-center gap-2">
				<Button onClick={handleRun} disabled={isLoading}>
					{isLoading ? "Running..." : "Run"}
				</Button>
			</div>
			<Output output={output}></Output>
		</div>
	);
};

export default Snippet;