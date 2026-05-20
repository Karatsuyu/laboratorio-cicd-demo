"""View de tareas — Router FastAPI que traduce HTTP ↔ controlador."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers import task_controller as ctrl
from app.database import get_db
from app.schemas.task import TaskCount, TaskCreate, TaskRead, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/count", response_model=TaskCount)
def count_tasks(
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
) -> TaskCount:
    """Retorna el conteo total, completadas y pendientes."""
    return ctrl.count_tasks(db, completed)


@router.get("/", response_model=list[TaskRead])
def list_tasks(
    completed: Optional[bool] = None,
    db: Session = Depends(get_db),
) -> list:
    """Lista todas las tareas con filtro opcional."""
    return ctrl.get_tasks(db, completed)


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, db: Session = Depends(get_db)) -> TaskRead:
    """Obtiene una tarea por ID."""
    task = ctrl.get_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    return task  # type: ignore[return-value]


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, db: Session = Depends(get_db)) -> TaskRead:
    """Crea una tarea nueva."""
    return ctrl.create_task(db, data)  # type: ignore[return-value]


@router.put("/{task_id}", response_model=TaskRead)
def update_task(
    task_id: int, data: TaskUpdate, db: Session = Depends(get_db)
) -> TaskRead:
    """Actualiza parcialmente una tarea."""
    task = ctrl.update_task(db, task_id, data)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    return task  # type: ignore[return-value]


@router.post("/{task_id}/toggle", response_model=TaskRead)
def toggle_task(task_id: int, db: Session = Depends(get_db)) -> TaskRead:
    """Alterna el estado completado de una tarea."""
    task = ctrl.toggle_task(db, task_id)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
    return task  # type: ignore[return-value]


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)) -> None:
    """Elimina una tarea."""
    deleted = ctrl.delete_task(db, task_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tarea no encontrada")
