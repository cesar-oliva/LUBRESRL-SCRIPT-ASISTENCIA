import { getEmployees } from '../services/employeeService.js';
import { getActiveTurns } from '../services/turnService.js';
import {
    getMonthlyTurnPlan,
    importMonthlyTurnPlan,
    downloadMonthlyTurnTemplate
} from '../services/monthlyTurnService.js';
import { getActiveSpecialCodes } from '../services/specialCodeService.js';
import { getHolidays } from '../services/holidayService.js';
import '../styles/monthly-turns.css';

const dayFormatter = new Intl.DateTimeFormat('es-AR', { weekday: 'short' });
const monthFormatter = new Intl.DateTimeFormat('es-AR', { month: 'long' });
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
                    <label class="field excel-field">
                        <span>Importar Excel</span>
                        <input type="file" data-role="excel-file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
                    </label>
                    <div class="excel-help">
                        <small>Usá el formato del modelo para importar la planilla.</small>
                        <div class="excel-format-preview" role="img" aria-label="Vista previa del formato Excel">
                            <table>
                                <thead>
                                    <tr><th>Legajo</th><th>Empleado</th><th>Área</th><th>1</th><th>2</th><th>3</th><th>...</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>501</td><td>Nombre</td><td>Playa</td><td>T2</td><td>F</td><td>VAC</td><td>...</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <button class="template-button" type="button" data-action="download-template">Descargar modelo Excel</button>
                    </div>
                    <div class="monthly-actions">
                        <button class="secondary-button" type="button" data-action="import-plan">Cargar Excel</button>
                        <button class="secondary-button" type="button" data-action="export-pdf">Exportar PDF</button>
                    </div>
                </div>
                <div class="monthly-message" data-role="message">Seleccioná un período para comenzar.</div>
                <div class="monthly-shortcuts">El Excel debe tener una fila con la columna Legajo y columnas numeradas del 1 al último día del período.</div>
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
    const excelFile = container.querySelector('[data-role="excel-file"]');
    const importButton = container.querySelector('[data-action="import-plan"]');
    const templateButton = container.querySelector('[data-action="download-template"]');
    const exportButton = container.querySelector('[data-action="export-pdf"]');
    const currentMonth = new Date().toISOString().slice(0, 7);
    periodInput.value = currentMonth;

    container.querySelector('[data-action="go-home"]').addEventListener('click', () => window.navigate('home'));

    try {
        const [employees, turns, specialCodes, holidays] = await Promise.all([
            getEmployees(),
            getActiveTurns(),
            getActiveSpecialCodes(),
            getHolidays()
        ]);
        renderLegend(legend, turns, specialCodes, holidays);
        await loadPlan(periodInput.value, grid, message, turns, specialCodes, holidays);

        periodInput.addEventListener('change', () => loadPlan(periodInput.value, grid, message, turns, specialCodes, holidays));
        exportButton.addEventListener('click', () => exportMonthlyPlanPdf(grid, legend, periodInput.value));
        templateButton.addEventListener('click', async () => {
            templateButton.disabled = true;
            try {
                await downloadMonthlyTurnTemplate(periodInput.value);
            } catch (error) {
                message.textContent = error.message || 'No se pudo descargar el modelo Excel.';
            } finally {
                templateButton.disabled = false;
            }
        });
        importButton.addEventListener('click', async () => {
            if (!excelFile.files[0]) {
                message.textContent = 'Seleccioná un archivo Excel .xlsx.';
                return;
            }
            importButton.disabled = true;
            message.textContent = 'Importando asignaciones...';
            try {
                const result = await importMonthlyTurnPlan(periodInput.value, excelFile.files[0]);
                await loadPlan(periodInput.value, grid, message, turns, specialCodes, holidays);
                message.textContent = `Se importaron ${result.saved} asignaciones de ${result.employees} empleado(s).`;
                excelFile.value = '';
            } catch (error) {
                message.textContent = error.message || 'No se pudo importar el Excel.';
            } finally {
                importButton.disabled = false;
            }
        });
        grid.dataset.employeeCount = employees.length;
    } catch (error) {
        grid.innerHTML = `<p class="error-message">No se pudo cargar la planilla: ${escapeHtml(error.message)}</p>`;
}

async function loadPlan(period, grid, message, turns, specialCodes, holidays) {
    if (!period) return;
    message.textContent = `Cargando ${formatPeriod(period)}...`;
    grid.innerHTML = '<div class="empty-state">Cargando planilla...</div>';
    try {
        const plan = await getMonthlyTurnPlan(period);
        renderGrid(grid, plan, turns, specialCodes, holidays);
        message.textContent = `${plan.employees.length} empleado(s) · ${plan.dates.length} día(s) · ${formatPeriod(period)}`;
    } catch (error) {
        grid.innerHTML = `<p class="error-message">${escapeHtml(error.message || 'No se pudo cargar la planilla.')}</p>`;
    }
}

