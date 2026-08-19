const API_URL = import.meta.env.VITE_API_URL;

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

export async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    return handleResponse(response);
}