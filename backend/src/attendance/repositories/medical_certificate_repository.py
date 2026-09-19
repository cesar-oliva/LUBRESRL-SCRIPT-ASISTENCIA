from src.attendance.database.connection import get_connection
from src.attendance.models.medical_certificate import MedicalCertificate


class MedicalCertificateRepository:

    def __init__(self):
        connection = get_connection()
        try:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS medical_certificates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_number INTEGER NOT NULL,
                    original_filename TEXT NOT NULL,
                    stored_filename TEXT NOT NULL UNIQUE,
                    valid_from TEXT NOT NULL,
                    valid_until TEXT NOT NULL,
                    days_count INTEGER NOT NULL,
                    active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS medical_certificate_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    certificate_id INTEGER NOT NULL,
                    assignment_date TEXT NOT NULL,
                    previous_code TEXT,
                    UNIQUE (certificate_id, assignment_date)
                );
                """
            )
            connection.commit()
        finally:
            connection.close()

    def get_all(self):
        connection = get_connection()
        try:
            rows = connection.execute(
                """
                SELECT c.*, e.name AS employee_name
                FROM medical_certificates c
                JOIN employees e ON e.employee_number = c.employee_number
                ORDER BY c.valid_from DESC, c.id DESC
                """
            ).fetchall()
            return [self._to_model(row) for row in rows]
        finally:
            connection.close()

    def get_active_covering_period(self, period):
        connection = get_connection()
        try:
            period_start = f"{period}-01"
            year, month = (int(value) for value in period.split("-"))
            next_month = month % 12 + 1
            next_year = year + (1 if month == 12 else 0)
            period_end = f"{next_year:04d}-{next_month:02d}-01"
            rows = connection.execute(
                """
                SELECT c.*, e.name AS employee_name
                FROM medical_certificates c
                JOIN employees e ON e.employee_number = c.employee_number
                WHERE c.active = 1
                                    AND c.valid_from < ?
                  AND c.valid_until >= ?
                """,
                                (period_end, period_start),
            ).fetchall()
            return [self._to_model(row) for row in rows]
        finally:
            connection.close()

    def get_by_id(self, certificate_id):
        connection = get_connection()
        try:
            row = connection.execute(
                """
                SELECT c.*, e.name AS employee_name
                FROM medical_certificates c
                JOIN employees e ON e.employee_number = c.employee_number
                WHERE c.id = ?
                """,
                (certificate_id,),
            ).fetchone()
            return self._to_model(row) if row else None
        finally:
            connection.close()

    def has_overlap(self, employee_number, valid_from, valid_until, exclude_id=None):
        connection = get_connection()
        try:
            query = """
                SELECT 1 FROM medical_certificates
                WHERE employee_number = ? AND active = 1
                  AND valid_from <= ? AND valid_until >= ?
            """
            params = [employee_number, valid_until.isoformat(), valid_from.isoformat()]
            if exclude_id is not None:
                query += " AND id != ?"
                params.append(exclude_id)
            return connection.execute(query, params).fetchone() is not None
        finally:
            connection.close()

    def save(self, certificate):
        connection = get_connection()
        try:
            cursor = connection.execute(
                """
                INSERT INTO medical_certificates (
                    employee_number, original_filename, stored_filename,
                    valid_from, valid_until, days_count, active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    certificate.employee_number,
                    certificate.original_filename,
                    certificate.stored_filename,
                    certificate.valid_from.isoformat(),
                    certificate.valid_until.isoformat(),
                    certificate.days_count,
                    int(certificate.active),
                ),
            )
            connection.commit()
            certificate.id = cursor.lastrowid
            return certificate
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

    def update(self, certificate):
        connection = get_connection()
        try:
            cursor = connection.execute(
                """
                UPDATE medical_certificates
                SET employee_number = ?, original_filename = ?, valid_from = ?,
                    valid_until = ?, days_count = ?, active = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                """,
                (
                    certificate.employee_number,
                    certificate.original_filename,
                    certificate.valid_from.isoformat(),
                    certificate.valid_until.isoformat(),
                    certificate.days_count,
                    int(certificate.active),
                    certificate.id,
                ),
            )
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    def delete(self, certificate_id):
        connection = get_connection()
        try:
            connection.execute(
                "DELETE FROM medical_certificate_assignments WHERE certificate_id = ?",
                (certificate_id,),
            )
            cursor = connection.execute(
                "DELETE FROM medical_certificates WHERE id = ?",
                (certificate_id,),
            )
            connection.commit()
            return cursor.rowcount > 0
        finally:
            connection.close()

    def save_assignment_snapshot(self, certificate_id, assignment_date, previous_code):
        connection = get_connection()
        try:
            connection.execute(
                """
                INSERT OR REPLACE INTO medical_certificate_assignments
                    (certificate_id, assignment_date, previous_code)
                VALUES (?, ?, ?)
                """,
                (certificate_id, assignment_date.isoformat(), previous_code),
            )
            connection.commit()
        finally:
            connection.close()

    def get_assignment_snapshots(self, certificate_id):
        connection = get_connection()
        try:
            return connection.execute(
                """
                SELECT assignment_date, previous_code
                FROM medical_certificate_assignments
                WHERE certificate_id = ?
                ORDER BY assignment_date
                """,
                (certificate_id,),
            ).fetchall()
        finally:
            connection.close()

    @staticmethod
    def _to_model(row):
        return MedicalCertificate(
            id=row['id'],
            employee_number=row['employee_number'],
            employee_name=row['employee_name'],
            original_filename=row['original_filename'],
            stored_filename=row['stored_filename'],
            valid_from=row['valid_from'],
            valid_until=row['valid_until'],
            days_count=row['days_count'],
            active=bool(row['active']),
            created_at=row['created_at'],
        )