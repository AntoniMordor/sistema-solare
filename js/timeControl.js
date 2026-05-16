/**
 * timeControl.js
 * Gestisce la modalità TEMPO REALE vs SIMULAZIONE, il selettore fuso orario
 * e la visualizzazione dell'orologio astronomico.
 */

// ── Stato interno ─────────────────────────────────────────────────────────────

let _realTimeMode = true;          // default: tempo reale
let _selectedTZ   = _detectTZ();   // fuso orario del PC
let _clockTimer   = null;

// ── Riferimenti DOM ───────────────────────────────────────────────────────────

let elDate, elClock, elTZLabel, elSearch, elSelect;

// ── Rilevamento fuso orario ───────────────────────────────────────────────────

function _detectTZ() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch { return 'UTC'; }
}

// ── Formattazione ─────────────────────────────────────────────────────────────

function _fmtTime(date) {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: _selectedTZ,
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).format(date);
}

function _fmtDate(date) {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: _selectedTZ,
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

function _fmtOffset() {
  try {
    const now   = new Date();
    const utcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                           now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
    const tzMs  = new Date(now.toLocaleString('en-US', { timeZone: _selectedTZ })).getTime();
    const offH  = Math.round((tzMs - utcMs) / 3600000 * 2) / 2; // arrotonda a 0.5h
    const sign  = offH >= 0 ? '+' : '−';
    const abs   = Math.abs(offH);
    const h     = Math.floor(abs);
    const m     = Math.round((abs - h) * 60);
    return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch { return 'UTC'; }
}

// ── Orologio ──────────────────────────────────────────────────────────────────

function _tick() {
  if (!elDate || !elClock) return;
  const now = new Date();
  elDate.textContent  = _fmtDate(now);
  elClock.textContent = `${_fmtTime(now)}  ${_fmtOffset()}`;
  if (elTZLabel) elTZLabel.textContent = _selectedTZ.replace(/_/g, ' ');
}

function _startClock() {
  _tick();
  if (_clockTimer) clearInterval(_clockTimer);
  _clockTimer = setInterval(_tick, 1000);
}

// ── Popola il menu dei fusi orari ─────────────────────────────────────────────

let _allTZ = [];

function _buildSelect(filter) {
  const q       = filter ? filter.toLowerCase().replace(/\s/g, '_') : '';
  const matched = q ? _allTZ.filter(tz => tz.toLowerCase().includes(q)) : _allTZ;

  elSelect.innerHTML = '';

  // Raggruppa per continente/regione
  const groups = {};
  matched.forEach(tz => {
    const [region] = tz.split('/');
    (groups[region] ??= []).push(tz);
  });

  Object.keys(groups).sort().forEach(region => {
    const og = document.createElement('optgroup');
    og.label = region;
    groups[region].forEach(tz => {
      const opt       = document.createElement('option');
      opt.value       = tz;
      opt.textContent = tz.replace(/_/g, ' ');
      if (tz === _selectedTZ) opt.selected = true;
      og.appendChild(opt);
    });
    elSelect.appendChild(og);
  });
}

// ── Cambia modalità ───────────────────────────────────────────────────────────

function _applyMode(realTime) {
  _realTimeMode = realTime;
  const timeDisplay = document.getElementById('time-display');
  const tzRow       = document.getElementById('tz-row');
  const speedBox    = document.getElementById('speed-box');
  const btnReal     = document.getElementById('btn-realtime');
  const btnSim      = document.getElementById('btn-sim');

  btnReal.classList.toggle('active', realTime);
  btnSim.classList.toggle('active', !realTime);

  if (realTime) {
    if (timeDisplay) timeDisplay.style.display = '';
    if (tzRow) tzRow.style.display = '';
    if (speedBox) { speedBox.style.opacity = '0.3'; speedBox.style.pointerEvents = 'none'; }
    _startClock();
  } else {
    if (timeDisplay) timeDisplay.style.display = 'none';
    if (tzRow) tzRow.style.display = 'none';
    if (speedBox) { speedBox.style.opacity = '1'; speedBox.style.pointerEvents = ''; }
  }
}

// ── Setup pubblico ────────────────────────────────────────────────────────────

export function setupTimeControl() {
  elDate    = document.getElementById('time-date');
  elClock   = document.getElementById('time-clock');
  elTZLabel = document.getElementById('tz-label');
  elSearch  = document.getElementById('tz-search');
  elSelect  = document.getElementById('tz-select');

  // Carica lista fusi orari
  try       { _allTZ = Intl.supportedValuesOf('timeZone'); }
  catch (_) { _allTZ = ['Africa/Cairo','America/New_York','America/Los_Angeles',
    'America/Chicago','America/Sao_Paulo','Asia/Tokyo','Asia/Shanghai','Asia/Kolkata',
    'Asia/Dubai','Australia/Sydney','Europe/London','Europe/Paris','Europe/Rome',
    'Europe/Berlin','Europe/Moscow','Pacific/Auckland','Pacific/Honolulu','UTC']; }

  _buildSelect('');

  // Selezione fuso
  elSelect.addEventListener('change', () => {
    _selectedTZ = elSelect.value;
    _tick();
  });

  // Ricerca fuso
  elSearch.addEventListener('input', () => {
    _buildSelect(elSearch.value);
  });

  // Toggle modalità
  document.getElementById('btn-realtime').addEventListener('click', () => _applyMode(true));
  document.getElementById('btn-sim').addEventListener('click',      () => _applyMode(false));

  // Avvia in modalità REALE
  _applyMode(true);
}

// ── Getter pubblici ───────────────────────────────────────────────────────────

/** Restituisce true se siamo in modalità Tempo Reale. */
export function isRealTimeMode() { return _realTimeMode; }

/** Restituisce la Julian Date corrente (sempre UTC, timezone solo per display). */
export function getCurrentJD() {
  return new Date().getTime() / 86400000 + 2440587.5;
}
