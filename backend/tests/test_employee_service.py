import pytest

from src.attendance.repositories.employee_repository import EmployeeRepository
from src.attendance.services.employee_service import EmployeeService


@pytest.fixture
def employee_service():
    return EmployeeService()


@pytest.fixture
def unique_employee_number():
    repository = EmployeeRepository()
    employee_number = 999991

    while repository.exists(employee_number):
        employee_number += 1

    return employee_number


def test_create_update_and_delete_employee(employee_service, unique_employee_number):
    created = employee_service.create_employee(
        unique_employee_number,
        "Ana Gómez"
    )

    assert created.employee_number == unique_employee_number
    assert created.name == "Ana Gómez"
    assert created.active is True

    updated = employee_service.update_employee(
        unique_employee_number,
        "Ana García",
        False
    )

    assert updated.name == "Ana García"
    assert updated.active is False

    deleted = employee_service.delete_employee(unique_employee_number)

    assert deleted is True

    with pytest.raises(ValueError):
        employee_service.get_employee(unique_employee_number)


def test_activate_and_deactivate_employee(employee_service, unique_employee_number):
    employee_service.create_employee(unique_employee_number, "Luis Pérez")

    activated = employee_service.activate_employee(unique_employee_number)
    assert activated.active is True

    deactivated = employee_service.deactivate_employee(unique_employee_number)
    assert deactivated.active is False

    employee_service.delete_employee(unique_employee_number)