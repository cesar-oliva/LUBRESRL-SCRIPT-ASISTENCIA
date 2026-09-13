from datetime import date, timedelta
from pathlib import Path
from uuid import uuid4

from src.attendance.database.connection import get_connection
from src.attendance.models.medical_certificate import MedicalCertificate
from src.attendance.repositories.employee_repository import EmployeeRepository
from src.attendance.repositories.medical_certificate_repository import (
    MedicalCertificateRepository,
)


class MedicalCertificateService:
    MEDICAL_CODE = "42"
    MEDICAL_CODE_DESCRIPTION = "CERTIFICADO MEDICO"

    def __init__(self, certificate_repository=None, employee_repository=None, media_dir=None):
        self.certificate_repository = certificate_repository or MedicalCertificateRepository()
        self.employee_repository = employee_repository or EmployeeRepository()
        self.media_dir = Path(media_dir or Path(__file__).resolve().parents[3] / "media" / "medical_certificates")
        self.media_dir.mkdir(parents=True, exist_ok=True)
        self._ensure_monthly_table()

    def list_certificates(self):
        return self.certificate_repository.get_all()

    def get_certificate(self, certificate_id):
        certificate = self.certificate_repository.get_by_id(certificate_id)
        if certificate is None:
            raise ValueError("Certificado médico no encontrado.")
        return certificate

    def create_certificate(self, employee_number, valid_from, valid_until, original_filename, contents):
        self._validate_employee(employee_number)
        start, end = self._validate_dates(valid_from, valid_until)
        self._validate_no_overlap(employee_number, start, end)
        self._ensure_medical_code()

        stored_filename = f"{uuid4().hex}{Path(original_filename).suffix.lower()}"
        file_path = self.media_dir / stored_filename
        file_path.write_bytes(contents)
        certificate = MedicalCertificate(
            employee_number=employee_number,
            original_filename=original_filename,
            stored_filename=stored_filename,
            valid_from=start,
            valid_until=end,
            days_count=(end - start).days + 1,
            active=True,
        )

        try:
            certificate = self.certificate_repository.save(certificate)
            self._apply_certificate(certificate)
            return self.get_certificate(certificate.id)
        except Exception:
            if certificate.id:
                self.certificate_repository.delete(certificate.id)
            file_path.unlink(missing_ok=True)
            raise

    def update_certificate(
        self,
        certificate_id,
        employee_number,
        valid_from,
        valid_until,
        original_filename=None,
        contents=None,
        active=True,
    ):
        current = self.get_certificate(certificate_id)
        self._validate_employee(employee_number)
        start, end = self._validate_dates(valid_from, valid_until)
        self._validate_no_overlap(employee_number, start, end, exclude_id=certificate_id)
        self._ensure_medical_code()

        old_file = self.media_dir / current.stored_filename
        stored_filename = current.stored_filename
        filename = original_filename or current.original_filename
        new_file = None
        if contents is not None and original_filename:
            stored_filename = f"{uuid4().hex}{Path(original_filename).suffix.lower()}"
            new_file = self.media_dir / stored_filename
            new_file.write_bytes(contents)

        try:
            self._restore_certificate(current)
            updated = MedicalCertificate(
                id=certificate_id,
                employee_number=employee_number,
                original_filename=filename,
                stored_filename=stored_filename,
                valid_from=start,
                valid_until=end,
                days_count=(end - start).days + 1,
                active=active,
            )
            if not self.certificate_repository.update(updated):
                raise ValueError("Certificado médico no encontrado.")
            self._clear_snapshots(certificate_id)
            if active:
                self._apply_certificate(updated)
            if new_file:
                old_file.unlink(missing_ok=True)
            return self.get_certificate(certificate_id)
        except Exception:
            if new_file:
                new_file.unlink(missing_ok=True)
            raise

    def delete_certificate(self, certificate_id):
        certificate = self.get_certificate(certificate_id)
        self._restore_certificate(certificate)
        deleted = self.certificate_repository.delete(certificate_id)
        if not deleted:
            raise ValueError("Certificado médico no encontrado.")
        (self.media_dir / certificate.stored_filename).unlink(missing_ok=True)

    def file_path(self, certificate_id):
        certificate = self.get_certificate(certificate_id)
        path = self.media_dir / certificate.stored_filename
        if not path.exists():
            raise FileNotFoundError("El archivo del certificado no existe.")
        return certificate, path

    def _apply_certificate(self, certificate):
        connection = get_connection()
        try:
            current = connection.execute(
                """
                SELECT assignment_date, assignment_code
                FROM monthly_turn_assignments
                WHERE employee_number = ? AND assignment_date BETWEEN ? AND ?
                """,
                (
                    certificate.employee_number,
                    certificate.valid_from.isoformat(),
                    certificate.valid_until.isoformat(),
                ),
            ).fetchall()
            current_by_date = {row["assignment_date"]: row["assignment_code"] for row in current}
            day = certificate.valid_from
            while day <= certificate.valid_until:
                previous_code = current_by_date.get(day.isoformat())
                connection.execute(
                    """
                    INSERT OR REPLACE INTO medical_certificate_assignments
                        (certificate_id, assignment_date, previous_code)
                    VALUES (?, ?, ?)
                    """,
                    (certificate.id, day.isoformat(), previous_code),
                )
                connection.execute(
                    """
                    INSERT INTO monthly_turn_assignments
                        (period, assignment_date, employee_number, assignment_code)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(period, assignment_date, employee_number)
                    DO UPDATE SET assignment_code = excluded.assignment_code,
                                  updated_at = CURRENT_TIMESTAMP
                    """,
                    (day.strftime("%Y-%m"), day.isoformat(), certificate.employee_number, self.MEDICAL_CODE),
                )
                day += timedelta(days=1)
            connection.commit()
        finally:
            connection.close()

    def _restore_certificate(self, certificate):
        connection = get_connection()
        try:
            snapshots = self.certificate_repository.get_assignment_snapshots(certificate.id)
            for row in snapshots:
                period = row["assignment_date"][:7]
                if row["previous_code"] is None:
                    connection.execute(
                        "DELETE FROM monthly_turn_assignments WHERE period = ? AND assignment_date = ? AND employee_number = ?",
                        (period, row["assignment_date"], certificate.employee_number),
                    )
                else:
                    connection.execute(
                        """
                        INSERT INTO monthly_turn_assignments
                            (period, assignment_date, employee_number, assignment_code)
                        VALUES (?, ?, ?, ?)
                        ON CONFLICT(period, assignment_date, employee_number)
                        DO UPDATE SET assignment_code = excluded.assignment_code,
                                      updated_at = CURRENT_TIMESTAMP
                        """,
                        (period, row["assignment_date"], certificate.employee_number, row["previous_code"]),
                    )
            connection.commit()
        finally:
            connection.close()

    def _clear_snapshots(self, certificate_id):
        connection = get_connection()
        try:
            connection.execute(
                "DELETE FROM medical_certificate_assignments WHERE certificate_id = ?",
                (certificate_id,),
            )
            connection.commit()
        finally:
            connection.close()

    def _ensure_medical_code(self):
        connection = get_connection()
        try:
            connection.execute(
                "INSERT OR IGNORE INTO special_codes (code, description, active) VALUES (?, ?, 1)",
                (self.MEDICAL_CODE, self.MEDICAL_CODE_DESCRIPTION),
            )
            connection.commit()
        finally:
            connection.close()

    @staticmethod
    def _ensure_monthly_table():
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

    def _validate_employee(self, employee_number):
        employee = self.employee_repository.get_by_employee_number(employee_number)
        if employee is None or not employee.active:
            raise ValueError("El empleado no existe o está inactivo.")

    def _validate_no_overlap(self, employee_number, valid_from, valid_until, exclude_id=None):
        if self.certificate_repository.has_overlap(employee_number, valid_from, valid_until, exclude_id):
            raise ValueError("El empleado ya tiene un certificado médico activo en ese período.")

    @staticmethod
    def _validate_dates(valid_from, valid_until):
        try:
            start = date.fromisoformat(valid_from)
            end = date.fromisoformat(valid_until)
        except (TypeError, ValueError):
            raise ValueError("Las fechas deben tener formato YYYY-MM-DD.")
        if end < start:
            raise ValueError("La fecha hasta no puede ser anterior a la fecha desde.")
        return start, end
