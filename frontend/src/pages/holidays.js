import {
    getHolidays,
    createHoliday,
    updateHoliday,
    deleteHoliday
} from '../services/holidayService.js';

export async function renderHolidays(container) {
    container.innerHTML = `
        <div class="holidays-page">
            <div class="page-header">
                <div>
                    <h2>Feriados</h2>
                    <p>Gestión de días no laborables</p>
                </div>

                <button class="secondary-button home-back-button" type="button" data-action="go-home">
                    ← Inicio
                </button>
            </div>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Lista de feriados</h3>
                        <p>Fechas y motivos registrados</p>
                    </div>

                    <button class="primary-button" type="button" data-action="new-holiday">
                        Nuevo feriado
                    </button>
                </div>

                <div class="holidays-table-container">
                    <p>Cargando feriados...</p>
                </div>
            </section>
        </div>

        <div class="holiday-modal hidden" data-role="holiday-modal">
            <div class="holiday-modal-backdrop" data-action="close-modal"></div>
            <div class="holiday-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="holiday-modal-title">
                <div class="holiday-modal-header">
                    <h3 id="holiday-modal-title">Feriado</h3>
                    <div class="header-actions">
                        <button type="button" class="secondary-button small-button" data-action="go-home">Inicio</button>
                        <button type="button" class="icon-button" data-action="close-modal" aria-label="Cerrar">×</button>
                    </div>
                </div>

                <form data-role="holiday-form">
                    <input type="hidden" name="holiday_id_hidden" />

                    <div class="form-grid">
                        <label class="field">
                            <span>Fecha</span>
                            <input type="date" name="date" required />
                        </label>

                        <label class="field">
                            <span>Motivo</span>
                            <input type="text" name="reason" maxlength="120" required />
                        </label>
                    </div>

                    <label class="checkbox-field">
                        <input type="checkbox" name="active" checked />
                        <span>Activo</span>
                    </label>

                    <div class="modal-actions">
                        <button type="button" class="secondary-button" data-action="close-modal">Cancelar</button>
                        <button type="submit" class="primary-button">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const tableContainer = container.querySelector('.holidays-table-container');
    const modal = container.querySelector('[data-role="holiday-modal"]');
    const form = container.querySelector('[data-role="holiday-form"]');

    try {
        const holidays = await getHolidays();
        renderHolidaysTable(tableContainer, holidays);
        bindHolidayActions(container, holidays, modal, form);
    } catch (error) {
        console.error(error);
        tableContainer.innerHTML = `
            <p class="error-message">No se pudieron cargar los feriados.</p>
        `;
    }

    const openNewButton = container.querySelector('[data-action="new-holiday"]');
    const homeButton = container.querySelector('[data-action="go-home"]');

    openNewButton.addEventListener('click', () => openHolidayModal(modal, form));
    homeButton.addEventListener('click', () => window.navigate('home'));

    modal.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
        button.addEventListener('click', () => closeHolidayModal(modal, form));
    });

    modal.querySelectorAll('[data-action="go-home"]').forEach((button) => {
        button.addEventListener('click', () => {
            closeHolidayModal(modal, form);
            window.navigate('home');
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const holiday = {
            date: String(formData.get('date')).trim(),
            reason: String(formData.get('reason')).trim(),
            active: formData.get('active') === 'on'
        };

        const holidayId = Number(formData.get('holiday_id_hidden'));

        try {
            if (form.dataset.mode === 'edit' && holidayId) {
                await updateHoliday(holidayId, holiday);
            } else {
                await createHoliday(holiday);
            }

            closeHolidayModal(modal, form);
            const refreshedHolidays = await getHolidays();
            renderHolidaysTable(tableContainer, refreshedHolidays);
            bindHolidayActions(container, refreshedHolidays, modal, form);
        } catch (error) {
            alert(error.message || 'No se pudo guardar el feriado.');
        }
    });
}

function bindHolidayActions(container, holidays, modal, form) {
    const editButtons = container.querySelectorAll('[data-action="edit-holiday"]');
    const deleteButtons = container.querySelectorAll('[data-action="delete-holiday"]');

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const holiday = holidays.find((item) => item.id === Number(button.dataset.holidayId));
            if (!holiday) return;
            openHolidayModal(modal, form, holiday);
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const holidayId = Number(button.dataset.holidayId);
            const holiday = holidays.find((item) => item.id === holidayId);

            if (!holiday) return;

            const confirmed = window.confirm(`¿Desea eliminar el feriado del ${holiday.date}?`);
            if (!confirmed) return;

            try {
                await deleteHoliday(holidayId);
                const refreshedHolidays = await getHolidays();
                renderHolidaysTable(container.querySelector('.holidays-table-container'), refreshedHolidays);
                bindHolidayActions(container, refreshedHolidays, modal, form);
            } catch (error) {
                alert(error.message || 'No se pudo eliminar el feriado.');
            }
        });
    });
}

function openHolidayModal(modal, form, holiday = null) {
    modal.classList.remove('hidden');
    form.reset();
    form.dataset.mode = holiday ? 'edit' : 'create';

    if (holiday) {
        form.querySelector('[name="holiday_id_hidden"]').value = holiday.id;
        form.querySelector('[name="date"]').value = holiday.date;
        form.querySelector('[name="reason"]').value = holiday.reason;
        form.querySelector('[name="active"]').checked = holiday.active;
        modal.querySelector('#holiday-modal-title').textContent = 'Editar feriado';
    } else {
        form.querySelector('[name="holiday_id_hidden"]').value = '';
        modal.querySelector('#holiday-modal-title').textContent = 'Nuevo feriado';
    }
}

function closeHolidayModal(modal, form) {
    modal.classList.add('hidden');
    form.reset();
    form.dataset.mode = 'create';
    form.querySelector('[name="holiday_id_hidden"]').value = '';
    modal.querySelector('#holiday-modal-title').textContent = 'Nuevo feriado';
}

function renderHolidaysTable(container, holidays) {
    if (holidays.length === 0) {
        container.innerHTML = `
            <p class="empty-state">No hay feriados registrados.</p>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${holidays.map((holiday) => {
                    const statusClass = holiday.active ? 'active' : 'inactive';
                    const statusText = holiday.active ? 'Activo' : 'Inactivo';

                    return `
                        <tr>
                            <td>${holiday.id}</td>
                            <td>${holiday.date}</td>
                            <td>${holiday.reason}</td>
                            <td>
                                <span class="holiday-status ${statusClass}">${statusText}</span>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button type="button" class="table-action-button edit" data-action="edit-holiday" data-holiday-id="${holiday.id}">Editar</button>
                                    <button type="button" class="table-action-button delete" data-action="delete-holiday" data-holiday-id="${holiday.id}">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
