import * as THREE from 'three';
import { camera, renderer } from './scene.js';
import { planetMeshes, orbitLines, moonMeshes, moonOrbitLines } from './planets.js';
import { focusPlanet, exitFollow, isFollowing } from './cameraControl.js';
import { setupTimeControl, getEffectiveJD } from './timeControl.js';
import { getHeliocentricPosition, getSeasons } from './astronomy.js';

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
    elSeason.textContent  = `${season.north} (N) · ${season.south} (S)`;
    elRow.style.display   = '';
  } else {
    elRow.style.display = 'none';
  }
}

function _drawIcon(mesh, isMoon) {
  const icon = document.getElementById('p-icon');
  const ctx  = icon.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);

  // Terra usa ShaderMaterial → day texture nelle uniforms
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
    const data   = isMoon ? mesh.userData.moon : mesh.userData.planet;
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

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setupUI() {
  setupTimeControl();

  const panel = document.getElementById('info-panel');

  // Chiudi pannello e rilascia follow
  document.getElementById('panel-x').addEventListener('click', () => {
    panel.classList.remove('open');
    if (isFollowing()) exitFollow();
  });

  // Bottone "torna alla mappa"
  document.getElementById('exit-follow').addEventListener('click', () => {
    panel.classList.remove('open');
    exitFollow();
  });

  // Escape
  globalThis.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFollowing()) {
      panel.classList.remove('open');
      exitFollow();
    }
  });

  // Velocità
  const slider     = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-val');
  slider.addEventListener('input', () => {
    speedMultiplier = Number.parseFloat(slider.value);
    speedLabel.textContent = speedMultiplier.toFixed(1) + '×';
  });

  // Toggle orbite (pianeti + lune)
  let orbitsOn = true;
  const orbitBtn = document.getElementById('orbit-btn');
  orbitBtn.addEventListener('click', () => {
    orbitsOn = !orbitsOn;
    [...orbitLines, ...moonOrbitLines].forEach((l) => (l.visible = orbitsOn));
    orbitBtn.classList.toggle('on', orbitsOn);
  });

  // Raycasting su pianeti E lune
  const ray     = new THREE.Raycaster();
  const mouse   = new THREE.Vector2();
  const tooltip = document.getElementById('tooltip');
  let hovered   = null;

  const allBodies = () => [...planetMeshes, ...moonMeshes];

  renderer.domElement.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
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
  });

  renderer.domElement.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(mouse, camera);

    const hits = ray.intersectObjects(allBodies(), false);
    if (hits.length > 0) {
      const mesh = hits[0].object;
      showInfo(mesh);
      focusPlanet(mesh);
    } else if (!isFollowing()) {
      panel.classList.remove('open');
    }
  });
}
