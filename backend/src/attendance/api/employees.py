from fastapi import APIRouter, HTTPException

from src.attendance.models.employee import Employee
from src.attendance.repositories.employee_repository import EmployeeRepository
from src.attendance.api.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse
)


router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)

repository = EmployeeRepository()


# =========================================================
# GET ALL
# =========================================================

@router.get(
    "",
    response_model=list[EmployeeResponse]
)
def get_employees():

    return repository.get_all()


# =========================================================
# GET ACTIVE
# =========================================================

@router.get(
    "/active",
    response_model=list[EmployeeResponse]
)
def get_active_employees():

    return repository.get_active()


# =========================================================
# GET BY EMPLOYEE NUMBER
# =========================================================

@router.get(
    "/{employee_number}",
    response_model=EmployeeResponse
)
def get_employee(employee_number: int):

    employee = repository.get_by_employee_number(
        employee_number
    )

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return employee


# =========================================================
# SEARCH BY NAME
# =========================================================

@router.get(
    "/search/by-name",
    response_model=list[EmployeeResponse]
)
def search_employees(name: str):

    return repository.find_by_name(name)


# =========================================================
# CREATE
# =========================================================

@router.post(
    "",
    response_model=EmployeeResponse,
    status_code=201
)
def create_employee(data: EmployeeCreate):

    if repository.exists(data.employee_number):
        raise HTTPException(
            status_code=409,
            detail="El employee_number ya existe"
        )

    employee = Employee(
        employee_number=data.employee_number,
        name=data.name,
        active=data.active
    )

    try:
        return repository.save(employee)

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


# =========================================================
# UPDATE
# =========================================================

@router.put(
    "/{employee_number}",
    response_model=EmployeeResponse
)
def update_employee(
    employee_number: int,
    data: EmployeeUpdate
):

    employee = Employee(
        employee_number=employee_number,
        name=data.name,
        active=data.active
    )

    updated = repository.update(employee)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return repository.get_by_employee_number(
        employee_number
    )


# =========================================================
# ACTIVATE / DEACTIVATE
# =========================================================

@router.patch(
    "/{employee_number}/active",
    response_model=EmployeeResponse
)
def set_employee_active(
    employee_number: int,
    active: bool
):

    updated = repository.set_active(
        employee_number,
        active
    )

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return repository.get_by_employee_number(
        employee_number
    )


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{employee_number}",
    status_code=204
)
def delete_employee(employee_number: int):

    deleted = repository.delete(employee_number)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Empleado no encontrado"
        )

    return None