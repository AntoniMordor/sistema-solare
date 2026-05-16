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

function _computeSeason(textureKey, orbAngle) {
  try {
    const jd = getEffectiveJD();
    const { lon } = getHeliocentricPosition(textureKey, jd);
    // In simulazione l'angolo orbitale potrebbe divergere dal kepleriano;
    // usiamo il kepleriano in real-time, l'angolo mesh in simulazione.
    const effectiveLon = Number.isFinite(lon) ? lon : orbAngle;
    return getSeasons(effectiveLon);
  } catch {
    return null;
  }
}

function showInfo(mesh) {
  const isMoon  = mesh.userData.type === 'moon';
  const elSeason     = document.getElementById('i-season');
  const elSeasonRow  = document.getElementById('season-row');

  if (isMoon) {
    const m = mesh.userData.moon;
    document.getElementById('p-name').textContent    = m.name;
    document.getElementById('p-tag').textContent     = `LUNA DI ${m.info.parentPlanet.toUpperCase()}`;
    document.getElementById('lbl-dist').textContent  = 'Dist. dal Pianeta';
    document.getElementById('lbl-extra').textContent = 'Pianeta';
    document.getElementById('i-dist').textContent    = m.info.dist;
    document.getElementById('i-period').textContent  = m.info.period;
    document.getElementById('i-diam').textContent    = m.info.diam;
    document.getElementById('i-moons').textContent   = m.info.parentPlanet;
    document.getElementById('p-desc').textContent    = m.info.desc;
    if (elSeasonRow) elSeasonRow.style.display = 'none';
  } else {
    const p = mesh.userData.planet;
    document.getElementById('p-name').textContent    = p.name;
    document.getElementById('p-tag').textContent     = p.tag;
    document.getElementById('lbl-dist').textContent  = 'Distanza dal Sole';
    document.getElementById('lbl-extra').textContent = 'Lune';
    document.getElementById('i-dist').textContent    = p.info.dist;
    document.getElementById('i-period').textContent  = p.info.period;
    document.getElementById('i-diam').textContent    = p.info.diam;
    document.getElementById('i-moons').textContent   = p.info.moons;
    document.getElementById('p-desc').textContent    = p.info.desc;

    // Stagioni correnti del pianeta
    if (elSeasonRow && elSeason) {
      const season = _computeSeason(p.textureKey, mesh.userData.angle ?? 0);
      if (season) {
        elSeason.textContent = `${season.north} (N) · ${season.south} (S)`;
        elSeasonRow.style.display = '';
      } else {
        elSeasonRow.style.display = 'none';
      }
    }
  }

  // Miniatura del corpo celeste
  const icon = document.getElementById('p-icon');
  const ctx  = icon.getContext('2d');
  ctx.clearRect(0, 0, 64, 64);
  const img = mesh.material.map?.image;
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 0, 0, 64, 64);
    ctx.restore();
  }

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
