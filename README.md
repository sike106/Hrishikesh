# AI App + AI Server

This repository now contains:

- **`ai_server`**: a FastAPI server with `/health` and `/chat` endpoints.
- **`ai_app`**: a Streamlit chat UI that calls the server.

## 1) Install dependencies

```bash
pip install -r requirements.txt
```

## 2) Run the AI server

```bash
uvicorn ai_server.main:app --reload --host 0.0.0.0 --port 8000
```

The server uses a local fallback response by default.

To use OpenAI responses, set your API key:

```bash
export OPENAI_API_KEY=your_key_here
```

## 3) Run the AI app

In a second terminal:

```bash
streamlit run ai_app/app.py
```

Optional server override:

```bash
export AI_SERVER_URL=http://localhost:8000
```

## 4) Run tests

```bash
pytest -q
```
