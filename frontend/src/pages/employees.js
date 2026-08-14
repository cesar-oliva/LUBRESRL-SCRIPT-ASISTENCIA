import { getEmployees } from '../services/employeeService.js';
import "../styles/employees.css";


export async function renderEmployees(container) {

    container.innerHTML = `
        <div class="employees-page">

            <div class="page-header">

                <h2>
                    Empleados
                </h2>

                <p>
                    Gestión de empleados
                </p>

            </div>


            <section class="content-card">

                <div class="content-card-header">

                    <div>
                        <h3>
                            Lista de empleados
                        </h3>

                        <p>
                            Empleados registrados en el sistema
                        </p>
                    </div>

                    <button class="primary-button">
                        Nuevo empleado
                    </button>

                </div>


                <div class="employees-table-container">

                    <p>
                        Cargando empleados...
                    </p>

                </div>

            </section>

        </div>
    `;


    const tableContainer = container.querySelector(
        '.employees-table-container'
    );


    try {

        const employees = await getEmployees();

        renderEmployeesTable(
            tableContainer,
            employees
        );

    } catch (error) {

        console.error(error);

        tableContainer.innerHTML = `
            <p class="error-message">
                No se pudieron cargar los empleados.
            </p>
        `;
    }
}


function renderEmployeesTable(
    container,
    employees
) {

    if (employees.length === 0) {

        container.innerHTML = `
            <p class="empty-state">
                No hay empleados registrados.
            </p>
        `;

        return;
    }


    container.innerHTML = `
        <table class="data-table">

            <thead>

                <tr>

                    <th>
                        Employee Number
                    </th>

                    <th>
                        Nombre
                    </th>

                    <th>
                        Estado
                    </th>

                </tr>

            </thead>


            <tbody>

                ${employees.map(employee => {

                    const statusClass = employee.active
                        ? 'active'
                        : 'inactive';

                    const statusText = employee.active
                        ? 'Activo'
                        : 'Inactivo';

                    return `

                        <tr>

                            <td>
                                ${employee.employee_number}
                            </td>

                            <td>
                                ${employee.name}
                            </td>

                            <td>

                                <span
                                    class="employee-status ${statusClass}"
                                >
                                    ${statusText}
                                </span>

                            </td>

                        </tr>

                    `;

                }).join('')}

            </tbody>

        </table>
    `;
}