# SISTEMA DE ASISTENCIA — CONTEXTO DEL PROYECTO

## 1. PROPÓSITO DE ESTE DOCUMENTO

Este documento contiene el contexto técnico y funcional del proyecto
"Sistema de Asistencia".

Debe utilizarse como contexto base en futuras consultas para evitar
tener que explicar nuevamente la estructura, decisiones y código ya
existente.

IMPORTANTE:

- No inventar carpetas, clases, métodos o tecnologías que no estén
  confirmadas en este documento o en el código proporcionado.
- Respetar la arquitectura existente.
- Antes de proponer nuevos archivos, verificar si la funcionalidad
  puede implementarse dentro de la estructura actual.
- Cuando se solicite modificar un archivo, entregar el archivo
  completo corregido, salvo que se pida específicamente un fragmento.
- No reemplazar la arquitectura existente por otra arquitectura
  diferente sin consultar previamente.
- El proyecto está siendo desarrollado para convertirse en una
  aplicación web.
- Existe una carpeta `api`; por lo tanto, la capa web/API debe
  integrarse allí y no debe inventarse una carpeta `web/` paralela.
- `main.py` no debe convertirse en un menú de consola ni contener
  lógica de negocio.

---

# 2. OBJETIVO DEL SISTEMA

El proyecto es un sistema de asistencia para empleados.

El sistema debe permitir gestionar:

- Empleados.
- Turnos.
- Períodos horarios pertenecientes a los turnos.
- Asignación de turnos a empleados según día de la semana.
- Estado activo/inactivo de empleados.
- Estado activo/inactivo de turnos.
- Posteriormente, funcionalidades relacionadas con asistencia.

El proyecto se está construyendo con separación de responsabilidades:

    API
      ↓
    Services
      ↓
    Repositories
      ↓
    Database

Los modelos representan las entidades del sistema.

---

# 3. ARQUITECTURA

La arquitectura actual utiliza las siguientes capas:

## Models

Contienen las entidades/objetos del dominio.

Ejemplos confirmados:

- Employee
- Turn
- WorkPeriod

---

## Repositories

Responsables del acceso a la base de datos.

No deben contener lógica de negocio compleja.

Ejemplos confirmados:

- EmployeeRepository
- TurnRepository
- EmployeeTurnRepository

Los repositories utilizan:

    get_connection()

para obtener una conexión a SQLite.

---

## Services

Responsables de la lógica de negocio y validaciones.

Ejemplo confirmado:

- EmployeeService

Los services utilizan repositories y no deberían ejecutar SQL
directamente.

---

## API

Existe una carpeta `api`.

La API será la capa utilizada por la aplicación web para comunicarse
con los services.

NO crear una carpeta `web/` independiente sin una decisión explícita.

La estructura exacta de `api` todavía debe documentarse con el árbol
real del proyecto.

---

## Database

Contiene la conexión a SQLite.

Existe:

    database/connection.py

y se utiliza:

    from src.attendance.database.connection import get_connection

o imports relativos equivalentes dependiendo de la ubicación del
archivo.

---

# 4. ESTRUCTURA DEL PROYECTO

La estructura general confirmada actualmente es:

    proyecto/
    │
    ├── src/
    │   └── attendance/
    │       ├── api/
    │       ├── config/
    │       ├── database/
    │       ├── models/
    │       ├── repositories/
    │       ├── services/
    │       └── utils/
    │
    ├── tests/
    │
    ├── docs/
    │
    ├── data/
    │
    └── .venv/

## src/

Contiene el código fuente principal de la aplicación.

### src/attendance/

Paquete principal del sistema de asistencia.

Contiene las diferentes capas y componentes de la aplicación.

### src/attendance/api/

Capa de API de la aplicación.

Es la interfaz mediante la cual la aplicación web se comunica con
la lógica del sistema.

IMPORTANTE:

No crear una carpeta `web/` paralela.

La funcionalidad web/API debe integrarse en la estructura `api`
existente.

### src/attendance/config/

Contiene la configuración de la aplicación.

El contenido exacto debe documentarse cuando se proporcionen sus
archivos.

### src/attendance/database/

