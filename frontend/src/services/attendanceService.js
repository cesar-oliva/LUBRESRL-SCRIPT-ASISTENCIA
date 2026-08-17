const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.13:8082';

async function handleResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof payload === 'object' && payload?.detail
            ? payload.detail
            : 'Ocurrió un error al procesar la solicitud.';
        throw new Error(message);
    }

    return payload;
}

export async function importAttendancePreview({ period, file, toleranceMinutes = 5 }) {
    const formData = new FormData();
    formData.append('period', period);
    formData.append('file', file);
    formData.append('tolerance_minutes', String(toleranceMinutes));

    const response = await fetch(`${API_URL}/attendance/import-preview`, {
        method: 'POST',
        body: formData
    });

    return handleResponse(response);
}

export async function confirmAttendanceImport({ period, entries }) {
    const response = await fetch(`${API_URL}/attendance/import-confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ period, entries })
    });

    return handleResponse(response);
}

export async function getAttendanceReport(period) {
    const response = await fetch(`${API_URL}/attendance/report/${encodeURIComponent(period)}`);
    return handleResponse(response);
}
