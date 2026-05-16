import * as THREE from 'three';

function mkCanvas(w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  return c;
}
function mkTex(w, h, fn) {
  return new THREE.CanvasTexture(mkCanvas(w, h, fn));
}

// ── Pianeti ───────────────────────────────────────────────────────────────────

function txMercury() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#909090'); g.addColorStop(0.5, '#b0b0b0'); g.addColorStop(1, '#6a6a6a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, y = Math.random() * h, r = Math.random() * 14 + 2;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(50,50,50,${Math.random() * 0.5 + 0.2})`; ctx.fill();
      ctx.strokeStyle = 'rgba(160,160,160,0.3)'; ctx.lineWidth = 1; ctx.stroke();
    }
  });
}

function txVenus() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e0b860'); g.addColorStop(0.4, '#c89030');
    g.addColorStop(0.7, '#e4c470'); g.addColorStop(1, '#b07828');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#fff0a0' : '#a06010';
      ctx.fillRect(0, (i / 14) * h, w, h / 14 + 2);
    }
    ctx.globalAlpha = 1;
  });
}

// ── Earth realistic textures ──────────────────────────────────────────────────

/** Converte lon/lat in pixel su canvas 1024×512. */
function ll(lon, lat, w, h) {
  return [(lon + 180) / 360 * w, (90 - lat) / 180 * h];
}

