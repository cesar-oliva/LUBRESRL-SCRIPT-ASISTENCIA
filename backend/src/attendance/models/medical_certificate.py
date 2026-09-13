class MedicalCertificate:

    def __init__(
        self,
        id=None,
        employee_number=None,
        employee_name=None,
        original_filename=None,
        stored_filename=None,
        valid_from=None,
        valid_until=None,
        days_count=0,
        active=True,
        created_at=None,
    ):
        self.id = id
        self.employee_number = employee_number
        self.employee_name = employee_name
        self.original_filename = original_filename
        self.stored_filename = stored_filename
        self.valid_from = valid_from
        self.valid_until = valid_until
        self.days_count = days_count
        self.active = active
        self.created_at = created_at