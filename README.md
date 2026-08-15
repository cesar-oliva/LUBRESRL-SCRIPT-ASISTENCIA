# Sistema de Asistencia

Aplicación de gestión de empleados, turnos y asignaciones de trabajo para una empresa o organización. El proyecto está dividido en un backend desarrollado con FastAPI y una interfaz web en JavaScript con Vite, usando SQLite como base de datos local.

## Objetivo

El sistema permite:

- Registrar empleados y controlar su estado activo/inactivo.
- Gestionar turnos de trabajo y sus períodos horarios.
- Asignar turnos a empleados por día de la semana.
- Exponer la información mediante una API REST.
- Mostrar una interfaz web ligera para navegar por empleados y turnos.

## Stack tecnológico

- Backend: Python, FastAPI
- Frontend: JavaScript ES modules, Vite
- Base de datos: SQLite
- Validación y serialización: Pydantic

## Estructura del proyecto

```text
LUBRESRL-SCRIPT-ASISTENCIA/
├── README.md
├── PROJECT_CONTEXT.md
├── backend/
│   ├── requirements.txt
│   ├── data/
│   ├── docs/
│   │   └── comandos.txt
│   └── src/
│       └── attendance/
│           ├── api/
│           │   ├── app.py
│           │   ├── employees.py
│           │   ├── employee_turns.py
│           │   ├── schemas.py
│           │   └── turns.py
│           ├── config/
│           ├── database/
│           │   ├── connection.py
│           │   ├── init_db.py
│           │   ├── schema.sql
│           │   ├── seed_employees.py
│           │   └── seed_turns.py
│           ├── models/
│           │   ├── employee.py
│           │   └── turn.py
│           ├── repositories/
│           │   ├── employee_repository.py
│           │   ├── employee_turn_repository.py
│           │   └── turn_repository.py
│           ├── services/
│           │   ├── employee_service.py
│           │   ├── employee_turn_service.py
│           │   └── turn_service.py
│           ├── utils/
│           └── main.py
│   └── tests/
│       └── test_employee_service.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── app.js
│       ├── main.js
│       ├── api/
│       │   └── employeeApi.js
│       ├── components/
│       ├── pages/
│       │   ├── attendance.js
│       │   ├── employees.js
│       │   ├── home.js
│       │   ├── reports.js
│       │   └── turns.js
│       ├── services/
│       │   └── employeeService.js
│       ├── styles/
│       ├── utils/
│       └── views/
│           └── employeesView.js
└── .venv/
```

## Arquitectura

El backend sigue una separación por capas:

- Models: entidades del dominio, como empleado y turno.
- Repositories: acceso directo a SQLite.
- Services: validaciones y lógica de negocio.
- API: endpoints con FastAPI.
- Database: conexión y esquema de SQLite.

La base de datos se crea en:

- backend/data/attendance.db

El esquema inicial está en:

- backend/src/attendance/database/schema.sql

## Funcionalidades actuales

### Backend

- CRUD de empleados
- CRUD de turnos
- Gestión de períodos de turno
- Asignación de turnos por día de la semana
- Estado activo/inactivo por entidad
- Endpoints REST para consultar y modificar datos

### Frontend

- Pantalla de inicio
- Vista de empleados
- Vista de turnos
- Navegación por rutas internas del cliente

## Requisitos previos

- Python 3.10 o superior
- Node.js 18 o superior
- npm

## Instalación y ejecución

### 1) Backend

Desde la raíz del proyecto:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m src.attendance.database.init_db
```

Iniciar el servidor API:

```bash
uvicorn src.attendance.main:app --reload
```

La API queda disponible en:

- http://127.0.0.1:8000
- Swagger/OpenAPI: http://127.0.0.1:8000/docs

### 2) Frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

La app web se sirve en:

- http://127.0.0.1:5173

## API REST

La API principal se define en FastAPI y expone rutas bajo los prefijos:

- /employees
- /turns

### Empleados

- GET /employees
- GET /employees/active
- GET /employees/search/by-name?name=juan
- GET /employees/{employee_number}
- POST /employees
- PUT /employees/{employee_number}
- PATCH /employees/{employee_number}/active
- DELETE /employees/{employee_number}

### Turnos

- GET /turns
- GET /turns/active
- GET /turns/{turn_id}
- GET /turns/by-code/{code}
- POST /turns
- PUT /turns/{turn_id}
- DELETE /turns/{turn_id}

## Base de datos

La conexión a SQLite se define en:

- backend/src/attendance/database/connection.py

El archivo de datos se genera en:

- backend/data/attendance.db

El esquema crea las siguientes tablas:

- employees
- turns
- turn_periods
- employee_turns

## Datos de ejemplo

El proyecto incluye scripts de carga de información para inicializar registros:

- backend/src/attendance/database/seed_employees.py
- backend/src/attendance/database/seed_turns.py

También se puede inicializar la base de datos manualmente con:

```bash
python -m src.attendance.database.init_db
```

## Comandos útiles

```bash
# Crear base de datos
python -m src.attendance.database.init_db

# Cargar empleados de ejemplo
python -m src.attendance.database.seed_employees

# Ejecutar backend
uvicorn src.attendance.main:app --reload

# Ejecutar frontend
cd frontend && npm run dev

# Ejecutar tests
cd backend && python -m tests.test_employee_service
```

## Estado del proyecto

Actualmente el proyecto tiene implementada la base de la gestión de asistencia con:

- API REST funcional para empleados y turnos
- Persistencia SQLite
- Interfaz web básica para navegación
- Estructura modular preparada para continuar desarrollando asistencia y reportes

Algunas áreas siguen en progreso, por ejemplo:

- pantallas de asistencia y reportes aún no están totalmente desarrolladas
- la lógica de asignación por día existe en repositorios/servicios, pero la UI completa no está finalizada

## Observación importante

En el proyecto hay dos puntos de entrada del backend:

- backend/src/attendance/main.py
- backend/src/attendance/api/app.py

El runner principal para iniciar la aplicación con Uvicorn es:

- src.attendance.main:app

Esto es lo que se usa en la documentación y en el arranque del servidor.

## Licencia

Este proyecto no define una licencia específica en el repositorio por el momento.

## Autor / contexto

Proyecto desarrollado como sistema interno de asistencia para LUBRESRL, con enfoque inicial en gestión de personal y turnos.
