from src.attendance.repositories.employee_turn_repository import (
    EmployeeTurnRepository
)
from src.attendance.repositories.employee_repository import (
    EmployeeRepository
)
from src.attendance.repositories.turn_repository import (
    TurnRepository
)


class EmployeeTurnService:

    def __init__(
        self,
        repository=None,
        employee_repository=None,
        turn_repository=None
    ):
        self.repository = (
            repository or EmployeeTurnRepository()
        )

        self.employee_repository = (
            employee_repository or EmployeeRepository()
        )

        self.turn_repository = (
            turn_repository or TurnRepository()
        )

    # ---------------------------------------------------------
    # ASIGNAR
    # ---------------------------------------------------------

    def assign_turn(
        self,
        employee_number,
        turn_id,
        day_of_week
    ):
        """
        Asigna un turno a un empleado para un día.
        """

        self._validate_day(day_of_week)

        if not self.employee_repository.exists(
            employee_number
        ):
            raise ValueError(
                f"No existe un empleado con legajo "
                f"{employee_number}."
            )

        if not self.turn_repository.exists(turn_id):
            raise ValueError(
                f"No existe un turno con ID {turn_id}."
            )

        if self.repository.exists(
            employee_number,
            day_of_week
        ):
            raise ValueError(
                "El empleado ya tiene un turno asignado "
                f"para el día {day_of_week}."
            )

        self.repository.assign_turn(
            employee_number,
            turn_id,
            day_of_week
        )

        return self.repository.get_turn_for_day(
            employee_number,
            day_of_week
        )

    # ---------------------------------------------------------
    # OBTENER TURNO DE UN DÍA
    # ---------------------------------------------------------

    def get_turn_for_day(
        self,
        employee_number,
        day_of_week
    ):
        """
        Obtiene el turno de un empleado para un día.
        """

        self._validate_day(day_of_week)

        return self.repository.get_turn_for_day(
            employee_number,
            day_of_week
        )

    # ---------------------------------------------------------
    # OBTENER HORARIO COMPLETO
    # ---------------------------------------------------------

    def get_employee_schedule(self, employee_number):
        """
        Obtiene todos los turnos del empleado.
        """

        if not self.employee_repository.exists(
            employee_number
        ):
            raise ValueError(
                f"No existe un empleado con legajo "
                f"{employee_number}."
            )

        return self.repository.get_employee_schedule(
            employee_number
        )

    # ---------------------------------------------------------
    # CAMBIAR TURNO
    # ---------------------------------------------------------

    def update_turn(
        self,
        employee_number,
        day_of_week,
        turn_id
    ):
        """
        Cambia el turno asignado para un día.
        """

        self._validate_day(day_of_week)

        if not self.employee_repository.exists(
            employee_number
        ):
            raise ValueError(
                f"No existe un empleado con legajo "
                f"{employee_number}."
            )

        if not self.turn_repository.exists(turn_id):
            raise ValueError(
                f"No existe un turno con ID {turn_id}."
            )

        if not self.repository.exists(
            employee_number,
            day_of_week
        ):
            raise ValueError(
                "El empleado no tiene un turno asignado "
                f"para el día {day_of_week}."
            )

        updated = self.repository.update_turn(
            employee_number,
            day_of_week,
            turn_id
        )

        if not updated:
            raise ValueError(
                "No se pudo actualizar la asignación."
            )

        return self.repository.get_turn_for_day(
            employee_number,
            day_of_week
        )

    # ---------------------------------------------------------
    # ELIMINAR
    # ---------------------------------------------------------

    def remove_turn(
        self,
        employee_number,
        day_of_week
    ):
        """
        Elimina la asignación de turno.
        """

        self._validate_day(day_of_week)

        removed = self.repository.remove_turn(
            employee_number,
            day_of_week
        )

        if not removed:
            raise ValueError(
                "No existe una asignación de turno "
                "para ese empleado y día."
            )

        return True

    # ---------------------------------------------------------
    # EXISTE
    # ---------------------------------------------------------

    def assignment_exists(
        self,
        employee_number,
        day_of_week
    ):
        """
        Comprueba si existe una asignación.
        """

        self._validate_day(day_of_week)

        return self.repository.exists(
            employee_number,
            day_of_week
        )

    # ---------------------------------------------------------
    # PRIVATE
    # ---------------------------------------------------------

    @staticmethod
    def _validate_day(day_of_week):
        if not isinstance(day_of_week, int):
            raise ValueError(
                "day_of_week debe ser un número entero."
            )

        if not 1 <= day_of_week <= 7:
            raise ValueError(
                "day_of_week debe estar entre 1 y 7."
            )