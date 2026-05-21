import React from "react";
import type { Task } from "../services/api";
import { toggleTask, deleteTask } from "../services/api";

interface Props {
  tasks: Task[];
  onRefresh: () => void;
}

export function TaskList({ tasks, onRefresh }: Props): React.ReactElement {
  const handleToggle = async (id: number) => {
    try {
      await toggleTask(id);
      onRefresh();
    } catch {
      alert("Error al actualizar la tarea.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;
    try {
      await deleteTask(id);
      onRefresh();
    } catch {
      alert("Error al eliminar la tarea.");
    }
  };

  if (tasks.length === 0) {
    return (
      <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>
        No hay tareas todavía. ¡Crea la primera!
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {tasks.map((task) => (
        <li
          key={task.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            marginBottom: "0.5rem",
            background: task.completed ? "#f0fdf4" : "#fff",
            border: `1px solid ${task.completed ? "#86efac" : "#e5e7eb"}`,
            borderRadius: "8px",
            transition: "all 0.2s",
          }}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => handleToggle(task.id)}
            aria-label={`Marcar como ${task.completed ? "pendiente" : "completada"}: ${task.title}`}
            style={{ cursor: "pointer", width: "1.1rem", height: "1.1rem", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span
              style={{
                display: "block",
                fontWeight: 500,
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "#6b7280" : "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {task.title}
            </span>
            {task.description && (
              <span
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  color: "#9ca3af",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.description}
              </span>
            )}
          </div>
          <button
            onClick={() => handleDelete(task.id)}
            aria-label={`Eliminar tarea: ${task.title}`}
            style={{
              background: "none",
              border: "1px solid #fca5a5",
              color: "#ef4444",
              borderRadius: "6px",
              padding: "0.25rem 0.6rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              flexShrink: 0,
            }}
          >
            Eliminar
          </button>
        </li>
      ))}
    </ul>
  );
}
