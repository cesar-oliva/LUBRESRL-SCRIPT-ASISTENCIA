from src.attendance.database.connection import get_connection
from src.attendance.models.holiday import Holiday


class HolidayRepository:

    def save(self, holiday):
        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO holidays (
                    date,
                    reason,
                    active
                )
                VALUES (?, ?, ?)
                """,
                (
                    holiday.date,
                    holiday.reason,
                    int(holiday.active)
                )
            )

            connection.commit()
            holiday.id = cursor.lastrowid
            return holiday
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def get_all(self):
        connection = get_connection()

        try:
            rows = connection.execute(
                """
                SELECT
                    id,
                    date,
                    reason,
                    active
                FROM holidays
                ORDER BY date
                """
            ).fetchall()

            return [
                Holiday(
                    id=row["id"],
                    date=row["date"],
                    reason=row["reason"],
                    active=bool(row["active"])
                )
                for row in rows
            ]
        finally:
            connection.close()

    def get_by_id(self, holiday_id):
        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    id,
                    date,
                    reason,
                    active
                FROM holidays
                WHERE id = ?
                """,
                (holiday_id,)
            ).fetchone()

            if row is None:
                return None

            return Holiday(
                id=row["id"],
                date=row["date"],
                reason=row["reason"],
                active=bool(row["active"])
            )
        finally:
            connection.close()

    def get_by_date(self, holiday_date):
        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT
                    id,
                    date,
                    reason,
                    active
                FROM holidays
                WHERE date = ?
                """,
                (holiday_date,)
            ).fetchone()

            if row is None:
                return None

            return Holiday(
                id=row["id"],
                date=row["date"],
                reason=row["reason"],
                active=bool(row["active"])
            )
        finally:
            connection.close()

    def update(self, holiday):
        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                UPDATE holidays
                SET
                    date = ?,
                    reason = ?,
                    active = ?
                WHERE id = ?
                """,
                (
                    holiday.date,
                    holiday.reason,
                    int(holiday.active),
                    holiday.id
                )
            )

            connection.commit()
            return cursor.rowcount > 0
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def delete(self, holiday_id):
        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                DELETE FROM holidays
                WHERE id = ?
                """,
                (holiday_id,)
            )

            connection.commit()
            return cursor.rowcount > 0
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def exists(self, holiday_id):
        connection = get_connection()

        try:
            row = connection.execute(
                """
                SELECT 1
                FROM holidays
                WHERE id = ?
                LIMIT 1
                """,
                (holiday_id,)
            ).fetchone()

            return row is not None
        finally:
            connection.close()

    def count(self):
        connection = get_connection()

        try:
            row = connection.execute(
                "SELECT COUNT(*) FROM holidays"
            ).fetchone()

            return row[0]
        finally:
            connection.close()
