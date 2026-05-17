import * as THREE from 'three';
import { scene, camera, renderer, controls } from './scene.js';
import { createStarfield } from './starfield.js';
import { createSun, updateSun } from './sun.js';
import { createPlanets, planetMeshes, moonMeshes, moonOrbitLines,
         getEarthMesh, getEarthMaterial } from './planets.js';
import { updateCamera, isFollowing } from './cameraControl.js';
import { setupUI, getSpeed } from './ui.js';
import { PLANETS } from './data.js';
import {
  getHeliocentricPosition,
  getPlanetRotationAngle,
  getMoonAngle,
  getEarthRotationY,
  jdToDate,
} from './astronomy.js';
import { isRealTimeMode, getCurrentJD, setSimulatedDate, updateEffectiveJD } from './timeControl.js';
import { isGameMode, updateGame } from './gameMode.js';

// ── Illuminazione ─────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x4466aa, 2.8));
scene.add(new THREE.HemisphereLight(0x223366, 0x000011, 1));

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

// ── Tempo simulato ────────────────────────────────────────────────────────────
// Terra: angVelocity = spd * 0.1 = 0.298 rad/s → periodo = 2π/0.298 ≈ 21.09 s = 365.25 gg simulati
const SIM_DAYS_PER_SEC = PLANETS[2].spd * 0.1 * 365.25 / (2 * Math.PI); // ≈ 17.32

let simJD = getCurrentJD();

// ── Loop di animazione ────────────────────────────────────────────────────────
let t = 0;
const clock = new THREE.Clock();
const _sunDir = new THREE.Vector3();

function updateEarthShader(earthOrbAngle, jd) {
  const em  = getEarthMesh();
  const mat = getEarthMaterial();
  if (!em || !mat) return;
  em.rotation.z = PLANETS[2].tilt;
  em.rotation.y = getEarthRotationY(earthOrbAngle, jd);
  _sunDir.copy(em.position).negate().normalize();
  mat.uniforms.uSunDir.value.copy(_sunDir);
}

function animate() {
  requestAnimationFrame(animate);

  const dt  = Math.min(clock.getDelta(), 0.05);
  const spd = getSpeed();

  updateSun(t, dt);

  if (isGameMode()) {
    // ── MODALITÀ GIOCO ─────────────────────────────────────────────────────
    // I pianeti non seguono le orbite: si muovono solo per la fisica delle catastrofi.
    // Ruotiamo solo visivamente.
    planetMeshes.forEach((mesh, i) => {
      const p = PLANETS[i];
      if (p.textureKey === 'earth') {
        updateEarthShader(mesh.userData.angle ?? 0, simJD);
      } else {
        mesh.rotation.y += dt * 0.18;
      }
    });
    // Lune seguono il pianeta padre (che si muove per fisica catastrofe)
    moonMeshes.forEach(moonMesh => {
      const { moon, parentMesh } = moonMesh.userData;
      moonMesh.userData.angle += dt * moon.spd * 0.12;
      const a = moonMesh.userData.angle;
      moonMesh.position.set(
        parentMesh.position.x + Math.cos(a) * moon.orbitR,
        parentMesh.position.y,
        parentMesh.position.z + Math.sin(a) * moon.orbitR,
      );
    });
    moonOrbitLines.forEach(l => l.position.copy(l.userData.parentMesh.position));
    updateGame(dt);

  } else if (isRealTimeMode()) {
    // ── TEMPO REALE ────────────────────────────────────────────────────────
    const jd = getCurrentJD();
    planetMeshes.forEach((mesh, i) => {
      const p = PLANETS[i];
      const { lon, lat } = getHeliocentricPosition(p.textureKey, jd);
      mesh.position.set(Math.cos(lon) * p.dist, Math.sin(lat) * p.dist, Math.sin(lon) * p.dist);
      mesh.userData.angle = lon;
      if (p.textureKey === 'earth') {
        updateEarthShader(lon, jd);
      } else {
        mesh.rotation.z = p.tilt;
        mesh.rotation.y = getPlanetRotationAngle(p.textureKey, jd);
      }
    });
    moonMeshes.forEach(moonMesh => {
      const { moon, parentMesh } = moonMesh.userData;
      const a = getMoonAngle(moon.textureKey, jd);
      moonMesh.userData.angle = a;
      moonMesh.position.set(
        parentMesh.position.x + Math.cos(a) * moon.orbitR,
        parentMesh.position.y,
        parentMesh.position.z + Math.sin(a) * moon.orbitR,
      );
    });
    moonOrbitLines.forEach(l => l.position.copy(l.userData.parentMesh.position));
    updateEffectiveJD(jd);
    simJD = jd;

  } else {
    // ── SIMULAZIONE ────────────────────────────────────────────────────────
    t += dt * spd;
    simJD += dt * spd * SIM_DAYS_PER_SEC;
    planetMeshes.forEach((mesh, i) => {
      const p = PLANETS[i];
      mesh.userData.angle += dt * p.spd * 0.1 * spd;
      const a = mesh.userData.angle;
      mesh.position.set(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist);
      if (p.textureKey === 'earth') {
        updateEarthShader(a, simJD);
      } else {
        mesh.rotation.z = p.tilt;
        mesh.rotation.y += dt * (0.4 + i * 0.07);
      }
    });
    moonMeshes.forEach(moonMesh => {
      const { moon, parentMesh } = moonMesh.userData;
      moonMesh.userData.angle += dt * moon.spd * 0.3 * spd;
      const a = moonMesh.userData.angle;
      moonMesh.position.set(
        parentMesh.position.x + Math.cos(a) * moon.orbitR,
        parentMesh.position.y,
        parentMesh.position.z + Math.sin(a) * moon.orbitR,
      );
    });
    moonOrbitLines.forEach(l => l.position.copy(l.userData.parentMesh.position));
    updateEffectiveJD(simJD);
    setSimulatedDate(jdToDate(simJD));
  }

  updateCamera(dt);
  if (!isFollowing()) controls.update();
  renderer.render(scene, camera);
}

animate();
