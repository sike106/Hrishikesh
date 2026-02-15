import test from "node:test";
import assert from "node:assert/strict";

import { createServer } from "../src/server.js";

async function withServer(run) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();

  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

test("GET /health returns ok", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
  });
});

test("POST /chat returns fallback without OPENAI_API_KEY", async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Hello" })
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.match(data.answer, /local fallback/i);
  });

  if (previous !== undefined) process.env.OPENAI_API_KEY = previous;
});

test("POST /chat rejects empty prompt", async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "" })
    });

    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: "prompt is required" });
  });
});
