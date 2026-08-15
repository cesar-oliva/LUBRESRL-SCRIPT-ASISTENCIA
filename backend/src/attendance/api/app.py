from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.attendance.api.employees import router as employees_router
from src.attendance.api.turns import router as turns_router
from src.attendance.api.employee_turns import router as employee_turns_router


app = FastAPI(
    title="Attendance API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


app.include_router(employees_router)
app.include_router(turns_router)
app.include_router(employee_turns_router)


@app.get("/")
def root():
    return {
        "application": "Attendance API",
        "version": "1.0.0",
        "status": "running"
    }