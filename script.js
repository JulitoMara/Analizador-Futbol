// --- Variables de estado ---
let timerInterval = null;
let startTime = null;
let elapsedStart = 0;
let markers = [];
let pendingMarker = null;

// --- Obtención de elementos del DOM ---
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const markersList = document.getElementById('markers-ul');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const halfSelect = document.getElementById('half-select');

// Elementos para notas y marcadores rápidos
const quickMarkerBtns = document.querySelectorAll('.marker-btn');
const noteInputContainer = document.getElementById('note-input-container');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');

// --- Guardado y recuperación en LocalStorage ---
function saveToLocal() {
    localStorage.setItem('timerData', JSON.stringify({
        elapsedStart,
        markers,
        half: halfSelect.value
    }));
}

function loadFromLocal() {
    const data = localStorage.getItem('timerData');
    if (data) {
        const obj = JSON.parse(data);
        elapsedStart = obj.elapsedStart || 0;
        markers = obj.markers || [];
        halfSelect.value = obj.half || "1ª Parte";
        timerDisplay.textContent = formatTime(elapsedStart);
        markersList.innerHTML = '';
        markers.forEach(addMarkerToList);
        resetBtn.disabled = markers.length === 0 && elapsedStart === 0;
    }
}

// --- Funciones del temporizador ---
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
    const elapsedTime = elapsedStart + (Date.now() - startTime);
    timerDisplay.textContent = formatTime(elapsedTime);
}

function getElapsedTime() {
    if (timerInterval) {
        return elapsedStart + (Date.now() - startTime);
    } else {
        return elapsedStart;
    }
}

// --- Manejo de botones de control ---

startBtn.addEventListener('click', () => {
    if (!timerInterval) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 200);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = false;
        quickMarkerBtns.forEach(btn => btn.disabled = false);
        halfSelect.disabled = true;
    }
});

stopBtn.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        elapsedStart += Date.now() - startTime;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        quickMarkerBtns.forEach(btn => btn.disabled = true);
        halfSelect.disabled = false;
        saveToLocal();
    }
});

resetBtn.addEventListener('click', () => {
    resetTimerAndMarkers();
    saveToLocal();
});

function resetTimerAndMarkers() {
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    elapsedStart = 0;
    timerDisplay.textContent = '00:00:00';
    markers = [];
    markersList.innerHTML = '';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    quickMarkerBtns.forEach(btn => btn.disabled = true);
    halfSelect.disabled = false;
}

// --- Manejo de mitades ---
halfSelect.addEventListener('change', () => {
    // Resetear cronómetro y marcadores al cambiar de parte
    resetTimerAndMarkers();
    saveToLocal();
});

// --- Marcadores rápidos ---
quickMarkerBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
        if (timerInterval || elapsedStart > 0) {
            const markerType = btn.dataset.type || btn.textContent;
            showNoteInput(markerType);
        }
    });
});

function showNoteInput(markerType) {
    pendingMarker = {
        time: getElapsedTime(),
        type: markerType,
        half: halfSelect.value,
        note: ''
    };
    noteInput.value = '';
    noteInputContainer.style.display = 'block';
    noteInput.focus();
}

addNoteBtn.addEventListener('click', () => {
    if (pendingMarker) {
        pendingMarker.note = noteInput.value.trim();
        markers.push({ ...pendingMarker });
        addMarkerToList(pendingMarker);
        pendingMarker = null;
        noteInputContainer.style.display = 'none';
        saveToLocal();
    }
});

cancelNoteBtn.addEventListener('click', () => {
    pendingMarker = null;
    noteInputContainer.style.display = 'none';
});

// --- Mostrar marcadores en la lista ---
function addMarkerToList(marker) {
    const li = document.createElement('li');
    li.className = "marcador-accion";
    li.innerHTML = `
        <div class="fila-marcador">
            <span class="parte">${marker.half}</span>
            <span class="accion">${marker.type}</span>
            <span class="tiempo">${formatTime(marker.time)}</span>
        </div>
        ${marker.note ? `<div class="nota-comentario">📝 ${marker.note}</div>` : ''}
    `;
    markersList.appendChild(li);
}

// --- Exportar a PDF ---
exportPdfBtn.addEventListener('click', () => {
    let html = `<h2>Marcadores</h2>
    <ul>`;
    markers.forEach(marker => {
        html += `<li><div><strong>${marker.half}</strong> | <strong>${marker.type}</strong> | ${formatTime(marker.time)}</div>${marker.note ? '<div>📝 ' + marker.note + '</div>' : ''}</li>`;
    });
    html += '</ul>';

    if (window.html2pdf) {
        html2pdf().from(html).set({
            margin: 1,
            filename: 'marcadores-partido.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait' }
        }).save();
    } else {
        alert('La funcionalidad de PDF requiere incluir html2pdf.js');
    }
});

// --- Inicialización de la interfaz ---
function init() {
    timerDisplay.textContent = '00:00:00';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    quickMarkerBtns.forEach(btn => btn.disabled = true);
    noteInputContainer.style.display = 'none';
    loadFromLocal();
}
init();

// --- Acceso rápido con teclado ---
document.addEventListener('keydown', (e) => {
    // Si el foco está en el input de nota, ignorar accesos rápidos
    if (document.activeElement === noteInput) return;
    if (timerInterval) {
        if (e.key === '1') quickMarkerBtns[0].click();
        if (e.key === '2') quickMarkerBtns[1].click();
        if (e.key === '3') quickMarkerBtns[2].click();
        // Agrega más si tienes más botones de marcador rápido
    }
});
