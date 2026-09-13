import {
    importAttendancePreview,
    confirmAttendanceImport,
    getAttendanceReport
} from '../services/reportService.js';
import '../styles/reports.css';

export async function renderReports(container) {
    container.innerHTML = `
        <div class="reports-page">
            <div class="page-header">
                <div>
                    <h2>Reportes de asistencia</h2>
                    <p>Importación mensual y consulta de resultados</p>
                </div>

                <button class="secondary-button home-back-button" type="button" data-action="go-home">
                    ← Inicio
                </button>
            </div>

            <section class="content-card reports-upload-card">
                <div class="content-card-header">
                    <div>
                        <h3>Importar archivo CrossChex</h3>
                        <p>Subí el Excel y previsualizá los resultados antes de confirmar.</p>
                    </div>
                </div>

                <form class="reports-toolbar" data-role="import-form">
                        <label class="field report-period-field">
                            <span>Período (YYYY-MM)</span>
                            <input type="month" name="period" required />
                        </label>

                        <label class="field report-tolerance-field">
                            <span>Tolerancia (minutos)</span>
                            <input type="number" name="tolerance" min="0" value="5" required />
                        </label>

                        <label class="field report-excel-field">
                        <span>Archivo Excel</span>
                        <input type="file" name="file" accept=".xlsx,.xls" required />
                        <small>Seleccioná el archivo CrossChex para generar la previsualización.</small>
                        </label>

                    <div class="reports-actions">
                        <button type="submit" class="primary-button">Previsualizar</button>
                        <button type="button" class="secondary-button" data-action="confirm-import" disabled>Confirmar importación</button>
                    </div>
                </form>
            </section>

            <section class="content-card" style="margin-bottom: 16px;">
                <div class="content-card-header">
                    <div>
                        <h3>Consultar período guardado</h3>
                        <p>Obtener el reporte persistido por período.</p>
                    </div>
                </div>

                <form data-role="report-form">
                    <div class="form-grid">
                        <label class="field">
                            <span>Período (YYYY-MM)</span>
                            <input type="month" name="report_period" required />
                        </label>
                    </div>

                    <div class="table-actions">
                        <button type="submit" class="secondary-button">Cargar reporte</button>
                    </div>
                </form>
            </section>

            <section class="content-card" style="margin-bottom: 16px;">
                <div class="content-card-header">
                    <div>
                        <h3>Resumen</h3>
                        <p data-role="summary-label">Sin datos cargados.</p>
                    </div>
                </div>

                <div class="reports-table-container" data-role="summary-container">
                    <div class="empty-state">Ejecutá una previsualización o cargá un período guardado.</div>
                </div>
            </section>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Detalle de marcaciones</h3>
                        <p data-role="details-label">Sin registros.</p>
                    </div>
                </div>

                <div class="report-detail-filters">
                    <label class="field" for="attendance-employee-filter">
                        <span>Filtrar por empleado</span>
                        <select id="attendance-employee-filter" data-role="employee-filter" disabled>
                            <option value="all">Todos los empleados</option>
                        </select>
                    </label>
                    <label class="field" for="attendance-sort-field">
                        <span>Ordenar por</span>
                        <select id="attendance-sort-field" data-role="sort-field" disabled>
                            <option value="employee_number">Legajo</option>
                            <option value="employee_name">Nombre</option>
                            <option value="date">Fecha</option>
                        </select>
                    </label>
                    <label class="field" for="attendance-sort-direction">
                        <span>Orden</span>
                        <select id="attendance-sort-direction" data-role="sort-direction" disabled>
                            <option value="asc">Ascendente</option>
                            <option value="desc">Descendente</option>
                        </select>
                    </label>
                    <button class="secondary-button report-export-button" type="button" data-action="export-report" disabled>
                        Exportar Excel
                    </button>
                </div>

                <div class="reports-table-container" data-role="results-container">
                    <div class="empty-state">No hay registros para mostrar.</div>
                </div>
            </section>
        </div>
    `;

    const homeButton = container.querySelector('[data-action="go-home"]');
    const importForm = container.querySelector('[data-role="import-form"]');
    const reportForm = container.querySelector('[data-role="report-form"]');
    const confirmButton = container.querySelector('[data-action="confirm-import"]');
    const resultsContainer = container.querySelector('[data-role="results-container"]');
    const employeeFilter = container.querySelector('[data-role="employee-filter"]');
    const sortField = container.querySelector('[data-role="sort-field"]');
    const sortDirection = container.querySelector('[data-role="sort-direction"]');
    const exportButton = container.querySelector('[data-action="export-report"]');
    const summaryContainer = container.querySelector('[data-role="summary-container"]');
    const summaryLabel = container.querySelector('[data-role="summary-label"]');
    const detailsLabel = container.querySelector('[data-role="details-label"]');

    let previewPeriod = null;
    let previewEntries = [];
    let detailEntries = [];

    const currentMonth = new Date().toISOString().slice(0, 7);
    importForm.querySelector('[name="period"]').value = currentMonth;
    reportForm.querySelector('[name="report_period"]').value = currentMonth;

    homeButton.addEventListener('click', () => window.navigate('home'));

    importForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        confirmButton.disabled = true;

        const period = importForm.querySelector('[name="period"]').value;
        const tolerance = Number(importForm.querySelector('[name="tolerance"]').value || '5');
        const file = importForm.querySelector('[name="file"]').files?.[0];

        if (!period || !file) {
            alert('Debe seleccionar período y archivo.');
            return;
        }

        summaryLabel.textContent = `Procesando previsualización para ${period}...`;
        detailsLabel.textContent = 'Calculando marcaciones...';

        try {
            const preview = await importAttendancePreview({
                period,
                file,
                toleranceMinutes: tolerance
            });

            previewPeriod = period;
            previewEntries = Array.isArray(preview.entries) ? preview.entries : [];
            detailEntries = previewEntries;
            const previewSummary = preview.summary || {};
            const errors = Array.isArray(preview.errors) ? preview.errors : [];

            renderSummary(summaryContainer, previewSummary, errors);
            populateEmployeeFilter(employeeFilter, previewEntries);
            updateDetailEntries();

            summaryLabel.textContent = `Previsualización lista para ${period}.`;
            detailsLabel.textContent = `${previewEntries.length} registro(s) analizado(s).`;
            confirmButton.disabled = previewEntries.length === 0;
        } catch (error) {
            previewPeriod = null;
            previewEntries = [];
            detailEntries = [];
            confirmButton.disabled = true;

            summaryLabel.textContent = 'No se pudo generar la previsualización.';
            detailsLabel.textContent = 'Error al procesar archivo.';

            summaryContainer.innerHTML = `
                <p class="error-message">${error.message || 'Error desconocido en previsualización.'}</p>
            `;
            resultsContainer.innerHTML = '<div class="empty-state">No hay registros para mostrar.</div>';
            populateEmployeeFilter(employeeFilter, []);
            updateDetailEntries();
        }
    });

    confirmButton.addEventListener('click', async () => {
        if (!previewPeriod || previewEntries.length === 0) {
            return;
        }

        const confirmed = window.confirm(`¿Desea confirmar la importación del período ${previewPeriod}?`);
        if (!confirmed) {
            return;
        }

        confirmButton.disabled = true;

        try {
            const response = await confirmAttendanceImport({
                period: previewPeriod,
                entries: previewEntries
            });

            alert(`Importación confirmada. Registros guardados: ${response.saved ?? 0}`);
            summaryLabel.textContent = `Importación confirmada para ${previewPeriod}.`;
        } catch (error) {
            alert(error.message || 'No se pudo confirmar la importación.');
            confirmButton.disabled = false;
        }
    });

    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const period = reportForm.querySelector('[name="report_period"]').value;
        if (!period) {
            alert('Debe indicar un período para la consulta.');
            return;
        }

        summaryLabel.textContent = `Consultando reporte guardado de ${period}...`;
        detailsLabel.textContent = 'Cargando registros persistidos...';

        try {
            const reportRows = await getAttendanceReport(period);
            const normalizedRows = Array.isArray(reportRows)
                ? reportRows.map(normalizeReportRow)
                : [];

            detailEntries = normalizedRows;
            const calculatedSummary = summarizeEntries(normalizedRows);
            renderSummary(summaryContainer, calculatedSummary, []);
            populateEmployeeFilter(employeeFilter, normalizedRows);
            updateDetailEntries();

            summaryLabel.textContent = `Reporte cargado para ${period}.`;
            detailsLabel.textContent = `${normalizedRows.length} registro(s) recuperado(s).`;
            confirmButton.disabled = true;
        } catch (error) {
            summaryLabel.textContent = 'No se pudo cargar el reporte.';
            detailsLabel.textContent = 'Error al consultar el período.';

            summaryContainer.innerHTML = `
                <p class="error-message">${error.message || 'Error desconocido al consultar el reporte.'}</p>
            `;
            resultsContainer.innerHTML = '<div class="empty-state">No hay registros para mostrar.</div>';
            detailEntries = [];
            populateEmployeeFilter(employeeFilter, []);
            updateDetailEntries();
        }
    });

    employeeFilter.addEventListener('change', () => {
        updateDetailEntries();
    });

    sortField.addEventListener('change', updateDetailEntries);
    sortDirection.addEventListener('change', updateDetailEntries);

    exportButton.addEventListener('click', () => {
        exportEntriesToExcel(detailEntries, previewPeriod || reportForm.querySelector('[name="report_period"]').value);
    });

    function updateDetailEntries() {
        const selectedEmployee = employeeFilter.value;
        const filteredEntries = detailEntries.filter((entry) => (
            selectedEmployee === 'all'
            || String(getEmployeeNumber(entry)) === selectedEmployee
        ));
        const sortedEntries = sortEntries(filteredEntries, sortField.value, sortDirection.value);

        renderEntries(resultsContainer, sortedEntries);
        detailsLabel.textContent = detailEntries.length === sortedEntries.length
            ? `${sortedEntries.length} registro(s) mostrado(s).`
            : `${sortedEntries.length} de ${detailEntries.length} registro(s) mostrado(s).`;
        sortField.disabled = detailEntries.length === 0;
        sortDirection.disabled = detailEntries.length === 0;
        exportButton.disabled = detailEntries.length === 0;
    }
}

