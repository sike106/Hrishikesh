# AI App + AI Server

This project provides a **Node.js AI server** and a **browser AI app** that run with npm.

## What is included

- `src/server.js`: HTTP server with:
  - `GET /health`
  - `POST /chat`
  - static hosting for the app in `public/`
  - JSON validation and request-size protection
- `src/llm.js`: AI response logic with:
  - **Ollama integration** (`/api/generate`)
  - local fallback mode if Ollama is unavailable
- `public/index.html`: chat UI for interacting with the server
- `test/server.test.js`: endpoint tests using Node test runner

## Install

```bash
npm install
```

## Run locally

```bash
npm run dev
```

The server starts on `http://localhost:3000`.

## Configure Ollama (recommended)

1. Install and run Ollama.
2. Pull a model, for example:

```bash
ollama pull llama3.2
```

3. Create a `.env` file from the template:

```bash
cp .env.example .env
```

4. Export variables and start:

```bash
set -a; source .env; set +a
npm run dev
```

If Ollama is not reachable, the app returns local fallback responses so the UI still works.

## Environment variables

- `AI_BACKEND=ollama` (default) or `AI_BACKEND=fallback`
- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=llama3.2`

## Test

```bash
npm test
```

## API quick check

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/chat -H 'content-type: application/json' -d '{"prompt":"Hello"}'
```