/** Disegna un poligono (array di [lon,lat]) sul canvas. */
function poly(ctx, pts, w, h) {
  ctx.beginPath();
  pts.forEach(([lon, lat], i) => {
    const [x, y] = ll(lon, lat, w, h);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
}

// Continenti semplificati ma riconoscibili [lon, lat]
const LAND = [
  // Nord America
  { c:'#2d6a2a', p:[[-168,71],[-141,60],[-128,50],[-124,47],[-117,32],[-107,23],[-90,20],
    [-83,10],[-78,9],[-77,8],[-80,9],[-85,11],[-90,16],[-97,20],[-105,23],[-110,22],[-117,30],
    [-118,33],[-120,40],[-124,47],[-125,50],[-130,55],[-140,60],[-155,58],[-162,62],[-168,66]] },
  // Groenlandia
  { c:'#d8eef8', p:[[-73,76],[-22,83],[-14,77],[-22,72],[-40,66],[-52,67],[-68,76]] },
  // Sud America
  { c:'#266622', p:[[-78,12],[-63,11],[-60,6],[-50,5],[-35,-4],[-35,-8],[-38,-12],
    [-40,-20],[-43,-23],[-46,-30],[-52,-34],[-56,-36],[-65,-42],[-68,-55],[-75,-50],
    [-73,-38],[-70,-28],[-72,-18],[-75,-10],[-78,0],[-78,8]] },
  // Europa continentale
  { c:'#3a8a3a', p:[[-9,38],[-9,44],[-3,44],[3,44],[8,44],[10,44],[14,44],[20,44],
    [28,44],[30,46],[32,47],[38,47],[38,54],[32,60],[28,60],[26,60],[24,58],[20,62],
    [22,66],[20,70],[15,70],[12,66],[5,62],[2,58],[2,52],[-4,51],[-5,48],[-2,48],
    [-4,44],[-8,44],[-10,40]] },
  // Scandinavia
  { c:'#3a8a3a', p:[[5,58],[8,56],[18,56],[24,58],[28,60],[28,66],[22,70],[17,70],
    [14,69],[12,66],[6,62]] },
  // Isole Britanniche
  { c:'#3a8540', p:[[-5,50],[-4,51],[-3,57],[-2,58],[-4,58],[-5,58],[-7,58],[-6,55],
    [-7,54],[-8,52],[-6,51],[-5,50]] },
  // ITALIA — stivale riconoscibile
  { c:'#3a9040', p:[[8,44],[14,44],[14,43],[16,41],[18,40.5],[18,40],[17,39.5],
    [16.5,38.5],[15.5,37.5],[15,37],[16,37.2],[16,37],[15.5,36.6],
    [13,36.5],[11,37],[9,38],[8.5,40],[8,44]] },
  // Sardegna
  { c:'#3a8540', p:[[8.2,41.5],[9.8,41.5],[9.8,38.8],[8.2,38.8]] },
  // Sicilia
  { c:'#3a8540', p:[[12,38.3],[15.7,38.3],[15.7,37],[12,37]] },
  // Grecia + Balcani
  { c:'#3a8540', p:[[20,42],[22,42],[26,40],[26,38],[24,36],[22,38],[20,38],[20,42]] },
  // Africa
  { c:'#7a6a20', p:[[-17,15],[-14,10],[-10,5],[0,5],[8,4],[10,1],[10,-2],[12,-5],
    [12,-14],[14,-22],[17,-28],[20,-35],[28,-35],[32,-30],[36,-22],[40,-12],[44,-12],
    [44,12],[42,14],[50,14],[44,18],[40,22],[32,22],[32,30],[35,30],[34,25],[32,22],
    [20,22],[12,20],[8,16],[0,15],[-8,15]] },
  // Madagascar
  { c:'#6a7830', p:[[43.5,-12],[50,-14],[50,-26],[44,-26],[44,-12]] },
  // Penisola arabica
  { c:'#c8a030', p:[[32,30],[37,24],[38,22],[44,14],[50,12],[56,20],[58,22],[56,28],
    [50,30],[44,30],[38,30]] },
  // Asia corpo principale
  { c:'#5a7a30', p:[[26,42],[32,42],[36,42],[40,38],[44,36],[50,36],[56,28],[58,22],
    [60,20],[62,18],[68,24],[72,22],[80,25],[88,22],[96,22],[98,18],[100,4],
    [104,2],[110,2],[110,14],[108,18],[108,22],[110,25],[115,22],[118,24],[120,30],
    [122,32],[122,40],[120,44],[118,50],[120,54],[126,54],[132,54],[140,52],[142,52],
    [140,58],[132,62],[130,66],[120,72],[100,72],[80,72],[68,72],[60,68],[60,62],
    [62,58],[58,56],[56,52],[56,50],[60,46],[56,44],[50,40],[44,42],[40,40],[36,42]] },
  // Subcontinente indiano
  { c:'#5a8820', p:[[68,24],[72,22],[80,25],[88,22],[88,14],[80,10],[77,8],[72,8],
    [68,14],[65,22],[68,24]] },
  // Giappone (semplificato)
  { c:'#3a7a3a', p:[[130,32],[131,34],[133,36],[137,38],[140,40],[141,42],[142,44],
    [143,44],[141,42],[138,36],[134,34],[130,32]] },
  // Australia
  { c:'#8a6a20', p:[[114,-22],[118,-20],[124,-16],[130,-12],[136,-12],[138,-14],
    [140,-18],[142,-18],[145,-14],[148,-20],[150,-24],[152,-27],[154,-28],[153,-32],
    [152,-34],[150,-36],[148,-38],[146,-38],[140,-36],[136,-34],[130,-32],[125,-32],
    [118,-28],[114,-22]] },
  // Nuova Guinea
  { c:'#3a7a3a', p:[[132,-2],[136,-4],[140,-6],[146,-6],[150,-6],[150,-8],[145,-8],
    [140,-8],[135,-6],[132,-4]] },
];

// Deserto del Sahara e aree aride
const DESERTS = [
  { c:'#c8a840', p:[[-6,20],[20,20],[20,32],[14,32],[8,20],[0,18],[-6,20]] },
  { c:'#d4a830', p:[[44,28],[60,28],[60,18],[44,18]] }, // Arabia
  { c:'#c8a040', p:[[44,30],[60,30],[56,36],[44,36]] }, // Anatolia/Iran
];

export function txEarthDay() {
  return mkTex(1024, 512, (ctx, w, h) => {
    // Oceano
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, '#1a4f8a');
    ocean.addColorStop(0.5, '#1a5f9a');
    ocean.addColorStop(1, '#104060');
    ctx.fillStyle = ocean; ctx.fillRect(0, 0, w, h);

    // Disegna deserto prima (sotto i continenti)
    DESERTS.forEach(({ c, p }) => { poly(ctx, p, w, h); ctx.fillStyle = c; ctx.fill(); });

    // Disegna continenti
    LAND.forEach(({ c, p }) => { poly(ctx, p, w, h); ctx.fillStyle = c; ctx.fill(); });

    // Bordi costa (leggermente più scuri)
    LAND.forEach(({ p }) => {
      poly(ctx, p, w, h);
      ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 0.8; ctx.stroke();
    });

    // Calotte polari
    ctx.fillStyle = '#e8f4ff';
    ctx.fillRect(0, 0, w, 28);      // Artico
    ctx.fillRect(0, h - 22, w, 22); // Antartide

    // Ghiaccio Groenlandia extra
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ddf0ff';
    poly(ctx, [[-74,76],[-20,83],[-14,77],[-22,72],[-40,66],[-52,67],[-68,76]], w, h);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Nuvole sparse
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
    const seed = 42; // deterministico
    const rng = (n) => ((Math.sin(n * 127.1 + seed) * 43758.5453) % 1 + 1) % 1;
    for (let i = 0; i < 60; i++) {
      const cx = rng(i * 2) * w;
      const cy = rng(i * 2 + 1) * h;
      const rx = rng(i + 100) * 60 + 20;
      const ry = rng(i + 200) * 14 + 5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, rng(i) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });
}

export function txEarthNight() {
  return mkTex(1024, 512, (ctx, w, h) => {
    // Sfondo scuro — oceano notturno
    ctx.fillStyle = '#020810'; ctx.fillRect(0, 0, w, h);

    // Silhouette continenti quasi nere
    LAND.concat(DESERTS).forEach(({ p }) => {
      poly(ctx, p, w, h);
      ctx.fillStyle = '#0a0d08'; ctx.fill();
    });

    // Luci città — ogni cluster è [lon, lat, intensità 0-1, raggio]
    const CITIES = [
      // Europa occidentale (densissima)
      [2, 48, 1, 20], [13, 52, 0.9, 18], [9, 51, 0.9, 16], [2, 51, 0.8, 14],
      [4, 52, 0.85, 12], [12, 42, 0.85, 16], [23, 38, 0.6, 10], // Roma, Atene
      [-3, 40, 0.8, 14], [-9, 39, 0.7, 10], [19, 47, 0.65, 10],
      [21, 52, 0.6, 10], [14, 50, 0.75, 10], [26, 44, 0.55, 8],
      [30, 50, 0.7, 10], [37, 55, 0.8, 14], // Mosca
      // Italia specifica
      [12, 41.9, 0.9, 10], // Roma
      [9.2, 45.5, 0.85, 8], // Milano
      [14.3, 40.8, 0.8, 7], // Napoli
      [11.3, 43.8, 0.7, 5], // Firenze
      [12.3, 45.4, 0.65, 5], // Venezia
      [7.7, 45, 0.6, 5],    // Torino
      // USA est
      [-74, 41, 1, 28], [-77, 39, 0.95, 22], [-71, 42, 0.9, 20],
      [-84, 34, 0.85, 18], [-80, 26, 0.8, 16], [-87, 42, 0.9, 20],
      // USA ovest
      [-118, 34, 0.95, 22], [-122, 37, 0.9, 18], [-122, 48, 0.75, 14],
      // USA centro
      [-94, 30, 0.8, 16], [-90, 30, 0.75, 14], [-96, 36, 0.7, 12],
      // Giappone
      [139, 36, 1, 24], [135, 34.7, 0.95, 20], [130, 33.6, 0.8, 14],
      // Cina costa
      [121, 31, 0.95, 22], [116, 40, 0.9, 20], [114, 22, 0.85, 16],
      [113, 23, 0.8, 14], [120, 30, 0.75, 12],
      // Korea/NE Asia
      [127, 37, 0.85, 14], [126, 38, 0.5, 6],
      // India
      [72, 19, 0.85, 16], [77, 28, 0.8, 16], [88, 22.5, 0.8, 14],
      [80, 13, 0.75, 12], [77, 11, 0.65, 10],
      // SE Asia
      [101, 3.2, 0.75, 12], [100, 14, 0.6, 10], [106, 10.8, 0.7, 10],
      // Medio Oriente
      [55, 25, 0.8, 12], [46, 25, 0.75, 12], [44, 33, 0.7, 10],
      // Australia
      [151, -34, 0.8, 14], [145, -38, 0.7, 12], [115, -32, 0.6, 10],
      // Sud America
      [-46, -23, 0.85, 16], [-43, -23, 0.8, 14], [-58, -34, 0.75, 12],
      [-70, -33, 0.7, 10], [-74, 4.7, 0.65, 10],
      // Africa
      [28, -26, 0.7, 12], [18, -34, 0.65, 10], [31, 30, 0.7, 12],
      [3, 6.4, 0.6, 10], [-17, 14.7, 0.55, 8],
    ];

    CITIES.forEach(([lon, lat, intensity, radius]) => {
      const [cx, cy] = ll(lon, lat, w, h);
      const px = radius * (w / 360); // raggio in pixel proporzionale
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, px);
      const r = Math.round(255 * intensity);
      const g2 = Math.round(200 * intensity);
      const b = Math.round(120 * intensity);
      g.addColorStop(0, `rgba(${r},${g2},${b},0.95)`);
      g.addColorStop(0.3, `rgba(${r},${g2},${b},0.5)`);
      g.addColorStop(0.7, `rgba(${Math.round(r*0.6)},${Math.round(g2*0.5)},${Math.round(b*0.4)},0.2)`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(cx - px, cy - px, px * 2, px * 2);
    });

    // Calotte polari (riflettono un po' di luce)
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#334466';
    ctx.fillRect(0, 0, w, 25);
    ctx.fillRect(0, h - 20, w, 20);
    ctx.globalAlpha = 1;
  });
}

function txMars() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#be4010'); g.addColorStop(0.5, '#9a2c0a'); g.addColorStop(1, '#c05018');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.38;
    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = 'rgba(70,15,0,0.6)'; ctx.beginPath();
      ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*70+20, Math.random()*28+8, Math.random()*Math.PI, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(235,215,195,0.8)'; ctx.fillRect(0, 0, w, 18); ctx.fillRect(0, 238, w, 18);
    ctx.strokeStyle = 'rgba(50,10,0,0.4)'; ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h, Math.random()*10+2, 0, Math.PI*2); ctx.stroke();
    }
  });
}

