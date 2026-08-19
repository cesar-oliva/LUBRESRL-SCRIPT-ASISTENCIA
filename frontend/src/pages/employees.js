import {
    getEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from '../services/employeeService.js';
import "../styles/employees.css";


export async function renderEmployees(container) {
    container.innerHTML = `
        <div class="employees-page">
            <div class="page-header">
                <div>
                    <h2>Empleados</h2>
                    <p>Gestión de empleados</p>
                </div>

                <button class="secondary-button home-back-button" type="button" data-action="go-home">
                    ← Inicio
                </button>
            </div>

            <section class="content-card">
                <div class="content-card-header">
                    <div>
                        <h3>Lista de empleados</h3>
                        <p>Empleados registrados en el sistema</p>
                    </div>

                    <button class="primary-button" type="button" data-action="new-employee">
                        Nuevo empleado
                    </button>
                </div>

                <div class="employees-table-container">
                    <p>Cargando empleados...</p>
                </div>
            </section>
        </div>

        <div class="employee-modal hidden" data-role="employee-modal">
            <div class="employee-modal-backdrop" data-action="close-modal"></div>
            <div class="employee-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
                <div class="employee-modal-header">
                    <h3 id="employee-modal-title">Empleado</h3>
                    <div class="header-actions">
                        <button type="button" class="secondary-button small-button" data-action="go-home">Inicio</button>
                        <button type="button" class="icon-button" data-action="close-modal" aria-label="Cerrar">×</button>
                    </div>
                </div>

                <form data-role="employee-form">
                    <input type="hidden" name="employee_number_hidden" />

                    <div class="form-grid">
                        <label class="field">
                            <span>Legajo</span>
                            <input type="number" name="employee_number" min="1" required />
                        </label>

                        <label class="field">
                            <span>Nombre</span>
                            <input type="text" name="name" maxlength="120" required />
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

    const tableContainer = container.querySelector('.employees-table-container');
    const modal = container.querySelector('[data-role="employee-modal"]');
    const form = container.querySelector('[data-role="employee-form"]');

    try {
        const employees = await getEmployees();
        renderEmployeesTable(tableContainer, employees);
        bindEmployeeActions(container, employees, modal, form);
    } catch (error) {
        console.error(error);
        tableContainer.innerHTML = `
            <p class="error-message">No se pudieron cargar los empleados.</p>
        `;
    }

    const openNewButton = container.querySelector('[data-action="new-employee"]');
    const homeButton = container.querySelector('[data-action="go-home"]');

    openNewButton.addEventListener('click', () => openEmployeeModal(modal, form));
    homeButton.addEventListener('click', () => window.navigate('home'));

    modal.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
        button.addEventListener('click', () => closeEmployeeModal(modal, form));
    });

    modal.querySelectorAll('[data-action="go-home"]').forEach((button) => {
        button.addEventListener('click', () => {
            closeEmployeeModal(modal, form);
            window.navigate('home');
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        const employee = {
            employee_number: Number(formData.get('employee_number')),
            name: String(formData.get('name')).trim(),
            active: formData.get('active') === 'on'
        };

        const employeeNumber = Number(formData.get('employee_number_hidden')) || employee.employee_number;

        try {
            if (employeeNumber && form.dataset.mode === 'edit') {
                await updateEmployee(employeeNumber, {
                    name: employee.name,
                    active: employee.active
                });
            } else {
                await createEmployee(employee);
            }

            closeEmployeeModal(modal, form);
            const refreshedEmployees = await getEmployees();
            renderEmployeesTable(tableContainer, refreshedEmployees);
            bindEmployeeActions(container, refreshedEmployees, modal, form);
        } catch (error) {
            alert(error.message || 'No se pudo guardar el empleado.');
        }
    });
}

function bindEmployeeActions(container, employees, modal, form) {
    const editButtons = container.querySelectorAll('[data-action="edit-employee"]');
    const deleteButtons = container.querySelectorAll('[data-action="delete-employee"]');

    editButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const employee = employees.find((item) => item.employee_number === Number(button.dataset.employeeNumber));
            if (!employee) return;
            openEmployeeModal(modal, form, employee);
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const employeeNumber = Number(button.dataset.employeeNumber);
            const employee = employees.find((item) => item.employee_number === employeeNumber);

            if (!employee) return;

            const confirmed = window.confirm(`¿Desea eliminar a ${employee.name}?`);
            if (!confirmed) return;

            try {
                await deleteEmployee(employeeNumber);
                const refreshedEmployees = await getEmployees();
                renderEmployeesTable(container.querySelector('.employees-table-container'), refreshedEmployees);
                bindEmployeeActions(container, refreshedEmployees, modal, form);
            } catch (error) {
                alert(error.message || 'No se pudo eliminar el empleado.');
            }
        });
    });
}

function openEmployeeModal(modal, form, employee = null) {
    modal.classList.remove('hidden');
    form.reset();
    form.dataset.mode = employee ? 'edit' : 'create';

    if (employee) {
        form.querySelector('[name="employee_number_hidden"]').value = employee.employee_number;
        form.querySelector('[name="employee_number"]').value = employee.employee_number;
        form.querySelector('[name="employee_number"]').readOnly = true;
        form.querySelector('[name="name"]').value = employee.name;
        form.querySelector('[name="active"]').checked = employee.active;
        modal.querySelector('#employee-modal-title').textContent = 'Editar empleado';
    } else {
        form.querySelector('[name="employee_number"]').readOnly = false;
        form.querySelector('[name="employee_number_hidden"]').value = '';
        modal.querySelector('#employee-modal-title').textContent = 'Nuevo empleado';
    }
}

function closeEmployeeModal(modal, form) {
    modal.classList.add('hidden');
    form.reset();
    form.dataset.mode = 'create';
    form.querySelector('[name="employee_number_hidden"]').value = '';
    form.querySelector('[name="employee_number"]').readOnly = false;
    modal.querySelector('#employee-modal-title').textContent = 'Nuevo empleado';
}

function renderEmployeesTable(container, employees) {
    if (employees.length === 0) {
        container.innerHTML = `
            <p class="empty-state">No hay empleados registrados.</p>
        `;
        return;
    }

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Legajo</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>

            <tbody>
                ${employees.map((employee) => {
                    const statusClass = employee.active ? 'active' : 'inactive';
                    const statusText = employee.active ? 'Activo' : 'Inactivo';

                    return `
                        <tr>
                            <td>${employee.employee_number}</td>
                            <td>${employee.name}</td>
                            <td>
                                <span class="employee-status ${statusClass}">${statusText}</span>
                            </td>
                            <td>
                                <div class="table-actions">
                                    <button type="button" class="table-action-button edit" data-action="edit-employee" data-employee-number="${employee.employee_number}">Editar</button>
                                    <button type="button" class="table-action-button delete" data-action="delete-employee" data-employee-number="${employee.employee_number}">Eliminar</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}