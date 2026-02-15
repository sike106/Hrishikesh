# AI App + AI Server

This project provides a **Node.js AI server** and a **browser AI app** that run with npm.

## What is included

- `src/server.js`: HTTP server with:
  - `GET /health`
  - `POST /chat`
  - static hosting for the app in `public/`
  - JSON validation and request-size protection
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

1. Create a `.env` file from the template:

```bash
cp .env.example .env
```

2. Add your API key in `.env`:

```bash
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

3. Export variables and run the app:

```bash
set -a; source .env; set +a
npm run dev
```

> Never commit real API keys. `.env` is gitignored in this repo.

## Test

```bash
npm test
```

## API quick check

```bash
curl -s http://localhost:3000/health
curl -s http://localhost:3000/chat -H 'content-type: application/json' -d '{"prompt":"Hello"}'
```
