export function renderTurns(container) {
    container.innerHTML = `
        <section class="page">

            <div class="page-header">
                <div>
                    <h1>Turnos</h1>
                    <p>Gestión de turnos de trabajo</p>
                </div>
            </div>

            <div class="card">

                <div class="card-header">
                    <h2>Turnos registrados</h2>

                    <button
                        class="button button-primary"
                        type="button"
                    >
                        Nuevo turno
                    </button>
                </div>

                <div class="empty-state">
                    <p>
                        No hay turnos para mostrar todavía.
                    </p>
                </div>

            </div>

        </section>
    `;
}