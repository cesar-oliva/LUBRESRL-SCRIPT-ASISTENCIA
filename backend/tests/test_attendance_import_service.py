from datetime import datetime

import pytest

from src.attendance.services.attendance_import_service import AttendanceImportService


@pytest.fixture
def service():
    return AttendanceImportService()


def _row(employee_number, dt, registration):
    return {
        "employee_number": employee_number,
        "date_time": dt,
        "registration": registration,
    }


def test_import_normal_entry_and_exit(service):
    rows = [
        _row(1001, "2026-07-13 08:07:00", 0),
        _row(1001, "2026-07-13 16:02:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["summary"]["total_imported"] == 1
    assert result["entries"][0]["status"] == "EN_HORARIO"
    assert result["entries"][0]["observation"]


def test_import_late_arrival(service):
    rows = [
        _row(1001, "2026-07-13 08:09:00", 0),
        _row(1001, "2026-07-13 16:00:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["status"] == "LLEGADA_TARDE"


def test_import_early_departure(service):
    rows = [
        _row(1001, "2026-07-13 08:00:00", 0),
        _row(1001, "2026-07-13 15:45:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["status"] == "SALIDA_ANTICIPADA"


def test_import_late_arrival_and_early_departure(service):
    rows = [
        _row(1001, "2026-07-13 08:09:00", 0),
        _row(1001, "2026-07-13 15:45:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["status"] == "LLEGADA_TARDE_Y_SALIDA_ANTICIPADA"


def test_import_without_entry(service):
    rows = [
        _row(1001, "2026-07-13 16:00:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["status"] == "SIN_REGISTRO_ENTRADA"


def test_import_without_exit(service):
    rows = [
        _row(1001, "2026-07-13 08:00:00", 0),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["status"] == "SIN_REGISTRO_SALIDA"


def test_import_without_any_record(service):
    rows = []

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["summary"]["total_imported"] == 0
    assert result["entries"] == []


def test_import_duplicate_record(service):
    rows = [
        _row(1001, "2026-07-13 08:07:00", 0),
        _row(1001, "2026-07-13 08:07:00", 0),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["summary"]["duplicated_records"] >= 1


def test_import_night_shift_crossing_midnight(service):
    rows = [
        _row(1001, "2026-07-13 20:58:00", 0),
        _row(1001, "2026-07-14 05:03:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["date"] == "2026-07-13"
    assert result["entries"][0]["state"] in {"EN_HORARIO", "LLEGADA_TARDE", "SIN_REGISTRO"}


def test_import_two_turns_same_day(service):
    rows = [
        _row(1001, "2026-07-13 08:00:00", 0),
        _row(1001, "2026-07-13 16:00:00", 1),
        _row(1001, "2026-07-13 18:00:00", 0),
        _row(1001, "2026-07-13 22:00:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert len(result["entries"]) >= 2


def test_import_record_outside_selected_period(service):
    rows = [
        _row(1001, "2026-06-30 08:00:00", 0),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["state"] == "REGISTRO_INCONSISTENTE"


def test_import_employee_without_turn(service):
    rows = [
        _row(9999, "2026-07-13 08:00:00", 0),
        _row(9999, "2026-07-13 16:00:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["state"] == "REGISTRO_INCONSISTENTE"


def test_import_turn_without_records(service):
    result = service.process_rows([], period="2026-07", tolerance_minutes=5)

    assert result["summary"]["total_imported"] == 0


def test_import_multiple_marks_for_same_employee(service):
    rows = [
        _row(1001, "2026-07-13 08:00:00", 0),
        _row(1001, "2026-07-13 08:10:00", 0),
        _row(1001, "2026-07-13 16:00:00", 1),
        _row(1001, "2026-07-13 18:00:00", 0),
        _row(1001, "2026-07-13 22:00:00", 1),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["summary"]["duplicated_records"] >= 1


def test_import_unsorted_rows(service):
    rows = [
        _row(1001, "2026-07-13 16:00:00", 1),
        _row(1001, "2026-07-13 08:00:00", 0),
    ]

    result = service.process_rows(rows, period="2026-07", tolerance_minutes=5)

    assert result["entries"][0]["date"] == "2026-07-13"
    assert result["entries"][0]["state"] in {"EN_HORARIO", "LLEGADA_TARDE"}
