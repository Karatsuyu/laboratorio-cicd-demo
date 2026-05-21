/**
 * Etapa 3 — Tests de TaskList.tsx
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskList } from "../components/TaskList";
import * as api from "../services/api";

vi.mock("../services/api");

const tasks: api.Task[] = [
  { id: 1, title: "Pendiente", completed: false },
  { id: 2, title: "Completada", completed: true, description: "Con descripción" },
];

describe("TaskList", () => {
  const onRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra mensaje cuando no hay tareas", () => {
    render(<TaskList tasks={[]} onRefresh={onRefresh} />);
    expect(screen.getByText(/No hay tareas/i)).toBeInTheDocument();
  });

  it("renderiza la lista de tareas", () => {
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("muestra la descripción cuando existe", () => {
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    expect(screen.getByText("Con descripción")).toBeInTheDocument();
  });

  it("el checkbox de tarea completada está marcado", () => {
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).not.toBeChecked(); // pendiente
    expect(checkboxes[1]).toBeChecked();     // completada
  });

  it("llama toggleTask y onRefresh al hacer click en checkbox", async () => {
    vi.mocked(api.toggleTask).mockResolvedValue({
      ...tasks[0], completed: true,
    });
    const user = userEvent.setup();
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await waitFor(() => expect(api.toggleTask).toHaveBeenCalledWith(1));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("muestra alerta si toggleTask falla", async () => {
    vi.mocked(api.toggleTask).mockRejectedValue(new Error("fail"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mockRestore();
  });

  it("llama deleteTask y onRefresh al confirmar eliminación", async () => {
    vi.mocked(api.deleteTask).mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    await user.click(deleteButtons[0]);
    await waitFor(() => expect(api.deleteTask).toHaveBeenCalledWith(1));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("no llama deleteTask si el usuario cancela la confirmación", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    await user.click(deleteButtons[0]);
    expect(api.deleteTask).not.toHaveBeenCalled();
  });

  it("muestra alerta si deleteTask falla", async () => {
    vi.mocked(api.deleteTask).mockRejectedValue(new Error("fail"));
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const user = userEvent.setup();
    render(<TaskList tasks={tasks} onRefresh={onRefresh} />);
    const deleteButtons = screen.getAllByRole("button", { name: /eliminar/i });
    await user.click(deleteButtons[0]);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    alertSpy.mockRestore();
  });
});
