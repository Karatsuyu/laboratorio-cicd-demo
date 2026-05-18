from fastapi import FastAPI

app = FastAPI(
    title="Laboratorio CI/CD",
    description="API de ejemplo para el laboratorio de CI/CD",
    version="1.0.0",
)


@app.get("/health", tags=["health"])
def health() -> dict:
    """Healthcheck — usado por Docker y el pipeline de CI."""
    return {"status": "ok"}
