from pydantic import BaseModel, Field
from typing import List, Optional


# =========================================================
# EMPLOYEE
# =========================================================

class EmployeeCreate(BaseModel):
    employee_number: int
    name: str
    sector: str = ""
    active: bool = True


class EmployeeUpdate(BaseModel):
    name: str
    sector: str = ""
    active: bool = True


class EmployeeResponse(BaseModel):
    employee_number: int
    name: str
    sector: str = ""
    active: bool


# =========================================================
# WORK PERIOD
# =========================================================

class WorkPeriodCreate(BaseModel):
    start_time: str
    end_time: str


class WorkPeriodResponse(BaseModel):
    start_time: str
    end_time: str


# =========================================================
# TURN
# =========================================================

class TurnCreate(BaseModel):
    code: str
    name: str
    periods: List[WorkPeriodCreate] = Field(default_factory=list)
    active: bool = True


class TurnUpdate(BaseModel):
    code: str
    name: str
    periods: List[WorkPeriodCreate] = Field(default_factory=list)
    active: bool = True


class TurnResponse(BaseModel):
    id: int
    code: str
    name: str
    periods: List[WorkPeriodResponse]
    active: bool


# =========================================================
# EMPLOYEE TURN
# =========================================================

class EmployeeTurnCreate(BaseModel):
    employee_number: int
    turn_id: int
    day_of_week: int = Field(ge=1, le=7)


class EmployeeTurnUpdate(BaseModel):
    turn_id: int
    day_of_week: int = Field(ge=1, le=7)


class EmployeeTurnResponse(BaseModel):
    day_of_week: int
    turn: Optional[TurnResponse] = None


# =========================================================
# MONTHLY TURN ASSIGNMENTS
# =========================================================

class MonthlyTurnAssignment(BaseModel):
    employee_number: int
    assignment_date: str
    assignment_code: str = Field(min_length=1, max_length=20)


class MonthlyTurnPlanRequest(BaseModel):
    assignments: List[MonthlyTurnAssignment] = Field(default_factory=list)


# =========================================================
# HOLIDAY
# =========================================================

class HolidayCreate(BaseModel):
    date: str
    reason: str
    active: bool = True


class HolidayUpdate(BaseModel):
    date: str
    reason: str
    active: bool = True


class HolidayResponse(BaseModel):
    id: int
    date: str
    reason: str
    active: bool


# =========================================================
# SPECIAL CODES
# =========================================================

class SpecialCodeCreate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1, max_length=120)
    active: bool = True


class SpecialCodeUpdate(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1, max_length=120)
    active: bool = True


class SpecialCodeResponse(BaseModel):
    id: int
    code: str
    description: str
    active: bool


# =========================================================
# ATTENDANCE IMPORT / REPORT
# =========================================================

class AttendancePreviewEntryResponse(BaseModel):
    employee_number: int
    employee_name: str
    date: str
    turn: Optional[str] = None
    expected_entry: Optional[str] = None
    actual_entry: Optional[str] = None
    expected_exit: Optional[str] = None
    actual_exit: Optional[str] = None
    status: str
    observation: Optional[str] = None
    minutes_late: int = 0
    minutes_early: int = 0
    state: str


class AttendancePreviewSummaryResponse(BaseModel):
    total_employees: int
    total_turns_analyzed: int
    total_imported: int
    duplicated_records: int
    late_arrivals: int
    early_departures: int
    missing_records: int
    inconsistent_records: int


class AttendancePreviewResponse(BaseModel):
    entries: List[AttendancePreviewEntryResponse]
    summary: AttendancePreviewSummaryResponse
    errors: List[str] = Field(default_factory=list)


class AttendanceImportConfirmRequest(BaseModel):
    period: str
    entries: List[AttendancePreviewEntryResponse] = Field(default_factory=list)
    replace_existing: bool = True


class AttendanceImportConfirmResponse(BaseModel):
    saved: int
    period: str
    entries: List["AttendanceReportResponse"]


class AttendanceReportResponse(BaseModel):
    id: int
    period: str
    employee_number: int
    employee_name: str
    report_date: str
    turn_code: Optional[str] = None
    expected_entry: Optional[str] = None
    actual_entry: Optional[str] = None
    expected_exit: Optional[str] = None
    actual_exit: Optional[str] = None
    status: str
    observation: Optional[str] = None
    minutes_late: int = 0
    minutes_early: int = 0
    active: bool


class AttendanceObservationUpdateRequest(BaseModel):
    observation: str