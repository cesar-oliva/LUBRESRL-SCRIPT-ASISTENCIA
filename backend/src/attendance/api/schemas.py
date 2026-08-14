from pydantic import BaseModel, Field
from typing import List, Optional


# =========================================================
# EMPLOYEE
# =========================================================

class EmployeeCreate(BaseModel):
    employee_number: int
    name: str
    active: bool = True


class EmployeeUpdate(BaseModel):
    name: str
    active: bool = True


class EmployeeResponse(BaseModel):
    employee_number: int
    name: str
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