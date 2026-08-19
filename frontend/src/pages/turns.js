import {
    getTurns,
    createTurn,
    updateTurn,
    deleteTurn
} from '../services/turnService.js';
import '../styles/employees.css';

export async function renderTurns(container) {
    container.innerHTML = `
        <div class="employees-page">
            <div class="page-header">
                <div>
                    <h2>Turnos</h2>
                    <p>Gestión de turnos de trabajo</p>
                </div>

                <button class="secondary-button home-back-button" type="button" data-action="go-home">
                    ← Inicio
                </button>
            </div>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Lista de turnos</h3>
                        <p>Turnos registrados en el sistema</p>
                    </div>

                    <button class="primary-button" type="button" data-action="new-turn">
                        Nuevo turno
                    </button>
                </div>

                <div class="employees-table-container">
                    <p>Cargando turnos...</p>
                </div>
            </section>
        </div>

        <div class="employee-modal hidden" data-role="turn-modal">
            <div class="employee-modal-backdrop" data-action="close-modal"></div>
            <div class="employee-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="turn-modal-title">
                <div class="employee-modal-header">
                    <h3 id="turn-modal-title">Turno</h3>
                    <div class="header-actions">
                        <button type="button" class="secondary-button small-button" data-action="go-home">Inicio</button>
                        <button type="button" class="icon-button" data-action="close-modal" aria-label="Cerrar">×</button>
                    </div>
                </div>

                <form data-role="turn-form">
                    <input type="hidden" name="turn_id_hidden" />

                    <div class="form-grid">
                        <label class="field">
                            <span>Código</span>
                            <input type="text" name="code" maxlength="20" required />
                        </label>

                        <label class="field">
                            <span>Nombre</span>
                            <input type="text" name="name" maxlength="80" required />
                        </label>
                    </div>

                    <div class="periods-section">
                        <div class="periods-header">
                            <span>Horarios</span>
                            <button type="button" class="secondary-button small-button" data-action="add-period">
                                + Agregar horario
                            </button>
                        </div>

                        <div data-role="periods-container"></div>
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

    const tableContainer = container.querySelector('.employees-table-container');
    const modal = container.querySelector('[data-role="turn-modal"]');
    const form = container.querySelector('[data-role="turn-form"]');

    try {
        const turns = await getTurns();
        renderTurnsTable(tableContainer, turns);
        bindTurnActions(container, turns, modal, form);
    } catch (error) {
        console.error(error);
        tableContainer.innerHTML = `
            <p class="error-message">No se pudieron cargar los turnos.</p>
        `;
    }

    const openNewButton = container.querySelector('[data-action="new-turn"]');
    const homeButton = container.querySelector('[data-action="go-home"]');

    openNewButton.addEventListener('click', () => openTurnModal(modal, form));
    homeButton.addEventListener('click', () => window.navigate('home'));

    modal.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
        button.addEventListener('click', () => closeTurnModal(modal, form));
    });

    modal.querySelectorAll('[data-action="go-home"]').forEach((button) => {
        button.addEventListener('click', () => {
            closeTurnModal(modal, form);
            window.navigate('home');
        });
    });

    form.querySelector('[data-action="add-period"]').addEventListener('click', () => {
        const periodsContainer = form.querySelector('[data-role="periods-container"]');
        const periodFields = periodsContainer.querySelectorAll('.period-row');
        renderPeriodFields(periodsContainer, [
            ...Array.from(periodFields).map((row) => ({
                start_time: row.querySelector('[name="start_time[]"]').value,
                end_time: row.querySelector('[name="end_time[]"]').value
            })),
            { start_time: '', end_time: '' }
        ]);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const periodsContainer = form.querySelector('[data-role="periods-container"]');
        const periods = Array.from(periodsContainer.querySelectorAll('.period-row'))
            .map((row) => ({
                start_time: String(row.querySelector('[name="start_time[]"]').value).trim(),
                end_time: String(row.querySelector('[name="end_time[]"]').value).trim()
            }))
            .filter((period) => period.start_time && period.end_time);

        const turn = {
            code: String(formData.get('code')).trim(),
            name: String(formData.get('name')).trim(),
            active: formData.get('active') === 'on',
            periods
        };

        const turnId = Number(formData.get('turn_id_hidden'));

        try {
            if (form.dataset.mode === 'edit' && turnId) {
                await updateTurn(turnId, turn);
            } else {
                await createTurn(turn);
            }

            closeTurnModal(modal, form);
            const refreshedTurns = await getTurns();
            renderTurnsTable(tableContainer, refreshedTurns);
            bindTurnActions(container, refreshedTurns, modal, form);
        } catch (error) {
            alert(error.message || 'No se pudo guardar el turno.');
        }
    });
}

function bindTurnActions(container, turns, modal, form) {
    const editButtons = container.querySelectorAll('[data-action="edit-turn"]');
    const deleteButtons = container.querySelectorAll('[data-action="delete-turn"]');

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const turn = turns.find((item) => item.id === Number(button.dataset.turnId));
            if (!turn) return;
            openTurnModal(modal, form, turn);
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const turnId = Number(button.dataset.turnId);
            const turn = turns.find((item) => item.id === turnId);

            if (!turn) return;

            const confirmed = window.confirm(`¿Desea eliminar el turno ${turn.name}?`);
            if (!confirmed) return;

            try {
                await deleteTurn(turnId);
                const refreshedTurns = await getTurns();
                renderTurnsTable(container.querySelector('.employees-table-container'), refreshedTurns);
                bindTurnActions(container, refreshedTurns, modal, form);
            } catch (error) {
                alert(error.message || 'No se pudo eliminar el turno.');
            }
        });
    });
}

function createPeriodRow(period = { start_time: '', end_time: '' }, index = 0) {
    return `
        <div class="period-row" data-period-index="${index}">
            <label class="field period-field">
                <span>Inicio</span>
                <input type="time" name="start_time[]" value="${period.start_time || ''}" />
            </label>

            <label class="field period-field">
                <span>Fin</span>
                <input type="time" name="end_time[]" value="${period.end_time || ''}" />
            </label>

            <button type="button" class="icon-button remove-period-button" data-action="remove-period" data-index="${index}" aria-label="Quitar horario">−</button>
        </div>
    `;
}

function renderPeriodFields(container, periods = []) {
    const validPeriods = periods.length > 0 ? periods : [{ start_time: '', end_time: '' }];

    container.innerHTML = validPeriods
        .map((period, index) => createPeriodRow(period, index))
        .join('');

    const removeButtons = container.querySelectorAll('[data-action="remove-period"]');

    removeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            const rows = Array.from(container.querySelectorAll('.period-row'));
            rows.splice(index, 1);

            if (rows.length === 0) {
                container.innerHTML = createPeriodRow({ start_time: '', end_time: '' }, 0);
                return;
            }

            container.innerHTML = rows
                .map((row, rowIndex) => createPeriodRow({
                    start_time: row.querySelector('[name="start_time[]"]').value,
                    end_time: row.querySelector('[name="end_time[]"]').value
                }, rowIndex))
                .join('');
        });
    });
}

function openTurnModal(modal, form, turn = null) {
    modal.classList.remove('hidden');
    form.reset();
    form.dataset.mode = turn ? 'edit' : 'create';

    const periodsContainer = form.querySelector('[data-role="periods-container"]');
    const turnPeriods = Array.isArray(turn?.periods) && turn.periods.length > 0
        ? turn.periods
        : [{ start_time: '', end_time: '' }];

    renderPeriodFields(periodsContainer, turnPeriods);

    if (turn) {
        form.querySelector('[name="turn_id_hidden"]').value = turn.id;
        form.querySelector('[name="code"]').value = turn.code;
        form.querySelector('[name="name"]').value = turn.name;
        form.querySelector('[name="active"]').checked = turn.active;

        modal.querySelector('#turn-modal-title').textContent = 'Editar turno';
    } else {
        form.querySelector('[name="turn_id_hidden"]').value = '';
        modal.querySelector('#turn-modal-title').textContent = 'Nuevo turno';
    }
}

function closeTurnModal(modal, form) {
    modal.classList.add('hidden');
    form.reset();
    form.dataset.mode = 'create';
    form.querySelector('[name="turn_id_hidden"]').value = '';
    form.querySelector('[data-role="periods-container"]').innerHTML = '';
    modal.querySelector('#turn-modal-title').textContent = 'Nuevo turno';
}

function formatTurnSchedule(turn) {
    const periods = Array.isArray(turn.periods) ? turn.periods : [];

    if (periods.length === 0) {
        return 'Sin horario';
    }

    return periods
        .map((period) => `${period.start_time} - ${period.end_time}`)
        .join(' / ');
}

function renderTurnsTable(container, turns) {
    if (turns.length === 0) {
        container.innerHTML = `
            <p class="empty-state">No hay turnos registrados.</p>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Horario</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${turns.map((turn) => {
                    const statusClass = turn.active ? 'active' : 'inactive';
                    const statusText = turn.active ? 'Activo' : 'Inactivo';
                    const schedule = formatTurnSchedule(turn);

                    return `
                        <tr>
                            <td>${turn.id}</td>
                            <td>${turn.code}</td>
                            <td>${turn.name}</td>
                            <td>${schedule}</td>
                            <td>
                                <span class="employee-status ${statusClass}">${statusText}</span>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button type="button" class="table-action-button edit" data-action="edit-turn" data-turn-id="${turn.id}">Editar</button>
                                    <button type="button" class="table-action-button delete" data-action="delete-turn" data-turn-id="${turn.id}">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}