function txJupiter() {
  return mkTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#c07840'; ctx.fillRect(0, 0, w, h);
    [[0,22,'#d4a060'],[22,20,'#9a3e18'],[42,18,'#ddb870'],[60,28,'#8c3010'],
     [88,22,'#c89040'],[110,26,'#b05828'],[136,20,'#e0c070'],[156,28,'#9c4020'],
     [184,32,'#c08840'],[216,40,'#a86030']].forEach(([y,h2,c]) => {
      ctx.fillStyle = c; ctx.fillRect(0, y, w, h2);
    });
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 45; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#300'; ctx.beginPath();
      ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*90+25, Math.random()*7+2, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#8a1e0a'; ctx.beginPath(); ctx.ellipse(355,143,34,19,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#c83a18'; ctx.lineWidth = 2; ctx.stroke();
  });
}

function txSaturn() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#e0c878'); g.addColorStop(0.5, '#c8aa60'); g.addColorStop(1, '#d4b86a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.22;
    ['#d0c070','#b09040','#e4d080','#a88030'].forEach((c, i) => {
      for (let j = i; j < 18; j += 4) { ctx.fillStyle = c; ctx.fillRect(0, (j/18)*h, w, h/18+1); }
    });
    ctx.globalAlpha = 1;
  });
}

function txUranus() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#7ae0e0'); g.addColorStop(0.5, '#8ad4ec'); g.addColorStop(1, '#58c0d0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i%2===0?'#a0f0f0':'#38a0b8'; ctx.fillRect(0,(i/8)*h,w,h/8); }
    ctx.globalAlpha = 1;
  });
}

