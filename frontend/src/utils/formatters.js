export function formatEmployeeStatus(active) {
    return active ? "Activo" : "Inactivo";
}


export function getEmployeeStatusClass(active) {
    return active
        ? "status-badge status-active"
        : "status-badge status-inactive";
}