function normalizeReportRow(row) {
    return {
        report_number: row.employee_number ?? row.report_number,
        report_name: row.employee_name ?? row.report_name,
        date: row.date || row.report_date,
        turn: row.turn || row.turn_code,
        expected_entry: row.expected_entry,
        actual_entry: row.actual_entry,
        expected_exit: row.expected_exit,
        actual_exit: row.actual_exit,
        status: row.status || row.state,
        observation: row.observation,
        minutes_late: Number(row.minutes_late || 0),
        minutes_early: Number(row.minutes_early || 0)
    };
}

function summarizeEntries(entries) {
    const summary = {
        total_employees: new Set(entries.map((item) => item.report_number)).size,
        total_turns_analyzed: entries.length,
        total_imported: entries.length,
        duplicated_records: 0,
        late_arrivals: 0,
        early_departures: 0,
        missing_records: 0,
        inconsistent_records: 0
    };

    entries.forEach((entry) => {
        const status = entry.status;
        if (status === 'LLEGADA_TARDE') summary.late_arrivals += 1;
        if (status === 'SALIDA_ANTICIPADA') summary.early_departures += 1;
        if (status === 'LLEGADA_TARDE_Y_SALIDA_ANTICIPADA') {
            summary.late_arrivals += 1;
            summary.early_departures += 1;
        }
        if (['SIN_REGISTRO', 'SIN_REGISTRO_ENTRADA', 'SIN_REGISTRO_SALIDA'].includes(status)) {
            summary.missing_records += 1;
        }
        if (status === 'REGISTRO_INCONSISTENTE') summary.inconsistent_records += 1;
    });

    return summary;
}

