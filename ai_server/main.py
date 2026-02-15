from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel, Field

from ai_server.llm import generate_response

app = FastAPI(title="AI Server", version="1.0.0")


class ChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt")


class ChatResponse(BaseModel):
    answer: str


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    answer = generate_response(request.prompt)
    return ChatResponse(answer=answer)
