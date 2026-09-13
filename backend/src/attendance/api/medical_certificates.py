from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse

from src.attendance.api.schemas import MedicalCertificateResponse
from src.attendance.services.medical_certificate_service import MedicalCertificateService


router = APIRouter(prefix="/medical-certificates", tags=["Medical Certificates"])
service = MedicalCertificateService()


def _serialize(certificate):
    return {
        "id": certificate.id,
        "employee_number": certificate.employee_number,
        "employee_name": certificate.employee_name,
        "original_filename": certificate.original_filename,
        "valid_from": certificate.valid_from,
        "valid_until": certificate.valid_until,
        "days_count": certificate.days_count,
        "active": certificate.active,
        "created_at": certificate.created_at,
    }


@router.get("", response_model=list[MedicalCertificateResponse])
def get_medical_certificates():
    return [_serialize(item) for item in service.list_certificates()]


@router.get("/{certificate_id}", response_model=MedicalCertificateResponse)
def get_medical_certificate(certificate_id: int):
    try:
        return _serialize(service.get_certificate(certificate_id))
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))


@router.get("/{certificate_id}/file")
def download_medical_certificate(certificate_id: int):
    try:
        certificate, path = service.file_path(certificate_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    return FileResponse(path, filename=certificate.original_filename)


@router.post("", response_model=MedicalCertificateResponse, status_code=201)
async def create_medical_certificate(
    employee_number: int = Form(...),
    valid_from: str = Form(...),
    valid_until: str = Form(...),
    file: UploadFile = File(...),
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="El certificado no puede estar vacío.")
    try:
        certificate = service.create_certificate(
            employee_number,
            valid_from,
            valid_until,
            file.filename or "certificado-medico",
            contents,
        )
        return _serialize(certificate)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.put("/{certificate_id}", response_model=MedicalCertificateResponse)
async def update_medical_certificate(
    certificate_id: int,
    employee_number: int = Form(...),
    valid_from: str = Form(...),
    valid_until: str = Form(...),
    active: bool = Form(True),
    file: UploadFile | None = File(None),
):
    contents = await file.read() if file else None
    try:
        certificate = service.update_certificate(
            certificate_id,
            employee_number,
            valid_from,
            valid_until,
            file.filename if file else None,
            contents,
            active,
        )
        return _serialize(certificate)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.delete("/{certificate_id}", status_code=204)
def delete_medical_certificate(certificate_id: int):
    try:
        service.delete_certificate(certificate_id)
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error))