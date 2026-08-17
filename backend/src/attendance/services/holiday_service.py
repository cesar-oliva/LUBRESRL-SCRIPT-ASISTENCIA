from src.attendance.models.holiday import Holiday
from src.attendance.repositories.holiday_repository import HolidayRepository


class HolidayService:

    def __init__(self, repository=None):
        self.repository = repository or HolidayRepository()

    def _validate_date(self, holiday_date):
        if holiday_date is None or str(holiday_date).strip() == '':
            raise ValueError('La fecha es obligatoria.')

        return str(holiday_date).strip()

    def _validate_reason(self, reason):
        if reason is None or not str(reason).strip():
            raise ValueError('El motivo es obligatorio.')

        return ' '.join(str(reason).strip().split())

    def get_all_holidays(self):
        return self.repository.get_all()

    def get_holiday(self, holiday_id):
        if holiday_id is None:
            raise ValueError('El ID del feriado es obligatorio.')

        holiday = self.repository.get_by_id(holiday_id)

        if holiday is None:
            raise ValueError(f'No existe un feriado con ID {holiday_id}.')

        return holiday

    def create_holiday(self, holiday_date, reason, active=True):
        normalized_date = self._validate_date(holiday_date)
        normalized_reason = self._validate_reason(reason)

        existing = self.repository.get_by_date(normalized_date)
        if existing is not None:
            raise ValueError(f'Ya existe un feriado para la fecha {normalized_date}.')

        holiday = Holiday(
            date=normalized_date,
            reason=normalized_reason,
            active=bool(active)
        )

        return self.repository.save(holiday)

    def update_holiday(self, holiday_id, holiday_date, reason, active=True):
        self.get_holiday(holiday_id)

        normalized_date = self._validate_date(holiday_date)
        normalized_reason = self._validate_reason(reason)

        holiday = Holiday(
            id=holiday_id,
            date=normalized_date,
            reason=normalized_reason,
            active=bool(active)
        )

        updated = self.repository.update(holiday)
        if not updated:
            raise ValueError(f'No se pudo actualizar el feriado {holiday_id}.')

        return holiday

    def delete_holiday(self, holiday_id):
        if holiday_id is None:
            raise ValueError('El ID del feriado es obligatorio.')

        if not self.repository.exists(holiday_id):
            raise ValueError(f'No existe un feriado con ID {holiday_id}.')

        return self.repository.delete(holiday_id)

    def count_holidays(self):
        return self.repository.count()
