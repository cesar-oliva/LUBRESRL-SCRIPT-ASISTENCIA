from .connection import get_connection


TURNS = [
    {
        "code": "T1",
        "name": "Turno 1",
        "periods": [
            ("22:06:00", "06:00:00"),
        ],
    },
    {
        "code": "T2",
        "name": "Turno 2",
        "periods": [
            ("06:06:00", "14:00:00"),
        ],
    },
    {
        "code": "T3",
        "name": "Turno 3",
        "periods": [
            ("14:06:00", "22:00:00"),
        ],
    },
    {
        "code": "T4",
        "name": "Turno 4",
        "periods": [
            ("08:06:00", "12:00:00"),
            ("16:06:00", "20:00:00"),
        ],
    },
    {
        "code": "T5",
        "name": "Turno 5",
        "periods": [
            ("08:06:00", "13:00:00"),
        ],
    },
    {
        "code": "T6",
        "name": "Turno 6",
        "periods": [
            ("13:06:00", "18:00:00"),
        ],
    },
    {
        "code": "T7",
        "name": "Turno 7",
        "periods": [
            ("08:06:00", "16:00:00"),
        ],
    },
    {
        "code": "T8",
        "name": "Turno 8",
        "periods": [
            ("08:06:00", "17:00:00"),
        ],
    },
    {
        "code": "T9",
        "name": "Turno 9",
        "periods": [
            ("07:06:00", "13:00:00"),
            ("15:06:00", "17:00:00"),
        ],
    },
    {
        "code": "T10",
        "name": "Turno 10",
        "periods": [
            ("08:06:00", "13:00:00"),
            ("14:06:00", "17:00:00"),
        ],
    },
    {
        "code": "T11",
        "name": "Turno 11",
        "periods": [
            ("07:06:00", "12:00:00"),
            ("16:06:00", "20:00:00"),
        ],
    },
    {
        "code": "T12",
        "name": "Turno 12",
        "periods": [
            ("09:06:00", "17:00:00"),
        ],
    },
    {
        "code": "T13",
        "name": "Turno 13",
        "periods": [
            ("07:06:00", "15:00:00"),
        ],
    },
    {
        "code": "T14",
        "name": "Turno 14",
        "periods": [
            ("13:06:00", "21:00:00"),
        ],
    },
]


def seed_turns():
    connection = get_connection()

    try:
        for turn in TURNS:
            cursor = connection.execute(
                """
                INSERT OR IGNORE INTO turns (
                    code,
                    name
                )
                VALUES (?, ?)
                """,
                (
                    turn["code"],
                    turn["name"],
                ),
            )

            # Obtener el ID aunque el turno ya existiera
            cursor = connection.execute(
                """
                SELECT id
                FROM turns
                WHERE code = ?
                """,
                (turn["code"],),
            )

            turn_id = cursor.fetchone()[0]

            for period_order, (start_time, end_time) in enumerate(
                turn["periods"],
                start=1,
            ):
                connection.execute(
                    """
                    INSERT OR IGNORE INTO turn_periods (
                        turn_id,
                        period_order,
                        start_time,
                        end_time
                    )
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        turn_id,
                        period_order,
                        start_time,
                        end_time,
                    ),
                )

        connection.commit()

        print(f"Turnos procesados: {len(TURNS)}")

    finally:
        connection.close()


if __name__ == "__main__":
    seed_turns()