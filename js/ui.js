import * as THREE from 'three';
import { camera, renderer } from './scene.js';
import { planetMeshes, orbitLines } from './planets.js';
import { focusPlanet, exitFollow, isFollowing } from './cameraControl.js';

// ── Speed ─────────────────────────────────────────────────────────────────────

let speedMultiplier = 1;

export function getSpeed() {
  return speedMultiplier;
}

// ── Info panel ────────────────────────────────────────────────────────────────

function showPlanetInfo(mesh) {
  const p = mesh.userData.planet;

  document.getElementById('p-name').textContent   = p.name;
  document.getElementById('p-tag').textContent    = p.tag;
  document.getElementById('i-dist').textContent   = p.info.dist;
  document.getElementById('i-period').textContent = p.info.period;
  document.getElementById('i-diam').textContent   = p.info.diam;
  document.getElementById('i-moons').textContent  = p.info.moons;
  document.getElementById('p-desc').textContent   = p.info.desc;

  // Miniatura del pianeta nell'icona
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

function hidePanel() {
  document.getElementById('info-panel').classList.remove('open');
}

// ── Setup ─────────────────────────────────────────────────────────────────────

export function setupUI() {
  // Chiudi pannello (×): chiude pannello e rilascia il follow
  document.getElementById('panel-x').addEventListener('click', () => {
    hidePanel();
    if (isFollowing()) exitFollow();
  });

  // Pulsante "torna alla mappa"
  document.getElementById('exit-follow').addEventListener('click', () => {
    hidePanel();
    exitFollow();
  });

  // Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isFollowing()) {
      hidePanel();
      exitFollow();
    }
  });

  // Speed slider
  const slider     = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-val');
  slider.addEventListener('input', () => {
    speedMultiplier = parseFloat(slider.value);
    speedLabel.textContent = speedMultiplier.toFixed(1) + '×';
  });

  // Orbit toggle
  let orbitsOn = true;
  const orbitBtn = document.getElementById('orbit-btn');
  orbitBtn.addEventListener('click', () => {
    orbitsOn = !orbitsOn;
    orbitLines.forEach((l) => (l.visible = orbitsOn));
    orbitBtn.classList.toggle('on', orbitsOn);
  });

  // Tooltip + click via raycasting
  const ray     = new THREE.Raycaster();
  const mouse   = new THREE.Vector2();
  const tooltip = document.getElementById('tooltip');
  let hovered   = null;

  renderer.domElement.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(mouse, camera);

    const hits = ray.intersectObjects(planetMeshes, false);
    if (hits.length > 0) {
      const m = hits[0].object;
      if (hovered !== m) {
        hovered = m;
        tooltip.textContent = m.userData.planet.name.toUpperCase();
        renderer.domElement.style.cursor = 'pointer';
      }
      tooltip.style.left = e.clientX + 'px';
      tooltip.style.top  = e.clientY + 'px';
      tooltip.classList.add('show');
    } else {
      if (hovered) {
        hovered = null;
        renderer.domElement.style.cursor = '';
      }
      tooltip.classList.remove('show');
    }
  });

  renderer.domElement.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    ray.setFromCamera(mouse, camera);

    const hits = ray.intersectObjects(planetMeshes, false);
    if (hits.length > 0) {
      const mesh = hits[0].object;
      showPlanetInfo(mesh);
      focusPlanet(mesh);
    } else if (!isFollowing()) {
      hidePanel();
    }
  });
}
