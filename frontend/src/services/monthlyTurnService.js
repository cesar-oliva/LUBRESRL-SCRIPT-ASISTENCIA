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

export function importMonthlyTurnPlan(period, file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch(`/monthly-turns/${encodeURIComponent(period)}/import`, {
        method: 'POST',
        body: formData
    });
}

export async function downloadMonthlyTurnTemplate(period) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/monthly-turns/template/${encodeURIComponent(period)}`);
    if (!response.ok) {
        throw new Error('No se pudo descargar el modelo Excel.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planilla-turnos-${period}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
}
