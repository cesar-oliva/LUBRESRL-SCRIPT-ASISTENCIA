# Sistema de Asistencia

Aplicación para gestión de asistencia con backend en FastAPI, frontend en Vite y base SQLite.

El proyecto ya incluye ABM de empleados, turnos y feriados, además de un módulo de importación mensual de marcaciones (Excel CrossChex) con previsualización y confirmación de reporte.

## Objetivo

Permitir administrar datos operativos de asistencia y procesar marcaciones reales para generar reportes mensuales por período.

## Stack tecnológico

- Backend: Python 3, FastAPI, Pydantic
- Frontend: JavaScript (ES Modules), Vite
- Base de datos: SQLite
- Importación de Excel: openpyxl

## Estructura general

```text
attendance/
├── PROJECT_CONTEXT.md
├── README.md
├── backend/
│   ├── requirements.txt
│   ├── data/
│   ├── docs/
│   ├── src/
│   │   └── attendance/
│   │       ├── api/
│   │       ├── database/
│   │       ├── models/
│   │       ├── repositories/
│   │       ├── services/
│   │       └── main.py
│   └── tests/
└── frontend/
    ├── package.json
    └── src/
        ├── app.js
        ├── pages/
        ├── services/
        └── styles/
```

## Funcionalidades implementadas

### Backend

- CRUD de empleados
- CRUD de turnos
- CRUD de feriados
- Persistencia de turnos con múltiples períodos horarios
- Importación de marcaciones desde Excel (CrossChex)
- Previsualización de resultados antes de persistir
- Confirmación y guardado de reporte mensual
- Consulta de reporte guardado por período
- Actualización de observación de registro de reporte

### Frontend

- Home con navegación a módulos
- Pantalla de Empleados (ABM)
- Pantalla de Turnos (ABM)
- Pantalla de Feriados (ABM)
- Pantalla de Reportes:
  - import preview
  - confirm import
  - consulta por período
  - tabla de resultados y resumen

## Endpoints principales

### Salud

- GET /health
- GET /

### Empleados

- GET /employees
- GET /employees/active
- GET /employees/search/by-name?name=
- GET /employees/{employee_number}
- POST /employees
- PUT /employees/{employee_number}
- PATCH /employees/{employee_number}/active
- DELETE /employees/{employee_number}

### Turnos

- GET /turns
- GET /turns/active
- GET /turns/by-code/{code}
- GET /turns/{turn_id}
- POST /turns
- PUT /turns/{turn_id}
- DELETE /turns/{turn_id}

### Feriados

- GET /holidays
- GET /holidays/{holiday_id}
- POST /holidays
- PUT /holidays/{holiday_id}
- DELETE /holidays/{holiday_id}

### Asistencia / Reportes

- POST /attendance/import-preview
- POST /attendance/import-confirm
- GET /attendance/report/{period}
- PUT /attendance/report/{report_id}

## Base de datos

Archivo SQLite generado en:

- backend/data/attendance.db

Esquema definido en:

- backend/src/attendance/database/schema.sql

Tablas de negocio relevantes:

- employees
- turns
- turn_periods
- employee_turns
- holidays
- attendance_reports

## Instalación

### Requisitos

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m src.attendance.database.init_db
```

Ejecutar API:

```bash
uvicorn src.attendance.main:app --reload
```

API disponible en:

- http://127.0.0.1:8000
- Docs Swagger: http://127.0.0.1:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend disponible en:

- http://127.0.0.1:5173

## Flujo recomendado de importación mensual

1. Ir a Reportes en frontend.
2. Seleccionar período (YYYY-MM).
3. Cargar Excel exportado desde CrossChex.
4. Ejecutar previsualización.
5. Revisar resumen y detalle.
6. Confirmar importación para persistir en attendance_reports.
7. Consultar el mismo período para validar datos guardados.

## Dependencias Python actuales

En backend/requirements.txt están registradas, entre otras:

- fastapi
- uvicorn
- openpyxl
- python-multipart
- pytest

## Estado actual

- Módulos ABM (empleados, turnos, feriados): operativos
- Módulo reportes/importación: operativo en flujo base
- Persistencia y consulta de reportes: operativas

Nota:

- Si el período seleccionado no coincide con las fechas del archivo, los registros pueden quedar como REGISTRO_INCONSISTENTE.
- Cuando no existe asignación explícita de turno para un empleado/día, el sistema aplica inferencia de turno en base a turnos activos.

## Comandos útiles

```bash
# Inicializar DB
cd backend && source .venv/bin/activate && python -m src.attendance.database.init_db

# Levantar backend
cd backend && source .venv/bin/activate && uvicorn src.attendance.main:app --reload

# Levantar frontend
cd frontend && npm run dev

# Build frontend
cd frontend && npm run build

# Ejecutar tests
cd backend && source .venv/bin/activate && PYTHONPATH=. pytest -q
```
