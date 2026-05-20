from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    """Esquema base para una tarea."""

    title: str
    description: str | None = None
    due_date: datetime | None = None


class TaskCreate(TaskBase):
    """DTO para crear una nueva tarea."""

    title: str = Field(..., min_length=1, max_length=200, description="Título de la tarea")
    description: Optional[str] = Field(None, max_length=500)


class TaskUpdate(BaseModel):
    """DTO para actualizar una tarea (todos los campos opcionales)."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    completed: Optional[bool] = None


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