Contiene la conexión y componentes relacionados con la base de datos.

Existe actualmente:

    connection.py

y se utiliza:

    get_connection()

La base de datos utilizada actualmente es SQLite.

### src/attendance/models/

Contiene los modelos/entidades del dominio.

Modelos confirmados:

    Employee
    Turn
    WorkPeriod

### src/attendance/repositories/

Contiene los repositories responsables del acceso a la base de datos.

Repositories confirmados:

    EmployeeRepository
    TurnRepository
    EmployeeTurnRepository

### src/attendance/services/

Contiene la lógica de negocio.

Service confirmado:

    EmployeeService

Services previstos:

    TurnService
    EmployeeTurnService

Estos deben implementarse respetando la arquitectura existente.

### src/attendance/utils/

Contiene utilidades reutilizables de la aplicación.

El contenido exacto debe documentarse cuando se proporcionen sus
archivos.

---

# 4.1 TESTS

Directorio:

    tests/

Contendrá las pruebas automatizadas del proyecto.

Las pruebas deben respetar la arquitectura existente y permitir
probar principalmente:

- Models.
- Repositories.
- Services.
- API.

No asumir todavía framework de testing hasta verificar la configuración
real del proyecto.

---

# 4.2 DOCS

Directorio:

    docs/

Contiene documentación del proyecto.

Este documento de contexto puede mantenerse dentro de `docs/`, por
ejemplo:

    docs/PROJECT_CONTEXT.md

si esa ubicación resulta conveniente para el proyecto.

---

# 4.3 DATA

Directorio:

    data/

Contiene los datos utilizados por la aplicación, incluyendo
potencialmente la base de datos SQLite.

No asumir todavía el nombre exacto del archivo de base de datos hasta
revisar `database/connection.py` y la configuración.

---

# 4.4 .VENV

Directorio:

    .venv/

Es el entorno virtual de Python del proyecto.

No debe contener código propio de la aplicación.

No modificarlo manualmente salvo tareas relacionadas con dependencias
o configuración del entorno.

# 5. EMPLEADO

## Modelo

Existe un modelo:

    Employee

Se utiliza con los siguientes atributos confirmados:

    legajo
    name
    active

Ejemplo:

    Employee(
        legajo=legajo,
        name=name,
        active=True
    )

El identificador del empleado utilizado por el sistema es el
`legajo`, denominado también `employee_number` en algunas partes
relacionadas con asignación de turnos.

Debe mantenerse consistencia entre ambos conceptos.

---

# 6. EmployeeService

Archivo confirmado:

    services/employee_service.py

Importaciones:

    from src.attendance.models.employee import Employee
    from src.attendance.repositories.employee_repository import EmployeeRepository

La clase es:

    class EmployeeService:

Constructor:

    def __init__(self, repository=None):
        self.repository = repository or EmployeeRepository()

Esto permite inyectar un repository, facilitando pruebas y desacoplamiento.

---

## Métodos confirmados

### create_employee

    create_employee(self, legajo, name)

Validaciones:

- El legajo es obligatorio.
- Debe ser entero.
- Debe ser mayor que cero.
- El nombre es obligatorio.
- Se normalizan espacios del nombre.
- No debe existir otro empleado con el mismo legajo.

Crea:

    Employee(
        legajo=legajo,
        name=name,
        active=True
    )

y utiliza:

    repository.save(employee)

---

### get_all_employees

    get_all_employees(self)

Devuelve todos los empleados mediante:

    repository.get_all()

---

### get_active_employees

    get_active_employees(self)

Devuelve empleados activos mediante:

    repository.get_active()

---

### get_employee

    get_employee(self, legajo)

Busca mediante:

    repository.get_by_legajo(legajo)

Si no existe, lanza:

    ValueError

---

### search_employees

    search_employees(self, name)

Si el nombre está vacío devuelve:

    []

Normaliza espacios y utiliza:

    repository.find_by_name(name)

---

### update_employee

    update_employee(self, legajo, name, active=True)

Valida:

- legajo obligatorio
- legajo entero
- legajo mayor que cero
- nombre obligatorio
- existencia del empleado

