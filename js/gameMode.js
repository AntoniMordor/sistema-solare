/**
 * gameMode.js — Modalità Catastrofe
 * Ogni catastrofe è una factory function che ritorna { update(dt), dispose() }.
 */

import * as THREE from 'three';
import { scene } from './scene.js';
import { planetMeshes, moonMeshes } from './planets.js';
import { getSunMesh, hideSun, restoreSun } from './sun.js';

// ── Catalogo catastrofi ───────────────────────────────────────────────────────

export const CATASTROPHES = [
  {
    id: 'blackhole', name: 'Buco Nero', icon: '⚫', color: '#aa44ff',
    info: 'Singolarità gravitazionale: F = GM/r². Distorce lo spaziotempo. I pianeti vengono "spaghettificati" dalle forze mareali prima di scomparire oltre l\'orizzonte degli eventi. Anche il Sole viene inghiottito. Clicca per posizionare la singolarità.',
  },
  {
    id: 'meteorite', name: 'Meteorite', icon: '🪨', color: '#cc8844',
    info: 'Corpo roccioso massiccio in rotta di collisione. Energia cinetica: KE = ½mv². Un impattore di 500 km libera energia pari a miliardi di bombe H, volatilizzando crosta e mantello planetario.',
  },
  {
    id: 'alien', name: 'Minaccia Aliena', icon: '🛸', color: '#00ff88',
    info: 'Una flotta di 4 astronavi aliene ha rilevato vita nel sistema solare. Gli UFO si avvicinano ai pianeti, li sorvolano e li disintegrano con raggi laser al plasma ad alta energia. Nessuna difesa è possibile.',
  },
  {
    id: 'gamma', name: 'Raggio Gamma', icon: '⚡', color: '#00ffbb',
    info: 'L\'evento più energetico dell\'universo (10⁴⁴ J). Il fascio di radiazioni ionizzanti viaggia alla velocità della luce. Un GRB entro 2000 anni luce distruggerebbe ogni biosfera in secondi.',
  },
];

// ── Stato interno ─────────────────────────────────────────────────────────────

let _active     = false;
let _selectedId = '';
let _cats        = [];
let _explosions  = [];
let _destroyed   = new Set();

// ── Explosion particles ───────────────────────────────────────────────────────

