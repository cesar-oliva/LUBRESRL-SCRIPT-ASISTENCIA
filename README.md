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
- CRUD de certificados médicos con carga y descarga de archivos
- Aplicación automática del código `42` en la planilla mensual durante la licencia médica
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
- Pantalla de Certificados médicos:
  - búsqueda de empleado
  - carga del certificado médico
  - fechas de vigencia inclusivas
  - cálculo de días involucrados
  - edición, descarga y eliminación
  - estilos consistentes y responsive con el resto de las pantallas
- Pantalla de asignación mensual de turnos
- Pantalla de Reportes:
  - carga de archivo Excel CrossChex
  - previsualización y confirmación de importación
  - resumen con empleados, turnos, importados, duplicados, faltantes e inconsistentes
  - detalle de marcaciones con resaltado rojo suave para registros fuera de horario
  - filtro por empleado
  - ordenamiento por legajo, nombre o fecha, ascendente o descendente
  - exportación completa del detalle a Excel compatible (`.xls`), incluyendo observaciones

## Planilla mensual de horarios

La pantalla **Planilla mensual de turnos** permite consultar y administrar la asignación diaria de horarios para los empleados de un período `YYYY-MM`.

Incluye:

- Visualización de empleados activos agrupados por sector.
- Columnas para cada día del mes seleccionado.
- Identificación visual de feriados y días con asignaciones.
- Leyenda con los turnos activos, sus períodos horarios y los códigos especiales disponibles.
- Descarga de un modelo Excel con las columnas `Legajo`, `Empleado`, `Área` y los días del período.
- Importación de una planilla Excel `.xlsx` usando el modelo descargado.
- Validación de empleados y códigos antes de guardar las asignaciones.
- Reemplazo de las asignaciones existentes del período al importar una nueva planilla.
- Exportación de la planilla visible a PDF en formato horizontal.

El Excel de la planilla mensual debe tener una fila de encabezados con `Legajo`, `Empleado`, `Área` y columnas numeradas desde `1` hasta el último día del mes. Cada celda diaria puede contener un código de turno activo o un código especial activo.

Los códigos utilizados en las celdas se validan contra los turnos y códigos especiales activos. Un código inexistente o inactivo impide la importación.

## Códigos especiales

La pantalla **Códigos especiales** contiene el CRUD para administrar valores como `VAC` o `LIC` que pueden utilizarse en la planilla mensual.

Cada código tiene:

- Código normalizado en mayúsculas.
- Descripción.
- Estado activo o inactivo.

Desde la interfaz se puede:

- Listar todos los códigos registrados.
- Crear un código nuevo.
- Editar código, descripción y estado.
- Eliminar un código.
- Consultar qué códigos están activos y disponibles para la planilla mensual.

El sistema evita duplicar un código especial existente o utilizar el mismo código que ya pertenece a un turno. Los códigos inactivos se conservan en el sistema, pero no pueden utilizarse en nuevas asignaciones mensuales.

## Endpoints principales

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

### Certificados médicos

- GET /medical-certificates
- GET /medical-certificates/{certificate_id}
- GET /medical-certificates/{certificate_id}/file
- POST /medical-certificates
- PUT /medical-certificates/{certificate_id}
- DELETE /medical-certificates/{certificate_id}

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
- medical_certificates
- medical_certificate_assignments

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

### Configuración de conexión

El frontend utiliza la variable `VITE_API_URL` para construir las solicitudes al backend. Por ejemplo, en `frontend/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Si el frontend y el backend se ejecutan en equipos o puertos diferentes, se debe actualizar esta URL y reiniciar Vite para que tome el cambio. La API habilita CORS para los orígenes de desarrollo configurados.

La base SQLite se crea o completa automáticamente cuando se importa `src.attendance.main`. También se puede inicializar manualmente con:

```bash
cd backend
source .venv/bin/activate
python -m src.attendance.database.init_db
```

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

## Certificados médicos

El certificado médico se registra para un empleado con un rango de fechas inclusivo y un archivo adjunto. La cantidad de días se calcula como:

`fecha_hasta - fecha_desde + 1`

Al crear o activar un certificado:

- Se valida que el empleado exista y esté activo.
- Se rechazan certificados activos superpuestos para el mismo empleado.
- Se crea automáticamente el código especial `42` (`CERTIFICADO MEDICO`) si todavía no existe.
- Cada día del rango se guarda en la planilla mensual con el código `42`.
- Se conserva la asignación anterior de cada día para poder restaurarla.

Al eliminar un certificado, se restauran las asignaciones anteriores y se eliminan los días que no tenían una asignación previa. Los archivos se almacenan en `backend/media/medical_certificates` y se descargan desde el endpoint del certificado.

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
- Módulo de certificados médicos: operativo con archivos, vigencia y aplicación automática del código 42
- Módulo reportes/importación: operativo con previsualización, validación, filtros, ordenamiento y exportación
- Persistencia y consulta de reportes: operativas

## Pruebas y validación

Para ejecutar las pruebas del backend:

```bash
cd backend
source .venv/bin/activate
PYTHONPATH=. pytest -q
```

La validación del frontend se realiza generando el build de producción:

```bash
cd frontend
npm run build
```

Antes de confirmar una importación se recomienda revisar los errores mostrados en la previsualización. La confirmación reemplaza los registros existentes del período seleccionado.

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
