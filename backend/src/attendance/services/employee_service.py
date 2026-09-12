from src.attendance.models.employee import Employee
from src.attendance.repositories.employee_repository import EmployeeRepository


class EmployeeService:

    def __init__(self, repository=None):
        self.repository = repository or EmployeeRepository()

    def _validate_employee_number(self, employee_number):
        if employee_number is None:
            raise ValueError("El número de empleado es obligatorio.")

        if not isinstance(employee_number, int):
            raise ValueError("El legajo debe ser un número entero.")

        if employee_number <= 0:
            raise ValueError("El legajo debe ser mayor que cero.")

    def _normalize_name(self, name):
        if name is None or not str(name).strip():
            raise ValueError("El nombre es obligatorio.")

        return " ".join(str(name).strip().split())

    # ---------------------------------------------------------
    # CREAR
    # ---------------------------------------------------------

    def create_employee(self, employee_number, name, active=True, sector=''):
        """
        Crea un nuevo empleado.
        """

        self._validate_employee_number(employee_number)
        normalized_name = self._normalize_name(name)

        if self.repository.exists(employee_number):
            raise ValueError(
                f"Ya existe un empleado con número {employee_number}."
            )

        employee = Employee(
            employee_number=employee_number,
            name=normalized_name,
            sector=str(sector or '').strip(),
            active=bool(active)
        )

        return self.repository.save(employee)

    # ---------------------------------------------------------
    # OBTENER TODOS
    # ---------------------------------------------------------

    def get_all_employees(self):
        """
        Devuelve todos los empleados.
        """

        return self.repository.get_all()

    # ---------------------------------------------------------
    # OBTENER ACTIVOS
    # ---------------------------------------------------------

    def get_active_employees(self):
        """
        Devuelve solamente los empleados activos.
        """

        return self.repository.get_active()

    # ---------------------------------------------------------
    # BUSCAR POR LEGAJO
    # ---------------------------------------------------------

    def get_employee(self, employee_number):
        """
        Busca un empleado por legajo.
        """

        self._validate_employee_number(employee_number)

        employee = self.repository.get_by_employee_number(employee_number)

        if employee is None:
            raise ValueError(
                f"No existe un empleado con número {employee_number}."
            )

        return employee

    # ---------------------------------------------------------
    # BUSCAR POR NOMBRE
    # ---------------------------------------------------------

    def search_employees(self, name):
        """
        Busca empleados por nombre.
        """

        if not name or not str(name).strip():
            return []

        return self.repository.find_by_name(str(name).strip())

    # ---------------------------------------------------------
    # ACTUALIZAR
    # ---------------------------------------------------------

    def update_employee(self, employee_number, name, active=True, sector=''):
        """
        Actualiza los datos de un empleado.
        """

        self._validate_employee_number(employee_number)
        normalized_name = self._normalize_name(name)

        if not self.repository.exists(employee_number):
            raise ValueError(
                f"No existe un empleado con legajo {employee_number}."
            )

        employee = Employee(
            employee_number=employee_number,
            name=normalized_name,
            sector=str(sector or '').strip(),
            active=bool(active)
        )

        updated = self.repository.update(employee)

        if not updated:
            raise ValueError(
                f"No se pudo actualizar el empleado {employee_number}."
            )

        return employee

    # ---------------------------------------------------------
    # ACTIVAR
    # ---------------------------------------------------------

    def activate_employee(self, employee_number):
        """
        Activa un empleado.
        """

        employee = self.get_employee(employee_number)

        if employee.active:
            return employee

        updated = self.repository.set_active(employee_number, True)

        if not updated:
            raise ValueError(
                f"No se pudo activar el empleado {employee_number}."
            )

        employee.active = True

        return employee

    # ---------------------------------------------------------
    # DESACTIVAR
    # ---------------------------------------------------------

    def deactivate_employee(self, employee_number):
        """
        Desactiva un empleado sin eliminarlo.
        """

        employee = self.get_employee(employee_number)

        if not employee.active:
            return employee

        updated = self.repository.set_active(employee_number, False)

        if not updated:
            raise ValueError(
                f"No se pudo desactivar el empleado {employee_number}."
            )

        employee.active = False

        return employee

    # ---------------------------------------------------------
    # ELIMINAR
    # ---------------------------------------------------------

    def delete_employee(self, employee_number):
        """
        Elimina un empleado.
        """

        self._validate_employee_number(employee_number)

        if not self.repository.exists(employee_number):
            raise ValueError(
                f"No existe un empleado con legajo {employee_number}."
            )

        return self.repository.delete(employee_number)

    # ---------------------------------------------------------
    # EXISTE
    # ---------------------------------------------------------

    def employee_exists(self, employee_number):
        """
        Comprueba si existe un empleado.
        """

        self._validate_employee_number(employee_number)
        return self.repository.exists(employee_number)

    # ---------------------------------------------------------
    # CANTIDAD
    # ---------------------------------------------------------

    def count_employees(self):
        """
        Cantidad total de empleados.
        """

        return self.repository.count()

    # ---------------------------------------------------------
    # CANTIDAD ACTIVOS
    # ---------------------------------------------------------

    def count_active_employees(self):
        """
        Cantidad de empleados activos.
        """

        return self.repository.count_active()