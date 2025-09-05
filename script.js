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
        renderMarkers();
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
    renderMarkers();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    quickMarkerBtns.forEach(btn => btn.disabled = true);
    halfSelect.disabled = false;
}

// --- Manejo de mitades ---
halfSelect.addEventListener('change', () => {
    // Solo resetear el cronómetro, NO los marcadores
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    elapsedStart = 0;
    timerDisplay.textContent = '00:00:00';
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    quickMarkerBtns.forEach(btn => btn.disabled = true);
    halfSelect.disabled = false;
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
        renderMarkers();
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
function addMarkerToList(marker, idx) {
    const li = document.createElement('li');
    li.className = "marcador-accion";
    li.innerHTML = `
        <div class="fila-marcador">
            <span class="parte">${marker.half}</span>
            <span class="accion">${marker.type}</span>
            <span class="tiempo">${formatTime(marker.time)}</span>
            <button class="delete-marker-btn" title="Borrar marcador" data-idx="${idx}">🗑️</button>
        </div>
        ${marker.note ? `<div class="nota-comentario">📝 ${marker.note}</div>` : ''}
    `;
    markersList.appendChild(li);
}

function renderMarkers() {
    markersList.innerHTML = '';
    markers.forEach((marker, idx) => addMarkerToList(marker, idx));
}

// --- Borrar marcador ---
markersList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-marker-btn')) {
        const idx = parseInt(e.target.dataset.idx);
        markers.splice(idx, 1);
        saveToLocal();
        renderMarkers();
    }
});

// --- Exportar a PDF ---
exportPdfBtn.addEventListener('click', () => {
    let html = `
    <h2 style="font-family:Arial,sans-serif;font-size:1.3em;text-align:center;margin-bottom:8px;">Acciones Marcadas</h2>
    <table style="width:100%;border-collapse:collapse;font-size:1.04em;">
        <thead>
            <tr>
                <th style="border-bottom:1px solid #999;padding:6px 4px;">Parte</th>
                <th style="border-bottom:1px solid #999;padding:6px 4px;">Acción</th>
                <th style="border-bottom:1px solid #999;padding:6px 4px;">Tiempo</th>
            </tr>
        </thead>
        <tbody>
    `;
    markers.forEach(marker => {
        html += `<tr>
            <td style="padding:6px 4px;border-bottom:1px solid #eee;text-align:left;">${marker.half}</td>
            <td style="padding:6px 4px;border-bottom:1px solid #eee;text-align:center;">${marker.type}</td>
            <td style="padding:6px 4px;border-bottom:1px solid #eee;text-align:right;">${formatTime(marker.time)}</td>
        </tr>`;
        if (marker.note) {
            html += `<tr>
                <td colspan="3" style="font-size:0.99em;color:#222;padding:4px 12px 10px 12px;font-style:italic;background:#f8f8f8;">📝 ${marker.note}</td>
            </tr>`;
        }
    });
    html += '</tbody></table>';

    // Exportar usando un div oculto para asegurar renderizado
    const pdfArea = document.getElementById('pdf-export-area') || (() => {
        const d = document.createElement('div');
        d.id = 'pdf-export-area';
        d.style.display = 'block';
        document.body.appendChild(d);
        return d;
    })();
    pdfArea.innerHTML = html;
    pdfArea.style.display = 'block';

    html2pdf().from(pdfArea).set({
        margin: 12,
        filename: 'marcadores-partido.pdf',
        html2canvas: { scale: 2, backgroundColor: "#fff" },
        jsPDF: { orientation: 'portrait' }
    }).save().then(() => {
        pdfArea.style.display = 'none';
    });
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
