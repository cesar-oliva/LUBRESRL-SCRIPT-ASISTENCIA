import { renderLayout } from './components/layout.js';

// 🟢 Mapa de rutas dinámico: Solo se importan los archivos cuando la función se ejecuta
const routes = {
    home: () => import('./pages/home.js'),
    employees: () => import('./pages/employees.js'),
    turns: () => import('./pages/turns.js'),
    monthlyTurns: () => import('./pages/monthlyTurns.js'),
    specialCodes: () => import('./pages/specialCodes.js'),
    holidays: () => import('./pages/holidays.js'),
    reports: () => import('./pages/reports.js')
};

export function initializeApp() {
    const app = document.querySelector('#app');

    if (!app) {
        console.error('No se encontró el elemento #app');
        return;
    }

    renderLayout(app);

    const content = document.querySelector('#page-content');

    if (!content) {
        console.error('No se encontró el contenedor #page-content');
        return;
    }

    window.navigate = async function (route) {
        const routeLoader = routes[route];

        if (!routeLoader) {
            console.warn(`Ruta no encontrada: ${route}`);
            return;
        }

        try {

            const module = await routeLoader();
            
            // Asume que las funciones se llaman renderHome, renderEmployees, etc.
            // Si usas "export default", usarías module.default(content)
            const renderFunctionName = `render${route.charAt(0).toUpperCase() + route.slice(1)}`;
            
            if (module[renderFunctionName]) {
                module[renderFunctionName](content);
            } else if (module.default) {
                module.default(content);
            }

            initializeNavigation();
        } catch (error) {
            console.error(`Error al cargar la ruta ${route}:`, error);
        }
    };

    window.navigate('home');
}

function initializeNavigation() {
    const navigationElements = document.querySelectorAll('[data-navigate]');

    navigationElements.forEach(element => {
        // Evita duplicar listeners si initializeNavigation se ejecuta múltiples veces
        element.replaceWith(element.cloneNode(true));
    });

    // Re-seleccionamos los elementos limpios para asignar el click
    document.querySelectorAll('[data-navigate]').forEach(element => {
        element.addEventListener('click', () => {
            const route = element.dataset.navigate;
            window.navigate(route);
        });
    });
}