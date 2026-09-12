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

            <section class="content-card" style="margin-bottom: 16px;">
                <div class="content-card-header">
                    <div>
                        <h3>Importar archivo CrossChex</h3>
                        <p>Subí el Excel y previsualizá los resultados antes de confirmar.</p>
                    </div>
                </div>

                <form data-role="import-form">
                    <div class="form-grid">
                        <label class="field">
                            <span>Período (YYYY-MM)</span>
                            <input type="month" name="period" required />
                        </label>

                        <label class="field">
                            <span>Tolerancia (minutos)</span>
                            <input type="number" name="tolerance" min="0" value="5" required />
                        </label>
                    </div>

                    <label class="field" style="margin-bottom: 16px;">
                        <span>Archivo Excel</span>
                        <input type="file" name="file" accept=".xlsx,.xls" required />
                    </label>

                    <div class="table-actions">
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
    const summaryContainer = container.querySelector('[data-role="summary-container"]');
    const summaryLabel = container.querySelector('[data-role="summary-label"]');
    const detailsLabel = container.querySelector('[data-role="details-label"]');

    let previewPeriod = null;
    let previewEntries = [];

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
            const previewSummary = preview.summary || {};
            const errors = Array.isArray(preview.errors) ? preview.errors : [];

            renderSummary(summaryContainer, previewSummary, errors);
            renderEntries(resultsContainer, previewEntries);

            summaryLabel.textContent = `Previsualización lista para ${period}.`;
            detailsLabel.textContent = `${previewEntries.length} registro(s) analizado(s).`;
            confirmButton.disabled = previewEntries.length === 0;
        } catch (error) {
            previewPeriod = null;
            previewEntries = [];
            confirmButton.disabled = true;

            summaryLabel.textContent = 'No se pudo generar la previsualización.';
            detailsLabel.textContent = 'Error al procesar archivo.';

            summaryContainer.innerHTML = `
                <p class="error-message">${error.message || 'Error desconocido en previsualización.'}</p>
            `;
            resultsContainer.innerHTML = '<div class="empty-state">No hay registros para mostrar.</div>';
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

            const calculatedSummary = summarizeEntries(normalizedRows);
            renderSummary(summaryContainer, calculatedSummary, []);
            renderEntries(resultsContainer, normalizedRows);

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
        }
    });
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
        total_reports: new Set(entries.map((item) => item.report_number)).size,
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
                <tr><th>Total empleados</th><td>${safeSummary.total_reports ?? 0}</td></tr>
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
                    <tr>
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

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