function spawnExplosion(pos, color, count = 120, spd = 20) {
  const arr = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    arr[i*3] = pos.x; arr[i*3+1] = pos.y; arr[i*3+2] = pos.z;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const v     = (Math.random() * 0.5 + 0.5) * spd;
    vel.push(new THREE.Vector3(
      v * Math.sin(phi) * Math.cos(theta),
      v * Math.sin(phi) * Math.sin(theta),
      v * Math.cos(phi),
    ));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const mat = new THREE.PointsMaterial({
    color, size: 1.3, transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  _explosions.push({ pts, vel, age: 0, maxAge: 2.5 });
}

function _updateExplosions(dt) {
  const dead = [];
  for (const exp of _explosions) {
    exp.age += dt;
    exp.pts.material.opacity = Math.max(0, 1 - exp.age / exp.maxAge);
    const arr = exp.pts.geometry.attributes.position.array;
    for (let i = 0; i < exp.vel.length; i++) {
      arr[i*3]   += exp.vel[i].x * dt;
      arr[i*3+1] += exp.vel[i].y * dt;
      arr[i*3+2] += exp.vel[i].z * dt;
    }
    exp.pts.geometry.attributes.position.needsUpdate = true;
    if (exp.age >= exp.maxAge) dead.push(exp);
  }
  for (const exp of dead) {
    scene.remove(exp.pts);
    exp.pts.geometry.dispose();
    exp.pts.material.dispose();
    _explosions.splice(_explosions.indexOf(exp), 1);
  }
}

// ── Distruzione pianeta ───────────────────────────────────────────────────────

function _destroyPlanet(mesh) {
  if (_destroyed.has(mesh)) return;
  _destroyed.add(mesh);
  spawnExplosion(mesh.position.clone(), 0xff5500, 140, 22);
  mesh.visible = false;
  mesh.scale.set(1, 1, 1);
  moonMeshes.forEach(m => {
    if (m.userData.parentMesh === mesh && !_destroyed.has(m)) {
      _destroyed.add(m); m.visible = false;
    }
  });
  _gameLog(mesh.userData.planet?.name ?? mesh.userData.moon?.name ?? '?');
}

function _gameLog(name) {
  const el = document.getElementById('game-log');
  if (!el) return;
  const row = document.createElement('div');
  row.className = 'game-log-row';
  row.textContent = `💥 ${name} distrutto`;
  el.insertBefore(row, el.firstChild);
  while (el.children.length > 5) el.lastChild.remove();
}

// ── Factory: Black Hole ───────────────────────────────────────────────────────

function mkBlackHole(pos) {
  const R = 4, GM = 14000;
  const meshes = [];
  let sunDestroyed = false;

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(R, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  core.position.copy(pos); scene.add(core); meshes.push(core);

  const disk = new THREE.Mesh(
    new THREE.RingGeometry(R * 1.6, R * 4.5, 64),
    new THREE.MeshBasicMaterial({ color: 0xff8800, side: THREE.DoubleSide,
      transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  disk.position.copy(pos); disk.rotation.x = 0.4; scene.add(disk); meshes.push(disk);

  const diskIn = new THREE.Mesh(
    new THREE.RingGeometry(R * 1.1, R * 1.65, 64),
    new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide,
      transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  diskIn.position.copy(pos); diskIn.rotation.x = 0.4; scene.add(diskIn); meshes.push(diskIn);

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(R * 3, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x6600cc, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide })
  );
  glow.position.copy(pos); scene.add(glow); meshes.push(glow);

  let age = 0;
  return {
    update(dt) {
      age += dt;
      disk.rotation.z   += dt * 0.55;
      diskIn.rotation.z -= dt * 1.1;
      glow.material.opacity = 0.15 + Math.sin(age * 1.5) * 0.07;

      // Pull planets
      planetMeshes.forEach(mesh => {
        if (_destroyed.has(mesh)) return;
        const dir  = new THREE.Vector3().subVectors(pos, mesh.position);
        const dist = Math.max(dir.length(), 0.1);
        if (dist < R * 1.4) { _destroyPlanet(mesh); return; }
        mesh.position.addScaledVector(dir.normalize(), (GM / (dist * dist)) * dt);
        const t = Math.max(0, 1 - dist / (R * 7));
        mesh.scale.set(1 - t * 0.6, 1 - t * 0.6, 1 + t * 3);
      });

      // Pull and destroy the sun
      if (!sunDestroyed) {
        const sunM = getSunMesh();
        if (sunM) {
          const sunDir  = new THREE.Vector3().subVectors(pos, sunM.position);
          const sunDist = Math.max(sunDir.length(), 0.1);
          if (sunDist < R * 2) {
            sunDestroyed = true;
            hideSun();
            spawnExplosion(sunM.position.clone(), 0xffaa22, 350, 40);
            _gameLog('☀️ Sole');
          } else {
            sunM.position.addScaledVector(sunDir.normalize(), (GM * 5 / (sunDist * sunDist)) * dt);
            // Spaghettification
            const squish = Math.max(0, 1 - sunDist / (R * 12));
            sunM.scale.set(1 - squish * 0.5, 1 - squish * 0.5, 1 + squish * 5);
          }
        }
      }

      return true;
    },
    dispose() { meshes.forEach(m => { scene.remove(m); m.geometry.dispose(); m.material.dispose(); }); },
  };
}

// ── Factory: Gamma Ray Burst ──────────────────────────────────────────────────

function mkGammaRayBurst(clickPos) {
  const srcPos = clickPos.clone().normalize().multiplyScalar(220);
  srcPos.y = 0;
  const beamDir = srcPos.clone().negate().normalize();
  const beamR = 10, speed = 170, maxLen = 520;
  let beamLen = 0, age = 0;
  const hitSet = new Set();

  const flash = new THREE.Mesh(
    new THREE.SphereGeometry(18, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false })
  );
  flash.position.copy(srcPos); scene.add(flash);

  const beamGeo = new THREE.CylinderGeometry(beamR * 0.5, beamR, 1, 16);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, transparent: true,
    opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), beamDir);
  beam.quaternion.copy(q); beam.position.copy(srcPos); scene.add(beam);

  const objs = [flash, beam];
  return {
    update(dt) {
      age += dt;
      beamLen = Math.min(beamLen + speed * dt, maxLen);
      beam.scale.y = Math.max(beamLen, 0.01);
      beam.position.copy(srcPos).addScaledVector(beamDir, beamLen / 2);
      beam.quaternion.copy(q);
      beamMat.opacity = Math.max(0, 0.65 - age * 0.05);
      flash.material.opacity = Math.max(0, 1 - age * 0.35);
      flash.scale.setScalar(1 + age * 2.5);

      planetMeshes.forEach(mesh => {
        if (_destroyed.has(mesh) || hitSet.has(mesh)) return;
        const rel  = new THREE.Vector3().subVectors(mesh.position, srcPos);
        const proj = rel.dot(beamDir);
        if (proj < 0 || proj > beamLen) return;
        const perp = rel.clone().addScaledVector(beamDir, -proj).length();
        if (perp < beamR * 1.3) { hitSet.add(mesh); _destroyPlanet(mesh); }
      });
      return age < 12;
    },
    dispose() { objs.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); },
  };
}

// ── Factory: Meteorite ───────────────────────────────────────────────────────

function mkMeteorite(pos) {
  const dir   = pos.clone().negate().normalize();
  const astR  = 2.5;
  const speed = 38;
  let age = 0, hit = false;

  const geo = new THREE.SphereGeometry(astR, 10, 10);
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i), y = posAttr.getY(i), z = posAttr.getZ(i);
    const n = 1 + Math.sin(x * 5 + y * 3 + z * 7) * 0.13;
    posAttr.setXYZ(i, x*n, y*n, z*n);
  }
  posAttr.needsUpdate = true;
  geo.computeVertexNormals();

  const ast = new THREE.Mesh(geo,
    new THREE.MeshPhongMaterial({ color: 0x886644, emissive: 0x221100, shininess: 3 })
  );
  ast.position.copy(pos); scene.add(ast);

  const trN = 80, trArr = new Float32Array(trN * 3);
  for (let i = 0; i < trN; i++) { trArr[i*3]=pos.x; trArr[i*3+1]=pos.y; trArr[i*3+2]=pos.z; }
  const trGeo = new THREE.BufferGeometry();
  trGeo.setAttribute('position', new THREE.BufferAttribute(trArr, 3));
  const trail = new THREE.Points(trGeo,
    new THREE.PointsMaterial({ color: 0xff8844, size: 0.9, transparent: true,
      opacity: 0.65, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true })
  );
  scene.add(trail);

  const objs = [ast, trail];
  return {
    update(dt) {
      age += dt;
      if (hit) return age < 4;
      ast.position.addScaledVector(dir, speed * dt);
      ast.rotation.x += dt * 0.9; ast.rotation.y += dt * 0.6;

      const ta = trGeo.attributes.position.array;
      for (let i = trN - 1; i > 0; i--) {
        ta[i*3] = ta[(i-1)*3]; ta[i*3+1] = ta[(i-1)*3+1]; ta[i*3+2] = ta[(i-1)*3+2];
      }
      ta[0] = ast.position.x; ta[1] = ast.position.y; ta[2] = ast.position.z;
      trGeo.attributes.position.needsUpdate = true;

      for (const mesh of planetMeshes) {
        if (_destroyed.has(mesh)) continue;
        const hitR = (mesh.userData.planet?.R ?? 1) + astR;
        if (ast.position.distanceTo(mesh.position) < hitR * 1.4) {
          spawnExplosion(mesh.position.clone(), 0xff4400, 200, 28);
          _destroyPlanet(mesh); ast.visible = false; hit = true; return true;
        }
      }
      return ast.position.length() < pos.length() + 280;
    },
    dispose() { objs.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); },
  };
}

