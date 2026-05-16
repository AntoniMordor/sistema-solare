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

function txEarth() {
  return mkTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#1a5c8a'; ctx.fillRect(0, 0, w, h);
    [[40,55,120,95,'#2a7a44'],[95,145,68,88,'#287040'],[215,45,85,165,'#2d8050'],
     [285,35,175,125,'#317848'],[345,155,85,62,'#2e7642']].forEach(([x,y,w2,h2,c]) => {
      ctx.fillStyle = c; ctx.fillRect(x, y, w2, h2);
    });
    ctx.fillStyle = '#d8eef8'; ctx.fillRect(0, 0, w, 14); ctx.fillRect(0, 242, w, 14);
    ctx.fillStyle = '#c0dff0'; ctx.fillRect(70, 16, 55, 36);
    ctx.globalAlpha = 0.38; ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.ellipse(Math.random()*w, Math.random()*h, Math.random()*55+18, Math.random()*12+4, 0, 0, Math.PI*2);
      ctx.fill();
    }
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
  mercury: txMercury, venus: txVenus, earth: txEarth, mars: txMars,
  jupiter: txJupiter, saturn: txSaturn, uranus: txUranus, neptune: txNeptune,
  // Lune
  luna: txLuna,
  phobos: txPhobos, deimos: txDeimos,
  io: txIo, europa: txEuropa, ganymede: txGanymede, callisto: txCallisto,
  mimas: txMimas, enceladus: txEnceladus, titan: txTitan,
  titania: txTitania, oberon: txOberon,
  triton: txTriton,
};
