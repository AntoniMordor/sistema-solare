import * as THREE from 'three';
import { camera, controls } from './scene.js';

// ── Stato ─────────────────────────────────────────────────────────────────────

let mode = 'free'; // 'free' | 'zooming' | 'following'
let targetMesh = null;
let zoomProgress = 0;

const zoomStartPos = new THREE.Vector3();
const _radial = new THREE.Vector3();

// ── Helpers ───────────────────────────────────────────────────────────────────

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Posizione ideale della camera: lato esterno dell'orbita, leggermente sopra.
 * Funziona sia per pianeti che per lune.
 */
function getDesiredCamPos(mesh) {
  const isMoon = mesh.userData.type === 'moon';
  const data   = isMoon ? mesh.userData.moon : mesh.userData.planet;
  const minDist = isMoon ? 3 : 10;
  const dist    = Math.max(data.R * 10, minDist);

  const pos = mesh.position;
  _radial.set(pos.x, 0, pos.z).normalize();

  return pos.clone()
    .addScaledVector(_radial, dist)
    .add(new THREE.Vector3(0, dist * 0.45, 0));
}

// ── API pubblica ──────────────────────────────────────────────────────────────

export function focusPlanet(mesh) {
  targetMesh   = mesh;
  mode         = 'zooming';
  zoomProgress = 0;
  zoomStartPos.copy(camera.position);
  controls.enabled = false;

  document.getElementById('ui-title').style.opacity = '0';
  document.getElementById('ui-title').style.pointerEvents = 'none';
  document.getElementById('exit-follow').style.display = 'block';
}

export function exitFollow() {
  mode       = 'free';
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
 * Aggiorna la camera ogni frame — chiamato da main.js.
 */
export function updateCamera(dt) {
  if (mode === 'free' || !targetMesh) return;

  const desired  = getDesiredCamPos(targetMesh);
  const lookAt   = targetMesh.position;

  if (mode === 'zooming') {
    zoomProgress = Math.min(zoomProgress + dt * 0.65, 1);
    camera.position.lerpVectors(zoomStartPos, desired, smoothstep(zoomProgress));
    camera.lookAt(lookAt);
    if (zoomProgress >= 1) mode = 'following';
  } else {
    // following: insegue il corpo in orbita con leggero lag
    camera.position.lerp(desired, Math.min(dt * 6, 0.15));
    camera.lookAt(lookAt);
  }
}
