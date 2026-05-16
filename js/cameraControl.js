import * as THREE from 'three';
import { camera, controls } from './scene.js';

// ── State ─────────────────────────────────────────────────────────────────────

let mode = 'free'; // 'free' | 'zooming' | 'following'
let targetMesh = null;
let zoomProgress = 0;

const zoomStartPos = new THREE.Vector3();
const _tmp = new THREE.Vector3();

// ── Helpers ───────────────────────────────────────────────────────────────────

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Calcola la posizione ideale della camera rispetto al pianeta:
 * - in direzione radiale (fuori dall'orbita)
 * - leggermente sopra il piano orbitale
 */
function getDesiredCamPos(mesh) {
  const p = mesh.userData.planet;
  const planetPos = mesh.position;
  const dist = Math.max(p.R * 7, 12);

  // Direzione radiale nel piano XZ (da sole verso pianeta)
  _tmp.set(planetPos.x, 0, planetPos.z).normalize();

  return planetPos
    .clone()
    .addScaledVector(_tmp, dist)
    .add(new THREE.Vector3(0, dist * 0.45, 0));
}

// ── Public API ────────────────────────────────────────────────────────────────

export function focusPlanet(mesh) {
  targetMesh = mesh;
  mode = 'zooming';
  zoomProgress = 0;
  zoomStartPos.copy(camera.position);
  controls.enabled = false;

  document.getElementById('ui-title').style.opacity = '0';
  document.getElementById('ui-title').style.pointerEvents = 'none';
  document.getElementById('exit-follow').style.display = 'block';
}

export function exitFollow() {
  mode = 'free';
  targetMesh = null;
  controls.enabled = true;
  controls.target.set(0, 0, 0);

  document.getElementById('ui-title').style.opacity = '1';
  document.getElementById('ui-title').style.pointerEvents = '';
  document.getElementById('exit-follow').style.display = 'none';
}

export function isFollowing() {
  return mode !== 'free';
}

/**
 * Aggiorna la camera ogni frame.
 * Chiamato dal loop di animazione in main.js.
 */
export function updateCamera(dt) {
  if (mode === 'free' || !targetMesh) return;

  const desiredPos = getDesiredCamPos(targetMesh);
  const lookTarget = targetMesh.position;

  if (mode === 'zooming') {
    // Transizione fluida verso il pianeta (durata ~1.5 s)
    zoomProgress = Math.min(zoomProgress + dt * 0.65, 1);
    const s = smoothstep(zoomProgress);
    camera.position.lerpVectors(zoomStartPos, desiredPos, s);
    camera.lookAt(lookTarget);

    if (zoomProgress >= 1) {
      mode = 'following';
    }
  } else if (mode === 'following') {
    // Segue il pianeta in orbita con un leggero lag per fluidità
    camera.position.lerp(desiredPos, Math.min(dt * 6, 0.15));
    camera.lookAt(lookTarget);
  }
}
