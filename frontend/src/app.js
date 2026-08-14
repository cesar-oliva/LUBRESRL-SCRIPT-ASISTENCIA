import './styles/main.css';

import { renderLayout } from './components/layout/layout.js';

import { renderHome } from './pages/home.js';
import { renderEmployees } from './pages/employees.js';
import { renderTurns } from './pages/turns.js';


const routes = {
    home: renderHome,
    employees: renderEmployees,
    turns: renderTurns
};


export function initializeApp() {

    const app = document.querySelector('#app');

    if (!app) {
        console.error(
            'No se encontró el elemento #app'
        );

        return;
    }

    renderLayout(app);

    const content = document.querySelector(
        '#page-content'
    );

    if (!content) {
        console.error(
            'No se encontró el contenedor #page-content'
        );

        return;
    }


    window.navigate = function (route) {

        const page = routes[route];

        if (!page) {
            console.warn(
                `Ruta no encontrada: ${route}`
            );

            return;
        }

        page(content);

        initializeNavigation();
    };


    window.navigate('home');
}


function initializeNavigation() {

    const navigationElements = document.querySelectorAll(
        '[data-navigate]'
    );

    navigationElements.forEach(element => {

        element.addEventListener('click', () => {

            const route = element.dataset.navigate;

            window.navigate(route);

        });

    });
}