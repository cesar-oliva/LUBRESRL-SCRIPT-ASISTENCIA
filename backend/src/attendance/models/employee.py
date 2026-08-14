class Employee:

    def __init__(self, employee_number, name, active=True):
        self.employee_number = employee_number
        self.name = name
        self.active = active

    def __repr__(self):
        return (
            f"Employee("
            f"employee_number={self.employee_number}, "
            f"name='{self.name}', "
            f"active={self.active}"
            f")"
        )