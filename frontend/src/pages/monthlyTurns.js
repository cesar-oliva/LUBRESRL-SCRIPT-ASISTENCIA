import { getEmployees } from '../services/employeeService.js';
import { getActiveTurns } from '../services/turnService.js';
import {
    getMonthlyTurnPlan,
    saveMonthlyTurnPlan
} from '../services/monthlyTurnService.js';
import { getActiveSpecialCodes } from '../services/specialCodeService.js';
import '../styles/monthly-turns.css';

const dayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' });
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' });
let copiedAssignmentCode = '';

export async function renderMonthlyTurns(container) {
    container.innerHTML = `
        <div class="monthly-turns-page">
            <div class="page-header">
                <div>
                    <h2>Planilla mensual de turnos</h2>
                    <p>Asigná un código de turno a cada empleado y día del mes.</p>
                </div>
                <button class="secondary-button home-back-button" type="button" data-action="go-home">← Inicio</button>
            </div>

            <section class="content-card monthly-toolbar-card">
                <div class="monthly-toolbar">
                    <label class="field month-field">
                        <span>Período</span>
                        <input type="month" data-role="period" required />
                    </label>
                    <div class="monthly-actions">
                        <button class="secondary-button" type="button" data-action="copy-assignment">Copiar turno</button>
                        <button class="secondary-button" type="button" data-action="paste-assignment">Pegar turno</button>
                        <button class="primary-button" type="button" data-action="save-plan">Guardar planilla</button>
                    </div>
                </div>
                <div class="monthly-message" data-role="message">Seleccioná un período para comenzar.</div>
                <div class="monthly-shortcuts">Usá las flechas para moverte por las fechas. Atajos: Ctrl/Cmd+C copia y Ctrl/Cmd+V pega el turno seleccionado.</div>
                <div class="monthly-legend" data-role="legend"></div>
            </section>

            <section class="content-card monthly-grid-card">
                <div class="monthly-grid-container" data-role="grid">
                    <div class="empty-state">Cargando planilla...</div>
                </div>
            </section>
        </div>
    `;

    const periodInput = container.querySelector('[data-role="period"]');
    const grid = container.querySelector('[data-role="grid"]');
    const message = container.querySelector('[data-role="message"]');
    const legend = container.querySelector('[data-role="legend"]');
    const saveButton = container.querySelector('[data-action="save-plan"]');
    const copyButton = container.querySelector('[data-action="copy-assignment"]');
    const pasteButton = container.querySelector('[data-action="paste-assignment"]');
    const currentMonth = new Date().toISOString().slice(0, 7);
    periodInput.value = currentMonth;

    container.querySelector('[data-action="go-home"]').addEventListener('click', () => window.navigate('home'));

    try {
        const [employees, turns, specialCodes] = await Promise.all([
            getEmployees(),
            getActiveTurns(),
            getActiveSpecialCodes()
        ]);
        renderLegend(legend, turns, specialCodes);
        await loadPlan(periodInput.value, grid, message, turns, specialCodes);

        periodInput.addEventListener('change', () => loadPlan(periodInput.value, grid, message, turns, specialCodes));
        copyButton.addEventListener('click', () => copyFocusedAssignment(grid, message));
        pasteButton.addEventListener('click', () => pasteAssignment(grid, message));
        saveButton.addEventListener('click', async () => {
            const assignments = collectAssignments(grid);
            saveButton.disabled = true;
            message.textContent = 'Guardando asignaciones...';
            try {
                await saveMonthlyTurnPlan(periodInput.value, assignments);
                message.textContent = `Planilla de ${formatPeriod(periodInput.value)} guardada.`;
            } catch (error) {
                message.textContent = error.message || 'No se pudo guardar la planilla.';
            } finally {
                saveButton.disabled = false;
            }
        });

        grid.dataset.employeeCount = employees.length;
    } catch (error) {
        grid.innerHTML = `<p class="error-message">No se pudo cargar la planilla: ${escapeHtml(error.message)}</p>`;
    }
}

async function loadPlan(period, grid, message, turns, specialCodes) {
    if (!period) return;
    message.textContent = `Cargando ${formatPeriod(period)}...`;
    grid.innerHTML = '<div class="empty-state">Cargando planilla...</div>';
    try {
        const plan = await getMonthlyTurnPlan(period);
        renderGrid(grid, plan, turns, specialCodes);
        message.textContent = `${plan.employees.length} empleado(s) · ${plan.dates.length} día(s) · ${formatPeriod(period)}`;
    } catch (error) {
        grid.innerHTML = `<p class="error-message">${escapeHtml(error.message || 'No se pudo cargar la planilla.')}</p>`;
    }
}

