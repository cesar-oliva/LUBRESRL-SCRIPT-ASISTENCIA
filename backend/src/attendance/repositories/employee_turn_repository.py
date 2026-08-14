from src.attendance.database.connection import get_connection
from src.attendance.models.turn import Turn, WorkPeriod

class EmployeeTurnRepository:

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def assign_turn(
        self,
        employee_number,
        turn_id,
        day_of_week
    ):
        """
        Asigna un turno a un empleado para un día de la semana.

        day_of_week:
            1 = lunes
            2 = martes
            3 = miércoles
            4 = jueves
            5 = viernes
            6 = sábado
            7 = domingo
        """

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7"
            )

        connection = get_connection()

        try:
            connection.execute(
                """
                INSERT INTO employee_turns (
                    employee_number,
                    turn_id,
                    day_of_week
                )
                VALUES (?, ?, ?)
                """,
                (
                    employee_number,
                    turn_id,
                    day_of_week
                )
            )

            connection.commit()

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - TURNO DE UN DÍA
    # ---------------------------------------------------------

    def get_turn_for_day(
        self,
        employee_number,
        day_of_week
    ):
        """
        Obtiene el turno asignado a un empleado
        para un día específico.

        Retorna:
            Turn | None
        """

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7"
            )

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    t.id,
                    t.code,
                    t.name,
                    t.active
                FROM employee_turns et
                INNER JOIN turns t
                    ON t.id = et.turn_id
                WHERE et.employee_number = ?
                  AND et.day_of_week = ?
                """,
                (
                    employee_number,
                    day_of_week
                )
            ).fetchone()

            if row is None:
                return None

            return self._row_to_turn(
                connection,
                row
            )

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - TODOS LOS TURNOS DEL EMPLEADO
    # ---------------------------------------------------------

    def get_employee_schedule(self, employee_number):
        """
        Obtiene todos los turnos asignados a un empleado.

        Retorna:
            list[dict]

        Ejemplo:

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
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    et.day_of_week,
                    t.id,
                    t.code,
                    t.name,
                    t.active
                FROM employee_turns et
                INNER JOIN turns t
                    ON t.id = et.turn_id
                WHERE et.employee_number = ?
                ORDER BY et.day_of_week
                """,
                (employee_number,)
            ).fetchall()

            result = []

            for row in rows:
                turn = self._row_to_turn(
                    connection,
                    row
                )

                result.append({
                    "day_of_week": row["day_of_week"],
                    "turn": turn
                })

            return result

        finally:
            connection.close()

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def remove_turn(
        self,
        employee_number,
        day_of_week
    ):
        """
        Elimina la asignación de turno
        para un empleado y día.

        Retorna:
            bool
        """

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7"
            )

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                DELETE FROM employee_turns
                WHERE employee_number = ?
                  AND day_of_week = ?
                """,
                (
                    employee_number,
                    day_of_week
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
    # EXISTS
    # ---------------------------------------------------------

    def exists(
        self,
        employee_number,
        day_of_week
    ):
        """
        Comprueba si un empleado tiene
        un turno asignado para un día.
        """

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7"
            )

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT 1
                FROM employee_turns
                WHERE employee_number = ?
                  AND day_of_week = ?
                LIMIT 1
                """,
                (
                    employee_number,
                    day_of_week
                )
            ).fetchone()

            return row is not None

        finally:
            connection.close()

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def update_turn(
        self,
        employee_number,
        day_of_week,
        turn_id
    ):
        """
        Cambia el turno asignado a un empleado
        para un determinado día.

        Retorna:
            bool
        """

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7"
            )

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                UPDATE employee_turns
                SET turn_id = ?
                WHERE employee_number = ?
                  AND day_of_week = ?
                """,
                (
                    turn_id,
                    employee_number,
                    day_of_week
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
    # PRIVATE
    # ---------------------------------------------------------

    def _row_to_turn(
        self,
        connection,
        row
    ):
        """
        Convierte una fila SQLite en un objeto Turn,
        incluyendo sus períodos.
        """

        turn_id = row["id"]

        period_rows = connection.execute(
            """
            SELECT
                start_time,
                end_time
            FROM turn_periods
            WHERE turn_id = ?
            ORDER BY period_order
            """,
            (turn_id,)
        ).fetchall()

        periods = [
            WorkPeriod(
                start_time=period["start_time"],
                end_time=period["end_time"]
            )
            for period in period_rows
        ]

        return Turn(
            id=row["id"],
            code=row["code"],
            name=row["name"],
            periods=periods,
            active=bool(row["active"])
        )