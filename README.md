# AI App + AI Server

This project now provides a **Node.js AI server** and a **browser AI app** that run with npm.

## What is included

- `src/server.js`: Express server with:
  - `GET /health`
  - `POST /chat`
  - static hosting for the app in `public/`
- `src/llm.js`: AI response logic with:
  - local fallback mode (no API key needed)
  - OpenAI Chat Completions integration when `OPENAI_API_KEY` is set
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

## Configure OpenAI (optional)

By default, `/chat` returns a local fallback response.

To use live model responses:

```bash
export OPENAI_API_KEY=your_key_here
export OPENAI_MODEL=gpt-4o-mini
npm run dev
```

## Test

```bash
npm test
```

## API quick check

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/chat -H 'content-type: application/json' -d '{"prompt":"Hello"}'
```
