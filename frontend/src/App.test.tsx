/**
 * Test mínimo de Etapa 2 — solo verifica que la app monta.
 * La cobertura FALLA (~35%) porque TaskForm, TaskList y api.ts
 * no tienen tests todavía. Eso es intencional: el PR a master
 * debe rechazarse con "coverage < 80%".
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

// Mock del módulo de API para no hacer peticiones reales
vi.mock("./services/api", () => ({
  listTasks: vi.fn().mockResolvedValue([]),
  countTasks: vi.fn().mockResolvedValue({ total: 0, completed: 0, pending: 0 }),
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

describe("App — Etapa 2 (cobertura insuficiente)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el título principal", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});
