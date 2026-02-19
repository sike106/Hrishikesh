const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";

function localFallbackResponse(prompt) {
  const cleaned = String(prompt || "").trim();
  if (!cleaned) {
    return "Please send a message so I can help.";
  }
  return `(local fallback) I received: '${cleaned}'.\nRun Ollama and set AI_BACKEND=ollama for live model responses.`;
}

function getBackend() {
  return (process.env.AI_BACKEND || "ollama").trim().toLowerCase();
}

async function ollamaGenerate(prompt) {
  const baseUrl = (process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_BASE_URL).replace(/\/$/, "");
  const model = (process.env.OLLAMA_MODEL || "llama3.2").trim();

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      system: "You are a concise and helpful AI assistant.",
      stream: false
    })
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  const content = data?.response;
  return (content || "I could not generate a response.").trim();
}

export function getRuntimeMode() {
  return getBackend() === "ollama" ? "ollama" : "fallback";
}

export async function generateResponse(prompt) {
  if (getBackend() !== "ollama") {
    return localFallbackResponse(prompt);
  }

  try {
    return await ollamaGenerate(prompt);
  } catch {
    return localFallbackResponse(prompt);
  }
}
