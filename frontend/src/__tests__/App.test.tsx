/**
 * Etapa 3 — Tests completos de App.tsx (100% cobertura del componente)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import * as api from "../services/api";

vi.mock("../services/api");

const mockListTasks = vi.mocked(api.listTasks);
const mockCountTasks = vi.mocked(api.countTasks);

const sampleTasks: api.Task[] = [
  { id: 1, title: "Tarea 1", completed: false },
  { id: 2, title: "Tarea 2", completed: true, description: "Con desc" },
];

const sampleCount: api.TaskCount = { total: 2, completed: 1, pending: 1 };

describe("App — Etapa 3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListTasks.mockResolvedValue(sampleTasks);
    mockCountTasks.mockResolvedValue(sampleCount);
  });

  it("muestra el título principal", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      "Gestor de Tareas"
    );
  });

  it("muestra las estadísticas de conteo", async () => {
    render(<App />);
    await screen.findByText("2"); // total
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Pendientes")).toBeInTheDocument();
    expect(screen.getByText("Completadas")).toBeInTheDocument();
  });

  it("muestra el mensaje de error si la API falla", async () => {
    mockListTasks.mockRejectedValue(new Error("network"));
    mockCountTasks.mockRejectedValue(new Error("network"));
    render(<App />);
    expect(
      await screen.findByText(/No se pudo conectar/i)
    ).toBeInTheDocument();
  });

  it("muestra las tareas cargadas", async () => {
    render(<App />);
    expect(await screen.findByText("Tarea 1")).toBeInTheDocument();
    expect(screen.getByText("Tarea 2")).toBeInTheDocument();
  });

  it("recarga las tareas después de crear una", async () => {
    vi.mocked(api.createTask).mockResolvedValue({
      id: 3, title: "Nueva", completed: false,
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Tarea 1");

    const input = screen.getByLabelText(/título/i);
    await user.type(input, "Nueva");
    await user.click(screen.getByRole("button", { name: /Agregar tarea/i }));

    await waitFor(() => expect(mockListTasks).toHaveBeenCalledTimes(2));
  });
});
