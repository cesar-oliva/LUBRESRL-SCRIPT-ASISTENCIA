from src.attendance.models.turn import Turn, WorkPeriod
from src.attendance.database.connection import get_connection


class TurnRepository:

    # ---------------------------------------------------------
    # CREATE
    # ---------------------------------------------------------

    def save(self, turn):
        """
        Guarda un nuevo turno y sus períodos.

        Retorna:
            Turn: turno guardado.
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO turns (
                    code,
                    name,
                    active
                )
                VALUES (?, ?, ?)
                """,
                (
                    turn.code,
                    turn.name,
                    int(turn.active)
                )
            )

            turn.id = cursor.lastrowid

            for period_order, period in enumerate(
                turn.periods,
                start=1
            ):
                connection.execute(
                    """
                    INSERT INTO turn_periods (
                        turn_id,
                        period_order,
                        start_time,
                        end_time
                    )
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        turn.id,
                        period_order,
                        period.start_time,
                        period.end_time
                    )
                )

            connection.commit()

            return turn

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
        Obtiene todos los turnos.

        Retorna:
            list[Turn]
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    id,
                    code,
                    name,
                    active
                FROM turns
                ORDER BY id
                """
            ).fetchall()

            return [
                self._row_to_turn(connection, row)
                for row in rows
            ]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # READ - POR ID
    # ---------------------------------------------------------

    def get_by_id(self, turn_id):
        """
        Busca un turno por ID.

        Retorna:
            Turn | None
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    id,
                    code,
                    name,
                    active
                FROM turns
                WHERE id = ?
                """,
                (turn_id,)
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
    # READ - POR CÓDIGO
    # ---------------------------------------------------------

    def get_by_code(self, code):
        """
        Busca un turno por código.

        Ejemplo:
            T1
            T2
            T14

        Retorna:
            Turn | None
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    id,
                    code,
                    name,
                    active
                FROM turns
                WHERE code = ?
                """,
                (code,)
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
    # READ - ACTIVOS
    # ---------------------------------------------------------

    def get_active(self):
        """
        Obtiene solamente turnos activos.

        Retorna:
            list[Turn]
        """

        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    id,
                    code,
                    name,
                    active
                FROM turns
                WHERE active = 1
                ORDER BY id
                """
            ).fetchall()

            return [
                self._row_to_turn(connection, row)
                for row in rows
            ]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # UPDATE
    # ---------------------------------------------------------

    def update(self, turn):
        """
        Actualiza un turno y sus períodos.

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                UPDATE turns
                SET
                    code = ?,
                    name = ?,
                    active = ?
                WHERE id = ?
                """,
                (
                    turn.code,
                    turn.name,
                    int(turn.active),
                    turn.id
                )
            )

            if cursor.rowcount == 0:
                connection.rollback()
                return False

            # Reemplazamos los períodos actuales
            connection.execute(
                """
                DELETE FROM turn_periods
                WHERE turn_id = ?
                """,
                (turn.id,)
            )

            for period_order, period in enumerate(
                turn.periods,
                start=1
            ):
                connection.execute(
                    """
                    INSERT INTO turn_periods (
                        turn_id,
                        period_order,
                        start_time,
                        end_time
                    )
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        turn.id,
                        period_order,
                        period.start_time,
                        period.end_time
                    )
                )

            connection.commit()

            return True

        except Exception:
            connection.rollback()
            raise

        finally:
            connection.close()

    # ---------------------------------------------------------
    # DELETE
    # ---------------------------------------------------------

    def delete(self, turn_id):
        """
        Elimina un turno.

        Los períodos se eliminan automáticamente por
        ON DELETE CASCADE.

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                DELETE FROM turns
                WHERE id = ?
                """,
                (turn_id,)
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

    def exists(self, turn_id):
        """
        Comprueba si existe un turno.

        Retorna:
            bool
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT 1
                FROM turns
                WHERE id = ?
                LIMIT 1
                """,
                (turn_id,)
            ).fetchone()

            return row is not None

        finally:
            connection.close()

    # ---------------------------------------------------------
    # COUNT
    # ---------------------------------------------------------

    def count(self):
        """
        Devuelve la cantidad total de turnos.
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT COUNT(*)
                FROM turns
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
        Devuelve la cantidad de turnos activos.
        """

        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT COUNT(*)
                FROM turns
                WHERE active = 1
                """
            ).fetchone()

            return row[0]

        finally:
            connection.close()

    # ---------------------------------------------------------
    # PRIVATE
    # ---------------------------------------------------------

    def _row_to_turn(self, connection, row):
        """
        Convierte una fila SQLite en un objeto Turn,
        incluyendo sus períodos.
        """

        period_rows = connection.execute(
            """
            SELECT
                start_time,
                end_time
            FROM turn_periods
            WHERE turn_id = ?
            ORDER BY period_order
            """,
            (row["id"],)
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