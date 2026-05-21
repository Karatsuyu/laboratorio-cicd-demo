"""Tests de Etapa 2 — solo health (cobertura insuficiente ~56%)."""


def test_health_ok(client):
    """GET /health retorna 200."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
