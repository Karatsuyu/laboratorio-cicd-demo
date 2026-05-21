/**
 * Etapa 3 — Tests de TaskForm.tsx
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskForm } from "../components/TaskForm";
import * as api from "../services/api";

vi.mock("../services/api");

describe("TaskForm", () => {
  const onCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el campo de título con label", () => {
    render(<TaskForm onCreated={onCreated} />);
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it("renderiza el campo de descripción", () => {
    render(<TaskForm onCreated={onCreated} />);
    expect(screen.getByLabelText(/descripción/i)).toBeInTheDocument();
  });

  it("el botón está deshabilitado cuando el título está vacío", () => {
    render(<TaskForm onCreated={onCreated} />);
    expect(screen.getByRole("button", { name: /Agregar tarea/i })).toBeDisabled();
  });

  it("el botón se habilita al escribir un título", async () => {
    const user = userEvent.setup();
    render(<TaskForm onCreated={onCreated} />);
    await user.type(screen.getByLabelText(/título/i), "Mi tarea");
    expect(screen.getByRole("button", { name: /Agregar tarea/i })).not.toBeDisabled();
  });

  it("llama createTask y onCreated al enviar el formulario", async () => {
    vi.mocked(api.createTask).mockResolvedValue({
      id: 1, title: "Mi tarea", completed: false,
    });
    const user = userEvent.setup();
    render(<TaskForm onCreated={onCreated} />);

    await user.type(screen.getByLabelText(/título/i), "Mi tarea");
    await user.type(screen.getByLabelText(/descripción/i), "Detalle");
    await user.click(screen.getByRole("button", { name: /Agregar tarea/i }));

    await waitFor(() => expect(api.createTask).toHaveBeenCalledWith({
      title: "Mi tarea",
      description: "Detalle",
    }));
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it("limpia los campos tras crear una tarea", async () => {
    vi.mocked(api.createTask).mockResolvedValue({
      id: 1, title: "Mi tarea", completed: false,
    });
    const user = userEvent.setup();
    render(<TaskForm onCreated={onCreated} />);
    const input = screen.getByLabelText(/título/i);
    await user.type(input, "Mi tarea");
    await user.click(screen.getByRole("button", { name: /Agregar tarea/i }));
    await waitFor(() => expect(input).toHaveValue(""));
  });

  it("muestra mensaje de error si createTask falla", async () => {
    vi.mocked(api.createTask).mockRejectedValue(new Error("fail"));
    const user = userEvent.setup();
    render(<TaskForm onCreated={onCreated} />);
    await user.type(screen.getByLabelText(/título/i), "Falla");
    await user.click(screen.getByRole("button", { name: /Agregar tarea/i }));
    expect(await screen.findByText(/Error al crear/i)).toBeInTheDocument();
  });
});