Crea un nuevo objeto Employee y utiliza:

    repository.update(employee)

---

### activate_employee

    activate_employee(self, legajo)

Obtiene el empleado.

Si ya está activo, devuelve el mismo objeto.

De lo contrario utiliza:

    repository.set_active(legajo, True)

---

### deactivate_employee

    deactivate_employee(self, legajo)

Obtiene el empleado.

Si ya está inactivo, devuelve el mismo objeto.

De lo contrario utiliza:

    repository.set_active(legajo, False)

---

### employee_exists

    employee_exists(self, legajo)

Utiliza:

    repository.exists(legajo)

---

### count_employees

    count_employees(self)

Utiliza:

    repository.count()

---

### count_active_employees

    count_active_employees(self)

Utiliza:

    repository.count_active()

---

# 7. TURNOS

Existe el modelo:

    Turn

y el modelo:

    WorkPeriod

Un Turn tiene, como mínimo, los siguientes atributos confirmados:

    id
    code
    name
    periods
    active

Ejemplo conceptual:

    Turn(
        id=...,
        code="T1",
        name="Turno mañana",
        periods=[...],
        active=True
    )

---

# 8. WorkPeriod

Representa un período horario dentro de un turno.

La base de datos utiliza:

    start_time
    end_time

En el código del TurnRepository se construye actualmente como:

    WorkPeriod(
        start=period["start_time"],
        end=period["end_time"]
    )
---

# 9. TurnRepository

Archivo:

    repositories/turn_repository.py

Importaciones:

    from src.attendance.models.turn import Turn, WorkPeriod
    from src.attendance.database.connection import get_connection

Clase:

    class TurnRepository:

---

## save

    save(self, turn)

Guarda:

1. El turno en `turns`.
2. Sus períodos en `turn_periods`.

Campos de `turns` utilizados:

    code
    name
    active

Después del INSERT:

    turn.id = cursor.lastrowid

Los períodos se insertan con:

    turn_id
    period_order
    start_time
    end_time

`period_order` comienza en 1.

Realiza commit y rollback ante excepciones.

Retorna el mismo objeto `turn`.

---

## get_all

Obtiene todos los turnos:

    SELECT id, code, name, active
    FROM turns
    ORDER BY id

Cada fila se transforma mediante:

    self._row_to_turn(connection, row)

Retorna:

    list[Turn]

---

## get_by_id

Busca un turno por ID.

Retorna:

    Turn | None

---

## get_by_code

Busca un turno mediante:

    code

Retorna:

    Turn | None

---

## get_active

Obtiene solamente:

    active = 1

Retorna:

    list[Turn]

---

## update

    update(self, turn)

Actualiza:

    code
    name
    active

Después elimina los períodos actuales:

    DELETE FROM turn_periods
    WHERE turn_id = ?

y vuelve a insertar los períodos del objeto `turn`.

Esto significa que la actualización de períodos se realiza mediante
reemplazo completo.

Retorna:

    True

si el turno existe y se actualiza.

Retorna:

    False

si no existe.

---

## delete

    delete(self, turn_id)

Elimina el turno.

Se espera que `turn_periods` utilice:

    ON DELETE CASCADE

para eliminar automáticamente sus períodos.

Retorna:

    bool

---

## exists

    exists(self, turn_id)

Retorna:

    bool

---

## count

    count(self)

Retorna la cantidad total de turnos.

---

## count_active

    count_active(self)

Retorna la cantidad de turnos activos.

---

## _row_to_turn

Convierte una fila de SQLite en un objeto `Turn`.

También consulta los períodos:

    SELECT
        start_time,
        end_time
    FROM turn_periods
    WHERE turn_id = ?
    ORDER BY period_order

Luego crea objetos `WorkPeriod`.

IMPORTANTE:

Debe mantenerse consistente con la firma real de `WorkPeriod`.

---

# 10. ASIGNACIÓN DE TURNOS A EMPLEADOS

Existe:

    EmployeeTurnRepository

Su responsabilidad es administrar la relación:

    empleado ←→ turno ←→ día de la semana

La tabla utilizada es:

    employee_turns