function renderGrid(container, plan, turns, specialCodes, holidays) {
    const specialCodeValues = new Set(specialCodes.map((specialCode) => specialCode.code));
    const holidaysByDate = new Map(
        holidays
            .filter((holiday) => holiday.active)
            .map((holiday) => [holiday.date, holiday])
    );
    container.innerHTML = `
        <table class="monthly-grid">
            <thead>
                <tr>
                    <th class="employee-number-column">Legajo</th>
                    <th class="employee-name-column">Empleado</th>
                    ${plan.dates.map((date) => {
                        const holiday = holidaysByDate.get(date);
                        const holidayClass = holiday ? ' holiday-column' : '';
                        const holidayLabel = holiday ? ` title="Feriado: ${escapeHtml(holiday.reason)}"` : '';
                        return `<th class="day-column${holidayClass}"${holidayLabel}><span>${formatDay(date)}</span><strong>${date.slice(8, 10)}</strong></th>`;
                    }).join('')}
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
                            ${plan.dates.map((date) => {
                                const holiday = holidaysByDate.get(date);
                                const holidayClass = holiday ? ' holiday-cell' : '';
                                const holidayLabel = holiday ? ` title="Feriado: ${escapeHtml(holiday.reason)}"` : '';
                                const value = employee.assignments?.[date] || '';
                                const valueClass = value ? ' has-value' : '';
                                const specialClass = specialCodeValues.has(value) ? ' special-code' : '';
                                return `
                                <td class="assignment-cell${holidayClass}${valueClass}"${holidayLabel}>
                                    <span class="assignment-value${specialClass}">${escapeHtml(value)}</span>
                                </td>
                            `;
                            }).join('')}
                        </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;

    }
}

function renderLegend(container, turns, specialCodes, holidays) {
    container.innerHTML = turns.map((turn) => `<span><b>${escapeHtml(turn.code)}</b> ${escapeHtml(formatTurnSchedule(turn))}</span>`).concat(
        specialCodes.map((specialCode) => `<span><b>${escapeHtml(specialCode.code)}</b> ${escapeHtml(specialCode.description)}</span>`)
    ).concat([
        '<span class="legend-holiday"><b>Feriado</b> día no laborable</span>',
        '<span class="legend-special"><b>Especial</b> código especial</span>'
    ]).join('');
}

function exportMonthlyPlanPdf(grid, legend, period) {
    const table = grid.querySelector('.monthly-grid');
    if (!table) return;

    const printWindow = window.open('', '_blank', 'width=1400,height=900');
    if (!printWindow) return;

    printWindow.document.write(`
        <!doctype html>
        <html lang="es">
        <head>
            <meta charset="utf-8" />
            <title>Planilla mensual ${escapeHtml(period)}</title>
            <style>
                @page { size: landscape; margin: 7mm; }
                * { box-sizing: border-box; }
                body { margin: 0; color: #172033; font-family: Arial, sans-serif; }
                h1 { margin: 0 0 8px; font-size: 16px; }
                .monthly-legend { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-bottom: 8px; font-size: 7px; }
                .monthly-legend span { display: inline-block; }
                .legend-holiday { color: #9a3412; }
                .legend-special { color: #7e22ce; }
                .monthly-grid { width: max-content; min-width: 100%; border-collapse: collapse; font-size: 7px; }
                .monthly-grid th, .monthly-grid td { border: 1px solid #cbd5e1; text-align: center; white-space: nowrap; }
                .monthly-grid thead th { height: 27px; padding: 2px; background: #e2e8f0; font-size: 7px; }
                .monthly-grid .employee-number-column { width: 40px; min-width: 40px; background: #dbeafe; }
                .monthly-grid .employee-name-column { width: 115px; min-width: 115px; background: #dbeafe; text-align: left; }
                .monthly-grid .day-column, .monthly-grid .assignment-cell { width: 25px; min-width: 25px; }
                .monthly-grid .day-column span, .monthly-grid .day-column strong { display: block; line-height: 1.05; }
                .monthly-grid .day-column span { font-size: 6px; }
                .monthly-grid .day-column strong { font-size: 7px; }
                .employee-number-cell, .employee-name-cell { padding: 2px; background: #fff; font-size: 7px; font-weight: 600; }
                .employee-name-cell { text-align: left !important; }
                .assignment-value { display: block; height: 22px; line-height: 22px; font-size: 7px; font-weight: 700; }
                .assignment-cell.has-value { background: #dcfce7; }
                .monthly-grid thead .holiday-column, .assignment-cell.holiday-cell { background: #fed7aa; color: #9a3412; }
                .assignment-value.special-code { background: #f3e8ff; color: #7e22ce; }
                .monthly-grid .sector-row th { padding: 3px 5px; background: #172033; color: #fff; text-align: left; font-size: 7px; }
                @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
            </style>
        </head>
        <body>
            <h1>Planilla mensual de turnos: ${escapeHtml(formatPeriod(period))}</h1>
            ${legend.outerHTML}
            ${table.outerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
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
