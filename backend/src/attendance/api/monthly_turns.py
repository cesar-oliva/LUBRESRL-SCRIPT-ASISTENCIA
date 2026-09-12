import calendar
import re
from datetime import date

from fastapi import APIRouter, HTTPException

from src.attendance.api.schemas import MonthlyTurnPlanRequest
from src.attendance.database.connection import get_connection


router = APIRouter(prefix="/monthly-turns", tags=["Monthly Turn Assignments"])
PERIOD_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def _validate_period(period):
    if not PERIOD_PATTERN.fullmatch(period):
        raise HTTPException(status_code=400, detail="El período debe tener formato YYYY-MM.")


def _ensure_table(connection):
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
            FOREIGN KEY (employee_number) REFERENCES employees(employee_number)
                ON DELETE CASCADE,
            UNIQUE (period, assignment_date, employee_number)
        )
        """
    )
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


def _period_dates(period):
    year, month = (int(value) for value in period.split("-"))
    return [date(year, month, day).isoformat() for day in range(1, calendar.monthrange(year, month)[1] + 1)]


@router.get("/{period}")
def get_monthly_turn_plan(period: str):
    _validate_period(period)
    connection = get_connection()
    try:
        _ensure_table(connection)
        employees = connection.execute(
            """
            SELECT employee_number, name, sector, active
            FROM employees
            WHERE active = 1
            ORDER BY sector, employee_number
            """
        ).fetchall()
        rows = connection.execute(
            """
            SELECT employee_number, assignment_date, assignment_code
            FROM monthly_turn_assignments
            WHERE period = ?
            """,
            (period,),
        ).fetchall()
        assignments = {
            (row["employee_number"], row["assignment_date"]): row["assignment_code"]
            for row in rows
        }
        dates = _period_dates(period)
        return {
            "period": period,
            "dates": dates,
            "employees": [
                {
                    "employee_number": employee["employee_number"],
                    "name": employee["name"],
                    "sector": employee["sector"] or "Sin sector",
                    "active": bool(employee["active"]),
                    "assignments": {
                        assignment_date: assignments.get((employee["employee_number"], assignment_date), "")
                        for assignment_date in dates
                    },
                }
                for employee in employees
            ],
        }
    finally:
        connection.close()


@router.put("/{period}")
def save_monthly_turn_plan(period: str, payload: MonthlyTurnPlanRequest):
    _validate_period(period)
    valid_dates = set(_period_dates(period))
    connection = get_connection()
    try:
        _ensure_table(connection)
        allowed_codes = {
            row["code"]
            for row in connection.execute(
                """
                SELECT code FROM turns WHERE active = 1
                UNION
                SELECT code FROM special_codes WHERE active = 1
                """
            ).fetchall()
        }
        for assignment in payload.assignments:
            if assignment.assignment_date not in valid_dates:
                raise HTTPException(status_code=400, detail=f"La fecha {assignment.assignment_date} no pertenece al período.")
            employee_exists = connection.execute(
                "SELECT 1 FROM employees WHERE employee_number = ? AND active = 1",
                (assignment.employee_number,),
            ).fetchone()
            if employee_exists is None:
                raise HTTPException(status_code=400, detail=f"No existe el empleado {assignment.employee_number}.")
            assignment_code = assignment.assignment_code.strip().upper()
            if not assignment_code:
                raise HTTPException(status_code=400, detail="El código de asignación no puede estar vacío.")
            if assignment_code not in allowed_codes:
                raise HTTPException(
                    status_code=400,
                    detail=f"El código {assignment_code} no existe o no está activo como turno o código especial.",
                )

        connection.execute("DELETE FROM monthly_turn_assignments WHERE period = ?", (period,))
        connection.executemany(
            """
            INSERT INTO monthly_turn_assignments (
                period, assignment_date, employee_number, assignment_code
            ) VALUES (?, ?, ?, ?)
            """,
            [
                (period, item.assignment_date, item.employee_number, item.assignment_code.strip().upper())
                for item in payload.assignments
                if item.assignment_code.strip()
            ],
        )
        connection.commit()
        return {"period": period, "saved": len(payload.assignments)}
    except HTTPException:
        connection.rollback()
        raise
    except Exception as error:
        connection.rollback()
        raise HTTPException(status_code=400, detail=str(error))
    finally:
        connection.close()