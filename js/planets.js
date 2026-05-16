import * as THREE from 'three';
import { scene } from './scene.js';
import { PLANETS } from './data.js';
import { TEXTURE_MAP, txRing } from './textures.js';

export const planetMeshes = [];
export const orbitLines = [];

export function createPlanets() {
  const ringTex = txRing();

  PLANETS.forEach((p) => {
    // Orbit line
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist));
    }
    const orbitLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x2a3d55, transparent: true, opacity: 0.45 })
    );
    scene.add(orbitLine);
    orbitLines.push(orbitLine);

    // Planet mesh
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(p.R, 64, 64),
      new THREE.MeshPhongMaterial({
        map: TEXTURE_MAP[p.textureKey](),
        emissive: new THREE.Color(p.emi),
        emissiveIntensity: p.emiI,
        shininess: p.shin,
        specular: new THREE.Color(0x333333),
      })
    );
    mesh.rotation.z = p.tilt;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { planet: p, angle: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    planetMeshes.push(mesh);

    // Saturn rings
    if (p.hasRings) {
      const iR = p.R * 1.38;
      const oR = p.R * 2.55;
      const rGeo = new THREE.RingGeometry(iR, oR, 128, 4);

      // Remap UV radially: U = 0 at inner edge, U = 1 at outer edge
      const pos = rGeo.attributes.position;
      const uv  = rGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        uv.setXY(i, (Math.sqrt(x * x + y * y) - iR) / (oR - iR), 0.5);
      }
      uv.needsUpdate = true;

      const ring = new THREE.Mesh(
        rGeo,
        new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.88,
          depthWrite: false,
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = 0.12;
      mesh.add(ring);
    }
  });
}
