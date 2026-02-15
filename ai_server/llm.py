from __future__ import annotations

import json
import os
from dataclasses import dataclass
from urllib import request


@dataclass
class LLMConfig:
    model: str = "gpt-4o-mini"
    system_prompt: str = "You are a concise and helpful AI assistant."


def _local_fallback_response(user_prompt: str) -> str:
    cleaned = user_prompt.strip()
    if not cleaned:
        return "Please send a message so I can help."

    return (
        "(local fallback) I received: "
        f"'{cleaned}'.\n"
        "Set OPENAI_API_KEY to enable live model responses."
    )


def _openai_chat_completion(prompt: str, cfg: LLMConfig, api_key: str) -> str:
    payload = {
        "model": cfg.model,
        "messages": [
            {"role": "system", "content": cfg.system_prompt},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
    }

    req = request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=30) as response:
        body = json.loads(response.read().decode("utf-8"))

    content = body["choices"][0]["message"]["content"]
    return (content or "").strip() or "I could not generate a response."


def generate_response(user_prompt: str, config: LLMConfig | None = None) -> str:
    cfg = config or LLMConfig()
    api_key = os.getenv("OPENAI_API_KEY", "").strip()

    if not api_key:
        return _local_fallback_response(user_prompt)

    return _openai_chat_completion(user_prompt, cfg, api_key)
