# Sistema de Asistencia

Aplicación web para gestionar empleados, turnos y feriados, e importar marcaciones de asistencia desde archivos Excel de CrossChex. El sistema genera una previsualización mensual, permite revisar cada marcación y guarda el reporte confirmado en SQLite.

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
- Asignación de turnos por empleado y día de la semana
- Códigos especiales de asistencia
- Importación de marcaciones desde Excel (CrossChex)
- Previsualización de resultados antes de persistir
- Detección de duplicados por legajo y fecha/hora de marcación
- Análisis de llegadas tarde, salidas anticipadas, faltantes e inconsistencias
- Confirmación y guardado de reporte mensual, reemplazando el período anterior
- Consulta de reporte guardado por período
- Actualización de observación de registro de reporte
- Inicialización automática del esquema SQLite al arrancar la API

### Frontend

- Home con navegación a módulos
- Pantalla de Empleados (ABM)
- Pantalla de Turnos (ABM)
- Pantalla de Feriados (ABM)
- Pantalla de Códigos especiales (ABM)
- Pantalla de asignación mensual de turnos
- Pantalla de Reportes:
  - carga de archivo Excel CrossChex
  - previsualización y confirmación de importación
  - resumen con empleados, turnos, importados, duplicados, faltantes e inconsistentes
  - detalle de marcaciones con resaltado rojo suave para registros fuera de horario
  - filtro por empleado
  - ordenamiento por legajo, nombre o fecha, ascendente o descendente
  - exportación completa del detalle a Excel compatible (`.xls`), incluyendo observaciones

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

### Turnos mensuales

- GET /monthly-turns/{period}
- PUT /monthly-turns/{period}
- POST /monthly-turns/{period}/import
- GET /monthly-turns/template/{period}

### Códigos especiales

- GET /special-codes
- GET /special-codes/active
- POST /special-codes
- PUT /special-codes/{special_code_id}
- DELETE /special-codes/{special_code_id}

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
3. Seleccionar la tolerancia en minutos.
4. Cargar el Excel exportado desde CrossChex.
5. Ejecutar previsualización.
6. Revisar el resumen y el detalle de marcaciones.
7. Filtrar por empleado u ordenar el detalle por legajo, nombre o fecha.
8. Exportar toda la previsualización a Excel si se necesita analizarla fuera del sistema.
9. Confirmar la importación para persistir el reporte en `attendance_reports`.
10. Consultar el mismo período para validar los datos guardados.

## Formato de importación CrossChex

El archivo debe ser Excel (`.xlsx` o `.xls`) y contener estas columnas:

- `Usuario Nro.`: legajo del empleado.
- `Fecha/Hora`: fecha y hora de la marcación.
- `Registro`: tipo de marcación compatible con entrada o salida (`0` o `1`, según el formato exportado).

Durante la previsualización:

- Se ignoran filas vacías y se informan filas inválidas.
- Se valida que el legajo exista en la base.
- Una marcación es única por combinación de `legajo + fecha/hora`.
- Dos empleados distintos pueden tener la misma fecha/hora sin que se consideren duplicados.
- Las marcaciones válidas se agrupan por empleado y día para resolver los turnos.
- Se marca como inconsistente un registro fuera del período seleccionado.

## Reporte generado

Cada registro del reporte puede incluir:

- Empleado y legajo.
- Fecha y turno resuelto.
- Entrada y salida esperadas.
- Entrada y salida reales.
- Estado de asistencia.
- Minutos de llegada tarde o salida anticipada.
- Observación explicativa.

Los estados principales son `EN_HORARIO`, `LLEGADA_TARDE`, `SALIDA_ANTICIPADA`, `LLEGADA_TARDE_Y_SALIDA_ANTICIPADA`, `SIN_REGISTRO_ENTRADA`, `SIN_REGISTRO_SALIDA`, `SIN_REGISTRO` y `REGISTRO_INCONSISTENTE`.

## Dependencias Python actuales

En backend/requirements.txt están registradas, entre otras:

- fastapi
- uvicorn
- openpyxl
- python-multipart
- pytest

## Estado actual

- Módulos ABM (empleados, turnos, feriados): operativos
- Módulos de códigos especiales y asignación mensual de turnos: operativos
- Módulo reportes/importación: operativo con previsualización, validación, filtros, ordenamiento y exportación
- Persistencia y consulta de reportes: operativas

Nota:

- Si el período seleccionado no coincide con las fechas del archivo, los registros pueden quedar como REGISTRO_INCONSISTENTE.
- Cuando no existe asignación explícita de turno para un empleado/día, el sistema aplica inferencia de turno en base a turnos activos.
- La API ejecuta la inicialización idempotente de `schema.sql` al arrancar, por lo que crea las tablas faltantes de SQLite automáticamente.
- El frontend utiliza `VITE_API_URL` para configurar la URL de la API. En desarrollo puede definirse en `frontend/.env`.

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
