import * as THREE from 'three';
import { camera, renderer } from './scene.js';
import { planetMeshes, orbitLines, moonMeshes, moonOrbitLines } from './planets.js';
import { focusPlanet, exitFollow, isFollowing } from './cameraControl.js';
import { setupTimeControl, getEffectiveJD } from './timeControl.js';
import { getHeliocentricPosition, getSeasons } from './astronomy.js';
import {
  CATASTROPHES, isGameMode, activateGameMode, deactivateGameMode,
  selectCatastrophe, placeCatastrophe, resetGame,
} from './gameMode.js';

// ── Velocità ──────────────────────────────────────────────────────────────────

let speedMultiplier = 1;
export function getSpeed() { return speedMultiplier; }

// ── Pannello informativo ──────────────────────────────────────────────────────

function _set(id, val) { document.getElementById(id).textContent = val; }

function _computeSeason(textureKey, orbAngle) {
  try {
    const jd = getEffectiveJD();
    const { lon } = getHeliocentricPosition(textureKey, jd);
    return getSeasons(Number.isFinite(lon) ? lon : orbAngle);
  } catch {
    return null;
  }
}

function _fillMoon(moon) {
  _set('p-name',   moon.name);
  _set('p-tag',    `LUNA DI ${moon.info.parentPlanet.toUpperCase()}`);
  _set('lbl-dist', 'Dist. dal Pianeta');
  _set('lbl-extra','Pianeta');
  _set('i-dist',   moon.info.dist);
  _set('i-period', moon.info.period);
  _set('i-diam',   moon.info.diam);
  _set('i-moons',  moon.info.parentPlanet);
  _set('p-desc',   moon.info.desc);
  const sr = document.getElementById('season-row');
  if (sr) sr.style.display = 'none';
}

function _fillPlanet(planet, textureKey, angle) {
  _set('p-name',   planet.name);
  _set('p-tag',    planet.tag);
  _set('lbl-dist', 'Distanza dal Sole');
  _set('lbl-extra','Lune');
  _set('i-dist',   planet.info.dist);
  _set('i-period', planet.info.period);
  _set('i-diam',   planet.info.diam);
  _set('i-moons',  planet.info.moons);
  _set('p-desc',   planet.info.desc);
  _updateSeason(textureKey, angle);
}

function _updateSeason(textureKey, angle) {
  const elRow    = document.getElementById('season-row');
  const elSeason = document.getElementById('i-season');
  if (!elRow || !elSeason) return;
  const season = _computeSeason(textureKey, angle ?? 0);
  if (season) {
    elSeason.textContent = `${season.north} (N) · ${season.south} (S)`;
    elRow.style.display  = '';
  } else {
    elRow.style.display = 'none';
  }
}

function _drawIcon(mesh, isMoon) {
  const icon = document.getElementById('p-icon');
  const ctx  = icon.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  const img = mesh.material.uniforms?.uDay
    ? mesh.material.uniforms.uDay.value?.image
    : mesh.material.map?.image;
  ctx.save();
  ctx.beginPath();
  ctx.arc(32, 32, 30, 0, Math.PI * 2);
  if (img) {
    ctx.clip();
    ctx.drawImage(img, 0, 0, 64, 64);
  } else {
    const data    = isMoon ? mesh.userData.moon : mesh.userData.planet;
    ctx.fillStyle = data.emi ? `#${data.emi.toString(16).padStart(6, '0')}` : '#334455';
    ctx.fill();
  }
  ctx.restore();
}

function showInfo(mesh) {
  const isMoon = mesh.userData.type === 'moon';
  if (isMoon) {
    _fillMoon(mesh.userData.moon);
  } else {
    _fillPlanet(mesh.userData.planet, mesh.userData.planet.textureKey, mesh.userData.angle);
  }
  _drawIcon(mesh, isMoon);
  document.getElementById('info-panel').classList.add('open');
}

// ── Modalità Gioco ────────────────────────────────────────────────────────────

function _buildGamePanel() {
  const grid = document.getElementById('cata-grid');
  if (!grid) return;
  grid.innerHTML = '';

  CATASTROPHES.forEach(c => {
    const card = document.createElement('div');
    card.className = 'cata-card';
    card.dataset.id = c.id;
    card.style.setProperty('--cata-color', c.color);
    card.innerHTML = `<div class="cata-icon-big">${c.icon}</div><div class="cata-name-sm">${c.name}</div>`;
    card.addEventListener('click', () => selectCatastrophe(c.id));
    grid.appendChild(card);
  });

  // Resetta stato selezione all'apertura
  const nameEl = document.getElementById('game-selected-name');
  const hintEl = document.getElementById('game-selected-hint');
  if (nameEl) nameEl.textContent = '—';
  if (hintEl) hintEl.textContent = '↑ Seleziona una catastrofe';
  const infoEl = document.getElementById('game-info-text');
  if (infoEl) infoEl.textContent = '';
}