function txNeptune() {
  return mkTex(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0,'#183888'); g.addColorStop(0.5,'#1c48c0'); g.addColorStop(1,'#0c1e5a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.22;
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = 'rgba(80,130,255,0.3)'; ctx.beginPath();
      ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*110+30,Math.random()*18+4,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(0,0,30,0.55)'; ctx.beginPath(); ctx.ellipse(195,118,38,22,0,0,Math.PI*2); ctx.fill();
  });
}

// ── Lune ─────────────────────────────────────────────────────────────────────

function txLuna() {
  return mkTex(256, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'#d8d8d8'); g.addColorStop(0.6,'#b0b0b8'); g.addColorStop(1,'#888890');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const x=Math.random()*w, y=Math.random()*h, r=Math.random()*8+1;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(60,60,70,${Math.random()*0.5+0.15})`; ctx.fill();
      ctx.strokeStyle='rgba(180,180,190,0.25)'; ctx.lineWidth=0.5; ctx.stroke();
    }
    // Mare (dark regions)
    ctx.globalAlpha=0.35;
    ctx.fillStyle='#444455';
    ctx.beginPath(); ctx.ellipse(80,55,28,20,0.3,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(150,70,35,22,-0.2,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  });
}

function txPhobos() {
  return mkTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle = '#4a3a30'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*5+1;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(20,15,10,${Math.random()*0.6+0.2})`; ctx.fill();
    }
    // Stickney crater
    ctx.beginPath(); ctx.arc(32,32,12,0,Math.PI*2);
    ctx.fillStyle='rgba(15,10,8,0.7)'; ctx.fill();
    ctx.strokeStyle='rgba(80,60,50,0.4)'; ctx.lineWidth=1; ctx.stroke();
  });
}

