from __future__ import annotations

import os

import requests
import streamlit as st

SERVER_URL = os.getenv("AI_SERVER_URL", "http://localhost:8000")

st.set_page_config(page_title="AI App", page_icon="🤖")
st.title("🤖 AI App")
st.caption("A simple chat UI backed by the local AI server.")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

prompt = st.chat_input("Ask anything...")

if prompt:
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            response = requests.post(
                f"{SERVER_URL}/chat",
                json={"prompt": prompt},
                timeout=60,
            )
            response.raise_for_status()
            answer = response.json()["answer"]
        st.markdown(answer)

    st.session_state.messages.append({"role": "assistant", "content": answer})
