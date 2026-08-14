export function renderHome() {

    const container = document.querySelector("#page-content");


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


                <div class="dashboard-card">

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


                <div class="dashboard-card">

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


                <div class="dashboard-card">

                    <span class="dashboard-icon">
                        📋
                    </span>

                    <div>

                        <h3>
                            Asistencia
                        </h3>

                        <p>
                            Registrar y consultar asistencia
                        </p>

                    </div>

                </div>


                <div class="dashboard-card">

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