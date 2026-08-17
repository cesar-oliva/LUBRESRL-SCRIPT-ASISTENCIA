from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from src.attendance.services.attendance_import_service import AttendanceImportService
from src.attendance.api.schemas import (
    AttendancePreviewResponse,
    AttendanceImportConfirmRequest,
    AttendanceImportConfirmResponse,
    AttendanceReportResponse,
    AttendanceObservationUpdateRequest,
)


router = APIRouter(prefix="/attendance", tags=["Attendance Import"])
service = AttendanceImportService()


def _serialize_report(report):
    return {
        "id": report.id,
        "period": report.period,
        "employee_number": report.employee_number,
        "employee_name": report.employee_name,
        "report_date": report.report_date,
        "turn_code": report.turn_code,
        "expected_entry": report.expected_entry,
        "actual_entry": report.actual_entry,
        "expected_exit": report.expected_exit,
        "actual_exit": report.actual_exit,
        "status": report.status,
        "observation": report.observation,
        "minutes_late": report.minutes_late,
        "minutes_early": report.minutes_early,
        "active": report.active,
    }


@router.post("/import-preview")
async def preview_import(
    period: str = Form(...),
    file: UploadFile = File(...),
    tolerance_minutes: int = Form(5),
) -> AttendancePreviewResponse:
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Debe subir un archivo Excel válido.")

    try:
        contents = await file.read()
        rows, errors = service.read_excel_rows(contents)
        preview = service.process_rows(rows, period, tolerance_minutes=tolerance_minutes)
        preview["errors"] = errors + preview.get("errors", [])
        return preview
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.post("/import-confirm", response_model=AttendanceImportConfirmResponse)
def confirm_import(payload: AttendanceImportConfirmRequest):
    period = payload.period
    entries = [entry.model_dump() for entry in payload.entries]

    if not period:
        raise HTTPException(status_code=400, detail="Debe indicar un período.")

    if payload.replace_existing:
        saved = service.replace_period_report(period, entries)
    else:
        saved = [service.save_report(period, entry) for entry in entries]

    return {
        "saved": len(saved),
        "period": period,
        "entries": [_serialize_report(item) for item in saved],
    }


@router.get("/report/{period}", response_model=list[AttendanceReportResponse])
def get_report(period: str):
    rows = service.get_report(period)
    return [_serialize_report(item) for item in rows]


@router.put("/report/{report_id}", response_model=AttendanceReportResponse)
def update_report_observation(report_id: int, payload: AttendanceObservationUpdateRequest):
    updated = service.update_report_observation(report_id, payload.observation)
    if updated is None:
        raise HTTPException(status_code=404, detail="Reporte no encontrado")
    return _serialize_report(updated)
