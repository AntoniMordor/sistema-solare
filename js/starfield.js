import * as THREE from 'three';
import { scene } from './scene.js';

export function createStarfield() {
  // White stars
  const N = 9000;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 900 + Math.random() * 700;
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(
    new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.85,
      })
    )
  );

  // Colored accent stars (orange/blue/white)
  const M = 600;
  const cpos = new Float32Array(M * 3);
  const col = new Float32Array(M * 3);
  for (let i = 0; i < M; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 800 + Math.random() * 800;
    cpos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    cpos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    cpos[i * 3 + 2] = r * Math.cos(phi);
    const t = Math.random();
    if (t < 0.3) {
      col[i * 3] = 1; col[i * 3 + 1] = 0.75; col[i * 3 + 2] = 0.5; // orange
    } else if (t < 0.6) {
      col[i * 3] = 0.5; col[i * 3 + 1] = 0.75; col[i * 3 + 2] = 1; // blue
    } else {
      col[i * 3] = 1; col[i * 3 + 1] = 1; col[i * 3 + 2] = 1;      // white
    }
  }
  const cgeo = new THREE.BufferGeometry();
  cgeo.setAttribute('position', new THREE.BufferAttribute(cpos, 3));
  cgeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  scene.add(
    new THREE.Points(
      cgeo,
      new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: true, vertexColors: true })
    )
  );
}
