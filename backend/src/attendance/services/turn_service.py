from src.attendance.models.turn import Turn, WorkPeriod
from src.attendance.repositories.turn_repository import TurnRepository


class TurnService:

    def __init__(self, repository=None):
        self.repository = repository or TurnRepository()

    # ---------------------------------------------------------
    # CREAR
    # ---------------------------------------------------------

    def create_turn(self, code, name, periods, active=True):
        """
        Crea un nuevo turno.
        """

        if not code or not code.strip():
            raise ValueError("El código del turno es obligatorio.")

        code = code.strip().upper()

        if not name or not name.strip():
            raise ValueError("El nombre del turno es obligatorio.")

        name = " ".join(name.strip().split())

        if periods is None:
            raise ValueError("El turno debe tener al menos un período.")

        if not periods:
            raise ValueError("El turno debe tener al menos un período.")

        if self.repository.get_by_code(code) is not None:
            raise ValueError(
                f"Ya existe un turno con código {code}."
            )

        turn = Turn(
            id=None,
            code=code,
            name=name,
            periods=periods,
            active=bool(active)
        )

        return self.repository.save(turn)

    # ---------------------------------------------------------
    # OBTENER TODOS
    # ---------------------------------------------------------

    def get_all_turns(self):
        """
        Devuelve todos los turnos.
        """

        return self.repository.get_all()

    # ---------------------------------------------------------
    # OBTENER ACTIVOS
    # ---------------------------------------------------------

    def get_active_turns(self):
        """
        Devuelve solamente los turnos activos.
        """

        return self.repository.get_active()

    # ---------------------------------------------------------
    # BUSCAR POR ID
    # ---------------------------------------------------------

    def get_turn(self, turn_id):
        """
        Busca un turno por ID.
        """

        if turn_id is None:
            raise ValueError("El ID del turno es obligatorio.")

        turn = self.repository.get_by_id(turn_id)

        if turn is None:
            raise ValueError(
                f"No existe un turno con ID {turn_id}."
            )

        return turn

    # ---------------------------------------------------------
    # BUSCAR POR CÓDIGO
    # ---------------------------------------------------------

    def get_turn_by_code(self, code):
        """
        Busca un turno por código.
        """

        if not code or not code.strip():
            raise ValueError("El código del turno es obligatorio.")

        code = code.strip().upper()

        turn = self.repository.get_by_code(code)

        if turn is None:
            raise ValueError(
                f"No existe un turno con código {code}."
            )

        return turn

    # ---------------------------------------------------------
    # ACTUALIZAR
    # ---------------------------------------------------------

    def update_turn(self, turn_id, code, name, periods, active=True):
        """
        Actualiza un turno y sus períodos.
        """

        if turn_id is None:
            raise ValueError("El ID del turno es obligatorio.")

        if not code or not code.strip():
            raise ValueError("El código del turno es obligatorio.")

        code = code.strip().upper()

        if not name or not name.strip():
            raise ValueError("El nombre del turno es obligatorio.")

        name = " ".join(name.strip().split())

        if not periods:
            raise ValueError(
                "El turno debe tener al menos un período."
            )

        current = self.repository.get_by_id(turn_id)

        if current is None:
            raise ValueError(
                f"No existe un turno con ID {turn_id}."
            )

        existing = self.repository.get_by_code(code)

        if existing is not None and existing.id != turn_id:
            raise ValueError(
                f"Ya existe otro turno con código {code}."
            )

        turn = Turn(
            id=turn_id,
            code=code,
            name=name,
            periods=periods,
            active=bool(active)
        )

        updated = self.repository.update(turn)

        if not updated:
            raise ValueError(
                f"No se pudo actualizar el turno {turn_id}."
            )

        return turn

    # ---------------------------------------------------------
    # ELIMINAR
    # ---------------------------------------------------------

    def delete_turn(self, turn_id):
        """
        Elimina un turno.
        """

        if turn_id is None:
            raise ValueError("El ID del turno es obligatorio.")

        if not self.repository.exists(turn_id):
            raise ValueError(
                f"No existe un turno con ID {turn_id}."
            )

        deleted = self.repository.delete(turn_id)

        if not deleted:
            raise ValueError(
                f"No se pudo eliminar el turno {turn_id}."
            )

        return True

    # ---------------------------------------------------------
    # EXISTE
    # ---------------------------------------------------------

    def turn_exists(self, turn_id):
        """
        Comprueba si existe un turno.
        """

        return self.repository.exists(turn_id)

    # ---------------------------------------------------------
    # CANTIDAD
    # ---------------------------------------------------------

    def count_turns(self):
        """
        Cantidad total de turnos.
        """

        return self.repository.count()

    # ---------------------------------------------------------
    # CANTIDAD ACTIVOS
    # ---------------------------------------------------------

    def count_active_turns(self):
        """
        Cantidad de turnos activos.
        """

        return self.repository.count_active()