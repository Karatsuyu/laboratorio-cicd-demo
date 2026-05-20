from fastapi import FastAPI

from app.database import Base, engine
from app.views.task_view import router as tasks_router

# Crear tablas al arrancar (en producción se usaría Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Laboratorio CI/CD",
    description="API CRUD de tareas — Etapa 2 y 3",
    version="2.0.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Endpoint de health check."""
    return {"status": "ok"}
app.include_router(tasks_router)
