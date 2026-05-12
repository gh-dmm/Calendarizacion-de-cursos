// Cargar datos persistentes
let aulas = JSON.parse(localStorage.getItem('aulas')) || [];
let cursosAsignados = JSON.parse(localStorage.getItem('cursos')) || [];

function actualizarVistaAulas() {
    const lista = document.getElementById('listaAulas');
    if (!lista) return;
    lista.innerHTML = aulas.map(a => 
        `<li class="list-group-item d-flex justify-content-between align-items-center">
            <span>Aula ID: <strong>${a.id}</strong></span>
            <span class="badge bg-secondary rounded-pill">${a.capacidad} asientos</span>
        </li>`
    ).join('') || '<li class="list-group-item text-muted">No hay aulas registradas</li>';
}

function agregarAula() {
    const cap = parseInt(document.getElementById('aulaCapacidad').value);
    if (!cap || cap <= 0) {
        alert("Por favor, ingresa una capacidad válida.");
        return;
    }
    
    const nuevaAula = { id: aulas.length + 1, capacidad: cap };
    aulas.push(nuevaAula);
    localStorage.setItem('aulas', JSON.stringify(aulas));
    actualizarVistaAulas();
    document.getElementById('aulaCapacidad').value = '';
}

// Función equivalente a hayConflicto en C
function hayConflicto(inicio1, fin1, inicio2, fin2) {
    return (inicio1 < fin2 && inicio2 < fin1);
}

function asignarCurso() {
    const alumnos = parseInt(document.getElementById('cAlumnos').value);
    const inicio = parseInt(document.getElementById('cInicio').value);
    const fin = parseInt(document.getElementById('cFin').value);
    const consola = document.getElementById('mensajeConsola');

    if (isNaN(alumnos) || isNaN(inicio) || isNaN(fin) || inicio >= fin) {
        consola.innerHTML = `<div class="alert alert-warning">⚠️ Datos incompletos o inválidos. Revisa el horario.</div>`;
        return;
    }

    if (aulas.length === 0) {
        consola.innerHTML = `<div class="alert alert-danger">❌ Error: Primero debes registrar al menos un aula.</div>`;
        return;
    }

    let asignado = false;
    let motivoError = "";

    // Algoritmo de búsqueda de aula disponible
    for (let aula of aulas) {
        if (alumnos <= aula.capacidad) {
            let conflictoDetectado = false;
            
            // Verificar contra cursos ya asignados en ESTA aula específica
            const ocupantesAula = cursosAsignados.filter(c => c.aulaId === aula.id);
            for (let cExistente of ocupantesAula) {
                if (hayConflicto(inicio, fin, cExistente.inicio, cExistente.fin)) {
                    conflictoDetectado = true;
                    motivoError = `Superposición detectada en Aula ${aula.id} de ${cExistente.inicio} a ${cExistente.fin} hrs.`;
                    break;
                }
            }

            if (!conflictoDetectado) {
                const nuevoCurso = {
                    id: cursosAsignados.length + 1,
                    alumnos: alumnos,
                    inicio: inicio,
                    fin: fin,
                    aulaId: aula.id
                };
                cursosAsignados.push(nuevoCurso);
                localStorage.setItem('cursos', JSON.stringify(cursosAsignados));
                consola.innerHTML = `
                    <div class="alert alert-success shadow-sm">
                        <strong>✅ Asignación Exitosa:</strong><br>
                        Curso #${nuevoCurso.id} asignado al Aula ${aula.id}.
                    </div>`;
                asignado = true;
                break; // Sale del bucle de aulas al asignar
            }
        } else {
            motivoError = "La capacidad del aula es insuficiente para el número de alumnos.";
        }
    }

    if (!asignado) {
        // Marcamos la excepción sin truncar el programa
        consola.innerHTML = `
            <div class="alert alert-danger border-start border-4 border-danger shadow-sm">
                <strong>⚠️ Advertencia de Sistema:</strong><br>
                El curso no pudo asignarse. Motivo: ${motivoError}<br>
                <small>Introduce un horario o aula diferente para continuar.</small>
            </div>`;
    }
}

// Inicializar vista al cargar
actualizarVistaAulas();

