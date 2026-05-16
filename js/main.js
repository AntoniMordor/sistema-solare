import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { createStarfield } from './starfield.js';
import { createSun, updateSun } from './sun.js';
import { createPlanets, planetMeshes, moonMeshes, moonOrbitLines } from './planets.js';
import { updateCamera, isFollowing } from './cameraControl.js';
import { setupUI, getSpeed } from './ui.js';
import { PLANETS } from './data.js';
import {
  getHeliocentricPosition,
  getPlanetRotationAngle,
  getMoonAngle,
} from './astronomy.js';
import { isRealTimeMode, getCurrentJD } from './timeControl.js';

// ── Illuminazione ─────────────────────────────────────────────────────────────
// Ambientale forte: tutti i pianeti rimangono visibili a qualsiasi distanza.
// In modalità reale la PointLight del Sole crea le ombre day/night corrette.
scene.add(new THREE.AmbientLight(0x4466aa, 2.8));
scene.add(new THREE.HemisphereLight(0x223366, 0x000011, 1));

// ── Costruzione scena ─────────────────────────────────────────────────────────
createStarfield();
createSun();
createPlanets();
setupUI();         // include setupTimeControl()

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

  updateSun(t, dt);

  // ── MODALITÀ TEMPO REALE ───────────────────────────────────────────────────
  if (isRealTimeMode()) {
    const jd = getCurrentJD();

    planetMeshes.forEach((mesh, i) => {
      const p = PLANETS[i];
      const { lon, lat } = getHeliocentricPosition(p.textureKey, jd);

      // Posizione: angolo reale + distanza compressa + inclinazione amplificata
      mesh.position.set(
        Math.cos(lon) * p.dist,
        Math.sin(lat) * p.dist,      // inclinazione eclittica reale
        Math.sin(lon) * p.dist
      );
      mesh.userData.angle = lon;

      // Rotazione siderale reale → terminatore giorno/notte corretto
      mesh.rotation.z = p.tilt;     // inclinazione assiale costante
      mesh.rotation.y = getPlanetRotationAngle(p.textureKey, jd);
    });

    moonMeshes.forEach((moonMesh) => {
      const { moon, parentMesh } = moonMesh.userData;
      const a = getMoonAngle(moon.textureKey, jd);
      moonMesh.userData.angle = a;
      moonMesh.position.set(
        parentMesh.position.x + Math.cos(a) * moon.orbitR,
        parentMesh.position.y,
        parentMesh.position.z + Math.sin(a) * moon.orbitR
      );
      moonMesh.rotation.y += dt * 0.6; // rotazione propria approssimata
    });

  // ── MODALITÀ SIMULAZIONE ───────────────────────────────────────────────────
  } else {
    t += dt * spd;

    planetMeshes.forEach((mesh, i) => {
      const p = PLANETS[i];
      mesh.userData.angle += dt * p.spd * 0.1 * spd;
      const a = mesh.userData.angle;
      mesh.position.set(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist);
      mesh.rotation.z = p.tilt;
      mesh.rotation.y += dt * (0.4 + i * 0.07);
    });

    moonMeshes.forEach((moonMesh) => {
      const { moon, parentMesh } = moonMesh.userData;
      moonMesh.userData.angle += dt * moon.spd * 0.3 * spd;
      const a = moonMesh.userData.angle;
      moonMesh.position.set(
        parentMesh.position.x + Math.cos(a) * moon.orbitR,
        parentMesh.position.y,
        parentMesh.position.z + Math.sin(a) * moon.orbitR
      );
      moonMesh.rotation.y += dt * 0.6;
    });
  }

  // Riposiziona le linee orbitali delle lune sul pianeta padre
  moonOrbitLines.forEach((line) => {
    line.position.copy(line.userData.parentMesh.position);
  });

  updateCamera(dt);
  if (!isFollowing()) controls.update();

  renderer.render(scene, camera);
}

animate();
