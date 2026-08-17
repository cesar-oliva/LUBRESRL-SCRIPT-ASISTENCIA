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

export async function getHolidays() {
    const response = await fetch(`${API_URL}/holidays`);
    return handleResponse(response);
}

export async function createHoliday(holiday) {
    const response = await fetch(`${API_URL}/holidays`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(holiday)
    });

    return handleResponse(response);
}

export async function updateHoliday(holidayId, holiday) {
    const response = await fetch(`${API_URL}/holidays/${holidayId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(holiday)
    });

    return handleResponse(response);
}

export async function deleteHoliday(holidayId) {
    const response = await fetch(`${API_URL}/holidays/${holidayId}`, {
        method: 'DELETE'
    });

    return handleResponse(response);
}
