import { apiFetch } from '../api/client';


export function getHolidays() {
    return apiFetch('/holidays');
}

export function createHoliday(holiday) {
    return apiFetch('/holidays', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(holiday)
    });
}

export function updateHoliday(holidayId, holiday) {
    return apiFetch(`/holidays/${holidayId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(holiday)
    });
}

export function deleteHoliday(holidayId) {
    return apiFetch(`/holidays/${holidayId}`, {
        method: 'DELETE'
    });
}
