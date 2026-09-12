import { apiFetch } from '../api/client.js';

export function getMonthlyTurnPlan(period) {
    return apiFetch(`/monthly-turns/${encodeURIComponent(period)}`);
}

export function saveMonthlyTurnPlan(period, assignments) {
    return apiFetch(`/monthly-turns/${encodeURIComponent(period)}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignments })
    });
}
