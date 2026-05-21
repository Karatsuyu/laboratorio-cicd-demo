"""Tests del endpoint /health — Etapa 3."""


def test_health_ok(client):
    """GET /health retorna 200 y status ok."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_post_not_allowed(client):
    """POST /health retorna 405."""
    response = client.post("/health")
    assert response.status_code == 405
