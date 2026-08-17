class AttendanceReport:

    def __init__(
        self,
        id=None,
        period=None,
        employee_number=None,
        employee_name=None,
        report_date=None,
        turn_code=None,
        expected_entry=None,
        actual_entry=None,
        expected_exit=None,
        actual_exit=None,
        status=None,
        observation=None,
        minutes_late=0,
        minutes_early=0,
        active=True,
    ):
        self.id = id
        self.period = period
        self.employee_number = employee_number
        self.employee_name = employee_name
        self.report_date = report_date
        self.turn_code = turn_code
        self.expected_entry = expected_entry
        self.actual_entry = actual_entry
        self.expected_exit = expected_exit
        self.actual_exit = actual_exit
        self.status = status
        self.observation = observation
        self.minutes_late = minutes_late
        self.minutes_early = minutes_early
        self.active = active

    def __repr__(self):
        return (
            f"AttendanceReport("
            f"id={self.id}, period='{self.period}', "
            f"employee_number={self.employee_number}, "
            f"report_date='{self.report_date}', "
            f"turn_code='{self.turn_code}', status='{self.status}'"
            f")"
        )
