from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from app.database import Base


class Task(Base):
    """Modelo ORM de la tabla tasks."""

    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def mark_completed(self) -> None:
        """Marca la tarea como completada."""
        self.completed = True

    def toggle(self) -> None:
        """Alterna el estado completado."""
        self.completed = not self.completed
