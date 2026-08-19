import { apiFetch } from '../api/client';

export function getEmployees() {
    return apiFetch('/employees');
}

export function createEmployee(employee) {
    return apiFetch('/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    });
}


export function updateEmployee(employeeNumber, employee) {
    return apiFetch(`/employees/${employeeNumber}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(employee)
    });
}

export function deleteEmployee(employeeNumber)  {
    return apiFetch(`/employees/${employeeNumber}`, {
        method: 'DELETE'
    });
}
