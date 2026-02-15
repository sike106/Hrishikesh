from fastapi.testclient import TestClient

from ai_server.main import app


client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json() == {'status': 'ok'}


def test_chat_endpoint_returns_fallback_without_api_key(monkeypatch) -> None:
    monkeypatch.delenv('OPENAI_API_KEY', raising=False)
    response = client.post('/chat', json={'prompt': 'Hello'})

    assert response.status_code == 200
    data = response.json()
    assert 'answer' in data
    assert 'local fallback' in data['answer']
