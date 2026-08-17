from src.attendance.database.connection import get_connection
from src.attendance.models.attendance_report import AttendanceReport


class AttendanceReportRepository:

    def save(self, report):
        connection = get_connection()

        try:
            cursor = connection.execute(
                """
                INSERT INTO attendance_reports (
                    period,
                    employee_number,
                    employee_name,
                    report_date,
                    turn_code,
                    expected_entry,
                    actual_entry,
                    expected_exit,
                    actual_exit,
                    status,
                    observation,
                    minutes_late,
                    minutes_early,
                    active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    report.period,
                    report.employee_number,
                    report.employee_name,
                    report.report_date,
                    report.turn_code,
                    report.expected_entry,
                    report.actual_entry,
                    report.expected_exit,
                    report.actual_exit,
                    report.status,
                    report.observation,
                    report.minutes_late,
                    report.minutes_early,
                    int(report.active)
                )
            )

            connection.commit()
            report.id = cursor.lastrowid
            return report
        finally:
            connection.close()

    def get_by_period(self, period):
        connection = get_connection()
        try:
            rows = connection.execute(
                """
                SELECT *
                FROM attendance_reports
                WHERE period = ?
                ORDER BY report_date, employee_number
                """,
                (period,),
            ).fetchall()

            return [
                AttendanceReport(
                    id=row["id"],
                    period=row["period"],
                    employee_number=row["employee_number"],
                    employee_name=row["employee_name"],
                    report_date=row["report_date"],
                    turn_code=row["turn_code"],
                    expected_entry=row["expected_entry"],
                    actual_entry=row["actual_entry"],
                    expected_exit=row["expected_exit"],
                    actual_exit=row["actual_exit"],
                    status=row["status"],
                    observation=row["observation"],
                    minutes_late=row["minutes_late"],
                    minutes_early=row["minutes_early"],
                    active=bool(row["active"]),
                )
                for row in rows
            ]
        finally:
            connection.close()

    def update_observation(self, report_id, observation):
        connection = get_connection()
        try:
            cursor = connection.execute(
                """
                UPDATE attendance_reports
                SET observation = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (observation, report_id),
            )
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    def delete_by_period(self, period):
        connection = get_connection()
        try:
            cursor = connection.execute(
                """
                DELETE FROM attendance_reports
                WHERE period = ?
                """,
                (period,),
            )
            connection.commit()
            return cursor.rowcount
        finally:
            connection.close()

    def get_by_id(self, report_id):
        connection = get_connection()
        try:
            row = connection.execute(
                """
                SELECT *
                FROM attendance_reports
                WHERE id = ?
                """,
                (report_id,),
            ).fetchone()

            if row is None:
                return None

            return AttendanceReport(
                id=row["id"],
                period=row["period"],
                employee_number=row["employee_number"],
                employee_name=row["employee_name"],
                report_date=row["report_date"],
                turn_code=row["turn_code"],
                expected_entry=row["expected_entry"],
                actual_entry=row["actual_entry"],
                expected_exit=row["expected_exit"],
                actual_exit=row["actual_exit"],
                status=row["status"],
                observation=row["observation"],
                minutes_late=row["minutes_late"],
                minutes_early=row["minutes_early"],
                active=bool(row["active"]),
            )
        finally:
            connection.close()
