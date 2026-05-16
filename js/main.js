import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { createStarfield } from './starfield.js';
import { createSun, updateSun } from './sun.js';
import { createPlanets, planetMeshes, moonMeshes, moonOrbitLines } from './planets.js';
import { updateCamera, isFollowing } from './cameraControl.js';
import { setupUI, getSpeed } from './ui.js';
import { PLANETS } from './data.js';

// ── Illuminazione ─────────────────────────────────────────────────────────────
// AmbientLight forte: tutti i pianeti e le lune restano visibili a qualsiasi distanza.
scene.add(new THREE.AmbientLight(0x5577aa, 3.5));
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

  updateSun(t, dt);

  // Animazione pianeti
  planetMeshes.forEach((mesh, i) => {
    const p = PLANETS[i];
    mesh.userData.angle += dt * p.spd * 0.1 * spd;
    const a = mesh.userData.angle;
    mesh.position.set(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist);
    mesh.rotation.y += dt * (0.4 + i * 0.07);
  });

  // Animazione lune: orbitano attorno al pianeta padre
  moonMeshes.forEach((moonMesh) => {
    const { moon, parentMesh } = moonMesh.userData;
    // moon.spd negativo → orbita retrograda (es. Tritone)
    moonMesh.userData.angle += dt * moon.spd * 0.3 * spd;
    const a = moonMesh.userData.angle;
    moonMesh.position.set(
      parentMesh.position.x + Math.cos(a) * moon.orbitR,
      parentMesh.position.y,
      parentMesh.position.z + Math.sin(a) * moon.orbitR
    );
    moonMesh.rotation.y += dt * 0.6;
  });

  // Riposiziona le linee orbitali delle lune sul pianeta padre
  moonOrbitLines.forEach((line) => {
    line.position.copy(line.userData.parentMesh.position);
  });

  updateCamera(dt);
  if (!isFollowing()) controls.update();

  renderer.render(scene, camera);
}

animate();
