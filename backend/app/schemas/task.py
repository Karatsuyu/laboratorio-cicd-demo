from datetime import datetime

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    """Esquema base para una tarea."""

    title: str
    description: str | None = None
    due_date: datetime | None = None


class TaskCreate(TaskBase):
    """DTO para crear una nueva tarea."""

    title: str = Field(..., min_length=1, max_length=200, description="Título de la tarea")
    description: str | None = Field(None, max_length=500)


class TaskUpdate(BaseModel):
    """DTO para actualizar una tarea (todos los campos opcionales)."""

    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=500)
    completed: bool | None = None


class TaskRead(TaskBase):
    """Esquema para la lectura de una tarea."""

    id: int
    completed: bool
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        """Configuración del esquema."""
        from_attributes = True


class TaskCount(BaseModel):
    """Respuesta del endpoint /tasks/count."""

    total: int
    completed: int
    pending: int
