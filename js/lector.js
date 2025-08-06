
const divdatoshistorial = document.getElementById("datosdocumentosH");
const divdatoscalculadora = document.getElementById("datosdocumentosC");
const divcalculadoraincorrecta = document.getElementById("calculadoraincorrecta");
const divcalnov = document.getElementById("cnovig");
const divhnovig = document.getElementById("hnovig");

function procesarArchivoH() {
    const archivo = document.getElementById('historial').files[0];
    divdatoshistorial.style.display = "block";




    if (!archivo) {
        alert('Por favor, seleccione un archivo PDF o una imagen.');
        return;
    }

    const lector = new FileReader();
    lector.onload = function(evento) {
        const datos = evento.target.result;
        if (archivo.type === 'application/pdf') {
            procesarPDFCHistorial(datos);
        } else {
            alert('Tipo de archivo no compatible. Por favor, seleccione un archivo PDF o una imagen.');
        }
    };
    lector.readAsArrayBuffer(archivo);
}


async function procesarPDFCHistorial(datos) {
    const pdf = await pdfjsLib.getDocument(datos).promise;
    const numPages = pdf.numPages;
    let textoCompleto = '';

    for (let i = 1; i <= numPages; i++) {
        const pagina = await pdf.getPage(i);
        const contenido = await pagina.getTextContent();
        const textoPagina = contenido.items.map(item => item.str).join(' ');
        textoCompleto += textoPagina + '\n'; // separa por páginas
    }

    divhnovig.style.display = "none";

    // ==============================
    // 🔍 Extraer Fecha del Historial
    // ==============================
    const regexFechaHistorial = /([^\s,]+,\d{2}\s+[^\s,]+,\d{4}\s+\d{2}:\d{2}:\d{2}\s+[APap][Mm])/;
    const fechaHistorialMatch = textoCompleto.match(regexFechaHistorial);
    const fechaHistorial = fechaHistorialMatch ? fechaHistorialMatch[1] : "No encontrada";
    console.log(fechaHistorial);


    if (fechaHistorial !== "No encontrada") {
        // 1. Eliminar el día de la semana (incluyendo acentos)
        const limpio = fechaHistorial.replace(/^[^,]+,/, '').trim();
        console.log(`Fecha limpio: ${limpio}`); // "06 Agosto,2025 10:08:07 Am"
        
        // 2. Reemplazar comas por espacios y normalizar
        const normalizado = limpio.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
        console.log(`Fecha normalizado: ${normalizado}`); // "06 Agosto 2025 10:08:07 Am"
        
        // 3. Formatear AM/PM y convertir mes a inglés
        const fechaFinal = normalizado.replace(/([ap])m/i, (_, l) => l.toUpperCase() + 'M');
        const meses = {
            "Enero": "January", "Febrero": "February", "Marzo": "March",
            "Abril": "April", "Mayo": "May", "Junio": "June",
            "Julio": "July", "Agosto": "August", "Septiembre": "September",
            "Octubre": "October", "Noviembre": "November", "Diciembre": "December"
        };
        
        // Convertir mes español a inglés
        const fechaFinalEnglish = fechaFinal.replace(
            /(\d{2})\s+(\w+)\s+(\d{4})/, 
            (_, dia, mes, anio) => `${dia} ${meses[mes]} ${anio}`
        );
        console.log(`Fecha final: ${fechaFinalEnglish}`); // "06 August 2025 10:08:07 AM"
        
        // 4. Parsear fecha
        const fecha = new Date(fechaFinalEnglish);
        console.log(`Fecha parseada: ${fecha}`);
        
        // 5. Formatear salida
        if (!isNaN(fecha.getTime())) {
            const yyyy = fecha.getFullYear();
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const dd = String(fecha.getDate()).padStart(2, '0');
            
            const fechaFormateada = `${yyyy}-${mm}-${dd}`;
            const fechaHTML = `${dd}-${mm}-${yyyy}`;
            
            console.log(`Fecha formateada: ${fechaFormateada}`);
            console.log(`Fecha HTML: ${fechaHTML}`);

            const partesFecha = fechaFormateada.split('-');
            console.log(`Fecha en partes: ${partesFecha}`)
            const fechaDoc = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
            const fechaActual = new Date();
            console.log(`Fecha documento: ${fechaDoc}`)
            console.log(`Fecha actual: ${fechaActual}`)
            const diferenciaMesesH = calcularDiferenciaMeses(fechaDoc, fechaActual);
            console.log(`Dias de emisión: ${diferenciaMesesH}`)


            if (diferenciaMesesH > 5 || fechaDoc.getFullYear() !== 2025) {
                divdatoshistorial.style.display = "none";
                divhnovig.style.display = "block";
            }

            document.getElementById("fechah").value = fechaHTML;
            document.getElementById("fechah").readOnly = true;

            
            // Resto de tu lógica...
        } else {
            console.error("Fecha inválida");
        }
    }


    // =============================
    // 🔍 Otros Datos del Historial
    // =============================

    const regexPromedioAvance = /Promedio:\s+([\d.]+)/;
    const promedioMatch = textoCompleto.match(regexPromedioAvance);
    const promedio = promedioMatch ? promedioMatch[1] : "No encontrado";

    const regexAvance = /Porcentaje de Avance:\s+([\d.]+)%/;
    const avanceMatch = textoCompleto.match(regexAvance);
    const avance = avanceMatch ? avanceMatch[1] : "No encontrado";

    const regexMaterias = /COLEGIATURA\s+\d{2}\/\d{2}\/\d{4}\s+(\d+)/;
    const materiasMatch = textoCompleto.match(regexMaterias);
    const numMaterias = materiasMatch ? materiasMatch[1] : 0;

    const regexMatricula = /MATRICULA:\s+(.+?)\s+FECHA ACUERDO:/;
    const matriculaMatch = textoCompleto.match(regexMatricula);
    const matricula = matriculaMatch ? matriculaMatch[1] : "No encontrada";

    const regexAlumno = /NOMBRE:\s+(.+?)\s+PROGRAMA:/;
    const alumnoMatch = textoCompleto.match(regexAlumno);
    const alumno = alumnoMatch ? alumnoMatch[1] : "No encontrado";

    const regexCampus = /UNIVA.-\s+(.+?)\s+MODALIDAD:/;
    const campusMatch = textoCompleto.match(regexCampus);
    const campus = campusMatch ? campusMatch[1].toLowerCase().replace(/\b\w/, l => l.toUpperCase()) : "No encontrado";
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

    // Elimina todo lo que no sea número o punto
    valor = valor.replace(/[^\d.]/g, '');

    // Solo un punto decimal permitido
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes[1]; // Ignora segundos puntos
    }

    // Limita los decimales a 2 cifras
    let entero = partes[0];
    let decimal = partes[1] ? partes[1].substring(0, 2) : '';

    // Formatea con comas el entero
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Une de nuevo
    input.value = decimal ? `${entero}.${decimal}` : entero;
}

document.addEventListener("DOMContentLoaded", function () {
    const comentarios = document.querySelector('textarea[name="CASECF39"]');
    comentarios.value = "Renovación hecha directamente por el campus";
    comentarios.readOnly = true;
});