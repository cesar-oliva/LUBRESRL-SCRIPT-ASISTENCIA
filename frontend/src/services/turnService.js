import { apiFetch } from '../api/client';


export function getTurns() {
    return apiFetch('/turns');
}

export function getActiveTurns() {
    return apiFetch('/turns/active');
}

export function createTurn(turn) {
    return apiFetch('/turns', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(turn)
    });
}


export function updateTurn(turnId, turn)  {
    return apiFetch(`/turns/${turnId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(turn)
    });
}

export function deleteTurn(turnId) {
    return apiFetch(`/turns/${turnId}`, {
        method: 'DELETE'
    });
}
