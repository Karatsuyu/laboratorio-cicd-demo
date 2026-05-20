import React, { useState } from "react";
import { createTask } from "../services/api";
import type { TaskCreate } from "../services/api";

interface Props {
  onCreated: () => void;
}

export function TaskForm({ onCreated }: Props): React.ReactElement {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data: TaskCreate = { title: title.trim() };
      if (description.trim()) data.description = description.trim();
      await createTask(data);
      setTitle("");
      setDescription("");
      onCreated();
    } catch {
      setError("Error al crear la tarea. Verifica que el backend esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
      <div style={{ marginBottom: "0.5rem" }}>
        <label
          htmlFor="task-title"
          style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}
        >
          Título *
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          required
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label
          htmlFor="task-desc"
          style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}
        >
          Descripción (opcional)
        </label>
        <input
          id="task-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles adicionales..."
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "1rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.9rem", marginBottom: "0.5rem" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading || !title.trim()}
        style={{
          background: "#2d7ff9",
          color: "white",
          border: "none",
          padding: "0.6rem 1.4rem",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading || !title.trim() ? 0.6 : 1,
        }}
      >
        {loading ? "Agregando..." : "Agregar tarea"}
      </button>
    </form>
  );
}