// ── Factory: Rogue Planet (interno, non esposto nel catalogo) ─────────────────

function mkRoguePlanet(pos) {
  const dir = pos.clone().negate().normalize();
  const spd = 22, GM = 4000;
  let age = 0;
  const vels = new Map();
  planetMeshes.forEach(m => vels.set(m, new THREE.Vector3()));

  const rGeo = new THREE.SphereGeometry(4, 32, 32);
  const rogue = new THREE.Mesh(rGeo,
    new THREE.MeshPhongMaterial({ color: 0x223355, emissive: 0x060810, shininess: 4 })
  );
  rogue.position.copy(pos); scene.add(rogue);

  const glowM = new THREE.MeshBasicMaterial({ color: 0x224488, transparent: true,
    opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
  const glowMesh = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 32), glowM);
  glowMesh.position.copy(pos); scene.add(glowMesh);

  const objs = [rogue, glowMesh];
  return {
    update(dt) {
      age += dt;
      rogue.position.addScaledVector(dir, spd * dt);
      glowMesh.position.copy(rogue.position);
      rogue.rotation.y += dt * 0.25;

      planetMeshes.forEach(mesh => {
        if (_destroyed.has(mesh)) return;
        const d = new THREE.Vector3().subVectors(rogue.position, mesh.position);
        const dist = Math.max(d.length(), 0.1);
        if (dist < 5) { _destroyPlanet(mesh); return; }
        const vel = vels.get(mesh) ?? new THREE.Vector3();
        vel.addScaledVector(d.normalize(), (GM / (dist * dist)) * dt);
        mesh.position.addScaledVector(vel, dt);
      });
      return rogue.position.length() < pos.length() + 400;
    },
    dispose() { objs.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); },
  };
}

