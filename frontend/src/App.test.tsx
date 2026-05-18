import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App — Etapa 1", () => {
  it("muestra el título del laboratorio", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Laboratorio CI/CD"
    );
  });

  it("muestra el mensaje de Etapa 1", () => {
    render(<App />);
    expect(screen.getByText(/Etapa 1/i)).toBeInTheDocument();
  });

  it("contiene el enlace al Swagger UI", () => {
    render(<App />);
    const link = screen.getByRole("link", { name: /Swagger UI/i });
    expect(link).toHaveAttribute("href", "http://localhost:8000/docs");
  });
});
