CREATE TABLE IF NOT EXISTS employees (
    employee_number INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS turn_periods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    turn_id INTEGER NOT NULL,
    period_order INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,

    FOREIGN KEY (turn_id)
        REFERENCES turns(id)
        ON DELETE CASCADE,

    UNIQUE (turn_id, period_order)
);

CREATE TABLE IF NOT EXISTS employee_turns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_number INTEGER NOT NULL,
    turn_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,

    FOREIGN KEY (employee_number)
        REFERENCES employees(employee_number)
        ON DELETE CASCADE,

    FOREIGN KEY (turn_id)
        REFERENCES turns(id)
        ON DELETE CASCADE,

    UNIQUE (employee_number, day_of_week)
);

CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS attendance_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    period TEXT NOT NULL,
    employee_number INTEGER NOT NULL,
    employee_name TEXT NOT NULL,
    report_date TEXT NOT NULL,
    turn_code TEXT,
    expected_entry TEXT,
    actual_entry TEXT,
    expected_exit TEXT,
    actual_exit TEXT,
    status TEXT NOT NULL,
    observation TEXT,
    minutes_late INTEGER NOT NULL DEFAULT 0,
    minutes_early INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);