// ── Factory: Solar Flare ──────────────────────────────────────────────────────

function mkSolarFlare() {
  let waveR = 5, age = 0;
  const waveSpd = 55, maxR = 200;
  const hitSet = new Set();

  const wMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true,
    opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
  const wave = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), wMat);
  scene.add(wave);

  const sMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true,
    opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
  const shock = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), sMat);
  scene.add(shock);

  const objs = [wave, shock];
  return {
    update(dt) {
      age += dt; waveR += waveSpd * dt;
      wave.scale.setScalar(waveR);
      shock.scale.setScalar(waveR * 1.18);
      wMat.opacity = Math.max(0, 0.55 - waveR / maxR * 0.5);
      sMat.opacity = Math.max(0, 0.28 - waveR / maxR * 0.24);
      planetMeshes.forEach(mesh => {
        if (_destroyed.has(mesh) || hitSet.has(mesh)) return;
        if (mesh.position.length() < waveR * 0.92) { hitSet.add(mesh); _destroyPlanet(mesh); }
      });
      return waveR < maxR + 30;
    },
    dispose() { objs.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); },
  };
}

// ── Factory: Supernova ────────────────────────────────────────────────────────

function mkSupernova() {
  let age = 0, phase = 0, shockR = 0;
  const shockSpd = 85, maxShock = 260;
  const hitSet = new Set();

  const fMat = new THREE.MeshBasicMaterial({ color: 0xffffee, transparent: true,
    opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const flash = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 32), fMat);
  scene.add(flash);

  const swMat = new THREE.MeshBasicMaterial({ color: 0xff8800, transparent: true,
    opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
  const sw = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), swMat);
  sw.visible = false; scene.add(sw);

  const ejMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true,
    opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide });
  const ej = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), ejMat);
  ej.visible = false; scene.add(ej);

  const objs = [flash, sw, ej];
  return {
    update(dt) {
      age += dt;
      if (phase === 0) {
        fMat.opacity = Math.min(age / 1.5, 1);
        flash.scale.setScalar(0.3 + age * 0.5);
        if (age > 1.5) { phase = 1; spawnExplosion(new THREE.Vector3(), 0xffffff, 350, 50); }
      }
      if (phase >= 1) {
        sw.visible = true; ej.visible = true; phase = 2;
        shockR += shockSpd * dt;
        sw.scale.setScalar(shockR); ej.scale.setScalar(shockR * 0.68);
        swMat.opacity = Math.max(0, 0.7 - shockR / maxShock * 0.65);
        ejMat.opacity = Math.max(0, 0.35 - shockR / maxShock * 0.32);
        fMat.opacity  = Math.max(0, 1 - shockR / 28);
        flash.scale.setScalar(Math.max(5, 50 - shockR * 0.8));
        planetMeshes.forEach(mesh => {
          if (_destroyed.has(mesh) || hitSet.has(mesh)) return;
          if (mesh.position.length() < shockR * 0.9) { hitSet.add(mesh); _destroyPlanet(mesh); }
        });
      }
      return shockR < maxShock + 20;
    },
    dispose() { objs.forEach(o => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); }); },
  };
}

// ── Factory: Minaccia Aliena ──────────────────────────────────────────────────

