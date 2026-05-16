import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { createStarfield } from './starfield.js';
import { createSun, updateSun } from './sun.js';
import { createPlanets, planetMeshes } from './planets.js';
import { updateCamera, isFollowing } from './cameraControl.js';
import { setupUI, getSpeed } from './ui.js';
import { PLANETS } from './data.js';

// ── Illuminazione ─────────────────────────────────────────────────────────────
// Luce ambientale forte: garantisce che tutti i pianeti (anche Urano e Nettuno)
// siano chiaramente visibili indipendentemente dalla distanza dal Sole.
scene.add(new THREE.AmbientLight(0x5577aa, 3.5));

// Luce emisferica per dare un tono "spaziale" (cielo blu scuro, suolo nero)
scene.add(new THREE.HemisphereLight(0x223366, 0x000011, 1.2));

// ── Costruzione scena ─────────────────────────────────────────────────────────
createStarfield();
createSun();
createPlanets();
setupUI();

// ── Loading screen ────────────────────────────────────────────────────────────
const loading = document.getElementById('loading');
setTimeout(() => {
  loading.style.opacity = '0';
  setTimeout(() => loading.remove(), 650);
}, 1400);

// ── Loop di animazione ────────────────────────────────────────────────────────
let t = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt  = Math.min(clock.getDelta(), 0.05);
  const spd = getSpeed();
  t += dt * spd;

  // Animazione Sole
  updateSun(t, dt);

  // Animazione pianeti
  planetMeshes.forEach((mesh, i) => {
    const p = PLANETS[i];
    // Avanzamento angolo orbitale
    mesh.userData.angle += dt * p.spd * 0.1 * spd;
    const a = mesh.userData.angle;
    mesh.position.set(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist);
    // Rotazione assiale
    mesh.rotation.y += dt * (0.4 + i * 0.07);
  });

  // Camera follow (se un pianeta è selezionato)
  updateCamera(dt);

  // OrbitControls solo in modalità libera
  if (!isFollowing()) controls.update();

  renderer.render(scene, camera);
}

animate();
