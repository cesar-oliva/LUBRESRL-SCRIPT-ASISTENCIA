import {
    formatEmployeeStatus,
    getEmployeeStatusClass
} from "../utils/formatters.js";


export function createStatusBadge(active) {
    const badge = document.createElement("span");

    badge.className = getEmployeeStatusClass(active);
    badge.textContent = formatEmployeeStatus(active);

    return badge;
}