function mkAlienThreat() {
  const UFO_R = 3.5, UFO_H = 0.7;
  const TRAVEL_SPD = 45, HOVER_H = 14, CHARGE_DUR = 1.5, FIRE_DUR = 2.0;

  const getAliveTargets = () => planetMeshes.filter(m => !_destroyed.has(m) && m.visible);

  // Build 4 UFO groups
  const ufoData = [];

  for (let i = 0; i < 4; i++) {
    const spawnAngle = (i / 4) * Math.PI * 2;
    const startPos = new THREE.Vector3(
      Math.cos(spawnAngle) * 190,
      22 + i * 9,
      Math.sin(spawnAngle) * 190
    );

    const group = new THREE.Group();
    group.position.copy(startPos);

    // Disc body
    group.add(new THREE.Mesh(
      new THREE.CylinderGeometry(UFO_R, UFO_R * 0.75, UFO_H, 32),
      new THREE.MeshPhongMaterial({ color: 0x7799aa, emissive: 0x112233, shininess: 90 })
    ));

    // Dome (upper half-sphere)
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(UFO_R * 0.55, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshPhongMaterial({ color: 0x88ccee, emissive: 0x113344, shininess: 120,
        transparent: true, opacity: 0.82 })
    );
    dome.position.y = UFO_H * 0.5;
    group.add(dome);

    // Rim glow ring
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0x00ffaa, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const rim = new THREE.Mesh(new THREE.TorusGeometry(UFO_R * 0.9, 0.22, 8, 32), rimMat);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);

    // Engine glow (underside)
    const engMat = new THREE.MeshBasicMaterial({
      color: 0x44ffcc, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const engine = new THREE.Mesh(
      new THREE.CylinderGeometry(UFO_R * 0.5, UFO_R * 0.25, 1.2, 16), engMat
    );
    engine.position.y = -UFO_H * 0.5 - 0.6;
    group.add(engine);

    scene.add(group);

    const targets = getAliveTargets();
    ufoData.push({
      group, rimMat, engMat,
      state: 'traveling',
      target: targets[i % Math.max(targets.length, 1)] ?? null,
      timer: 0,
      laser: null,
    });
  }

  function makeLaser() {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ff55, transparent: true, opacity: 0.92,
        blending: THREE.AdditiveBlending, depthWrite: false })
    );
    scene.add(mesh);
    return mesh;
  }

  function removeLaser(ufo) {
    if (!ufo.laser) return;
    scene.remove(ufo.laser);
    ufo.laser.geometry.dispose();
    ufo.laser.material.dispose();
    ufo.laser = null;
  }

  function updateLaserTransform(ufo) {
    if (!ufo.laser || !ufo.target) return;
    const from = ufo.group.position;
    const to   = ufo.target.position;
    const dir  = new THREE.Vector3().subVectors(to, from);
    const len  = dir.length();
    ufo.laser.scale.y = len;
    ufo.laser.position.addVectors(from, to).multiplyScalar(0.5);
    ufo.laser.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  }

  function nextTarget(ufo) {
    const alive = getAliveTargets();
    if (alive.length > 0) {
      ufo.target = alive[Math.floor(Math.random() * alive.length)];
      ufo.state  = 'traveling';
    } else {
      ufo.target = null;
      ufo.state  = 'done';
    }
    ufo.timer = 0;
  }

  let age = 0;
  return {
    update(dt) {
      age += dt;

      ufoData.forEach(ufo => {
        ufo.group.rotation.y += dt * 1.5;

        // Pulse rim
        ufo.rimMat.opacity = 0.55 + Math.sin(age * 6 + ufo.group.id) * 0.35;

        // Handle missing or already-destroyed target
        if (ufo.target && _destroyed.has(ufo.target)) {
          removeLaser(ufo);
          nextTarget(ufo);
        }
        if (ufo.state === 'done' || !ufo.target) { nextTarget(ufo); return; }

        const tPos    = ufo.target.position;
        const up      = tPos.clone().normalize();
        const hoverPos = tPos.clone().addScaledVector(up, HOVER_H);

        if (ufo.state === 'traveling') {
          const toHover = new THREE.Vector3().subVectors(hoverPos, ufo.group.position);
          const dist = toHover.length();
          if (dist < 3) {
            ufo.state = 'hovering'; ufo.timer = 0;
          } else {
            ufo.group.position.addScaledVector(toHover.normalize(), Math.min(dist, TRAVEL_SPD * dt));
          }

        } else if (ufo.state === 'hovering') {
          ufo.group.position.lerp(hoverPos, 8 * dt);
          ufo.timer += dt;
          if (ufo.timer >= CHARGE_DUR) { ufo.state = 'charging'; ufo.timer = 0; }

        } else if (ufo.state === 'charging') {
          // Fast pulse — charging indicator
          ufo.rimMat.opacity = 0.4 + Math.abs(Math.sin(age * 22)) * 0.6;
          ufo.engMat.opacity = 0.8;
          ufo.timer += dt;
          if (ufo.timer >= 1.0) {
            ufo.state = 'firing'; ufo.timer = 0;
            ufo.laser = makeLaser();
          }

        } else if (ufo.state === 'firing') {
          updateLaserTransform(ufo);
          if (ufo.laser) ufo.laser.material.opacity = 0.7 + Math.sin(age * 18) * 0.28;
          ufo.timer += dt;
          if (ufo.timer >= FIRE_DUR) {
            if (!_destroyed.has(ufo.target)) _destroyPlanet(ufo.target);
            removeLaser(ufo);
            nextTarget(ufo);
          }
        }
      });

      return true;
    },
    dispose() {
      ufoData.forEach(ufo => {
        removeLaser(ufo);
        scene.remove(ufo.group);
        ufo.group.traverse(child => {
          if (!child.isMesh) return;
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        });
      });
    },
  };
}

