from src.attendance.database.connection import get_connection
from src.attendance.models.special_code import SpecialCode


class SpecialCodeRepository:

    def __init__(self):
        connection = get_connection()
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS special_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    code TEXT NOT NULL UNIQUE,
                    description TEXT NOT NULL,
                    active INTEGER NOT NULL DEFAULT 1
                )
                """
            )
            connection.commit()
        finally:
            connection.close()

    def get_all(self):
        connection = get_connection()
        try:
            rows = connection.execute(
                "SELECT id, code, description, active FROM special_codes ORDER BY code"
            ).fetchall()
            return [self._to_model(row) for row in rows]
        finally:
            connection.close()

    def get_active(self):
        connection = get_connection()
        try:
            rows = connection.execute(
                """
                SELECT id, code, description, active
                FROM special_codes
                WHERE active = 1
                ORDER BY code
                """
            ).fetchall()
            return [self._to_model(row) for row in rows]
        finally:
            connection.close()

    def get_by_id(self, special_code_id):
        connection = get_connection()
        try:
            row = connection.execute(
                "SELECT id, code, description, active FROM special_codes WHERE id = ?",
                (special_code_id,),
            ).fetchone()
            return self._to_model(row) if row else None
        finally:
            connection.close()

    def exists_code(self, code, exclude_id=None):
        connection = get_connection()
        try:
            query = "SELECT 1 FROM special_codes WHERE code = ?"
            params = [code]
            if exclude_id is not None:
                query += " AND id != ?"
                params.append(exclude_id)
            return connection.execute(query, params).fetchone() is not None
        finally:
            connection.close()

    def save(self, special_code):
        connection = get_connection()
        try:
            cursor = connection.execute(
                "INSERT INTO special_codes (code, description, active) VALUES (?, ?, ?)",
                (special_code.code, special_code.description, int(special_code.active)),
            )
            connection.commit()
            special_code.id = cursor.lastrowid
            return special_code
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def update(self, special_code):
        connection = get_connection()
        try:
            cursor = connection.execute(
                """
                UPDATE special_codes
                SET code = ?, description = ?, active = ?
                WHERE id = ?
                """,
                (special_code.code, special_code.description, int(special_code.active), special_code.id),
            )
            connection.commit()
            return cursor.rowcount > 0
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def delete(self, special_code_id):
        connection = get_connection()
        try:
            cursor = connection.execute("DELETE FROM special_codes WHERE id = ?", (special_code_id,))
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    @staticmethod
    def _to_model(row):
        return SpecialCode(
            id=row['id'],
            code=row['code'],
            description=row['description'],
            active=bool(row['active']),
        )