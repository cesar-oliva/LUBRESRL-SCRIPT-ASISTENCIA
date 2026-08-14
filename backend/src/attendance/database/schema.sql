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

CREATE TABLE employee_turns (
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