// ── API pubblica ───────────────────────────────────────────────────────────────

export const isGameMode    = () => _active;
export const getSelectedId = () => _selectedId;

export function selectCatastrophe(id) {
  _selectedId = id;
  const def = CATASTROPHES.find(c => c.id === id);
  if (!def) return;

  const infoEl = document.getElementById('game-info-text');
  if (infoEl) infoEl.textContent = def.info;

  const nameEl  = document.getElementById('game-selected-name');
  const hintEl  = document.getElementById('game-selected-hint');
  const barEl   = document.getElementById('game-selected-bar');
  if (nameEl) nameEl.textContent = `${def.icon}  ${def.name.toUpperCase()}`;
  if (hintEl) hintEl.textContent = '→ Clicca nel sistema solare per piazzarla';
  if (barEl)  barEl.style.setProperty('--sel-color', def.color);

  document.querySelectorAll('.cata-card').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
    el.style.setProperty('--cata-color', CATASTROPHES.find(c => c.id === el.dataset.id)?.color ?? '#666');
  });
}

export function activateGameMode() {
  _active = true;
}

export function deactivateGameMode() {
  _active = false;
  resetGame();
  document.dispatchEvent(new CustomEvent('gamemode:exit'));
}

export function placeCatastrophe(worldPos) {
  if (!_selectedId) return;
  let cat;
  switch (_selectedId) {
    case 'blackhole': cat = mkBlackHole(worldPos);     break;
    case 'meteorite': cat = mkMeteorite(worldPos);     break;
    case 'alien':     cat = mkAlienThreat();           break;
    case 'gamma':     cat = mkGammaRayBurst(worldPos); break;
    default: return;
  }
  _cats.push(cat);
}

export function resetGame() {
  _cats.forEach(c => c.dispose());
  _cats = [];
  _explosions.forEach(e => { scene.remove(e.pts); e.pts.geometry.dispose(); e.pts.material.dispose(); });
  _explosions = [];

  restoreSun();

  planetMeshes.forEach(mesh => {
    mesh.visible = true;
    mesh.scale.set(1, 1, 1);
    const p = mesh.userData.planet;
    const a = mesh.userData.angle;
    if (p) mesh.position.set(Math.cos(a) * p.dist, 0, Math.sin(a) * p.dist);
  });
  moonMeshes.forEach(mesh => {
    mesh.visible = true;
    const { moon, parentMesh } = mesh.userData;
    const a = mesh.userData.angle;
    mesh.position.set(
      parentMesh.position.x + Math.cos(a) * moon.orbitR,
      parentMesh.position.y,
      parentMesh.position.z + Math.sin(a) * moon.orbitR,
    );
  });
  _destroyed.clear();

  const logEl = document.getElementById('game-log');
  if (logEl) logEl.innerHTML = '';
}

export function updateGame(dt) {
  if (!_active) return;
  _cats = _cats.filter(c => {
    const alive = c.update(dt);
    if (!alive) c.dispose();
    return alive;
  });
  _updateExplosions(dt);
}