function txDeimos() {
  return mkTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle='#5a4a3a'; ctx.fillRect(0,0,w,h);
    for (let i=0;i<25;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*4+0.5;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(25,18,12,${Math.random()*0.4+0.15})`; ctx.fill();
    }
  });
}

function txIo() {
  return mkTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle='#e8c830'; ctx.fillRect(0,0,w,h);
    // Zolfo e vulcani
    const patches=[['#c0a010',60,40,35,25],['#ff6600',150,70,20,15],['#cc8800',90,90,45,30],
                   ['#ffaa00',200,40,25,18],['#884400',50,80,18,12],['#ff4400',180,100,15,10]];
    patches.forEach(([c,x,y,rx,ry])=>{
      ctx.fillStyle=c; ctx.beginPath(); ctx.ellipse(x,y,rx,ry,Math.random(),0,Math.PI*2); ctx.fill();
    });
    // Caldera vulcaniche
    ctx.fillStyle='#1a0800';
    [[150,70,8],[90,30,5],[210,95,6],[40,60,4]].forEach(([x,y,r])=>{
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=0.25; ctx.fillStyle='#ffff80';
    for(let i=0;i<15;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*3+1,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  });
}

function txEuropa() {
  return mkTex(256, 128, (ctx, w, h) => {
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#d0e8f8'); g.addColorStop(0.5,'#c0d8f0'); g.addColorStop(1,'#a8c8e0');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Linee di frattura (rusalka)
    ctx.strokeStyle='rgba(120,80,50,0.5)'; ctx.lineWidth=1.5;
    for(let i=0;i<20;i++){
      ctx.beginPath();
      const x1=Math.random()*w,y1=Math.random()*h;
      ctx.moveTo(x1,y1);
      ctx.lineTo(x1+(Math.random()-0.5)*80, y1+(Math.random()-0.5)*60);
      ctx.stroke();
    }
    ctx.strokeStyle='rgba(100,60,30,0.35)'; ctx.lineWidth=0.8;
    for(let i=0;i<30;i++){
      ctx.beginPath(); ctx.moveTo(Math.random()*w,Math.random()*h);
      ctx.lineTo(Math.random()*w,Math.random()*h); ctx.stroke();
    }
    ctx.globalAlpha=0.15; ctx.fillStyle='#ffffff';
    for(let i=0;i<8;i++){
      ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*20+8,Math.random()*8+3,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  });
}

function txGanymede() {
  return mkTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle='#6a6055'; ctx.fillRect(0,0,w,h);
    // Regioni chiare e scure
    ctx.globalAlpha=0.5;
    ctx.fillStyle='#908878';
    [[60,40,50,35],[180,80,60,40],[100,90,40,28]].forEach(([x,y,rx,ry])=>{
      ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
    });
    ctx.fillStyle='#403830';
    [[140,35,40,28],[50,85,35,25],[220,60,45,30]].forEach(([x,y,rx,ry])=>{
      ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
    for(let i=0;i<30;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*5+1,0,Math.PI*2);
      ctx.fillStyle=`rgba(200,180,160,${Math.random()*0.3+0.1})`; ctx.fill();
    }
  });
}

function txCallisto() {
  return mkTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle='#252018'; ctx.fillRect(0,0,w,h);
    // Vecchi crateri numerosi
    for(let i=0;i<50;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*10+2;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(15,12,8,0.6)`; ctx.fill();
      ctx.strokeStyle=`rgba(80,70,55,0.3)`; ctx.lineWidth=0.8; ctx.stroke();
    }
    // Bright impact spots
    for(let i=0;i<15;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*3+0.5,0,Math.PI*2);
      ctx.fillStyle='rgba(200,190,170,0.6)'; ctx.fill();
    }
  });
}

