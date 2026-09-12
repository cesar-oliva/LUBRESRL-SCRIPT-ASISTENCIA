import { apiFetch } from '../api/client.js';

export function getSpecialCodes() {
    return apiFetch('/special-codes');
}

export function getActiveSpecialCodes() {
    return apiFetch('/special-codes/active');
}

export function createSpecialCode(specialCode) {
    return apiFetch('/special-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialCode)
    });
}

export function updateSpecialCode(id, specialCode) {
    return apiFetch(`/special-codes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(specialCode)
    });
}

export function deleteSpecialCode(id) {
    return apiFetch(`/special-codes/${id}`, { method: 'DELETE' });
}
