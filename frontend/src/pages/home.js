
export function renderHome(container) {

    container.innerHTML = `
        <div class="home-page">

            <div class="page-header">

                <h2>
                    Inicio
                </h2>

                <p>
                    Sistema de gestión de asistencia
                </p>

            </div>


            <section class="welcome-card">

                <h3>
                    Bienvenido al sistema de asistencia
                </h3>

                <p>
                    Desde este panel podrás administrar
                    empleados, turnos y asistencia.
                </p>

            </section>


            <section class="dashboard-grid">


                <!-- EMPLEADOS -->

                <div
                    class="dashboard-card"
                    data-navigate="employees"
                >

                    <span class="dashboard-icon">
                        👥
                    </span>

                    <div>

                        <h3>
                            Empleados
                        </h3>

                        <p>
                            Gestionar empleados
                        </p>

                    </div>

                </div>


                <!-- TURNOS -->

                <div
                    class="dashboard-card"
                    data-navigate="turns"
                >

                    <span class="dashboard-icon">
                        🕐
                    </span>

                    <div>

                        <h3>
                            Turnos
                        </h3>

                        <p>
                            Gestionar turnos y horarios
                        </p>

                    </div>

                </div>


                <!-- FERIADOS -->

                <div
                    class="dashboard-card"
                    data-navigate="holidays"
                >

                    <span class="dashboard-icon">
                        🏖️
                    </span>

                    <div>

                        <h3>
                            Feriados
                        </h3>

                        <p>
                            Gestionar días no laborables
                        </p>

                    </div>

                </div>


                <!-- REPORTES -->

                <div
                    class="dashboard-card"
                    data-navigate="reports"
                >

                    <span class="dashboard-icon">
                        📊
                    </span>

                    <div>

                        <h3>
                            Reportes
                        </h3>

                        <p>
                            Consultar información y reportes
                        </p>

                    </div>

                </div>


            </section>

        </div>
    `;
}