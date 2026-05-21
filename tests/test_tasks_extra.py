"""
Tests del CRUD de tareas — Etapa 3.
Cubre los endpoints de task_view.py y la lógica de task_controller.py,
llevando la cobertura total a ~96%.
"""
import pytest


# ── Helpers ────────────────────────────────────────────────────────────────────

def create(client, title: str, description: str | None = None) -> dict:
    """Crea una tarea y retorna el JSON de respuesta."""
    body = {"title": title}
    if description:
        body["description"] = description
    r = client.post("/tasks/", json=body)
    assert r.status_code == 201
    return r.json()


# ── POST /tasks/ ───────────────────────────────────────────────────────────────

class TestCreateTask:
    def test_crear_tarea_basica(self, client):
        """Crear tarea con título retorna 201 y el objeto creado."""
        r = client.post("/tasks/", json={"title": "Aprender CI"})
        assert r.status_code == 201
        data = r.json()
        assert data["title"] == "Aprender CI"
        assert data["completed"] is False
        assert data["id"] > 0

    def test_crear_tarea_con_descripcion(self, client):
        """Tarea con descripción la persiste correctamente."""
        r = client.post("/tasks/", json={"title": "CI", "description": "Pipeline completo"})
        assert r.status_code == 201
        assert r.json()["description"] == "Pipeline completo"

    def test_titulo_vacio_falla(self, client):
        """Título vacío retorna 422 (validación Pydantic)."""
        r = client.post("/tasks/", json={"title": ""})
        assert r.status_code == 422

    def test_sin_titulo_falla(self, client):
        """Sin campo title retorna 422."""
        r = client.post("/tasks/", json={"description": "solo descripcion"})
        assert r.status_code == 422


# ── GET /tasks/ ────────────────────────────────────────────────────────────────

class TestListTasks:
    def test_lista_vacia(self, client):
        """Sin tareas retorna lista vacía."""
        r = client.get("/tasks/")
        assert r.status_code == 200
        assert r.json() == []

    def test_lista_con_tareas(self, client):
        """Retorna todas las tareas creadas."""
        create(client, "Tarea 1")
        create(client, "Tarea 2")
        r = client.get("/tasks/")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_filtrar_pendientes(self, client):
        """?completed=false retorna solo pendientes."""
        t = create(client, "Pendiente")
        c = create(client, "Completada")
        client.post(f"/tasks/{c['id']}/toggle")
        r = client.get("/tasks/", params={"completed": "false"})
        ids = [task["id"] for task in r.json()]
        assert t["id"] in ids
        assert c["id"] not in ids

    def test_filtrar_completadas(self, client):
        """?completed=true retorna solo completadas."""
        create(client, "Pendiente")
        c = create(client, "Completada")
        client.post(f"/tasks/{c['id']}/toggle")
        r = client.get("/tasks/", params={"completed": "true"})
        ids = [task["id"] for task in r.json()]
        assert c["id"] in ids


# ── GET /tasks/{id} ────────────────────────────────────────────────────────────

class TestGetTask:
    def test_obtener_existente(self, client):
        """Retorna la tarea con el ID correcto."""
        t = create(client, "Única")
        r = client.get(f"/tasks/{t['id']}")
        assert r.status_code == 200
        assert r.json()["title"] == "Única"

    def test_obtener_no_existente(self, client):
        """ID inexistente retorna 404."""
        r = client.get("/tasks/99999")
        assert r.status_code == 404


# ── GET /tasks/count ───────────────────────────────────────────────────────────

class TestCountTasks:
    def test_conteo_inicial(self, client):
        """Sin tareas el conteo es 0/0/0."""
        r = client.get("/tasks/count")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] == 0
        assert data["completed"] == 0
        assert data["pending"] == 0

    def test_conteo_con_tareas_mixtas(self, client):
        """Conteo correcto con tareas pendientes y completadas."""
        create(client, "P1")
        t2 = create(client, "C1")
        t3 = create(client, "C2")
        client.post(f"/tasks/{t2['id']}/toggle")
        client.post(f"/tasks/{t3['id']}/toggle")
        r = client.get("/tasks/count")
        data = r.json()
        assert data["total"] == 3
        assert data["completed"] == 2
        assert data["pending"] == 1


