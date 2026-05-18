"""Tests de la Etapa 1 — solo el endpoint /health."""


def test_health_ok(client):
    """GET /health debe retornar 200 y status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_method_not_allowed(client):
    """POST /health debe retornar 405 Method Not Allowed."""
    response = client.post("/health")
    assert response.status_code == 405
