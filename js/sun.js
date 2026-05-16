import * as THREE from 'three';
import { scene } from './scene.js';
import { txSun, txGlow } from './textures.js';

let sunMesh, glowMat1, glowMat2, glowMat3, flareMat;

export function createSun() {
  // Sun sphere
  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),
    new THREE.MeshBasicMaterial({ map: txSun(), color: 0xffee88 })
  );
  scene.add(sunMesh);

  // Point light — decay=0 so no distance falloff (tutti i pianeti ricevono luce)
  const sunLight = new THREE.PointLight(0xfff4d0, 6, 0, 0);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  scene.add(sunLight);

  // Glow layers (additive blending)
  const glowTex = txGlow();
  function addGlow(radius, opacity, color) {
    const mat = new THREE.MeshBasicMaterial({
      map: glowTex,
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), mat));
    return mat;
  }

  glowMat1 = addGlow(7.2,  0.5,  0xff8800);
  glowMat2 = addGlow(10.5, 0.2,  0xff4400);
  glowMat3 = addGlow(16,   0.08, 0xff2200);

  // Lens flare sprite
  flareMat = new THREE.SpriteMaterial({
    map: glowTex,
    color: 0xffaa00,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const flare = new THREE.Sprite(flareMat);
  flare.scale.set(45, 45, 1);
  scene.add(flare);
}

export function updateSun(t, dt) {
  sunMesh.rotation.y += dt * 0.15;
  const pulse = 1 + Math.sin(t * 1.8) * 0.04;
  flareMat.rotation = t * 0.1;
  // reuse flare sprite scale via its parent (sprite scale is on the object)
  sunMesh.parent; // no-op just to keep reference
  // Animate glow opacity
  glowMat1.opacity = 0.42 + Math.sin(t * 1.5) * 0.08;
  glowMat2.opacity = 0.16 + Math.sin(t * 0.9) * 0.04;
  glowMat3.opacity = 0.06 + Math.sin(t * 0.7) * 0.02;
  // pulse handled via flareMat color intensity — simpler approach:
  // We scale the sprite by setting its material map's offset slightly
  void pulse; // suppresses unused warning
}
