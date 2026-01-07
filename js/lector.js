const divdatoshistorial = document.getElementById("datosdocumentosH");
const divdatoscalculadora = document.getElementById("datosdocumentosC");
const divcalculadoraincorrecta = document.getElementById("calculadoraincorrecta");
const divcalnov = document.getElementById("cnovig");
const divhnovig = document.getElementById("hnovig");
const loadingIndicator = document.getElementById("loading-indicator");

function procesarArchivoH() {
    const archivo = document.getElementById('historial').files[0];
    divdatoshistorial.style.display = "block";

    if (!archivo) {
        alert('Por favor, seleccione un archivo PDF.');
        return;
    }

    const lector = new FileReader();
    lector.onload = function(evento) {
        const datos = evento.target.result;
        if (archivo.type === 'application/pdf') {
            procesarPDFCHistorial(datos);
        } else {
            alert('Tipo de archivo no compatible. Por favor, seleccione un archivo PDF.');
        }
    };
    lector.readAsArrayBuffer(archivo);
}

async function procesarPDFCHistorial(datos) {
    loadingIndicator.style.display = 'block';
    divhnovig.style.display = "none";

    const pdf = await pdfjsLib.getDocument(datos).promise;
    const numPages = pdf.numPages;
    let textoCompleto = '';

    // Intenta extraer texto directamente
    for (let i = 1; i <= numPages; i++) {
        const pagina = await pdf.getPage(i);
        const contenido = await pagina.getTextContent();
        const textoPagina = contenido.items.map(item => item.str).join(' ');
        textoCompleto += textoPagina + '\n';
    }

    // Si el texto es muy corto, probablemente es una imagen, usa OCR
    if (textoCompleto.trim().length < 100) { 
        console.log("Texto no encontrado, iniciando OCR...");
        textoCompleto = ''; // Resetea el texto para llenarlo con el resultado del OCR
        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            const { data: { text } } = await Tesseract.recognize(
                canvas,
                'spa', // Usar español
                { logger: m => console.log(m) } // Para ver el progreso en la consola
            );
            textoCompleto += text + '\n';
        }
    }

    loadingIndicator.style.display = 'none';
    procesarTextoExtraido(textoCompleto);
}

