// ================== TIMER LOGIC ==================
let timer = 0, interval = null;
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timerDisplay = document.getElementById('timer');

function formatTime(sec) {
  let m = Math.floor(sec / 60);
  let s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(timer);
}
function startTimer() {
  if (interval) return;
  interval = setInterval(() => {
    timer++;
    updateTimerDisplay();
  }, 1000);
  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;
}
function pauseTimer() {
  clearInterval(interval); interval = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
}
function resetTimer() {
  timer = 0; updateTimerDisplay();
  clearInterval(interval); interval = null;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resetBtn.disabled = true;
}
startBtn.onclick = startTimer;
pauseBtn.onclick = pauseTimer;
resetBtn.onclick = resetTimer;
updateTimerDisplay();

// ================== MARCADORES ==================
let markers = [];
let editingIndex = null;

function getParteSel() {
  return document.querySelector('input[name="parte"]:checked').value;
}

window.addMarker = function (fase) {
  if (!interval && timer === 0) { alert("¡Primero inicia el temporizador!"); return; }
  const nota = document.getElementById('noteInput').value.trim();
  markers.push({
    tiempo: formatTime(timer),
    parte: getParteSel(),
    fase: fase,
    nota: nota
  });
  document.getElementById('noteInput').value = '';
  renderMarkers();
}

function renderMarkers() {
  let tbody = document.getElementById('markersTable').querySelector('tbody');
  tbody.innerHTML = '';
  markers.forEach((m, idx) => {
    let tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${m.tiempo}</td>
      <td>${m.parte}</td>
      <td>${m.fase}</td>
      <td>${m.nota || ''}</td>
      <td>
        <button class="actions-btn edit" onclick="editMarker(${idx})">✏️</button>
        <button class="actions-btn delete" onclick="deleteMarker(${idx})">🗑️</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.editMarker = function (idx) {
  editingIndex = idx;
  const m = markers[idx];
  document.getElementById('editTime').value = m.tiempo;
  document.getElementById('editParte').value = m.parte;
  document.getElementById('editFase').value = m.fase;
  document.getElementById('editNota').value = m.nota;
  document.getElementById('editSection').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.cancelEdit = function () {
  document.getElementById('editSection').style.display = 'none';
  editingIndex = null;
}

window.saveEdit = function () {
  if (editingIndex === null) return;
  markers[editingIndex] = {
    tiempo: document.getElementById('editTime').value,
    parte: document.getElementById('editParte').value,
    fase: document.getElementById('editFase').value,
    nota: document.getElementById('editNota').value
  };
  renderMarkers();
  cancelEdit();
}

window.deleteMarker = function (idx) {
  if (confirm('¿Eliminar este marcador?')) {
    markers.splice(idx, 1);
    renderMarkers();
  }
}

// ================== EXPORTAR A PDF ==================
window.exportToPDF = function () {
  if (markers.length === 0) { alert("No hay marcadores para exportar."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text('Marcadores de Partido', 14, 16);

  const head = [['#', 'Tiempo', 'Parte', 'Fase/Jugada', 'Nota']];
  const body = markers.map((m, i) => [
    i + 1, m.tiempo, m.parte, m.fase, m.nota || ''
  ]);

  doc.autoTable({
    head: head,
    body: body,
    startY: 24,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [30, 30, 30] },
  });

  doc.save('marcadores_partido.pdf');
}

// Inicializa tabla vacía al cargar la página
renderMarkers();
