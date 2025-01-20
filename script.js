let currentIndex = 0; // Índice del registro actual
let rowsData = []; // Array para almacenar los datos de la tabla

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    console.log("Archivo seleccionado:", file.name);

    Papa.parse(file, {
        complete: function(result) {
            let rows = result.data.map(row => row.map(cell => cell.trim())); // Eliminar espacios en blanco
            
            console.log("Filas procesadas:", rows); // Verificar el formato de las filas
            
            // Omitir la primera fila (encabezado)
            rows.shift(); 

            populateTable(rows);
        },
        header: false,  // No interpretar la primera fila como encabezado automáticamente
        delimiter: ";", // Especificar el delimitador de punto y coma
        skipEmptyLines: true, // Omitir líneas vacías
    });
});

function populateTable(data) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    data.forEach((row, index) => {
        if (row.length < 11) {
            console.warn("Fila con menos de 11 columnas ignorada:", row);
            return;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td> <!-- Número de fila -->
            <td>${row[0] || 'N/A'}</td>
            <td>${row[1] || 'N/A'}</td>
            <td>${row[2] || 'N/A'}</td>
            <td>${row[3] || 'N/A'}</td>
            <td>${row[4] || 'N/A'}</td>
            <td>${row[5] || 'N/A'}</td>
            <td>${row[6] || 'N/A'}</td>
            <td>${row[7] || 'N/A'}</td>
            <td>${row[8] || 'N/A'}</td>
            <td>${row[9] || 'N/A'}</td>
            <td><a href="${row[10] || '#'}" target="_blank">${row[10] || 'N/A'}</a></td>
            <td><button onclick="showAnalysis('${index + 1}','${row[0]}', '${row[1]}', '${row[10]}', '${row[5]}')">Analisis</button></td>
            <!-- Columna de Inclusión con un select -->
            <td id="inclusion-${index + 1}">
                <select onchange="saveInclusionStatus(${index}, this)">
                    <option value="N/A" ${localStorage.getItem(`inclusion-${index}`) === 'N/A' ? 'selected' : ''}>N/A</option>
                    <option value="incluido" ${localStorage.getItem(`inclusion-${index}`) === 'incluido' ? 'selected' : ''}>Incluido</option>
                    <option value="excluido" ${localStorage.getItem(`inclusion-${index}`) === 'excluido' ? 'selected' : ''}>Excluido</option>
                </select>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    updateNavigationButtons();

} 


function showAnalysis(index, pmid, ti, url, ab) {
    const ifa = document.getElementById('nombreIFA').value;
    const indicacion = document.getElementById('indicacion').value;

    const abTemplate = `
        <p>Para el artículo con PMID: ${pmid}, del siguiente párrafo que corresponde a un abstract de artículo científico indica si evalúa la eficacia y/o seguridad de <strong>${ifa}</strong> en <strong>${indicacion}</strong>, dar los resultados en español.</p>
        <p>En caso de que sí evalúe algún aspecto de eficacia, efectividad o seguridad, extraer lo siguiente:</p>
        <ul>
            <li>1- Tipo de estudio</li>
            <li>2- Objetivo, población estudiada y brazos de tratamiento</li>
            <li>3- Lista de resultados con sus datos numéricos por cada outcome medido (a modo de párrafo resumido)</li>
            <li>4- Qué se puede concluir del estudio</li>
        </ul>
        <p>Si el artículo no describe ningún aspecto de eficacia, efectividad o seguridad, indica que será excluido y el motivo de exclusión.</p>
        <p>${ab}</p>
    `;

    const analysisWindow = window.open(`analysisWindow.html?index=${index}`, '_blank', 'width=1200,height=800');

    analysisWindow.onload = function() {
        // Agregar el número de fila a la ventana emergente
        analysisWindow.document.getElementById('index').textContent = index;
        analysisWindow.document.getElementById('pmid').textContent = pmid;
        analysisWindow.document.getElementById('ti').textContent = ti;
        analysisWindow.document.getElementById('url').href = url;
        analysisWindow.document.getElementById('url').textContent = url;
        analysisWindow.document.getElementById('ab').innerHTML = abTemplate;
    }; 
}