Campos utilizados:

    employee_number
    turn_id
    day_of_week

---

# 11. DÍAS DE LA SEMANA

La convención utilizada actualmente es:

    1 = lunes
    2 = martes
    3 = miércoles
    4 = jueves
    5 = viernes
    6 = sábado
    7 = domingo

Siempre que se trabaje con `day_of_week`, mantener esta convención.

---

# 12. EmployeeTurnRepository

Archivo:

    repositories/employee_turn_repository.py

Importaciones actuales:

    from ..database.connection import get_connection
    from ..models.turn import Turn, WorkPeriod

---

## assign_turn

    assign_turn(
        self,
        employee_number,
        turn_id,
        day_of_week
    )

Valida:

    1 <= day_of_week <= 7

Luego inserta:

    employee_number
    turn_id
    day_of_week

Realiza commit.

Ante excepción:

    rollback()
    raise

---

## get_turn_for_day

    get_turn_for_day(
        self,
        employee_number,
        day_of_week
    )

Busca el turno de un empleado para un día específico.

Hace JOIN entre:

    employee_turns
    turns

Retorna:

    Turn | None

---

## get_employee_schedule

    get_employee_schedule(self, employee_number)

Obtiene todas las asignaciones del empleado.

Orden:

    ORDER BY et.day_of_week

Retorna:

    list[dict]

Formato esperado:

    [
        {
            "day_of_week": 1,
            "turn": Turn(...)
        },
        {
            "day_of_week": 2,
            "turn": Turn(...)
        }
    ]

---

## remove_turn

    remove_turn(
        self,
        employee_number,
        day_of_week
    )

Elimina la asignación del empleado para ese día.

Retorna:

    bool

---

## exists

    exists(
        self,
        employee_number,
        day_of_week
    )

Comprueba si existe una asignación.

Retorna:

    bool

---

## update_turn

    update_turn(
        self,
        employee_number,
        day_of_week,
        turn_id
    )

Actualiza el `turn_id` correspondiente.

Retorna:

    bool

---

# 13. PROBLEMAS PENDIENTES EN EmployeeTurnRepository

Existe actualmente un parámetro:

    turn_offset=0

en:

    _row_to_turn()

Pero el parámetro no se utiliza realmente.

Además, el código actual utiliza:

    row["id"]

para obtener el ID del turno.

Por lo tanto, el parámetro `turn_offset` parece innecesario.

Debe eliminarse cuando se haga la corrección definitiva.

---

## Inconsistencia de WorkPeriod

Actualmente EmployeeTurnRepository contiene:

    WorkPeriod(
        start_time=period["start_time"],
        end_time=period["end_time"]
    )

Mientras TurnRepository contiene:

    WorkPeriod(
        start=period["start_time"],
        end=period["end_time"]
    )

Esto debe corregirse para que ambos repositories utilicen la firma
real del modelo `WorkPeriod`.

No asumir cuál es correcta sin revisar el modelo.

---

# 14. MAIN

Actualmente `main.py` contiene:

    def main():
        print("=================================")
        print("   SISTEMA DE ASISTENCIA")
        print("=================================")
        print("Aplicación iniciada correctamente.")


    if __name__ == "__main__":
        main()

Esto corresponde a una prueba de arranque por consola.

El proyecto será una aplicación web/API, por lo que esta lógica no debe
convertirse en la interfaz principal del sistema.

No agregar menús de consola ni lógica de negocio en `main.py`.

El punto de entrada real deberá integrarse con la arquitectura `api`
existente.

La forma exacta de hacerlo debe determinarse revisando los archivos
actuales de `api`.

---

# 15. PRINCIPIOS DE DESARROLLO

## Separación de responsabilidades

Repository:

    SQL + acceso a datos

Service:

    reglas de negocio + validaciones

API:

    HTTP + entrada/salida + códigos de respuesta

Model:

    representación de entidades

Database:

    conexión/configuración de base de datos

---

## No poner SQL en Services

Los services deben utilizar repositories.

Incorrecto:

    connection.execute(...)

dentro de un service.

Correcto:

    self.repository.get_by_id(...)

---

## No poner lógica de negocio compleja en API

