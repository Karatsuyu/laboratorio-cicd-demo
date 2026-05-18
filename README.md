# Laboratorio CI/CD Demo

> Repositorio de práctica para el laboratorio de **Integración Continua y Análisis Estático**.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI + SQLAlchemy + PostgreSQL |
| Frontend | React 18 + Vite + TypeScript |
| Tests backend | pytest + pytest-cov |
| Tests frontend | Vitest + Testing Library |
| Linting | Ruff (Python) + ESLint (TS) |
| CI/CD | GitHub Actions |
| Calidad | SonarCloud |
| Infra local | Docker Compose |

## Levantar el stack local

```bash
docker compose up -d
docker compose ps          # todos deben estar healthy/running
```

| Servicio | URL |
|----------|-----|
| Backend API | http://localhost:8000/docs |
| Frontend | http://localhost:5173 |
| pgAdmin | http://localhost:5050 |

Credenciales pgAdmin: `admin@lab.com` / `admin`  
Credenciales BD: `labuser` / `labpass` / `labdb`

## Ejecutar tests localmente

### Backend
```bash
cd backend
pip install -r requirements.txt
pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

### Frontend
```bash
cd frontend
npm install
npm run test:coverage
```

### Lint
```bash
# Backend
cd backend && ruff check app

# Frontend
cd frontend && npm run lint
```

## Estructura del repo

```
laboratorio-cicd-demo/
├── .github/workflows/
│   ├── ci-develop.yml   ← pipeline para PRs a develop
│   └── ci-master.yml    ← pipeline estricto para PRs a master
├── backend/
│   ├── app/             ← código FastAPI (MVC en Etapa 2+)
│   └── tests/           ← pytest
├── frontend/
│   ├── src/             ← React + TypeScript
│   └── ...
├── docker-compose.yml
├── sonar-project.properties   ← editar ORG y PROJECT_KEY
└── scripts/setup-windows.ps1
```

## Etapas

| Etapa | Acción | PR a develop | PR a master |
|-------|--------|-------------|-------------|
| **1** | Setup + config | — | — |
| **2** | Aplicar `../etapa-2/` | ✅ pasa | ❌ falla (cov <80%) |
| **3** | Aplicar `../etapa-3/` | ✅ pasa | ✅ pasa |

## Configuración rápida

1. Crear repo **público** en GitHub y hacer push:
   ```bash
   git remote add origin https://github.com/<usuario>/<repo>.git
   git push -u origin master
   git push -u origin develop
   ```
2. Importar en **SonarCloud**, desactivar Automatic Analysis.
3. Copiar el **SONAR_TOKEN** → GitHub Settings → Secrets → `SONAR_TOKEN`.
4. Editar `sonar-project.properties` con tu `ORG` y `PROJECT_KEY`.
5. Configurar **Branch Protection** en `develop` y `master`.
6. Seguir la guía `guia.html` para las 3 etapas.