function renderGrid(container, plan, turns, specialCodes) {
    const turnOptions = [
        ...turns.map((turn) => ({ value: turn.code, label: formatTurnLabel(turn) })),
        ...specialCodes.map((specialCode) => ({ value: specialCode.code, label: `${specialCode.code} · ${specialCode.description}` }))
    ];
    const optionsHtml = `<option value=""></option>${turnOptions.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}`;

    container.innerHTML = `
        <table class="monthly-grid">
            <thead>
                <tr>
                    <th class="employee-number-column">Legajo</th>
                    <th class="employee-name-column">Empleado</th>
                    ${plan.dates.map((date) => `<th class="day-column"><span>${formatDay(date)}</span><strong>${date.slice(8, 10)}</strong></th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${plan.employees.map((employee, index) => {
                    const sector = employee.sector || 'Sin sector';
                    const previousSector = plan.employees[index - 1]?.sector || 'Sin sector';
                    const sectorRow = sector !== previousSector
                        ? `<tr class="sector-row"><th colspan="${plan.dates.length + 2}">${escapeHtml(sector)}</th></tr>`
                        : '';

                    return `${sectorRow}
                        <tr>
                            <td class="employee-number-cell">${employee.employee_number}</td>
                            <td class="employee-name-cell">${escapeHtml(employee.name)}</td>
                            ${plan.dates.map((date) => `
                                <td class="assignment-cell">
                                    <select data-employee="${employee.employee_number}" data-date="${date}" aria-label="${escapeHtml(employee.name)} ${date}">
                                        ${optionsHtml}
                                    </select>
                                </td>
                            `).join('')}
                        </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;

    container.querySelectorAll('select').forEach((select) => {
        const value = plan.employees.find((employee) => String(employee.employee_number) === select.dataset.employee)
            ?.assignments?.[select.dataset.date] || '';
        select.value = value;
        select.classList.toggle('has-value', Boolean(value));
        select.addEventListener('change', () => select.classList.toggle('has-value', Boolean(select.value)));
        select.addEventListener('keydown', (event) => handleGridKeydown(event, select, container));
    });
}

function handleGridKeydown(event, select, container) {
    const isCopy = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c';
    const isPaste = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v';

    if (isCopy) {
        event.preventDefault();
        copyFocusedAssignment(container, null, select);
        return;
    }

    if (isPaste) {
        event.preventDefault();
        pasteAssignment(container, null, select);
        return;
    }

    const movement = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1]
    }[event.key];

    if (!movement) return;
    event.preventDefault();

    const selects = Array.from(container.querySelectorAll('select'));
    const dates = [...new Set(selects.map((item) => item.dataset.date))];
    const employees = [...new Set(selects.map((item) => item.dataset.employee))];
    const dateIndex = dates.indexOf(select.dataset.date);
    const employeeIndex = employees.indexOf(select.dataset.employee);
    const nextDateIndex = Math.max(0, Math.min(dates.length - 1, dateIndex + movement[0]));
    const nextEmployeeIndex = Math.max(0, Math.min(employees.length - 1, employeeIndex + movement[1]));
    const target = selects.find((item) => (
        item.dataset.date === dates[nextDateIndex]
        && item.dataset.employee === employees[nextEmployeeIndex]
    ));

    if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}

function copyFocusedAssignment(container, message, focusedSelect = document.activeElement) {
    if (!focusedSelect || focusedSelect.tagName !== 'SELECT' || !container.contains(focusedSelect)) {
        if (message) message.textContent = 'Seleccioná una celda con turno para copiar.';
        return;
    }

    if (!focusedSelect.value) {
        if (message) message.textContent = 'La celda seleccionada no tiene un turno para copiar.';
        return;
    }

    copiedAssignmentCode = focusedSelect.value;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(copiedAssignmentCode).catch(() => {});
    }
    if (message) message.textContent = `Turno ${copiedAssignmentCode} copiado. Elegí otra celda y pegalo.`;
}

function pasteAssignment(container, message, focusedSelect = document.activeElement) {
    if (!focusedSelect || focusedSelect.tagName !== 'SELECT' || !container.contains(focusedSelect)) {
        if (message) message.textContent = 'Seleccioná una celda para pegar el turno.';
        return;
    }

    if (!copiedAssignmentCode) {
        if (message) message.textContent = 'Todavía no hay un turno copiado.';
        return;
    }

    const optionExists = Array.from(focusedSelect.options).some((option) => option.value === copiedAssignmentCode);
    if (!optionExists) {
        if (message) message.textContent = `El turno ${copiedAssignmentCode} no está disponible en este período.`;
        return;
    }

    focusedSelect.value = copiedAssignmentCode;
    focusedSelect.classList.add('has-value');
    focusedSelect.dispatchEvent(new Event('change', { bubbles: true }));
    if (message) message.textContent = `Turno ${copiedAssignmentCode} pegado.`;
}

function collectAssignments(container) {
    return Array.from(container.querySelectorAll('select'))
        .filter((select) => select.value)
        .map((select) => ({
            employee_number: Number(select.dataset.employee),
            assignment_date: select.dataset.date,
            assignment_code: select.value
        }));
}

function renderLegend(container, turns, specialCodes) {
    container.innerHTML = turns.map((turn) => `<span><b>${escapeHtml(turn.code)}</b> ${escapeHtml(formatTurnSchedule(turn))}</span>`).concat(
        specialCodes.map((specialCode) => `<span><b>${escapeHtml(specialCode.code)}</b> ${escapeHtml(specialCode.description)}</span>`)
    ).join('');
}

function formatTurnLabel(turn) {
    return `${turn.code} ${formatTurnSchedule(turn)}`;
}

function formatTurnSchedule(turn) {
    const periods = Array.isArray(turn.periods) ? turn.periods : [];
    const schedule = periods
        .map((period) => `${formatTime(period.start_time)} - ${formatTime(period.end_time)}`)
        .join(' / ');

    return schedule || turn.name || 'Sin horario';
}

function formatTime(value) {
    return String(value || '').slice(0, 5);
}

function formatDay(value) {
    return dayFormatter.format(new Date(`${value}T12:00:00`)).replace('.', '').slice(0, 3).toUpperCase();
}

function formatPeriod(value) {
    const date = new Date(`${value}-01T12:00:00`);
    return `${monthFormatter.format(date)} ${value.slice(0, 4)}`;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
