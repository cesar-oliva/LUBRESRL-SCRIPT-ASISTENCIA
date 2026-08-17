const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.13:8082';

async function handleResponse(response) {
    if (!response.ok) {
        let message = 'Error en la solicitud';

        try {
            const errorData = await response.json();
            message = errorData.detail || message;
        } catch {
            // Ignorar errores sin JSON
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

export async function getTurns() {
    const response = await fetch(`${API_URL}/turns`);
    return handleResponse(response);
}

export async function createTurn(turn) {
    const response = await fetch(`${API_URL}/turns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(turn)
    });

    return handleResponse(response);
}

export async function updateTurn(turnId, turn) {
    const response = await fetch(`${API_URL}/turns/${turnId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(turn)
    });

    return handleResponse(response);
}

export async function deleteTurn(turnId) {
    const response = await fetch(`${API_URL}/turns/${turnId}`, {
        method: 'DELETE'
    });

    return handleResponse(response);
}
