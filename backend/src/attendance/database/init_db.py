from pathlib import Path

from .connection import get_connection


def initialize_database():
    schema_path = Path(__file__).with_name("schema.sql")

    with open(schema_path, "r", encoding="utf-8") as file:
        schema = file.read()

    connection = get_connection()

    try:
        connection.executescript(schema)
        connection.commit()
    finally:
        connection.close()


if __name__ == "__main__":
    initialize_database()
    print("Base de datos inicializada correctamente.")