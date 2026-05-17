import * as THREE from 'three';
import { scene } from './scene.js';
import { txSun, txGlow } from './textures.js';

let sunMesh, sunLight, flareMat, flareSprite;
const glowMeshes = [];
let glowMat1, glowMat2, glowMat3;
let sunHidden = false;

export function createSun() {
  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshBasicMaterial({ map: txSun(), color: 0xffee88 })
  );
  scene.add(sunMesh);

  sunLight = new THREE.PointLight(0xfff4d0, 6, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  scene.add(sunLight);

  const glowTex = txGlow();
  function addGlow(radius, opacity, color) {
    const mat = new THREE.MeshBasicMaterial({
      map: glowTex, color, transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
    });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), mat);
    scene.add(mesh);
    glowMeshes.push(mesh);
    return mat;
  }

  glowMat1 = addGlow(7.2,  0.5,  0xff8800);
  glowMat2 = addGlow(10.5, 0.2,  0xff4400);
  glowMat3 = addGlow(16,   0.08, 0xff2200);

  flareMat = new THREE.SpriteMaterial({
    map: glowTex, color: 0xffaa00, transparent: true, opacity: 0.55,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  flareSprite = new THREE.Sprite(flareMat);
  flareSprite.scale.set(45, 45, 1);
  scene.add(flareSprite);
}

export function updateSun(t, dt) {
  if (sunHidden) return;
  sunMesh.rotation.y += dt * 0.15;
  flareMat.rotation = t * 0.1;
  glowMat1.opacity = 0.42 + Math.sin(t * 1.5) * 0.08;
  glowMat2.opacity = 0.16 + Math.sin(t * 0.9) * 0.04;
  glowMat3.opacity = 0.06 + Math.sin(t * 0.7) * 0.02;

  // Keep all sun-related objects synced to sun mesh position
  const p = sunMesh.position;
  sunLight.position.copy(p);
  glowMeshes.forEach(m => m.position.copy(p));
  flareSprite.position.copy(p);
}

export const getSunMesh  = () => sunMesh;
export const getSunLight = () => sunLight;

export function hideSun() {
  if (sunHidden) return;
  sunHidden = true;
  sunMesh.visible    = false;
  flareSprite.visible = false;
  glowMeshes.forEach(m => { m.visible = false; });
  sunLight.intensity = 0;
}

/** Fully resets sun to initial state — called by resetGame(). */
export function restoreSun() {
  sunHidden = false;
  sunMesh.visible    = true;
  flareSprite.visible = true;
  glowMeshes.forEach(m => { m.visible = true; });
  sunLight.intensity = 6;
  sunMesh.scale.set(1, 1, 1);
  const origin = new THREE.Vector3();
  sunMesh.position.copy(origin);
  sunLight.position.copy(origin);
  glowMeshes.forEach(m => m.position.copy(origin));
  flareSprite.position.copy(origin);
}
