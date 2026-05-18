import React from "react";

function App(): React.ReactElement {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "4rem" }}>
      <h1>Laboratorio CI/CD</h1>
      <p style={{ color: "#555", fontSize: "1.2rem" }}>
        🚀 Hola — el stack está funcionando correctamente.
      </p>
      <p style={{ color: "#888", fontSize: "0.9rem" }}>
        Esta es la <strong>Etapa 1</strong>: app mínima sin CRUD todavía.
      </p>
      <a
        href="http://localhost:8000/docs"
        target="_blank"
        rel="noreferrer"
        style={{ color: "#2d7ff9" }}
      >
        Abrir Swagger UI →
      </a>
    </div>
  );
}

export default App;
