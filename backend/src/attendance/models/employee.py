class Employee:

    def __init__(self, employee_number, name, sector='', active=True):
        self.employee_number = employee_number
        self.name = name
        self.sector = sector or ''
        self.active = active

    def __repr__(self):
        return (
            f"Employee("
            f"employee_number={self.employee_number}, "
            f"name='{self.name}', "
            f"sector='{self.sector}', "
            f"active={self.active}"
            f")"
        )