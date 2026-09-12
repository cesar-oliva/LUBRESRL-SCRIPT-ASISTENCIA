from fastapi import APIRouter, HTTPException

from src.attendance.api.schemas import (
    SpecialCodeCreate,
    SpecialCodeUpdate,
    SpecialCodeResponse,
)
from src.attendance.models.special_code import SpecialCode
from src.attendance.repositories.special_code_repository import SpecialCodeRepository
from src.attendance.repositories.turn_repository import TurnRepository


router = APIRouter(prefix='/special-codes', tags=['Special Codes'])
repository = SpecialCodeRepository()
turn_repository = TurnRepository()


@router.get('', response_model=list[SpecialCodeResponse])
def get_special_codes():
    return repository.get_all()


@router.get('/active', response_model=list[SpecialCodeResponse])
def get_active_special_codes():
    return repository.get_active()


@router.post('', response_model=SpecialCodeResponse, status_code=201)
def create_special_code(data: SpecialCodeCreate):
    code = data.code.strip().upper()
    description = ' '.join(data.description.strip().split())
    if repository.exists_code(code) or turn_repository.get_by_code(code) is not None:
        raise HTTPException(status_code=409, detail=f'Ya existe el código especial {code}.')
    try:
        return repository.save(SpecialCode(code=code, description=description, active=data.active))
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.put('/{special_code_id}', response_model=SpecialCodeResponse)
def update_special_code(special_code_id: int, data: SpecialCodeUpdate):
    code = data.code.strip().upper()
    description = ' '.join(data.description.strip().split())
    if repository.get_by_id(special_code_id) is None:
        raise HTTPException(status_code=404, detail='Código especial no encontrado.')
    if (repository.exists_code(code, exclude_id=special_code_id)
            or turn_repository.get_by_code(code) is not None):
        raise HTTPException(status_code=409, detail=f'Ya existe el código especial {code}.')
    special_code = SpecialCode(
        id=special_code_id,
        code=code,
        description=description,
        active=data.active,
    )
    try:
        repository.update(special_code)
        return repository.get_by_id(special_code_id)
    except Exception as error:
        raise HTTPException(status_code=400, detail=str(error))


@router.delete('/{special_code_id}', status_code=204)
def delete_special_code(special_code_id: int):
    if not repository.delete(special_code_id):
        raise HTTPException(status_code=404, detail='Código especial no encontrado.')