import React, { useEffect, useState, useCallback } from "react";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { listTasks, countTasks } from "./services/api";
import type { Task, TaskCount } from "./services/api";

function App(): React.ReactElement {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [count, setCount] = useState<TaskCount>({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [ts, c] = await Promise.all([listTasks(), countTasks()]);
      setTasks(ts);
      setCount(c);
    } catch {
      setError("No se pudo conectar con el backend. ¿Está corriendo?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "2rem 1rem",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "#1d2433", margin: 0 }}>
          📋 Gestor de Tareas
        </h1>
        <p style={{ color: "#5b6779", margin: "0.5rem 0 0" }}>
          Laboratorio CI/CD — Etapa 2 &amp; 3
        </p>
      </header>

      {/* Estadísticas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "Total", value: count.total, color: "#2d7ff9" },
          { label: "Pendientes", value: count.pending, color: "#d97706" },
          { label: "Completadas", value: count.completed, color: "#16a34a" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "#f6f8fb",
              borderRadius: "8px",
              padding: "0.75rem",
              textAlign: "center",
              border: "1px solid #e1e5ec",
            }}
          >
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: "0.82rem", color: "#5b6779" }}>{label}</div>
          </div>
        ))}
      </div>

      <TaskForm onCreated={refresh} />

      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#dc2626",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Cargando tareas...</p>
      ) : (
        <TaskList tasks={tasks} onRefresh={refresh} />
      )}
    </div>
  );
}

export default App;