La API debe recibir los datos y delegar al service.

Ejemplo conceptual:

    API
      ↓
    service.create_employee(...)
      ↓
    repository.save(...)

---

# 16. MANEJO DE ERRORES

Los services actualmente utilizan `ValueError` para errores de
validación y situaciones de negocio simples.

Ejemplo:

    raise ValueError("El legajo es obligatorio.")

La API deberá transformar posteriormente esos errores en respuestas
HTTP apropiadas.

No trasladar SQL ni detalles internos de SQLite directamente al cliente.

---

# 17. BASE DE DATOS

Tablas confirmadas por el código:

    employees
    turns
    turn_periods
    employee_turns

Relaciones conocidas:

    turns
      │
      └── turn_periods

y:

    employees
      │
      └── employee_turns
              │
              └── turns

`turn_periods` está diseñado para eliminarse mediante:

    ON DELETE CASCADE

cuando se elimina el turno correspondiente.

---

# 18. ESTADO ACTUAL DEL PROYECTO

Ya existe:

- Modelo Employee.
- Modelo Turn.
- Modelo WorkPeriod.
- EmployeeRepository.
- TurnRepository.
- EmployeeTurnRepository.
- EmployeeService.
- Capa database con get_connection().
- Carpeta API.
- Aplicación inicial por consola en main.py.

Pendiente o en desarrollo:

- Revisar y completar la API.
- Crear TurnService.
- Crear EmployeeTurnService.
- Conectar API con Services.
- Revisar WorkPeriod y unificar su constructor.
- Corregir EmployeeTurnRepository.
- Definir endpoints HTTP.
- Construir interfaz web si corresponde a la siguiente etapa.
- Implementar funcionalidades completas de asistencia.

---

# 19. REGLAS PARA FUTURAS MODIFICACIONES

Cuando se solicite modificar el proyecto:

1. Respetar la estructura existente.
2. No crear carpetas nuevas sin necesidad.
3. No cambiar de framework o arquitectura sin autorización.
4. No mover clases existentes sin indicación.
5. Mantener Repository → Service → API.
6. Mantener los modelos como entidades del dominio.
7. No duplicar código existente.
8. Reutilizar repositories y services.
9. Mantener los nombres actuales de métodos salvo que exista una razón
   clara para cambiarlos.
10. Si se cambia un método, revisar todos sus consumidores.
11. Entregar archivos completos cuando el usuario solicite
    "archivo completo".
12. Explicar qué archivos cambian y por qué.
13. No modificar archivos que no sean necesarios.
14. No inventar contenido de archivos que no fueron proporcionados.
15. Antes de hacer cambios estructurales importantes, solicitar el
    código faltante.
16. Mantener compatibilidad con SQLite.
17. Mantener la convención de días:
       1 lunes
       2 martes
       3 miércoles
       4 jueves
       5 viernes
       6 sábado
       7 domingo

---

# 20. ESTADO DE LA APLICACIÓN FINAL DESEADA

El objetivo final es disponer de una aplicación web de gestión de
asistencia.

Conceptualmente:

    Navegador
        ↓
    API
        ↓
    Services
        ↓
    Repositories
        ↓
    SQLite

El usuario debería poder gestionar empleados y turnos desde la
aplicación y posteriormente utilizar esa información para registrar y
consultar asistencia.

La implementación debe hacerse progresivamente sin romper las capas
ya construidas.

---

# 21. INFORMACIÓN QUE FALTA INCORPORAR A ESTE DOCUMENTO

Para completar definitivamente este contexto, falta documentar el
código real de:

- Árbol completo del proyecto.
- Contenido de `api/`.
- Contenido completo de `models/`.
- `EmployeeRepository`.
- `database/connection.py`.
- Esquema/migraciones de SQLite.
- Definición exacta de `Turn`.
- Definición exacta de `WorkPeriod`.
- Definición exacta de `Employee`.
- Endpoints API existentes, si ya existen.
- Framework web/API utilizado.
- Configuración actual de ejecución.
- Requisitos funcionales finales del sistema.

NO inventar esta información.

Debe agregarse cuando sea proporcionada por el usuario.