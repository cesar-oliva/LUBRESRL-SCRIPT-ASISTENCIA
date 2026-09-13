import { apiFetch } from '../api/client.js';

export function getMedicalCertificates() {
    return apiFetch('/medical-certificates');
}

export function createMedicalCertificate({ employeeNumber, validFrom, validUntil, file }) {
    const formData = new FormData();
    formData.append('employee_number', employeeNumber);
    formData.append('valid_from', validFrom);
    formData.append('valid_until', validUntil);
    formData.append('file', file);
    return apiFetch('/medical-certificates', { method: 'POST', body: formData });
}

export function updateMedicalCertificate({ id, employeeNumber, validFrom, validUntil, active, file }) {
    const formData = new FormData();
    formData.append('employee_number', employeeNumber);
    formData.append('valid_from', validFrom);
    formData.append('valid_until', validUntil);
    formData.append('active', String(active));
    if (file) formData.append('file', file);
    return apiFetch(`/medical-certificates/${id}`, { method: 'PUT', body: formData });
}

export function deleteMedicalCertificate(id) {
    return apiFetch(`/medical-certificates/${id}`, { method: 'DELETE' });
}

export function getMedicalCertificateFileUrl(id) {
    return `${import.meta.env.VITE_API_URL}/medical-certificates/${id}/file`;
}
