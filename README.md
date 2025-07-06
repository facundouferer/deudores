# Buscador de Deudores BCRA

Este proyecto es una aplicación web que permite consultar la situación de deudas de una persona o empresa en el sistema financiero argentino, utilizando el CUIT como identificador. Los datos se obtienen en tiempo real desde la API pública del BCRA (Banco Central de la República Argentina).

## ¿Qué hace la aplicación?

- Permite ingresar un CUIT y buscar la información de deudas asociadas a ese identificador.
- Muestra, para cada período disponible:
  - Un **gráfico de torta** (pie chart) que representa la distribución de la deuda entre las distintas entidades financieras.
  - Una **tabla** al lado del gráfico, con las columnas: Entidad, Monto (ARS) y Situación.
- Debajo de los resultados, muestra un **gráfico de líneas** con la evolución histórica del monto total de deuda a lo largo del tiempo.
- Todo el diseño es responsive y utiliza [Materialize CSS](https://materializecss.com/) y [Chart.js](https://www.chartjs.org/).

## Estructura de archivos

- `index.html`: Página principal de la aplicación.
- `style.css`: Estilos personalizados para el layout y visualización.
- `script.js`: Lógica principal de la aplicación, manejo de eventos, llamadas a la API y renderizado de gráficos/tablas.

## ¿Cómo funciona?

1. El usuario ingresa un CUIT y presiona "Buscar".
2. Se consulta la API del BCRA para obtener la información de deudas y deudas históricas.
3. Se muestran los resultados:
   - Por cada período, un gráfico de torta y una tabla, alineados horizontalmente (mitad y mitad).
   - Un gráfico de líneas con la evolución histórica de la deuda total.
4. Los gráficos se generan dinámicamente usando Chart.js.

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Acceso a internet para consumir la API del BCRA y cargar las librerías externas.

## Instalación y uso

1. Descarga o clona este repositorio.
2. Abre `index.html` en tu navegador.
3. Ingresa un CUIT válido y haz clic en "Buscar".

## Créditos

- [Materialize CSS](https://materializecss.com/)
- [Chart.js](https://www.chartjs.org/)
- API pública del [BCRA](https://api.bcra.gob.ar/centraldedeudores/)

---

**Nota:** Esta aplicación es solo para fines informativos y educativos. Los datos provienen de la API pública del BCRA y pueden estar sujetos a cambios o limitaciones.