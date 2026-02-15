import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateResponse } from "./llm.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");

async function parseJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function serveStatic(req, res) {
  const route = req.url === "/" ? "/index.html" : req.url;
  const fullPath = path.join(publicDir, route);

  if (!fullPath.startsWith(publicDir)) {
    sendJson(res, 403, { error: "Forbidden" });
    return true;
  }

  try {
    const file = await fs.readFile(fullPath);
    const ext = path.extname(fullPath);
    const contentType = ext === ".html" ? "text/html" : "text/plain";
    res.writeHead(200, { "Content-Type": `${contentType}; charset=utf-8` });
    res.end(file);
    return true;
  } catch {
    return false;
  }
}

export function createServer() {
  return http.createServer(async (req, res) => {
    if (!req.url || !req.method) {
      return sendJson(res, 400, { error: "Bad Request" });
    }

    if (req.method === "GET" && req.url === "/health") {
      return sendJson(res, 200, { status: "ok" });
    }

    if (req.method === "POST" && req.url === "/chat") {
      try {
        const body = await parseJsonBody(req);
        const prompt = body?.prompt;

        if (typeof prompt !== "string" || !prompt.trim()) {
          return sendJson(res, 400, { error: "prompt is required" });
        }

        const answer = await generateResponse(prompt);
        return sendJson(res, 200, { answer });
      } catch (error) {
        return sendJson(res, 502, {
          error: "Failed to generate response",
          details: error instanceof Error ? error.message : String(error)
        });
      }
    }

    const served = await serveStatic(req, res);
    if (!served) {
      sendJson(res, 404, { error: "Not Found" });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, "0.0.0.0", () => {
    console.log(`AI server listening on http://0.0.0.0:${port}`);
  });
}
