export function renderLayout(container) {
    container.innerHTML = `
        <div class="app-layout">
        
            <main
                id="page-content"
                class="main-content"
            >
            </main>

        </div>
    `;

    configureNavigation();
}


function configureNavigation() {

    const menuItems = document.querySelectorAll(
        '[data-navigate]'
    );

    menuItems.forEach(item => {

        item.addEventListener('click', () => {

            const route = item.dataset.navigate;

            if (typeof window.navigate === 'function') {
                window.navigate(route);
            }

            setActiveMenuItem(item);
        });
    });
}


function setActiveMenuItem(activeItem) {

    const menuItems = document.querySelectorAll(
        '[data-navigate]'
    );

    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    activeItem.classList.add('active');
}