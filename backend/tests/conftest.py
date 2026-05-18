"""Fixtures compartidas para todos los tests del backend."""
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    """Cliente HTTP de prueba — no necesita servidor levantado."""
    with TestClient(app) as c:
        yield c