function renderSummary(container, summary, errors) {
    const safeSummary = summary || {};
    const errorItems = Array.isArray(errors) ? errors : [];

    container.innerHTML = `
        <table class="data-table">
            <tbody>
                <tr><th>Total empleados</th><td>${safeSummary.total_employees ?? 0}</td></tr>
                <tr><th>Total turnos analizados</th><td>${safeSummary.total_turns_analyzed ?? 0}</td></tr>
                <tr><th>Total importados</th><td>${safeSummary.total_imported ?? 0}</td></tr>
                <tr><th>Duplicados</th><td>${safeSummary.duplicated_records ?? 0}</td></tr>
                <tr><th>Llegadas tarde</th><td>${safeSummary.late_arrivals ?? 0}</td></tr>
                <tr><th>Salidas anticipadas</th><td>${safeSummary.early_departures ?? 0}</td></tr>
                <tr><th>Faltantes</th><td>${safeSummary.missing_records ?? 0}</td></tr>
                <tr><th>Inconsistentes</th><td>${safeSummary.inconsistent_records ?? 0}</td></tr>
            </tbody>
        </table>
        ${errorItems.length > 0
            ? `<div class="error-message" style="margin-top: 12px;">${errorItems.join('<br />')}</div>`
            : ''
        }
    `;
}

