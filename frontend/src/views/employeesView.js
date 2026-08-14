import {
    loadEmployees
} from "../services/employeeService.js";

import {
    createEmployeeTable
} from "../components/employeeTable.js";


export async function renderEmployeesView(container) {
    container.innerHTML = "";

    const page = document.createElement("section");

    page.className = "employees-page";

    const header = document.createElement("div");

    header.className = "page-header";

    const title = document.createElement("h1");

    title.textContent = "Empleados";

    const description = document.createElement("p");

    description.textContent =
        "Listado de empleados registrados en el sistema.";

    header.appendChild(title);
    header.appendChild(description);

    page.appendChild(header);

    const content = document.createElement("div");

    content.className = "page-content";

    const loading = document.createElement("p");

    loading.textContent = "Cargando empleados...";

    content.appendChild(loading);

    page.appendChild(content);

    container.appendChild(page);

    try {
        const employees = await loadEmployees();

        content.innerHTML = "";

        const table =
            createEmployeeTable(employees);

        content.appendChild(table);

    } catch (error) {
        content.innerHTML = "";

        const errorMessage =
            document.createElement("div");

        errorMessage.className = "error-message";

        errorMessage.textContent =
            `No se pudieron cargar los empleados: ${error.message}`;

        content.appendChild(errorMessage);
    }
}