function txMimas() {
  return mkTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle='#b8b0a8'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<35;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*6+1;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(60,55,50,${Math.random()*0.4+0.15})`; ctx.fill();
    }
    // Herschel crater (il grande cratere stile Morte Nera)
    ctx.beginPath(); ctx.arc(28,30,16,0,Math.PI*2);
    ctx.fillStyle='rgba(40,35,30,0.7)'; ctx.fill();
    ctx.strokeStyle='rgba(180,170,160,0.4)'; ctx.lineWidth=1.5; ctx.stroke();
    // Central peak
    ctx.beginPath(); ctx.arc(28,30,3,0,Math.PI*2);
    ctx.fillStyle='rgba(200,190,180,0.8)'; ctx.fill();
  });
}

function txEnceladus() {
  return mkTex(128, 64, (ctx, w, h) => {
    const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'#f8f8ff'); g.addColorStop(0.5,'#e8f0ff'); g.addColorStop(1,'#d0e0f8');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Striature tigrate
    ctx.strokeStyle='rgba(100,140,200,0.3)'; ctx.lineWidth=1;
    for(let i=0;i<12;i++){
      ctx.beginPath(); ctx.moveTo(0,(i/12)*h); ctx.lineTo(w,(i/12)*h+(Math.random()-0.5)*10); ctx.stroke();
    }
    ctx.globalAlpha=0.2; ctx.fillStyle='#80c0ff';
    for(let i=0;i<8;i++){
      ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*15+5,Math.random()*5+2,0,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  });
}

function txTitan() {
  return mkTex(256, 128, (ctx, w, h) => {
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#c06010'); g.addColorStop(0.4,'#a04808'); g.addColorStop(0.7,'#b85810'); g.addColorStop(1,'#804005');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Haze bands
    ctx.globalAlpha=0.2;
    for(let i=0;i<10;i++){
      const y=(i/10)*h;
      ctx.fillStyle=i%2===0?'#e07020':'#603008';
      ctx.fillRect(0,y,w,h/10+2);
    }
    // Laghi di metano
    ctx.globalAlpha=0.55; ctx.fillStyle='#1a0808';
    [[200,80,22,14],[60,100,18,10],[170,110,12,8],[240,40,16,10]].forEach(([x,y,rx,ry])=>{
      ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.fill();
    });
    ctx.globalAlpha=1;
  });
}

function txTitania() {
  return mkTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle='#504848'; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=0.4; ctx.fillStyle='#706058';
    for(let i=0;i<6;i++){
      ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*25+10,Math.random()*10+4,Math.random(),0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<20;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*5+1,0,Math.PI*2);
      ctx.fillStyle=`rgba(30,25,22,${Math.random()*0.5+0.2})`; ctx.fill();
    }
    // Canyon
    ctx.strokeStyle='rgba(100,80,65,0.5)'; ctx.lineWidth=1.5;
    for(let i=0;i<5;i++){
      ctx.beginPath(); ctx.moveTo(Math.random()*w,0); ctx.lineTo(Math.random()*w,h); ctx.stroke();
    }
  });
}

function txOberon() {
  return mkTex(128, 64, (ctx, w, h) => {
    ctx.fillStyle='#302820'; ctx.fillRect(0,0,w,h);
    for(let i=0;i<35;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*7+1;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(15,10,8,0.65)`; ctx.fill();
      ctx.strokeStyle=`rgba(70,55,40,0.3)`; ctx.lineWidth=0.8; ctx.stroke();
    }
    for(let i=0;i<10;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*2+0.5,0,Math.PI*2);
      ctx.fillStyle='rgba(180,155,120,0.5)'; ctx.fill();
    }
  });
}

