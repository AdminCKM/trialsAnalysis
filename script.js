document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("file-input");
    const dataTableBody = document.querySelector("#data-table tbody");
    const limpiarBtn = document.getElementById("limpiar-btn");
    const descargarBtn = document.getElementById("descargar-btn");

    let data = []; // Variable para almacenar los datos del archivo CSV

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                delimiter: ";", // Especificar el delimitador de punto y coma
                complete: function (results) {
                    console.log("Datos procesados por PapaParse:", results);
                    data = results.data; // Almacenar los datos en la variable data
                    renderTable();
                },
                error: function (error) {
                    console.error("Error al procesar el archivo CSV:", error);
                }
            });
        }
    });

    function renderTable() {
        dataTableBody.innerHTML = ""; // Limpiar tabla antes de renderizar
    
        data.forEach((row, index) => { 
            // Comprobar si la fila tiene datos antes de agregarla
            if (Object.values(row).some(value => value !== "" && value !== null)) {  // Verifica que la fila no esté vacía
                const tr = document.createElement("tr");
    
                // Acceder a las columnas especificadas en el CSV
                const columns = [
                    row['PMID'] || 'N/A',
                    row['TI'] || 'N/A',
                    row['AU'] || 'N/A',
                    row['YYYY'] || 'N/A',
                    row['MMM'] || 'N/A',
                    row['AB'] || 'N/A', // Guardamos AB aquí para usarlo más adelante
                    row['JT'] || 'N/A',
                    row['PT'] || 'N/A',
                    row['DP'] || 'N/A',
                    row['DOI'] || 'N/A',
                    row['URL'] || 'N/A'
                ];
    
                columns.forEach(value => { 
                    const td = document.createElement("td");
                    td.textContent = value; // Manejar columnas faltantes
                    td.setAttribute("data-full-text", value); // Añadir el texto completo como atributo de datos
                    tr.appendChild(td);
                });
    
                // Columna para el botón de análisis
                const reviewTd = document.createElement("td");
                const analysisButton = document.createElement("button");
                analysisButton.textContent = "Análisis";
                analysisButton.classList.add("analysis-btn");
                analysisButton.dataset.id = index;
                reviewTd.appendChild(analysisButton);
                tr.appendChild(reviewTd);
    
                // Columna para estado de inclusión/exclusión
                const inclusionTd = document.createElement("td");
                inclusionTd.textContent = ""; // Inicialmente vacío
                tr.appendChild(inclusionTd);
    
                dataTableBody.appendChild(tr);
            }
        });
    
        console.log("Tabla renderizada con éxito.");
        attachAnalysisButtonEvents();
    }
    

    function attachAnalysisButtonEvents() {
        const analysisButtons = document.getElementsByClassName("analysis-btn");
        for (let btn of analysisButtons) {
            btn.addEventListener("click", function () {
                const id = this.getAttribute("data-id");
                const abContent = data[id]?.['AB'] || "Sin contenido"; // Manejar valores faltantes
                const pmid = data[id]?.['PMID'] || "N/A"; // Manejar valores faltantes
                openAnalysisTab(pmid, abContent, id); // Pasar también el índice para marcar la fila correcta
            });
        }
    }

    function openAnalysisTab(pmid, abContent, rowIndex) {
        // Obtener los valores ingresados en los campos de texto
        const nombreIFA = document.getElementById("nombre-ifa").value;
        const indicacion = document.getElementById("indicacion").value;
    
        // Plantilla de texto con placeholders
        const template = `
            Para el artículo con PMID: ${pmid}, del siguiente párrafo que corresponde a un abstract de artículo científico indica si evalúa la eficacia y/o seguridad de ${nombreIFA} en ${indicacion}, dar los resultados en español.
    
            En caso de que sí evalúe algún aspecto de eficacia, efectividad o seguridad, extraer lo siguiente:
            1- Tipo de estudio
            2- Objetivo, población estudiada y brazos de tratamiento
            3- Lista de resultados con sus datos numéricos por cada outcome medido (a modo de párrafo resumido)
            4- Qué se puede concluir del estudio
    
            Si el artículo no describe ningún aspecto de eficacia, efectividad o seguridad, indica que será excluido y el motivo de exclusión.
    
            [Coloca aquí el AB]
        `;
    
        // Generar el texto final reemplazando los placeholders por los valores ingresados
        const combinedText = template.replace("[Coloca aquí el AB]", abContent);
    
        // Crear una nueva pestaña (nueva ventana del navegador)
        const newTab = window.open('', '_blank');
        newTab.document.open();
        newTab.document.write(`
            <html>
            <head>
                <title>Análisis para PMID ${pmid}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { font-size: 18px; }
                    pre { font-family: inherit; white-space: pre-wrap; word-wrap: break-word; }
                    .btn-container { margin-top: 20px; }
                    .btn-container button { margin-right: 10px; padding: 8px 12px; cursor: pointer; background-color: #4CAF50; color: white; border: none; border-radius: 3px; }
                    .btn-container button:hover { background-color: #45a049; }
                    .btn-container .close-btn { background-color: #f44336; } /* Botón rojo para cerrar */
                    .btn-container .close-btn:hover { background-color: #e53935; }
                </style>
            </head>
            <body>
                <h2>Análisis del artículo:</h2>
                <pre id="analysis-content">${combinedText}</pre> <!-- Mostrar texto combinado -->
                <div class="btn-container">
                    <button id="copy-btn">Copiar</button>
                    <button id="included-btn">Incluido</button>
                    <button id="excluded-btn">Excluido</button>
                    <button id="close-btn" class="close-btn">Cerrar</button>
                </div>
                <script>
                    document.getElementById("copy-btn").addEventListener("click", function () {
                        const content = document.getElementById("analysis-content").textContent;
                        navigator.clipboard.writeText(content).then(function () {
                            alert("Texto copiado al portapapeles.");
                        }).catch(function (error) {
                            alert("Hubo un error al copiar el texto: " + error);
                        });
                    });
    
                    document.getElementById("included-btn").addEventListener("click", function () {
                        window.opener.markInclusion(${rowIndex}, "incluido");
                        window.close();
                    });
    
                    document.getElementById("excluded-btn").addEventListener("click", function () {
                        window.opener.markInclusion(${rowIndex}, "excluido");
                        window.close();
                    });
    
                    document.getElementById("close-btn").addEventListener("click", function () {
                        window.close(); // Cerrar la ventana
                    });
                </script>
            </body>
            </html>
        `);
        newTab.document.close();
    }   
    
    
    // Función para marcar la inclusión en la tabla principal
    window.markInclusion = function (rowIndex, status) {
        const inclusionCell = dataTableBody.rows[rowIndex].cells[dataTableBody.rows[rowIndex].cells.length - 1];
        inclusionCell.textContent = status.charAt(0).toUpperCase() + status.slice(1); // Capitalizar la primera letra
    };

    // Función para limpiar la tabla
    limpiarBtn.addEventListener("click", function () {
    dataTableBody.innerHTML = ""; // Limpiar la tabla
    data = []; // Vaciar los datos
    console.log("Tabla limpiada.");
    });
    
    // Función para descargar la tabla como archivo XLS
    descargarBtn.addEventListener("click", function () {
    const wb = XLSX.utils.table_to_book(dataTableBody, {sheet: "Datos"}); // Convertir la tabla a libro Excel
    XLSX.writeFile(wb, "datos_tabla.xlsx"); // Descargar el archivo como .xlsx
    });
});

