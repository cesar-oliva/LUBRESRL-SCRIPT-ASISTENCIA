import { getEmployees } from '../services/employeeService.js';
import {
    getMedicalCertificates,
    createMedicalCertificate,
    updateMedicalCertificate,
    deleteMedicalCertificate,
    getMedicalCertificateFileUrl
} from '../services/medicalCertificateService.js';
import '../styles/medical-certificates.css';

export async function renderMedicalCertificates(container) {
    container.innerHTML = `
        <div class="medical-certificates-page">
            <div class="page-header">
                <div>
                    <h2>Certificados médicos</h2>
                    <p>Registrá ausencias médicas y aplicá el código 42 en la planilla mensual.</p>
                </div>
                <button class="secondary-button home-back-button" type="button" data-action="go-home">← Inicio</button>
            </div>

            <section class="content-card medical-certificate-form-card">
                <div class="content-card-header">
                    <div>
                        <h3 data-role="form-title">Nuevo certificado</h3>
                        <p>La fecha desde y hasta se consideran inclusive.</p>
                    </div>
                </div>
                <form data-role="certificate-form">
                    <input type="hidden" name="id" />
                    <div class="medical-certificate-form-grid">
                        <label class="field">
                            <span>Buscar empleado</span>
                            <input type="text" name="employee_search" list="medical-employees" placeholder="Legajo o nombre" required />
                            <datalist id="medical-employees"></datalist>
                            <input type="hidden" name="employee_number" />
                        </label>
                        <label class="field">
                            <span>Desde</span>
                            <input type="date" name="valid_from" required />
                        </label>
                        <label class="field">
                            <span>Hasta</span>
                            <input type="date" name="valid_until" required />
                        </label>
                        <label class="field">
                            <span>Días involucrados</span>
                            <input type="number" name="days_count" readonly />
                        </label>
                        <label class="field medical-file-field">
                            <span>Certificado médico</span>
                            <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png" />
                            <small data-role="file-help">PDF, JPG, JPEG o PNG. Obligatorio al crear.</small>
                        </label>
                        <label class="checkbox-field medical-active-field">
                            <input type="checkbox" name="active" checked />
                            <span>Activo</span>
                        </label>
                    </div>
                    <div class="table-actions">
                        <button class="primary-button" type="submit" data-role="save-button">Guardar certificado</button>
                        <button class="secondary-button" type="button" data-action="cancel-edit" hidden>Cancelar edición</button>
                    </div>
                </form>
                <p class="medical-certificate-message" data-role="message"></p>
            </section>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Certificados cargados</h3>
                        <p>Los días activos se reflejan automáticamente con el código 42.</p>
                    </div>
                </div>
                <div class="medical-certificates-table-container" data-role="table-container">
                    <div class="empty-state">Cargando certificados...</div>
                </div>
            </section>
        </div>
    `;

    const form = container.querySelector('[data-role="certificate-form"]');
    const employeeSearch = form.querySelector('[name="employee_search"]');
    const employeeNumber = form.querySelector('[name="employee_number"]');
    const employeeList = container.querySelector('#medical-employees');
    const fromInput = form.querySelector('[name="valid_from"]');
    const untilInput = form.querySelector('[name="valid_until"]');
    const daysInput = form.querySelector('[name="days_count"]');
    const fileInput = form.querySelector('[name="file"]');
    const activeInput = form.querySelector('[name="active"]');
    const tableContainer = container.querySelector('[data-role="table-container"]');
    const message = container.querySelector('[data-role="message"]');
    const formTitle = container.querySelector('[data-role="form-title"]');
    const fileHelp = container.querySelector('[data-role="file-help"]');
    const cancelButton = container.querySelector('[data-action="cancel-edit"]');

    let employees = [];
    let certificates = [];

    try {
        employees = await getEmployees();
        employeeList.innerHTML = employees
            .filter((employee) => employee.active)
            .map((employee) => `<option value="${escapeHtml(`${employee.employee_number} - ${employee.name}`)}"></option>`)
            .join('');
        await refresh();
    } catch (error) {
        tableContainer.innerHTML = `<p class="error-message">${escapeHtml(error.message || 'No se pudieron cargar los certificados.')}</p>`;
    }

    container.querySelector('[data-action="go-home"]').addEventListener('click', () => window.navigate('home'));
    employeeSearch.addEventListener('input', () => {
        const employee = findEmployee(employeeSearch.value);
        employeeNumber.value = employee?.employee_number || '';
    });
    fromInput.addEventListener('change', updateDays);
    untilInput.addEventListener('change', updateDays);
    cancelButton.addEventListener('click', resetForm);

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const employee = findEmployee(employeeSearch.value);
        if (!employee) {
            message.textContent = 'Seleccioná un empleado válido de la lista.';
            return;
        }
        if (!fromInput.value || !untilInput.value) {
            message.textContent = 'Indicá el período de validez.';
            return;
        }
        const file = fileInput.files?.[0];
        const id = Number(form.querySelector('[name="id"]').value);
        const payload = {
            id,
            employeeNumber: employee.employee_number,
            validFrom: fromInput.value,
            validUntil: untilInput.value,
            active: activeInput.checked,
            file
        };

        try {
            message.textContent = 'Guardando certificado...';
            if (id) await updateMedicalCertificate(payload);
            else {
                if (!file) {
                    message.textContent = 'Seleccioná el archivo del certificado.';
                    return;
                }
                await createMedicalCertificate(payload);
            }
            await refresh();
            resetForm();
            message.textContent = 'Certificado guardado correctamente.';
        } catch (error) {
            message.textContent = error.message || 'No se pudo guardar el certificado.';
        }
    });

    async function refresh() {
        certificates = await getMedicalCertificates();
        renderTable();
    }

    function renderTable() {
        if (!certificates.length) {
            tableContainer.innerHTML = '<div class="empty-state">No hay certificados médicos cargados.</div>';
            return;
        }
        tableContainer.innerHTML = `
            <table class="data-table">
                <thead><tr><th>Empleado</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Archivo</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                    ${certificates.map((certificate) => `
                        <tr>
                            <td>${escapeHtml(`${certificate.employee_number} - ${certificate.employee_name}`)}</td>
                            <td>${escapeHtml(certificate.valid_from)}</td>
                            <td>${escapeHtml(certificate.valid_until)}</td>
                            <td>${certificate.days_count}</td>
                            <td><a href="${escapeHtml(getMedicalCertificateFileUrl(certificate.id))}" target="_blank" rel="noreferrer">${escapeHtml(certificate.original_filename)}</a></td>
                            <td>${certificate.active ? 'Activo' : 'Inactivo'}</td>
                            <td><div class="table-actions">
                                <button class="table-action-button edit" type="button" data-action="edit-certificate" data-id="${certificate.id}">Editar</button>
                                <button class="table-action-button delete" type="button" data-action="delete-certificate" data-id="${certificate.id}">Eliminar</button>
                            </div></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        tableContainer.querySelectorAll('[data-action="edit-certificate"]').forEach((button) => {
            button.addEventListener('click', () => startEdit(certificates.find((item) => item.id === Number(button.dataset.id))));
        });
        tableContainer.querySelectorAll('[data-action="delete-certificate"]').forEach((button) => {
            button.addEventListener('click', async () => {
                const certificate = certificates.find((item) => item.id === Number(button.dataset.id));
                if (!certificate || !window.confirm(`¿Eliminar el certificado de ${certificate.employee_name}?`)) return;
                try {
                    await deleteMedicalCertificate(certificate.id);
                    await refresh();
                    message.textContent = 'Certificado eliminado y asignaciones restauradas.';
                } catch (error) {
                    message.textContent = error.message || 'No se pudo eliminar el certificado.';
                }
            });
        });
    }

    function startEdit(certificate) {
        if (!certificate) return;
        form.querySelector('[name="id"]').value = certificate.id;
        employeeSearch.value = `${certificate.employee_number} - ${certificate.employee_name}`;
        employeeNumber.value = certificate.employee_number;
        fromInput.value = certificate.valid_from;
        untilInput.value = certificate.valid_until;
        activeInput.checked = certificate.active;
        fileInput.value = '';
        formTitle.textContent = 'Editar certificado';
        fileHelp.textContent = 'Dejá vacío para conservar el archivo actual.';
        cancelButton.hidden = false;
        updateDays();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetForm() {
        form.reset();
        form.querySelector('[name="id"]').value = '';
        employeeNumber.value = '';
        daysInput.value = '';
        activeInput.checked = true;
        formTitle.textContent = 'Nuevo certificado';
        fileHelp.textContent = 'PDF, JPG, JPEG o PNG. Obligatorio al crear.';
        cancelButton.hidden = true;
    }

    function findEmployee(value) {
        const number = String(value).split(' - ')[0].trim();
        return employees.find((employee) => String(employee.employee_number) === number && employee.active);
    }

    function updateDays() {
        if (!fromInput.value || !untilInput.value) {
            daysInput.value = '';
            return;
        }
        const start = new Date(`${fromInput.value}T00:00:00`);
        const end = new Date(`${untilInput.value}T00:00:00`);
        daysInput.value = end >= start ? Math.floor((end - start) / 86400000) + 1 : 0;
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
