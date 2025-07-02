
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


function procesarPDFCHistorial(datos) {
    pdfjsLib.getDocument(datos).promise.then(function(pdf) {
        pdf.getPage(1).then(function(pagina) {
            pagina.getTextContent().then(function(contenido) {
                const texto = contenido.items.map(function(item) {
                    return item.str;
                }).join(' ');

                divhnovig.style.display = "none";


                console.log(texto)

                const regexFechaHistorial = /Fecha\s+de\s+consulta:\s+(\d{2}\/\d{2}\/\d{4})/; // Coincide con el formato de fecha: dd/mm/aaaa
                const fechaHistorialMatch = texto.match(regexFechaHistorial);
                const fechaHistorial = fechaHistorialMatch ? fechaHistorialMatch[1] : "No encontrada";

                if (fechaHistorial !== "No encontrada") {
                    const partesFecha = fechaHistorial.split('/');
                    const fechaDoc = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]);
                    const fechaActual = new Date();

                    const diferenciaMesesH = calcularDiferenciaMeses(fechaDoc, fechaActual);

                    console.log(fechaDoc.getFullYear())
                    console.log(fechaDoc)
                    console.log(fechaActual)
                    console.log(diferenciaMesesH)


                    if (diferenciaMesesH > 1 || fechaDoc.getFullYear() !== 2025) {
                        divdatoshistorial.style.display = "none";
                        divhnovig.style.display = "block";
                    }
                }

                // Buscar el promedio general
                const regexPromedioAvance = /Avance\s+\d+\s+(\d+\.\d+)\s+\d+\.\d+\s+(\d+\.\d+%)/;
                const promedioMatch = texto.match(regexPromedioAvance);
                const promedio = promedioMatch ? promedioMatch[1] : "No encontrado";

                // Buscar el avance
                const regexAvance = /Avance\s+\d+\s+\d+\.\d+\s+\d+\.\d+\s+(\d+\.\d+)%/;
                const avanceMatch = texto.match(regexAvance);
                const avance = avanceMatch ? avanceMatch[1] : "No encontrado";

                        // Expresión regular para extraer el nombre del campus
                const regexCampus = /CAMPUS\s+(\w+)/;
                const campusMatch = texto.match(regexCampus);
                const campus = campusMatch ? campusMatch[1] : "No encontrado";
                console.log(campus)
                const formattedCampus = campus.charAt(0).toUpperCase() + campus.slice(1).toLowerCase();
                console.log(formattedCampus)


                if (formattedCampus === "En_linea"){
                    document.getElementById("CASECF10").value = "Online";
                }
                else {
                    document.getElementById("CASECF10").value = formattedCampus;
                }

                document.getElementById("fechah").value = fechaHistorial;
                document.getElementById("fechah").readOnly = true;
                document.getElementById("promedio").value = promedio;
                document.getElementById("promedio").readOnly = true;
                document.getElementById("avance").value = avance;
                document.getElementById("avance").readOnly = true;
                
            });
        });
    });
}

function procesarArchivoC() {
    const archivo = document.getElementById('calculadora').files[0];
    divdatoscalculadora.style.display = "block";



    if (!archivo) {
        alert('Por favor, seleccione un archivo PDF o una imagen.');
        return;
    }

    const lector = new FileReader();
    lector.onload = function(evento) {
        const datos = evento.target.result;
        if (archivo.type === 'application/pdf') {
            procesarPDFCalculadora(datos);
        } else {
            alert('Tipo de archivo no compatible. Por favor, seleccione un archivo PDF o una imagen.');
        }
    };
    lector.readAsArrayBuffer(archivo);
}


