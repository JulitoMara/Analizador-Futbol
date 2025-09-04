// Obtención de elementos del DOM
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const markBtn = document.getElementById('mark-btn');
const markerOptions = document.getElementById('marker-options');
const phaseSelect = document.getElementById('phase-select');
const noteInput = document.getElementById('note-input');
const addMarkerBtn = document.getElementById('add-marker-btn');
const markersList = document.getElementById('markers-ul');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const halfSelect = document.getElementById('half-select');

// Variables de estado
let timerInterval;
let startTime;
let markers = [];
const { jsPDF } = window.jspdf;

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
        // Deshabilitar botones para evitar errores
        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = false;
        markBtn.disabled = false;
        halfSelect.disabled = true;
    }
});

stopBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    markBtn.disabled = true;
    halfSelect.disabled = false;
});

resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerDisplay.textContent = '00:00:00';
    markers = [];
    markersList.innerHTML = '';
    // Habilitar/Deshabilitar botones
    startBtn.disabled = false;
    stopBtn.disabled = true;
    resetBtn.disabled = true;
    markBtn.disabled = true;
    markerOptions.classList.add('hidden');
    halfSelect.disabled = false;
    halfSelect.value = '1';
});

// --- Funciones para los marcadores ---

function formatPhase(phase) {
    if (phase === 'abp') {
        return 'ABP';
    }
    return phase
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

markBtn.addEventListener('click', () => {
    markerOptions.classList.toggle('hidden');
});

addMarkerBtn.addEventListener('click', () => {
    const elapsedTime = Date.now() - startTime;
    const timeFormatted = formatTime(elapsedTime);
    const phaseRaw = phaseSelect.value;
    const phaseDisplay = formatPhase(phaseRaw);
    const note = noteInput.value.trim();
    const half = halfSelect.value;

    const newMarker = {
        time: timeFormatted,
        phase: phaseDisplay,
        note: note,
        half: half
    };
    markers.push(newMarker);
    displayMarker(newMarker);

    noteInput.value = '';
    markerOptions.classList.add('hidden');
});

function displayMarker(marker) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <div class="marker-line-1">
            <span class="marker-time">${marker.time}</span>
            <span class="marker-half">${marker.half}ª Parte</span>
        </div>
        <span class="marker-phase">${marker.phase}</span>
        ${marker.note ? `<span class="marker-note">${marker.note}</span>` : ''}
    `;
    markersList.appendChild(listItem);
}

// --- Función para exportar a PDF ---

exportPdfBtn.addEventListener('click', () => {
    if (markers.length === 0) {
        alert("No hay acciones marcadas para exportar.");
        return;
    }

    const doc = new jsPDF();
    let yPos = 20;

    doc.setFontSize(16);
    doc.text(`Análisis de Partido UDE Canonja`, 15, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, yPos);
    yPos += 15;

    const markersByHalf = {
        '1': [],
        '2': []
    };
    markers.forEach(marker => {
        markersByHalf[marker.half].push(marker);
    });

    for (const halfNum in markersByHalf) {
        if (markersByHalf[halfNum].length > 0) {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.setFontSize(14);
            doc.text(`${halfNum}ª Parte`, 15, yPos);
            yPos += 10;
            doc.setFontSize(10);
            
            markersByHalf[halfNum].forEach((marker, index) => {
                const text = `[${marker.time}] - ${marker.phase}. ${marker.note}`;
                const splitText = doc.splitTextToSize(text, 180);
                doc.text(splitText, 20, yPos);
                yPos += (splitText.length * 5) + 5;
                if (yPos > 280) {
                    doc.addPage();
                    yPos = 20;
                    doc.setFontSize(10);
                }
            });
            yPos += 10;
        }
    }

    doc.save('Analisis_UDE_Canonja.pdf');
});