function renderEntries(container, entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay registros para mostrar.</div>';
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Legajo</th>
                    <th>Empleado</th>
                    <th>Turno</th>
                    <th>Esp. entrada</th>
                    <th>Real entrada</th>
                    <th>Esp. salida</th>
                    <th>Real salida</th>
                    <th>Estado</th>
                    <th>Obs.</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map((entry) => `
                    <tr class="${entry.observation !== 'Marcación dentro del horario establecido.' ? 'report-row-alert' : ''}">
                        <td>${escapeHtml(entry.date ?? '-')}</td>
                        <td>${escapeHtml(String(entry.employee_number ?? entry.report_number ?? '-'))}</td>
                        <td>${escapeHtml(entry.employee_name ?? entry.report_name ?? '-')}</td>
                        <td>${escapeHtml(entry.turn ?? '-')}</td>
                        <td>${escapeHtml(entry.expected_entry ?? '-')}</td>
                        <td>${escapeHtml(entry.actual_entry ?? '-')}</td>
                        <td>${escapeHtml(entry.expected_exit ?? '-')}</td>
                        <td>${escapeHtml(entry.actual_exit ?? '-')}</td>
                        <td>${escapeHtml(entry.status ?? '-')}</td>
                        <td>${escapeHtml(entry.observation ?? '-')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function populateEmployeeFilter(filter, entries) {
    const employees = new Map();

    entries.forEach((entry) => {
        const employeeNumber = getEmployeeNumber(entry);
        if (employeeNumber !== undefined && employeeNumber !== null) {
            const employeeName = entry.employee_name ?? entry.report_name ?? '';
            employees.set(String(employeeNumber), employeeName);
        }
    });

    filter.innerHTML = `
        <option value="all">Todos los empleados</option>
        ${Array.from(employees.entries())
            .sort(([numberA], [numberB]) => numberA.localeCompare(numberB, undefined, { numeric: true }))
            .map(([number, name]) => `
                <option value="${escapeHtml(number)}">${escapeHtml(`${number} - ${name || 'Sin nombre'}`)}</option>
            `)
            .join('')}
    `;
    filter.disabled = employees.size === 0;
}

function getEmployeeNumber(entry) {
    return entry.employee_number ?? entry.report_number;
}

function sortEntries(entries, field, direction) {
    const multiplier = direction === 'desc' ? -1 : 1;

    return [...entries].sort((entryA, entryB) => {
        let valueA;
        let valueB;

        if (field === 'employee_number') {
            valueA = Number(getEmployeeNumber(entryA));
            valueB = Number(getEmployeeNumber(entryB));
        } else if (field === 'employee_name') {
            valueA = String(entryA.employee_name ?? entryA.report_name ?? '').toLocaleLowerCase();
            valueB = String(entryB.employee_name ?? entryB.report_name ?? '').toLocaleLowerCase();
        } else {
            valueA = String(entryA.date ?? '');
            valueB = String(entryB.date ?? '');
        }

        if (valueA < valueB) return -1 * multiplier;
        if (valueA > valueB) return 1 * multiplier;
        return 0;
    });
}

function exportEntriesToExcel(entries, period) {
    if (!Array.isArray(entries) || entries.length === 0) return;

    const columns = [
        ['Fecha', (entry) => entry.date],
        ['Legajo', (entry) => getEmployeeNumber(entry)],
        ['Empleado', (entry) => entry.employee_name ?? entry.report_name],
        ['Turno', (entry) => entry.turn ?? entry.turn_code],
        ['Entrada esperada', (entry) => entry.expected_entry],
        ['Entrada real', (entry) => entry.actual_entry],
        ['Salida esperada', (entry) => entry.expected_exit],
        ['Salida real', (entry) => entry.actual_exit],
        ['Estado', (entry) => entry.status ?? entry.state],
        ['Observación', (entry) => entry.observation]
    ];
    const tableRows = entries.map((entry) => `
        <tr>${columns.map(([, getValue]) => `<td>${escapeHtml(getValue(entry) ?? '')}</td>`).join('')}</tr>
    `).join('');
    const workbook = `
        <html><head><meta charset="UTF-8"></head><body>
            <table>
                <thead><tr>${columns.map(([label]) => `<th>${escapeHtml(label)}</th>`).join('')}</tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        </body></html>
    `;
    const blob = new Blob([`\ufeff${workbook}`], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-asistencia-${period || 'previsualizacion'}.xls`;
    link.click();
    URL.revokeObjectURL(url);
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