function procesarPDFCalculadora(datos) {
    pdfjsLib.getDocument(datos).promise.then(function(pdf) {
        pdf.getPage(1).then(function(pagina) {
            pagina.getTextContent().then(function(contenido) {
                const texto = contenido.items.map(function(item) {
                    return item.str;
                }).join(' ');
                divcalculadoraincorrecta.style.display = "none";
                divcalnov.style.display = "none";



                console.log(texto);

                const regexFechaCalculadora = /Fecha:\s+(\d{2}\/\d{2}\/\d{4})/; // Coincide con el formato de fecha: dd/mm/aaaa
                const fechaCalculadoraMatch = texto.match(regexFechaCalculadora);
                const fechaCalculadora = fechaCalculadoraMatch ? fechaCalculadoraMatch[1] : "No encontrada";

                if (fechaCalculadora !== "No encontrada") {
                    const partesFecha = fechaCalculadora.split('/');
                    const fechaDoc = new Date(partesFecha[2], partesFecha[1] - 1, partesFecha[0]);
                    const fechaActual = new Date();

                    const diferenciaMeses = calcularDiferenciaMeses(fechaDoc, fechaActual);

                    console.log(fechaDoc.getFullYear())
                    console.log(fechaDoc)
                    console.log(fechaActual)
                    console.log(diferenciaMeses)


                    if (diferenciaMeses > 1 || fechaDoc.getFullYear() !== 2025) {
                        divdatoscalculadora.style.display = "none";
                        divcalnov.style.display = "block";
                    }
                }
                
                // Buscar el monto
                const regexMonto = /ciclo\s+\d+\s+es\s+de\s+\$([\d,]+\.\d{2})/;
                const montoMatch = texto.match(regexMonto);
                const monto = montoMatch ? montoMatch[1] : "No encontrado";

                // Contar el número de materias
                const regexMaterias = /COLEGIATURA\s+\d{2}\/\d{2}\/\d{4}\s+(\d+)/;
                const materiasMatch = texto.match(regexMaterias);
                const numMaterias = materiasMatch ? materiasMatch[1] : 0;

                // Buscar la matrícula
                const regexMatricula = /Número\s*de\s*cuenta:\s*(\d+)/;
                const matriculaMatch = texto.match(regexMatricula);
                const matricula = matriculaMatch ? matriculaMatch[1] : "No encontrada";

                // Buscar tipo de calculadora
                const regextipocalculadora = /alternativa\s+de\s+pago\s+de:\s+(UN\s+PAGO\s+\(\d+\))/;
                const tipocalculadoraMatch = texto.match(regextipocalculadora);
                const tipocalculadora = tipocalculadoraMatch ? tipocalculadoraMatch[1] : "No encontrada";
                if (tipocalculadora !== "UN PAGO (100)") {
                    divcalculadoraincorrecta.style.display = "block";
                    divdatoscalculadora.style.display = "none";

                }             


                const regexAlumno = /Alumno:\s+(.+)\s+Campus:/;
                const alumnoMatch = texto.match(regexAlumno);
                const alumno = alumnoMatch ? alumnoMatch[1] : "No encontrado";
                

                // Actualizar el contenido del HTML
                document.getElementById("fechac").value = fechaCalculadora;
                document.getElementById("fechac").readOnly = true;

                document.getElementById("monto").value = monto;
                document.getElementById("monto").readOnly = true;

                document.getElementById("materias").value = numMaterias;
                document.getElementById("materias").readOnly = true;

                document.getElementById("matricula").value = matricula;
                document.getElementById("matricula").readOnly = true;

                document.getElementById("tipodecalculadora").value = tipocalculadora;
                document.getElementById("tipodecalculadora").readOnly = true;

                document.getElementById("alumno").value = alumno;
                document.getElementById("alumno").readOnly = true;
        
            });
        });
    });
}

function calcularDiferenciaMeses(fecha1, fecha2) {
    const year1 = fecha1.getFullYear();
    const month1 = fecha1.getMonth();
    const year2 = fecha2.getFullYear();
    const month2 = fecha2.getMonth();

    return (year2 - year1) * 12 + (month2 - month1);
}