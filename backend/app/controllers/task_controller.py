"""Controlador de tareas — lógica de negocio, sin conocimiento de HTTP."""
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCount, TaskCreate, TaskUpdate


def get_tasks(db: Session, completed: bool | None = None) -> list[Task]:
    """Lista todas las tareas, con filtro opcional por estado."""
    query = db.query(Task)
    if completed is not None:
        query = query.filter(Task.completed == completed)
    return query.order_by(Task.id).all()


def get_task(db: Session, task_id: int) -> Task | None:
    """Obtiene una tarea por ID. Retorna None si no existe."""
    return db.query(Task).filter(Task.id == task_id).first()


def count_tasks(db: Session, completed: bool | None = None) -> TaskCount:
    """Cuenta tareas totales, completadas y pendientes."""
    total_q = db.query(Task)
    completed_q = db.query(Task).filter(Task.completed.is_(True))
    pending_q = db.query(Task).filter(Task.completed.is_(False))

    if completed is not None:
        total_q = total_q.filter(Task.completed == completed)

    total = total_q.count()
    done = completed_q.count()
    pending = pending_q.count()
    return TaskCount(total=total, completed=done, pending=pending)


def create_task(db: Session, data: TaskCreate) -> Task:
    """Crea una tarea nueva y la persiste."""
    task = Task(title=data.title, description=data.description)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: int, data: TaskUpdate) -> Task | None:
    """Actualiza parcialmente una tarea. Retorna None si no existe."""
    task = get_task(db, task_id)
    if task is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


def toggle_task(db: Session, task_id: int) -> Task | None:
    """Alterna el estado completado de una tarea."""
    task = get_task(db, task_id)
    if task is None:
        return None
    task.toggle()
    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> bool:
    """Elimina una tarea. Retorna True si existía, False si no."""
    task = get_task(db, task_id)
    if task is None:
        return False
    db.delete(task)
    db.commit()
    return True
