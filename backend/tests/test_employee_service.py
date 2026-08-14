from src.attendance.services.employee_service import EmployeeService


service = EmployeeService()


# ---------------------------------------------------------
# CANTIDAD
# ---------------------------------------------------------

print("Total empleados:")
print(service.count_employees())


# ---------------------------------------------------------
# BUSCAR
# ---------------------------------------------------------

employee = service.get_employee(501)

print("\nEmpleado:")
print(employee)


# ---------------------------------------------------------
# BUSCAR POR NOMBRE
# ---------------------------------------------------------

print("\nBuscar Oliva:")

employees = service.search_employees("Oliva")

for employee in employees:
    print(employee)


# ---------------------------------------------------------
# ACTIVOS
# ---------------------------------------------------------

print("\nEmpleados activos:")
print(service.count_active_employees())