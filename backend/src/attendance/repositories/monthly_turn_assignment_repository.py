from src.attendance.database.connection import get_connection


class MonthlyTurnAssignmentRepository:

    def __init__(self):
        connection = get_connection()
        try:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS monthly_turn_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    period TEXT NOT NULL,
                    assignment_date TEXT NOT NULL,
                    employee_number INTEGER NOT NULL,
                    assignment_code TEXT NOT NULL,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (period, assignment_date, employee_number)
                )
                """
            )
            connection.commit()
        finally:
            connection.close()

    def get_code(self, period, assignment_date, employee_number):
        connection = get_connection()
        try:
            row = connection.execute(
                """
                SELECT assignment_code
                FROM monthly_turn_assignments
                WHERE period = ?
                  AND assignment_date = ?
                  AND employee_number = ?
                """,
                (period, assignment_date.isoformat(), employee_number),
            ).fetchone()
            return row["assignment_code"] if row else None
        finally:
            connection.close()

    def save_code(self, period, assignment_date, employee_number, assignment_code):
        connection = get_connection()
        try:
            connection.execute(
                """
                INSERT INTO monthly_turn_assignments (
                    period, assignment_date, employee_number, assignment_code
                ) VALUES (?, ?, ?, ?)
                ON CONFLICT(period, assignment_date, employee_number)
                DO UPDATE SET
                    assignment_code = excluded.assignment_code,
                    updated_at = CURRENT_TIMESTAMP
                """,
                (period, assignment_date.isoformat(), employee_number, assignment_code),
            )
            connection.commit()
        finally:
            connection.close()