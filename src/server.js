import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { generateResponse, getRuntimeMode } from "./llm.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");
const MAX_BODY_SIZE_BYTES = 1024 * 1024; // 1MB

async function parseJsonBody(req) {
  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_SIZE_BYTES) {
      const error = new Error("Request body too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("Invalid JSON body");
    error.statusCode = 400;
    throw error;
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html";
  if (ext === ".css") return "text/css";
  if (ext === ".js") return "application/javascript";
  if (ext === ".json") return "application/json";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "text/plain";
}

async function serveStatic(req, res) {
  const pathname = new URL(req.url, "http://localhost").pathname;
  const route = pathname === "/" ? "/index.html" : pathname;
  const safePath = path.normalize(route).replace(/^([.][.][/\\])+/, "");
  const fullPath = path.join(publicDir, safePath);

  if (!fullPath.startsWith(publicDir)) {
    sendJson(res, 403, { error: "Forbidden" });
    return true;
  }

  try {
    const file = await fs.readFile(fullPath);
    res.writeHead(200, { "Content-Type": `${getContentType(fullPath)}; charset=utf-8` });
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
      return sendJson(res, 200, {
        status: "ok",
        mode: getRuntimeMode()
      });
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
        if (error?.statusCode === 400) {
          return sendJson(res, 400, { error: error.message });
        }

        if (error?.statusCode === 413) {
          return sendJson(res, 413, { error: error.message });
        }

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
