from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.attendance.api.employees import router as employees_router
from src.attendance.api.turns import router as turns_router
from src.attendance.api.holidays import router as holidays_router
from src.attendance.api.employee_turns import (
    router as employee_turns_router
)
from src.attendance.api.attendance_import import (
    router as attendance_import_router
)
from src.attendance.api.monthly_turns import router as monthly_turns_router
from src.attendance.api.special_codes import router as special_codes_router
from src.attendance.api.medical_certificates import router as medical_certificates_router
from src.attendance.database.init_db import initialize_database


app = FastAPI(
    title="Attendance API",
    description="API para gestión de empleados, turnos y asignaciones",
    version="1.0.0"
)


initialize_database()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# API ROUTERS
# =========================================================

app.include_router(employees_router)
app.include_router(turns_router)
app.include_router(holidays_router)
app.include_router(employee_turns_router)
app.include_router(attendance_import_router)
app.include_router(monthly_turns_router)
app.include_router(special_codes_router)
app.include_router(medical_certificates_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():

    return {
        "application": "Attendance API",
        "version": "1.0.0",
        "status": "running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "ok"
    }