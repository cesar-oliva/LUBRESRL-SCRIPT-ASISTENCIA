const API_URL = 'http://127.0.0.1:8000';


export async function getEmployees() {

    const response = await fetch(
        `${API_URL}/employees`
    );

    if (!response.ok) {
        throw new Error(
            `Error al obtener empleados: ${response.status}`
        );
    }

    return await response.json();
}