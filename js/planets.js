import * as THREE from 'three';
import { scene } from './scene.js';
import { PLANETS } from './data.js';
import { TEXTURE_MAP, txRing, txEarthDay, txEarthNight } from './textures.js';

export const planetMeshes   = [];
export const orbitLines     = [];
export const moonMeshes     = [];
export const moonOrbitLines = [];

// Riferimenti interni alla Terra (accessibili tramite getter)
let _earthMesh     = null;
let _earthMaterial = null;
export const getEarthMesh     = () => _earthMesh;
export const getEarthMaterial = () => _earthMaterial;

// ── Earth ShaderMaterial ──────────────────────────────────────────────────────

const EARTH_VERT = /* glsl */`
  varying vec3 vWorldNormal;
  varying vec2 vUv;
  void main() {
    vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const EARTH_FRAG = /* glsl */`
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform vec3      uSunDir;   // dir. dal centro Terra verso il Sole (world space)

  varying vec3 vWorldNormal;
  varying vec2 vUv;

  void main() {
    vec3  N      = normalize(vWorldNormal);
    float cosA   = dot(N, normalize(uSunDir));

    // Zona terminatore ±10°  → smooth blend
    float day    = smoothstep(-0.18, 0.18, cosA);

    vec4 colDay   = texture2D(uDay,   vUv);
    vec4 colNight = texture2D(uNight, vUv);

    // Blend giorno/notte
    vec4 color = mix(colNight, colDay, day);

    // Diffuse sunlight sul lato giorno
    float diff = max(0.0, cosA);
    color.rgb *= mix(0.08, 1.0 + diff * 0.25, day);

    // Bagliore atmosferico azzurro al terminatore
    float rim = 1.0 - abs(cosA);
    rim = pow(rim, 4.0);
    color.rgb += vec3(0.05, 0.12, 0.28) * rim;

    // Highlight speculare sull'oceano (canale blu alto = oceano)
    float ocean   = clamp(colDay.b - colDay.g * 0.6, 0.0, 1.0);
    float spec    = pow(max(0.0, cosA), 40.0) * ocean * day;
    color.rgb    += vec3(0.4, 0.55, 0.7) * spec;

    gl_FragColor = color;
  }
`;

// ── Orbite ────────────────────────────────────────────────────────────────────

function makeOrbitLine(radius, color = 0x2a3d55, opacity = 0.45, segments = 128) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

// ── Lune ─────────────────────────────────────────────────────────────────────

function createMoonsForPlanet(planetMesh, planetData) {
  if (!planetData.moons || planetData.moons.length === 0) return;

  planetData.moons.forEach((moon) => {
    // Orbita della luna (riposizionata ogni frame nel loop)
    const orbitLine = makeOrbitLine(moon.orbitR, 0x3a4f6a, 0.28, 64);
    orbitLine.userData.parentMesh = planetMesh;
    scene.add(orbitLine);
    moonOrbitLines.push(orbitLine);

    // Mesh della luna
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(moon.R, 32, 32),
      new THREE.MeshPhongMaterial({
        map: TEXTURE_MAP[moon.textureKey](),
        emissive: new THREE.Color(0x111111),
        emissiveIntensity: 0.18,
        shininess: 5,
        specular: new THREE.Color(0x111111),
      })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      type: 'moon',
      moon,
      parentMesh: planetMesh,
      angle: Math.random() * Math.PI * 2,
    };
    scene.add(mesh);
    moonMeshes.push(mesh);
  });
}

// ── Pianeti ───────────────────────────────────────────────────────────────────

export function createPlanets() {
  const ringTex = txRing();

  PLANETS.forEach((p) => {
    // Orbita del pianeta
    const orbitLine = makeOrbitLine(p.dist);
    scene.add(orbitLine);
    orbitLines.push(orbitLine);

    // Materiale: Terra → ShaderMaterial day/night, altri → MeshPhongMaterial
    let mat;
    if (p.textureKey === 'earth') {
      mat = new THREE.ShaderMaterial({
        uniforms: {
          uDay:    { value: txEarthDay() },
          uNight:  { value: txEarthNight() },
          uSunDir: { value: new THREE.Vector3(1, 0, 0) }, // aggiornato ogni frame
        },
        vertexShader:   EARTH_VERT,
        fragmentShader: EARTH_FRAG,
      });
      _earthMaterial = mat;
    } else {
      mat = new THREE.MeshPhongMaterial({
        map: TEXTURE_MAP[p.textureKey](),
        emissive: new THREE.Color(p.emi),
        emissiveIntensity: p.emiI,
        shininess: p.shin,
        specular: new THREE.Color(0x333333),
      });
    }

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.R, 64, 64), mat);
    mesh.rotation.z = p.tilt;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type: 'planet', planet: p, angle: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    planetMeshes.push(mesh);

    if (p.textureKey === 'earth') _earthMesh = mesh;

    // Anelli di Saturno
    if (p.hasRings) {
      const iR = p.R * 1.38, oR = p.R * 2.55;
      const rGeo = new THREE.RingGeometry(iR, oR, 128, 4);
      const pos = rGeo.attributes.position, uv = rGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i);
        uv.setXY(i, (Math.hypot(x, y) - iR) / (oR - iR), 0.5);
      }
      uv.needsUpdate = true;
      const ring = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({
        map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0.88, depthWrite: false,
      }));
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = 0.12;
      mesh.add(ring);
    }

    // Lune del pianeta
    createMoonsForPlanet(mesh, p);
  });
}
