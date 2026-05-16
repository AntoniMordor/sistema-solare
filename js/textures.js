import * as THREE from 'three';

function mkCanvas(w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  fn(c.getContext('2d'), w, h);
  return c;
}

function mkTex(w, h, fn) {
  return new THREE.CanvasTexture(mkCanvas(w, h, fn));
}

// ── Planet textures ───────────────────────────────────────────────────────────

function txMercury() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#909090');
    g.addColorStop(0.5, '#b0b0b0');
    g.addColorStop(1, '#6a6a6a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 14 + 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(50,50,50,${Math.random() * 0.5 + 0.2})`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(160,160,160,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  });
}

function txVenus() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e0b860');
    g.addColorStop(0.4, '#c89030');
    g.addColorStop(0.7, '#e4c470');
    g.addColorStop(1, '#b07828');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 14; i++) {
      const y = (i / 14) * h;
      ctx.fillStyle = i % 2 === 0 ? '#fff0a0' : '#a06010';
      ctx.fillRect(0, y, w, h / 14 + 2);
    }
    ctx.globalAlpha = 1;
  });
}

function txEarth() {
  return mkTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1a5c8a';
    ctx.fillRect(0, 0, w, h);
    const land = [
      [40, 55, 120, 95, '#2a7a44'],
      [95, 145, 68, 88, '#287040'],
      [215, 45, 85, 165, '#2d8050'],
      [285, 35, 175, 125, '#317848'],
      [345, 155, 85, 62, '#2e7642'],
    ];
    land.forEach(([x, y, w2, h2, c]) => {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, w2, h2);
    });
    ctx.fillStyle = '#d8eef8';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillRect(0, 242, w, 14);
    ctx.fillStyle = '#c0dff0';
    ctx.fillRect(70, 16, 55, 36);
    ctx.globalAlpha = 0.38;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w, Math.random() * h,
        Math.random() * 55 + 18, Math.random() * 12 + 4,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

function txMars() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#be4010');
    g.addColorStop(0.5, '#9a2c0a');
    g.addColorStop(1, '#c05018');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.38;
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = 'rgba(70,15,0,0.6)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w, Math.random() * h,
        Math.random() * 70 + 20, Math.random() * 28 + 8,
        Math.random() * Math.PI, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(235,215,195,0.8)';
    ctx.fillRect(0, 0, w, 18);
    ctx.fillRect(0, 238, w, 18);
    ctx.strokeStyle = 'rgba(50,10,0,0.4)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 10 + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function txJupiter() {
  return mkTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c07840';
    ctx.fillRect(0, 0, w, h);
    const bands = [
      [0, 22, '#d4a060'], [22, 20, '#9a3e18'], [42, 18, '#ddb870'],
      [60, 28, '#8c3010'], [88, 22, '#c89040'], [110, 26, '#b05828'],
      [136, 20, '#e0c070'], [156, 28, '#9c4020'], [184, 32, '#c08840'],
      [216, 40, '#a86030'],
    ];
    bands.forEach(([y, h2, c]) => {
      ctx.fillStyle = c;
      ctx.fillRect(0, y, w, h2);
    });
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#300';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w, Math.random() * h,
        Math.random() * 90 + 25, Math.random() * 7 + 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8a1e0a';
    ctx.beginPath();
    ctx.ellipse(355, 143, 34, 19, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c83a18';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,80,40,0.3)';
    ctx.beginPath();
    ctx.ellipse(355, 143, 28, 13, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

function txSaturn() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e0c878');
    g.addColorStop(0.5, '#c8aa60');
    g.addColorStop(1, '#d4b86a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.22;
    const bc = ['#d0c070', '#b09040', '#e4d080', '#a88030'];
    for (let i = 0; i < 18; i++) {
      const y = (i / 18) * h;
      ctx.fillStyle = bc[i % bc.length];
      ctx.fillRect(0, y, w, h / 18 + 1);
    }
    ctx.globalAlpha = 1;
  });
}

function txUranus() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7ae0e0');
    g.addColorStop(0.5, '#8ad4ec');
    g.addColorStop(1, '#58c0d0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) {
      const y = (i / 8) * h;
      ctx.fillStyle = i % 2 === 0 ? '#a0f0f0' : '#38a0b8';
      ctx.fillRect(0, y, w, h / 8);
    }
    ctx.globalAlpha = 1;
  });
}

function txNeptune() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#183888');
    g.addColorStop(0.5, '#1c48c0');
    g.addColorStop(1, '#0c1e5a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = 'rgba(80,130,255,0.3)';
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w, Math.random() * h,
        Math.random() * 110 + 30, Math.random() * 18 + 4,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,30,0.55)';
    ctx.beginPath();
    ctx.ellipse(195, 118, 38, 22, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ── Special textures ──────────────────────────────────────────────────────────

export function txSun() {
  return mkTex(512, 512, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, '#fffce0');
    g.addColorStop(0.25, '#ffda30');
    g.addColorStop(0.6, '#ff8000');
    g.addColorStop(1, '#c03a00');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 28 + 4;
      const sg = ctx.createRadialGradient(x, y, 0, x, y, r);
      sg.addColorStop(0, '#ffff90');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export function txGlow() {
  return mkTex(256, 256, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,220,80,1)');
    g.addColorStop(0.2, 'rgba(255,140,0,0.8)');
    g.addColorStop(0.55, 'rgba(255,80,0,0.25)');
    g.addColorStop(1, 'rgba(200,30,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

export function txRing() {
  return mkTex(512, 2, (ctx, w) => {
    const g = ctx.createLinearGradient(0, 0, w, 0);
    const stops = [
      [0, 'rgba(180,160,120,0)'],
      [0.05, 'rgba(190,170,130,0.55)'],
      [0.15, 'rgba(210,190,150,0.4)'],
      [0.25, 'rgba(170,150,110,0.75)'],
      [0.35, 'rgba(200,180,140,0.35)'],
      [0.45, 'rgba(185,165,125,0.65)'],
      [0.55, 'rgba(215,195,155,0.5)'],
      [0.65, 'rgba(165,145,105,0.7)'],
      [0.75, 'rgba(195,175,135,0.45)'],
      [0.88, 'rgba(175,155,115,0.3)'],
      [1, 'rgba(180,160,120,0)'],
    ];
    stops.forEach(([s, c]) => g.addColorStop(s, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, 2);
  });
}

// ── Map: textureKey → generator ───────────────────────────────────────────────

export const TEXTURE_MAP = {
  mercury: txMercury,
  venus:   txVenus,
  earth:   txEarth,
  mars:    txMars,
  jupiter: txJupiter,
  saturn:  txSaturn,
  uranus:  txUranus,
  neptune: txNeptune,
};
