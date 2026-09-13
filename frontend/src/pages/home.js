
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
                    todo el sistema.
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

                <!-- PLANILLA MENSUAL -->
                <div
                    class="dashboard-card"
                    data-navigate="monthlyTurns"
                >

                    <span class="dashboard-icon">
                        📅
                    </span>

                    <div>

                        <h3>
                            Planilla mensual
                        </h3>

                        <p>
                            Asignar turnos por día
                        </p>

                    </div>

                </div>

                <!-- CODIGOS ESPECIALES -->
                <div
                    class="dashboard-card"
                    data-navigate="specialCodes"
                >

                    <span class="dashboard-icon">
                        🏷️
                    </span>

                    <div>
                        <h3>Códigos especiales</h3>
                        <p>Definir eventos de planilla</p>
                    </div>

                </div>

                <!-- CERTIFICADOS MEDICOS -->
                <div
                    class="dashboard-card"
                    data-navigate="medicalCertificates"
                >
                    <span class="dashboard-icon">
                        🩺
                    </span>

                    <div>
                        <h3>Certificados médicos</h3>
                        <p>Gestionar ausencias médicas</p>
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