from fastapi import APIRouter, HTTPException

from src.attendance.models.turn import Turn, WorkPeriod
from src.attendance.repositories.turn_repository import TurnRepository
from src.attendance.api.schemas import (
    TurnCreate,
    TurnUpdate,
    TurnResponse
)


router = APIRouter(
    prefix="/turns",
    tags=["Turns"]
)

repository = TurnRepository()


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "",
    response_model=list[TurnResponse]
)
def get_turns():

    return repository.get_all()


# =========================================================
# GET ACTIVE
# =========================================================

@router.get(
    "/active",
    response_model=list[TurnResponse]
)
def get_active_turns():

    return repository.get_active()


# =========================================================
# GET BY CODE
# =========================================================

@router.get(
    "/by-code/{code}",
    response_model=TurnResponse
)
def get_turn_by_code(code: str):

    turn = repository.get_by_code(code)

    if turn is None:
        raise HTTPException(
            status_code=404,
            detail="Turno no encontrado"
        )

    return turn


# =========================================================
# GET BY ID
# =========================================================

@router.get(
    "/{turn_id}",
    response_model=TurnResponse
)
def get_turn(turn_id: int):

    turn = repository.get_by_id(turn_id)

    if turn is None:
        raise HTTPException(
            status_code=404,
            detail="Turno no encontrado"
        )

    return turn


# =========================================================
# CREATE
# =========================================================

@router.post(
    "",
    response_model=TurnResponse,
    status_code=201
)
def create_turn(data: TurnCreate):

    periods = [
        WorkPeriod(
            start_time=period.start_time,
            end_time=period.end_time
        )
        for period in data.periods
    ]

    turn = Turn(
        code=data.code,
        name=data.name,
        periods=periods,
        active=data.active
    )

    try:
        return repository.save(turn)

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{turn_id}",
    response_model=TurnResponse
)
def update_turn(
    turn_id: int,
    data: TurnUpdate
):

    periods = [
        WorkPeriod(
            start_time=period.start_time,
            end_time=period.end_time
        )
        for period in data.periods
    ]

    turn = Turn(
        id=turn_id,
        code=data.code,
        name=data.name,
        periods=periods,
        active=data.active
    )

    updated = repository.update(turn)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Turno no encontrado"
        )

    return repository.get_by_id(turn_id)


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{turn_id}",
    status_code=204
)
def delete_turn(turn_id: int):

    deleted = repository.delete(turn_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Turno no encontrado"
        )

    return None