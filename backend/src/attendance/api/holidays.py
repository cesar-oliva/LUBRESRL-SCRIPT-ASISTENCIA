from fastapi import APIRouter, HTTPException

from src.attendance.models.holiday import Holiday
from src.attendance.repositories.holiday_repository import HolidayRepository
from src.attendance.api.schemas import HolidayCreate, HolidayUpdate, HolidayResponse


router = APIRouter(
    prefix="/holidays",
    tags=["Holidays"]
)

repository = HolidayRepository()


@router.get("", response_model=list[HolidayResponse])
def get_holidays():
    return repository.get_all()


@router.get("/{holiday_id}", response_model=HolidayResponse)
def get_holiday(holiday_id: int):
    holiday = repository.get_by_id(holiday_id)

    if holiday is None:
        raise HTTPException(status_code=404, detail='Feriado no encontrado')

    return holiday


@router.post("", response_model=HolidayResponse, status_code=201)
def create_holiday(data: HolidayCreate):
    holiday = Holiday(
        date=data.date,
        reason=data.reason,
        active=data.active
    )

    try:
        return repository.save(holiday)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.put("/{holiday_id}", response_model=HolidayResponse)
def update_holiday(holiday_id: int, data: HolidayUpdate):
    holiday = Holiday(
        id=holiday_id,
        date=data.date,
        reason=data.reason,
        active=data.active
    )

    updated = repository.update(holiday)

    if not updated:
        raise HTTPException(status_code=404, detail='Feriado no encontrado')

    return repository.get_by_id(holiday_id)


@router.delete("/{holiday_id}", status_code=204)
def delete_holiday(holiday_id: int):
    deleted = repository.delete(holiday_id)

    if not deleted:
        raise HTTPException(status_code=404, detail='Feriado no encontrado')

    return None
