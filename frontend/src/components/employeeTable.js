import { createStatusBadge } from "./statusBadge.js";


export function createEmployeeTable(employees) {
    const container = document.createElement("div");

    container.className = "table-container";

    if (employees.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-message";
        emptyMessage.textContent =
            "No hay empleados para mostrar.";

        container.appendChild(emptyMessage);

        return container;
    }

    const table = document.createElement("table");

    table.className = "employee-table";

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = [
        "Employee Number",
        "Nombre",
        "Estado"
    ];

    headers.forEach((header) => {
        const th = document.createElement("th");

        th.textContent = header;

        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");

    employees.forEach((employee) => {
        const row = document.createElement("tr");

        const employeeNumberCell =
            document.createElement("td");

        employeeNumberCell.textContent =
            employee.employee_number;

        const nameCell =
            document.createElement("td");

        nameCell.textContent = employee.name;

        const statusCell =
            document.createElement("td");

        statusCell.appendChild(
            createStatusBadge(employee.active)
        );

        row.appendChild(employeeNumberCell);
        row.appendChild(nameCell);
        row.appendChild(statusCell);

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);

    container.appendChild(table);

    return container;
}