/**
 * timeControl.js
 * Gestisce la modalità TEMPO REALE vs SIMULAZIONE, il selettore fuso orario
 * e la visualizzazione dell'orologio astronomico.
 */

import { isGameMode, deactivateGameMode } from './gameMode.js';

// ── Stato interno ─────────────────────────────────────────────────────────────

let _realTimeMode = true;
let _selectedTZ   = _detectTZ();
let _clockTimer   = null;
let _effectiveJD  = Date.now() / 86400000 + 2440587.5;

// ── Riferimenti DOM ───────────────────────────────────────────────────────────

let elDate, elClock, elTZLabel, elSearch, elSelect;

// ── Rilevamento fuso orario ───────────────────────────────────────────────────

function _detectTZ() {
  try    { return Intl.DateTimeFormat().resolvedOptions().timeZone; }
  catch  { return 'UTC'; }
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
    const offH  = Math.round((tzMs - utcMs) / 3600000 * 2) / 2;
    const sign  = offH >= 0 ? '+' : '−';
    const abs   = Math.abs(offH);
    const h     = Math.floor(abs);
    const m     = Math.round((abs - h) * 60);
    return `UTC${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch (err) {
    console.warn('Timezone offset error:', err);
    return 'UTC';
  }
}

// ── Orologio ──────────────────────────────────────────────────────────────────

function _tick() {
  if (!elDate || !elClock) return;
  const now = new Date();
  elDate.textContent  = _fmtDate(now);
  elClock.textContent = `${_fmtTime(now)}  ${_fmtOffset()}`;
  if (elTZLabel) elTZLabel.textContent = _selectedTZ.replaceAll('_', ' ');
}

function _startClock() {
  _tick();
  if (_clockTimer) clearInterval(_clockTimer);
  _clockTimer = setInterval(_tick, 1000);
}

// ── Popola il menu dei fusi orari ─────────────────────────────────────────────

let _allTZ = [];

function _buildGroups(list) {
  const groups = {};
  list.forEach(tz => {
    const [region] = tz.split('/');
    if (!groups[region]) groups[region] = [];
    groups[region].push(tz);
  });
  return groups;
}

function _buildSelect(filter) {
  const q       = filter ? filter.toLowerCase().replaceAll(' ', '_') : '';
  const matched = q ? _allTZ.filter(tz => tz.toLowerCase().includes(q)) : _allTZ;

  elSelect.innerHTML = '';

  const groups = _buildGroups(matched);

  Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .forEach(region => {
      const og = document.createElement('optgroup');
      og.label = region;
      groups[region].forEach(tz => {
        const opt       = document.createElement('option');
        opt.value       = tz;
        opt.textContent = tz.replaceAll('_', ' ');
        if (tz === _selectedTZ) opt.selected = true;
        og.appendChild(opt);
      });
      elSelect.appendChild(og);
    });
}

// ── Visibilità elementi per modalità ─────────────────────────────────────────

function _showRealElements(visible) {
  const ids  = ['time-display', 'tz-row'];
  const show = visible ? '' : 'none';
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = show;
  });
}

function _showSimElements(visible) {
  const el = document.getElementById('sim-display');
  if (el) el.style.display = visible ? '' : 'none';
}

function _setSpeedBoxEnabled(enabled) {
  const sb = document.getElementById('speed-box');
  if (!sb) return;
  sb.style.opacity       = enabled ? '1' : '0.3';
  sb.style.pointerEvents = enabled ? '' : 'none';
}

// ── Cambia modalità ───────────────────────────────────────────────────────────

function _applyMode(realTime) {
  _realTimeMode = realTime;

  document.getElementById('btn-realtime')?.classList.toggle('active',  realTime);
  document.getElementById('btn-sim')?.classList.toggle('active', !realTime);

  _showRealElements(realTime);
  _showSimElements(!realTime);
  _setSpeedBoxEnabled(!realTime);

  if (realTime) _startClock();
}

// ── Setup pubblico ────────────────────────────────────────────────────────────

export function setupTimeControl() {
  elDate    = document.getElementById('time-date');
  elClock   = document.getElementById('time-clock');
  elTZLabel = document.getElementById('tz-label');
  elSearch  = document.getElementById('tz-search');
  elSelect  = document.getElementById('tz-select');

  try {
    _allTZ = Intl.supportedValuesOf('timeZone');
  } catch (err) {
    console.warn('Intl.supportedValuesOf not available, using fallback:', err);
    _allTZ = [
      'Africa/Cairo', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
      'America/Sao_Paulo', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
      'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'Europe/Rome',
      'Europe/Berlin', 'Europe/Moscow', 'Pacific/Auckland', 'Pacific/Honolulu', 'UTC',
    ];
  }

  _buildSelect('');

  elSelect.addEventListener('change', () => { _selectedTZ = elSelect.value; _tick(); });
  elSearch.addEventListener('input',  () => _buildSelect(elSearch.value));

  // I pulsanti REALE/SIM escono dalla modalità GIOCO se attiva
  document.getElementById('btn-realtime')?.addEventListener('click', () => {
    if (isGameMode()) deactivateGameMode();
    _applyMode(true);
  });
  document.getElementById('btn-sim')?.addEventListener('click', () => {
    if (isGameMode()) deactivateGameMode();
    _applyMode(false);
  });

  _applyMode(true);
}

// ── Getter / Setter pubblici ──────────────────────────────────────────────────

/** true se modalità Tempo Reale attiva. */
export function isRealTimeMode() { return _realTimeMode; }

/** Julian Date basata sull'ora UTC corrente del PC. */
export function getCurrentJD() {
  return Date.now() / 86400000 + 2440587.5;
}

/**
 * Memorizza la JD effettiva corrente (reale o simulata).
 * Usata da main.js ad ogni frame; consultata da ui.js per stagioni/info.
 */
export function updateEffectiveJD(jd) { _effectiveJD = jd; }

/** Restituisce la JD effettiva corrente (reale in modalità REALE, simulata in SIM). */
export function getEffectiveJD() {
  return _realTimeMode ? getCurrentJD() : _effectiveJD;
}

/**
 * Aggiorna il display del calendario simulato (chiamato ogni frame in modalità SIM).
 * @param {Date} date
 */
export function setSimulatedDate(date) {
  const elSimDate = document.getElementById('sim-date');
  const elSimTime = document.getElementById('sim-time');
  if (!elSimDate || !elSimTime) return;

  elSimDate.textContent = new Intl.DateTimeFormat('it-IT', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(date);

  elSimTime.textContent = new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'UTC',
  }).format(date) + ' UTC';
}
