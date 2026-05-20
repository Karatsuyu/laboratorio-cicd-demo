from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    """DTO para crear una nueva tarea."""

    title: str = Field(..., min_length=1, max_length=200, description="Título de la tarea")
    description: Optional[str] = Field(None, max_length=500)


class TaskUpdate(BaseModel):
    """DTO para actualizar una tarea (todos los campos opcionales)."""

    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    completed: Optional[bool] = None


class TaskRead(BaseModel):
    """DTO de salida — lo que se serializa al cliente."""

    id: int
    title: str
    description: Optional[str]
    completed: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class TaskCount(BaseModel):
    """Respuesta del endpoint /tasks/count."""

    total: int
    completed: int
    pending: int
