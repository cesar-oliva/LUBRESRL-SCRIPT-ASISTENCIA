import {
    getEmployees,
    getActiveEmployees,
    getEmployee,
    searchEmployees,
    createEmployee,
    updateEmployee,
    setEmployeeActive,
    deleteEmployee
} from "../api/employeeApi.js";


export async function loadEmployees() {
    return getEmployees();
}


export async function loadActiveEmployees() {
    return getActiveEmployees();
}


export async function loadEmployee(employeeNumber) {
    return getEmployee(employeeNumber);
}


export async function findEmployeesByName(name) {
    return searchEmployees(name);
}


export async function addEmployee(employee) {
    return createEmployee(employee);
}


export async function editEmployee(
    employeeNumber,
    employee
) {
    return updateEmployee(
        employeeNumber,
        employee
    );
}


export async function changeEmployeeStatus(
    employeeNumber,
    active
) {
    return setEmployeeActive(
        employeeNumber,
        active
    );
}


export async function removeEmployee(employeeNumber) {
    return deleteEmployee(employeeNumber);
}