from src.attendance.models.employee import Employee
from src.attendance.database.connection import get_connection


class EmployeeRepository:

    def __init__(self):
        connection = get_connection()
        try:
            columns = connection.execute("PRAGMA table_info(employees)").fetchall()
            if columns and not any(row["name"] == "sector" for row in columns):
                connection.execute("ALTER TABLE employees ADD COLUMN sector TEXT NOT NULL DEFAULT ''")
                connection.commit()
        finally:
            connection.close()

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def save(self, employee):
        """
        Guarda un nuevo empleado en SQLite.

        Retorna:
            Employee: empleado guardado.

        Lanza:
            ValueError: si el legajo ya existe.
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO employees (
                    employee_number,
                    name,
                    sector,
                    active
                )
                VALUES (?, ?, ?, ?)
                """,
                (
                    employee.employee_number,
                    employee.name,
                    employee.sector,
                    int(employee.active)
                )
            )

            connection.commit()

            return employee

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - TODOS
    # ---------------------------------------------------------

    def get_all(self):
        """
        Obtiene todos los empleados.

        Retorna:
            list[Employee]
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    employee_number,
                    name,
                    sector,
                    active
                FROM employees
                ORDER BY employee_number
                """
            ).fetchall()

            return [
                Employee(
                    employee_number=row["employee_number"],
                    name=row["name"],
                    sector=row["sector"],
                    active=bool(row["active"])
                )
                for row in rows
            ]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - POR LEGAJO
    # ---------------------------------------------------------

    def get_by_employee_number(self, employee_number):
        """
        Busca un empleado por legajo.

        Retorna:
            Employee | None
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    employee_number,
                    name,
                    sector,
                    active
                FROM employees
                WHERE employee_number = ?
                """,
                (employee_number,)
            ).fetchone()

            if row is None:
                return None

            return Employee(
                employee_number=row["employee_number"],
                name=row["name"],
                sector=row["sector"],
                active=bool(row["active"])
            )

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - POR NOMBRE
    # ---------------------------------------------------------

    def find_by_name(self, name):
        """
        Busca empleados cuyo nombre contenga el texto indicado.

        La búsqueda no distingue mayúsculas/minúsculas.

        Retorna:
            list[Employee]
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    employee_number,
                    name,
                    sector,
                    active
                FROM employees
                WHERE name LIKE ?
                ORDER BY name
                """,
                (f"%{name}%",)
            ).fetchall()

            return [
                Employee(
                    employee_number=row["employee_number"],
                    name=row["name"],
                    sector=row["sector"],
                    active=bool(row["active"])
                )
                for row in rows
            ]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - ACTIVOS
    # ---------------------------------------------------------

    def get_active(self):
        """
        Obtiene solamente empleados activos.

        Retorna:
            list[Employee]
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    employee_number,
                    name,
                    sector,
                    active
                FROM employees
                WHERE active = 1
                ORDER BY employee_number
                """
            ).fetchall()

            return [
                Employee(
                    employee_number=row["employee_number"],
                    name=row["name"],
                    sector=row["sector"],
                    active=True
                )
                for row in rows
            ]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def update(self, employee):
        """
        Actualiza un empleado existente.

        Retorna:
            bool:
                True  -> se actualizó
                False -> el legajo no existe
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                UPDATE employees
                SET
                    name = ?,
                    sector = ?,
                    active = ?
                WHERE employee_number = ?
                """,
                (
                    employee.name,
                    employee.sector,
                    int(employee.active),
                    employee.employee_number
                )
            )

            connection.commit()

            return cursor.rowcount > 0

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # UPDATE - ESTADO
    # ---------------------------------------------------------

    def set_active(self, employee_number, active):
        """
        Activa o desactiva un empleado.

        Ejemplo:

            set_active(501, False)

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                UPDATE employees
                SET active = ?
                WHERE employee_number = ?
                """,
                (
                    int(active),
                    employee_number
                )
            )

            connection.commit()

            return cursor.rowcount > 0

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def delete(self, employee_number):
        """
        Elimina físicamente un empleado.

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                DELETE FROM employees
                WHERE employee_number = ?
                """,
                (employee_number,)
            )

            connection.commit()

            return cursor.rowcount > 0

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # EXISTS
    # ---------------------------------------------------------

    def exists(self, employee_number):
        """
        Comprueba si existe un empleado.

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT 1
                FROM employees
                WHERE employee_number = ?
                LIMIT 1
                """,
                (employee_number,)
            ).fetchone()

            return row is not None

        finally:
            connection.close()

    # ---------------------------------------------------------
    # COUNT
    # ---------------------------------------------------------

    def count(self):
        """
        Devuelve la cantidad total de empleados.
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT COUNT(*)
                FROM employees
                """
            ).fetchone()

            return row[0]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # COUNT ACTIVE
    # ---------------------------------------------------------

    def count_active(self):
        """
        Devuelve la cantidad de empleados activos.
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT COUNT(*)
                FROM employees
                WHERE active = 1
                """
            ).fetchone()

            return row[0]

        finally:
            connection.close()