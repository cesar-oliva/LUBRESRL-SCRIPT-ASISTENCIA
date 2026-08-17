const API_BASE_URL = "http://192.168.1.13:8082";

async function handleResponse(response) {
    if (!response.ok) {
        let message = "Error en la solicitud";

        try {
            const data = await response.json();

            if (data.detail) {
                message = data.detail;
            }
        } catch {
            // La respuesta no tenía JSON
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function getEmployees() {
    const response = await fetch(
        `${API_BASE_URL}/employees`
    );

    return handleResponse(response);
}

export async function getActiveEmployees() {
    const response = await fetch(
        `${API_BASE_URL}/employees/active`
    );

    return handleResponse(response);
}

export async function getEmployee(employeeNumber) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${employeeNumber}`
    );

    return handleResponse(response);
}

export async function searchEmployees(name) {
    const response = await fetch(
        `${API_BASE_URL}/employees/search/by-name?name=${encodeURIComponent(name)}`
    );

    return handleResponse(response);
}

export async function createEmployee(employee) {
    const response = await fetch(
        `${API_BASE_URL}/employees`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        }
    );

    return handleResponse(response);
}

export async function updateEmployee(
    employeeNumber,
    employee
) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${employeeNumber}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(employee)
        }
    );

    return handleResponse(response);
}

export async function setEmployeeActive(
    employeeNumber,
    active
) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${employeeNumber}/active?active=${active}`,
        {
            method: "PATCH"
        }
    );

    return handleResponse(response);
}

export async function deleteEmployee(employeeNumber) {
    const response = await fetch(
        `${API_BASE_URL}/employees/${employeeNumber}`,
        {
            method: "DELETE"
        }
    );

    return handleResponse(response);
}