function _elDisplay(id, val) {
  const el = document.getElementById(id);
  if (el) el.style.display = val;
}
function _elOpacity(id, val, ptr = '') {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.opacity = val;
  el.style.pointerEvents = ptr;
}

function _showGameMode(on) {
  // game-panel e time-panel sono mutuamente esclusivi (stessa posizione)
  _elDisplay('game-panel', on ? 'block' : 'none');
  _elDisplay('time-panel', on ? 'none' : 'block');
  _elOpacity('speed-box', on ? '0.25' : '1', on ? 'none' : '');
  _elOpacity('orbit-btn', on ? '0.4' : '');
  renderer.domElement.style.cursor = on ? 'crosshair' : '';
  // btn-game è ora FUORI da time-panel, sempre visibile
  document.getElementById('btn-game')?.classList.toggle('active', on);
  if (on) _buildGamePanel();
}

// Raycast sul piano eclittico (Y=0) per piazzare la catastrofe
function _placeFromClick(e) {
  const mx = (e.clientX / window.innerWidth)  * 2 - 1;
  const my = -(e.clientY / window.innerHeight) * 2 + 1;
  const ray = new THREE.Raycaster();
  ray.setFromCamera(new THREE.Vector2(mx, my), camera);
  const eclipticPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const target = new THREE.Vector3();
  if (ray.ray.intersectPlane(eclipticPlane, target)) {
    placeCatastrophe(target);
  }
}

// ── Setup — handler estratti per ridurre cognitive complexity ─────────────────

function _makeKeyHandler(panel) {
  return (e) => {
    if (e.key !== 'Escape') return;
    if (isGameMode()) { deactivateGameMode(); _showGameMode(false); return; }
    if (isFollowing()) { panel.classList.remove('open'); exitFollow(); }
  };
}

function _makeMoveHandler(ray, mouse, tooltip, allBodies) {
  let hovered = null;
  return (e) => {
    if (isGameMode()) { tooltip.classList.remove('show'); return; }
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(allBodies(), false);
    if (hits.length > 0) {
      const m = hits[0].object;
      if (hovered !== m) {
        hovered = m;
        const name = m.userData.type === 'moon'
          ? `${m.userData.moon.name} (${m.userData.moon.info.parentPlanet})`
          : m.userData.planet.name;
        tooltip.textContent = name.toUpperCase();
        renderer.domElement.style.cursor = 'pointer';
      }
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top  = e.clientY + 'px';
      tooltip.classList.add('show');
    } else {
      if (hovered) { hovered = null; renderer.domElement.style.cursor = ''; }
      tooltip.classList.remove('show');
    }
  };
}

function _makeClickHandler(ray, mouse, panel, allBodies) {
  return (e) => {
    if (isGameMode()) { _placeFromClick(e); return; }
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(mouse, camera);
    const hits = ray.intersectObjects(allBodies(), false);
    if (hits.length > 0) {
      showInfo(hits[0].object);
      focusPlanet(hits[0].object);
    } else if (!isFollowing()) {
      panel.classList.remove('open');
    }
  };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setupUI() {
  setupTimeControl();

  const panel = document.getElementById('info-panel');
  const ray   = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const allBodies = () => [...planetMeshes, ...moonMeshes];

  document.getElementById('panel-x').addEventListener('click', () => {
    panel.classList.remove('open');
    if (isFollowing()) exitFollow();
  });
  document.getElementById('exit-follow').addEventListener('click', () => {
    panel.classList.remove('open');
    exitFollow();
  });
  globalThis.addEventListener('keydown', _makeKeyHandler(panel));

  const slider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-val');
  slider.addEventListener('input', () => {
    speedMultiplier = Number.parseFloat(slider.value);
    speedLabel.textContent = speedMultiplier.toFixed(1) + '×';
  });

  let orbitsOn = true;
  const orbitBtn = document.getElementById('orbit-btn');
  orbitBtn.addEventListener('click', () => {
    orbitsOn = !orbitsOn;
    [...orbitLines, ...moonOrbitLines].forEach(l => (l.visible = orbitsOn));
    orbitBtn.classList.toggle('on', orbitsOn);
  });

  document.getElementById('btn-game')?.addEventListener('click', () => {
    if (isGameMode()) return;
    activateGameMode();
    _showGameMode(true);
    panel.classList.remove('open');
  });

  // Nasconde il pannello gioco quando si esce dalla modalità (custom event da gameMode.js)
  document.addEventListener('gamemode:exit', () => _showGameMode(false));
  document.getElementById('game-reset-btn')?.addEventListener('click', () => {
    resetGame();
    const logEl = document.getElementById('game-log');
    if (logEl) logEl.innerHTML = '';
  });

  const tooltip = document.getElementById('tooltip');
  renderer.domElement.addEventListener('mousemove', _makeMoveHandler(ray, mouse, tooltip, allBodies));
  renderer.domElement.addEventListener('click',     _makeClickHandler(ray, mouse, panel, allBodies));
}