function procesarTextoExtraido(textoCompleto) {
    console.log(textoCompleto);

    // =============================
    // 🔍 Extraer Fecha del Historial
    // =============================
    const regexFechaHistorial = /([^\s,]+,\d{2}\s+[^\s,]+,\d{4}\s+\d{2}:\d{2}:\d{2}\s+[APap][Mm])/;
    const fechaHistorialMatch = textoCompleto.match(regexFechaHistorial);
    const fechaHistorial = fechaHistorialMatch ? fechaHistorialMatch[1] : "No encontrada";
    console.log(fechaHistorial);

    if (fechaHistorial !== "No encontrada") {
        const limpio = fechaHistorial.replace(/^[^,]+,/, '').trim();
        const normalizado = limpio.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        const fechaFinal = normalizado.replace(/([ap])m/i, (_, l) => l.toUpperCase() + 'M');
        const meses = {
            "Enero": "January", "Febrero": "February", "Marzo": "March",
            "Abril": "April", "Mayo": "May", "Junio": "June",
            "Julio": "July", "Agosto": "August", "Septiembre": "September",
            "Octubre": "October", "Noviembre": "November", "Diciembre": "December"
        };
        const fechaFinalEnglish = fechaFinal.replace(
            /(\d{2})\s+(\w+)\s+(\d{4})/,
            (_, dia, mes, anio) => `${dia} ${meses[mes]} ${anio}`
        );
        const fecha = new Date(fechaFinalEnglish);
        
        if (!isNaN(fecha.getTime())) {
            const yyyy = fecha.getFullYear();
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const dd = String(fecha.getDate()).padStart(2, '0');
            const fechaFormateada = `${yyyy}-${mm}-${dd}`;
            const fechaHTML = `${dd}-${mm}-${yyyy}`;
            
            const partesFecha = fechaFormateada.split('-');
            const fechaDoc = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
            const fechaActual = new Date();
            const diferenciaMesesH = calcularDiferenciaMeses(fechaDoc, fechaActual);

            if (diferenciaMesesH > 5 || fechaDoc.getFullYear() !== 2026) {
                divdatoshistorial.style.display = "none";
                divhnovig.style.display = "block";
            }

            document.getElementById("fechah").value = fechaHTML;
            document.getElementById("fechah").readOnly = true;
        } else {
            console.error("Fecha inválida");
        }
    }

    // =============================
    // 🔍 Otros Datos del Historial
    // =============================
    const regexPromedio1 = /Promedio:\s+([\d.]+)/;
    const regexPromedio2 = /Promedio:\s*[-–—]?\s*([\d.]+)/;
    let promedioMatch = textoCompleto.match(regexPromedio1);
    if (!promedioMatch) {
    promedioMatch = textoCompleto.match(regexPromedio2);
    }
    const promedio = promedioMatch ? promedioMatch[1] : "No encontrado";
    console.log(promedio); 


    const regexAvance = /Porcentaje de Avance:\s+([\d.]+)%/;
    const avanceMatch = textoCompleto.match(regexAvance);
    const avance = avanceMatch ? avanceMatch[1] : "No encontrado";

    const regexMatricula = /MATRICULA:\s+(.+?)\s+FECHA ACUERDO:/;
    const matriculaMatch = textoCompleto.match(regexMatricula);
    const matricula = matriculaMatch ? matriculaMatch[1] : "No encontrada";

    const regexAlumno = /NOMBRE:\s+(.+?)\s+PROGRAMA:/;
    const alumnoMatch = textoCompleto.match(regexAlumno);
    const alumno = alumnoMatch ? alumnoMatch[1] : "No encontrado";

    const regexCampus1 = /CAMPUS:\s*UNIVA\.-\s*([\w\s]+)\s+MODALIDAD:/; 
    const regexCampus2 = /CAMPUS:\s*UNIVA[.\-–—]*\s*([^\n]+)/i;
    let campusMatch = textoCompleto.match(regexCampus1);
    if (!campusMatch) {
    campusMatch = textoCompleto.match(regexCampus2);
    }
    const campus = campusMatch
    ? campusMatch[1].trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    : "No encontrado";
    console.log(campus); 

    // ====================== 
    // 📋 Cargar al formulario
    // ====================== 
    document.getElementById("promedio").value = promedio;
    document.getElementById("promedio").readOnly = true;

    document.getElementById("avance").value = avance;
    document.getElementById("avance").readOnly = true;

    document.getElementById("matricula").value = matricula;
    document.getElementById("matricula").readOnly = true;

    document.getElementById("alumno").value = alumno;
    document.getElementById("alumno").readOnly = true;

    document.getElementById("campus").value = campus;
    document.getElementById("campus").readOnly = true;
}

function calcularDiferenciaMeses(fecha1, fecha2) {
    const year1 = fecha1.getFullYear();
    const month1 = fecha1.getMonth();
    const year2 = fecha2.getFullYear();
    const month2 = fecha2.getMonth();

    return (year2 - year1) * 12 + (month2 - month1);
}

function formatearMonto(input) {
    let valor = input.value;
    valor = valor.replace(/[^\d.]/g, '');
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes[1];
    }
    let entero = partes[0];
    let decimal = partes[1] ? partes[1].substring(0, 2) : '';
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    input.value = decimal ? `${entero}.${decimal}` : entero;
}

document.addEventListener("DOMContentLoaded", function () {
    const comentarios = document.querySelector('textarea[name="CASECF39"]');
    comentarios.value = "Renovación hecha directamente por el campus";
    comentarios.readOnly = true;
});
