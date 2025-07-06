const identificacionInput = document.getElementById('cuitInput');
const searchButton = document.getElementById('searchButton');
const resultsContainer = document.getElementById('resultsContainer');

const API_URL = 'https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/';

searchButton.addEventListener('click', () => {
    const identificacion = identificacionInput.value.trim();
    if (identificacion) {
        searchDeudores(identificacion);
    }
});

async function searchDeudores(identificacion) {
    resultsContainer.innerHTML = 'Buscando...';

    try {
        const response = await fetch(`${API_URL}${identificacion}`);

        if (response.ok) {
            const data = await response.json();
            displayResults(data);
            fetchAndDrawHistorico(identificacion); // <-- Agregado aquí
        } else {
            resultsContainer.innerHTML = 'Error al buscar la información.';
        }
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = 'Ocurrió un error en la búsqueda.';
    }
}

async function fetchAndDrawHistorico(identificacion) {
    const HISTORICO_URL = `https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/${identificacion}`;
    const lineChartContainerId = 'lineChartContainer';
    // Elimina el gráfico anterior si existe
    const prevContainer = document.getElementById(lineChartContainerId);
    if (prevContainer) prevContainer.remove();

    try {
        const response = await fetch(HISTORICO_URL);
        if (response.ok) {
            const data = await response.json();
            if (data.status === 200 && data.results && data.results.periodos) {
                // Invierte el array para que los más antiguos estén primero
                const periodos = [...data.results.periodos].reverse();
                const labels = periodos.map(p => {
                    const year = p.periodo.substring(0, 4);
                    const month = p.periodo.substring(4, 6);
                    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                    return `${meses[parseInt(month, 10) - 1]} ${year}`;
                });
                const montos = periodos.map(p =>
                    p.entidades.reduce((sum, e) => sum + (e.monto * 1000), 0)
                );

                // Crea el canvas y lo agrega al DOM
                const container = document.createElement('div');
                container.id = lineChartContainerId;
                container.style.margin = '40px 0';
                container.innerHTML = `<h4>Evolución histórica de la deuda total</h4>
                    <canvas id="lineChartHistorico" height="100"></canvas>`;
                resultsContainer.parentNode.appendChild(container);

                const ctx = document.getElementById('lineChartHistorico').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Deuda total (ARS)',
                            data: montos,
                            fill: false,
                            borderColor: '#1976d2',
                            backgroundColor: '#1976d2',
                            tension: 0.2,
                            pointRadius: 4,
                            pointBackgroundColor: '#1976d2'
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { display: false },
                            title: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: value => value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
                                }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        // Opcional: puedes mostrar un mensaje de error si falla la carga histórica
        console.error('Error al cargar histórico:', error);
    }
}

function displayResults(data) {
    if ((data.status === 0 || data.status === 200) && data.results) {
        const { denominacion, periodos } = data.results;
        let html = `<h2>${denominacion}</h2>`;

        if (periodos && periodos.length > 0) {
            periodos.forEach((p, idx) => {
                // Formatea el período (ej: 202505 -> Mayo 2025)
                const year = p.periodo.substring(0, 4);
                const month = p.periodo.substring(4, 6);
                const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                const periodoStr = `${meses[parseInt(month, 10) - 1]} ${year}`;

                html += `<h3>Período: ${periodoStr}</h3>`;

                html += `<div class="periodo-flex">`;

                // Gráfico de torta (1/3)
                html += `<div class="grafico-torta"><canvas id="pieChart${idx}" width="200" height="200"></canvas></div>`;

                // Tabla (2/3)
                if (p.entidades && p.entidades.length > 0) {
                    html += `
                        <div class="tabla-entidades">
                        <table>
                            <thead>
                                <tr>
                                    <th>Entidad</th>
                                    <th>Monto (ARS)</th>
                                    <th>Situación</th>
                                </tr>
                            </thead>
                            <tbody>
                    `;
                    p.entidades.forEach(e => {
                        const montoPesos = (e.monto * 1000).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
                        html += `
                            <tr>
                                <td>${e.entidad}</td>
                                <td>${montoPesos}</td>
                                <td>${e.situacion}</td>
                            </tr>
                        `;
                    });
                    html += `
                            </tbody>
                        </table>
                        </div>
                    `;
                } else {
                    html += '<div class="tabla-entidades"><p>No se encontraron entidades para este período.</p></div>';
                }

                html += `</div>`; // Cierra .periodo-flex
            });
        } else {
            html += '<p>No se encontraron períodos.</p>';
        }

        resultsContainer.innerHTML = html;

        // Dibuja los gráficos de torta para cada período
        if (periodos && periodos.length > 0) {
            periodos.forEach((p, idx) => {
                if (p.entidades && p.entidades.length > 0) {
                    const ctx = document.getElementById(`pieChart${idx}`).getContext('2d');
                    const labels = p.entidades.map(e => e.entidad);
                    const dataMontos = p.entidades.map(e => e.monto * 1000);
                    new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dataMontos,
                                backgroundColor: [
                                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                                    '#9966FF', '#FF9F40', '#C9CBCF', '#B2FF66', '#FF6666'
                                ],
                            }]
                        },
                        options: {
                            plugins: {
                                legend: {
                                    position: 'bottom'
                                },
                                title: {
                                    display: true,
                                    text: 'Deuda por Entidad'
                                }
                            }
                        }
                    });
                }
            });
        }
    } else {
        resultsContainer.innerHTML = 'No se encontraron resultados.';
    }
}