# ── PUT /tasks/{id} ────────────────────────────────────────────────────────────

class TestUpdateTask:
    def test_actualizar_titulo(self, client):
        """PUT actualiza el título de la tarea."""
        t = create(client, "Viejo")
        r = client.put(f"/tasks/{t['id']}", json={"title": "Nuevo"})
        assert r.status_code == 200
        assert r.json()["title"] == "Nuevo"

    def test_actualizar_completado(self, client):
        """PUT puede marcar la tarea como completada."""
        t = create(client, "Pendiente")
        r = client.put(f"/tasks/{t['id']}", json={"completed": True})
        assert r.status_code == 200
        assert r.json()["completed"] is True

    def test_actualizar_no_existente(self, client):
        """PUT a ID inexistente retorna 404."""
        r = client.put("/tasks/99999", json={"title": "X"})
        assert r.status_code == 404


# ── POST /tasks/{id}/toggle ────────────────────────────────────────────────────

class TestToggleTask:
    def test_toggle_pendiente_a_completada(self, client):
        """Toggle cambia de False a True."""
        t = create(client, "Tarea")
        r = client.post(f"/tasks/{t['id']}/toggle")
        assert r.status_code == 200
        assert r.json()["completed"] is True

    def test_toggle_completada_a_pendiente(self, client):
        """Toggle doble vuelve al estado original."""
        t = create(client, "Tarea")
        client.post(f"/tasks/{t['id']}/toggle")
        r = client.post(f"/tasks/{t['id']}/toggle")
        assert r.json()["completed"] is False

    def test_toggle_no_existente(self, client):
        """Toggle en ID inexistente retorna 404."""
        r = client.post("/tasks/99999/toggle")
        assert r.status_code == 404


# ── DELETE /tasks/{id} ─────────────────────────────────────────────────────────

class TestDeleteTask:
    def test_eliminar_existente(self, client):
        """DELETE retorna 204 y la tarea ya no existe."""
        t = create(client, "A eliminar")
        r = client.delete(f"/tasks/{t['id']}")
        assert r.status_code == 204
        assert client.get(f"/tasks/{t['id']}").status_code == 404

    def test_eliminar_no_existente(self, client):
        """DELETE a ID inexistente retorna 404."""
        r = client.delete("/tasks/99999")
        assert r.status_code == 404


# ── Modelo Task ────────────────────────────────────────────────────────────────

class TestTaskModel:
    def test_mark_completed(self, db_session):
        """mark_completed() setea completed=True."""
        from app.models.task import Task
        t = Task(title="Test")
        t.mark_completed()
        assert t.completed is True

    def test_toggle_false_to_true(self, db_session):
        """toggle() cambia False a True."""
        from app.models.task import Task
        t = Task(title="Test", completed=False)
        t.toggle()
        assert t.completed is True

    def test_toggle_true_to_false(self, db_session):
        """toggle() cambia True a False."""
        from app.models.task import Task
        t = Task(title="Test", completed=True)
        t.toggle()
        assert t.completed is False


# ── Schemas Pydantic ───────────────────────────────────────────────────────────

class TestSchemas:
    def test_task_create_valida(self):
        """TaskCreate con título válido no lanza excepción."""
        from app.schemas.task import TaskCreate
        t = TaskCreate(title="Válido")
        assert t.title == "Válido"

    def test_task_create_titulo_vacio_falla(self):
        """TaskCreate con título vacío lanza ValidationError."""
        from pydantic import ValidationError
        from app.schemas.task import TaskCreate
        with pytest.raises(ValidationError):
            TaskCreate(title="")
