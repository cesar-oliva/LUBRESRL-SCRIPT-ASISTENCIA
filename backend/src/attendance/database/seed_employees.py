from .connection import get_connection


EMPLOYEES = [
    (501, "Barbaglia Hugo Daniel"),
    (544, "Zamorano Aymara Denise"),
    (543, "Romero Facundo"),
    (540, "Gonzalez Claudio Emanuel"),
    (502, "Zamorano Lucas Sebastian"),
    (503, "Berta Facundo Julian"),
    (504, "Sanchez Belen Luciana"),
    (505, "Albornoz Ivan Nahuel"),
    (546, "Luna Rocio Belen"),
    (506, "Lescano Sebastian"),
    (507, "Juarez Enzo Jesus"),
    (508, "Acevedo Diego Fernando"),
    (545, "Vallejo Roxana Melissa"),
    (509, "Monteros Johana Giselle"),
    (510, "Lesmo Mariana Micaela"),
    (511, "Rojas Fatima Giselle"),
    (512, "Castellanos Luis Alberto"),
    (547, "Barbosa Santiago"),
    (548, "Diaz Hernan"),
    (513, "Molina Lizabeth del Carmen"),
    (514, "Luna Santiago Ariel"),
    (515, "Pino Rosarito"),
    (516, "Salazar Cesar Daniel"),
    (517, "Zamorano Waldo Marcelo"),
    (518, "Amer Jessica Johana"),
    (519, "Molina Leila Emilcen"),
    (520, "Diaz Andrea Estefania"),
    (522, "Oliva Franco Matias"),
    (525, "Zarate Oscar Mauricio"),
    (524, "Andrada Nelson Ariel"),
    (521, "Castellano Pablo Jesus"),
    (523, "Bulacio Maria Jose"),
    (526, "Montero Flavia"),
    (527, "Vera Franco Emanuel"),
    (528, "Garcia Tomas Ramon"),
    (529, "Ponce de Leon Federico Antonio"),
    (530, "Varela Joaquin Daniel"),
    (531, "Lesmo Erica Vanina"),
    (532, "Costilla Maria Laura"),
    (533, "Valdiviezo Abiail Estefania"),
    (534, "Barboza Brian Ulises"),
    (535, "Monteros Luciana Abigail"),
    (537, "Freitas Duran Agustina Rocio"),
    (536, "Latina Jimenez Matias Patricio"),
    (538, "Olivares Alejo Daniel"),
    (539, "Ortiz Lucas Manuel"),
    (541, "Rojo Lucero Milagros"),
    (542, "Carbajal Andres Maximiliano"),
    (1001, "Montivero Pablo Exequiel"),
    (1002, "Avila Lobo Santiago Jose"),
    (1003, "Ruiseñol Ruben Dario"),
    (1004, "Gambarte Luciana Ayelen"),
    (1005, "Lescano Elizabeth"),
]


def seed_employees():
    connection = get_connection()

    try:
        connection.executemany(
            """
            INSERT OR IGNORE INTO employees (
                employee_number,
                name
            )
            VALUES (?, ?)
            """,
            EMPLOYEES
        )

        connection.commit()

        print(f"Empleados procesados: {len(EMPLOYEES)}")

    finally:
        connection.close()


if __name__ == "__main__":
    seed_employees()