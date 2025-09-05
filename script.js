// Variables de estado
let timerInterval;
let startTime;
let markers = [];
let pendingMarker = null;

// Obtención de elementos del DOM
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const markersList = document.getElementById('markers-ul');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const halfSelect = document.getElementById('half-select');

// Nuevos elementos para la interfaz mejorada
const quickMarkerBtns = document.querySelectorAll('.marker-btn');
const noteInputContainer = document.getElementById('note-input-container');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');

// --- Funciones del temporizador ---

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
    const elapsedTime = Date.now() - startTime;
    timerDisplay.textContent = formatTime(elapsedTime);
}

startBtn.addEventListener('click', () => {
    if (!timerInterval) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = false;
        quickMarkerBtns.forEach(btn => btn.disabled = false);
        halfSelect.disabled = true;
    }
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    quickMarkerBtns.forEach(btn => btn.disabled = true);
    halfSelect.disabled = false;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = '00:00:00';
    markers = [];
    markersList.innerHTML = '';
