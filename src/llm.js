const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

function localFallbackResponse(prompt) {
  const cleaned = String(prompt || "").trim();
  if (!cleaned) {
    return "Please send a message so I can help.";
  }
  return `(local fallback) I received: '${cleaned}'.\nSet OPENAI_API_KEY to enable live model responses.`;
}

async function openAIChatCompletion(prompt, apiKey) {
  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a concise and helpful AI assistant." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  };

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${details}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return (content || "I could not generate a response.").trim();
}

export async function generateResponse(prompt) {
  const apiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return localFallbackResponse(prompt);
  }
  return openAIChatCompletion(prompt, apiKey);
}
