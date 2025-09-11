import { useState } from "react";

export default function App() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  async function askGemini() {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ fontFamily: "Arial", padding: "2rem" }}>
      <h1>📚 StudyFlow</h1>
      <p>Ask Gemini anything about your AP subjects.</p>
      <textarea
        rows="4"
        cols="50"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your question here..."
      />
      <br />
      <button onClick={askGemini}>Ask Gemini</button>
      <pre>{response}</pre>
    </div>
  );
}