function txTriton() {
  return mkTex(256, 128, (ctx, w, h) => {
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'#e0d0c8'); g.addColorStop(0.4,'#c8b8b0'); g.addColorStop(0.7,'#d0c0b8'); g.addColorStop(1,'#b0a098');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // Distese di azoto ghiacciato
    ctx.globalAlpha=0.35; ctx.fillStyle='#f0e8e0';
    for(let i=0;i<10;i++){
      ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*40+15,Math.random()*20+8,Math.random(),0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=0.2; ctx.fillStyle='#c080a0';
    for(let i=0;i<6;i++){
      ctx.beginPath(); ctx.ellipse(Math.random()*w,Math.random()*h,Math.random()*30+10,Math.random()*12+5,Math.random(),0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    for(let i=0;i<20;i++){
      ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*5+1,0,Math.PI*2);
      ctx.fillStyle=`rgba(40,30,25,${Math.random()*0.3+0.1})`; ctx.fill();
    }
  });
}

// ── Sole e speciali ───────────────────────────────────────────────────────────

export function txSun() {
  return mkTex(512, 512, (ctx, w, h) => {
    const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'#fffce0'); g.addColorStop(0.25,'#ffda30');
    g.addColorStop(0.6,'#ff8000'); g.addColorStop(1,'#c03a00');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.globalAlpha=0.18;
    for(let i=0;i<50;i++){
      const x=Math.random()*w,y=Math.random()*h,r=Math.random()*28+4;
      const sg=ctx.createRadialGradient(x,y,0,x,y,r);
      sg.addColorStop(0,'#ffff90'); sg.addColorStop(1,'transparent');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
  });
}

export function txGlow() {
  return mkTex(256, 256, (ctx, w, h) => {
    const g=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    g.addColorStop(0,'rgba(255,220,80,1)'); g.addColorStop(0.2,'rgba(255,140,0,0.8)');
    g.addColorStop(0.55,'rgba(255,80,0,0.25)'); g.addColorStop(1,'rgba(200,30,0,0)');
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  });
}

export function txRing() {
  return mkTex(512, 2, (ctx, w) => {
    const g=ctx.createLinearGradient(0,0,w,0);
    [[0,'rgba(180,160,120,0)'],[.05,'rgba(190,170,130,0.55)'],[.15,'rgba(210,190,150,0.4)'],
     [.25,'rgba(170,150,110,0.75)'],[.35,'rgba(200,180,140,0.35)'],[.45,'rgba(185,165,125,0.65)'],
     [.55,'rgba(215,195,155,0.5)'],[.65,'rgba(165,145,105,0.7)'],[.75,'rgba(195,175,135,0.45)'],
     [.88,'rgba(175,155,115,0.3)'],[1,'rgba(180,160,120,0)']].forEach(([s,c])=>g.addColorStop(s,c));
    ctx.fillStyle=g; ctx.fillRect(0,0,w,2);
  });
}

// ── Mappa textureKey → generatore ─────────────────────────────────────────────

export const TEXTURE_MAP = {
  // Pianeti
  mercury: txMercury, venus: txVenus, earth: txEarthDay, mars: txMars,
  jupiter: txJupiter, saturn: txSaturn, uranus: txUranus, neptune: txNeptune,
  // Lune
  luna: txLuna,
  phobos: txPhobos, deimos: txDeimos,
  io: txIo, europa: txEuropa, ganymede: txGanymede, callisto: txCallisto,
  mimas: txMimas, enceladus: txEnceladus, titan: txTitan,
  titania: txTitania, oberon: txOberon,
  triton: txTriton,
};
