# 🪐 Sistema Solare 3D

Simulazione interattiva del sistema solare realizzata con **Three.js** e **Vite**.

> Creato da **Antonio Izzo**

![Sistema Solare 3D](https://img.shields.io/badge/Three.js-r160-black?logo=three.js) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)

---

## ✨ Funzionalità

- **Rendering 3D** con Three.js — tutti gli 8 pianeti con texture procedurali realistiche
- **Campo stellare volumetrico** con 9.600 stelle colorate
- **Sole animato** con glow multi-livello, lens flare e luce dinamica `PointLight`
- **Saturno con anelli 3D** (RingGeometry con UV corretto)
- **Orbite visibili** come linee semitrasparenti (attivabili/disattivabili)
- **Click su un pianeta** → zoom cinematico + la camera segue il pianeta in orbita
- **Pannello informativo** con nome, distanza dal Sole, periodo orbitale, diametro e numero di lune
- **Controllo velocità** — slider da 0× a 6×
- **Camera orbitale** — rotazione, zoom e pan con mouse
- **ESC** per tornare alla vista libera

---

## 🚀 Avvio rapido

### Prerequisiti

- [Node.js](https://nodejs.org/) versione **18 o superiore**
- npm (incluso con Node.js)

### Installazione

```bash
# 1. Clona il repository
git clone https://github.com/TUO_USERNAME/sistema-solare.git

# 2. Entra nella cartella
cd sistema-solare

# 3. Installa le dipendenze
npm install

# 4. Avvia il server di sviluppo
npm run dev
```

Apri il browser su **http://localhost:5173**

### Build per produzione

```bash
npm run build    # genera la cartella dist/
npm run preview  # anteprima del build ottimizzato
```

---

## 🎮 Controlli

| Azione | Controllo |
|--------|-----------|
| Ruota la scena | Trascina con il tasto sinistro |
| Zoom | Rotella del mouse |
| Pan (sposta) | Trascina con il tasto destro |
| Seguire un pianeta | Click sul pianeta |
| Tornare alla mappa | Pulsante "← TORNA ALLA MAPPA" o **ESC** |
| Mostra/nascondi orbite | Pulsante "◯ ORBITE" |

---

## 📁 Struttura del progetto

```
sistema-solare/
├── index.html              # Shell HTML principale
├── package.json            # Dipendenze e script npm
│
├── css/
│   └── style.css           # Tutti gli stili (dark space theme)
│
└── js/
    ├── main.js             # Entry point — loop di animazione
    ├── data.js             # Dati astronomici dei pianeti
    ├── textures.js         # Generatori di texture canvas procedurali
    ├── scene.js            # Scene, camera, renderer, OrbitControls
    ├── starfield.js        # Campo stellare volumetrico
    ├── sun.js              # Sole, PointLight e effetti glow
    ├── planets.js          # Mesh pianeti, orbite, anelli di Saturno
    ├── cameraControl.js    # Logica zoom e follow pianeta
    └── ui.js               # Pannello info, tooltip, slider velocità
```

---

## 🛠️ Tecnologie utilizzate

| Tecnologia | Versione | Utilizzo |
|------------|----------|---------|
| [Three.js](https://threejs.org/) | r160 | Rendering 3D WebGL |
| [Vite](https://vitejs.dev/) | 5 | Dev server e bundler |
| Canvas 2D API | — | Texture procedurali dei pianeti |
| OrbitControls | Three.js addon | Camera interattiva |

---

## 📊 Dati planetari

| Pianeta | Distanza reale | Periodo orbitale | Diametro | Lune |
|---------|---------------|-----------------|---------|------|
| Mercurio | 57.9M km | 88 giorni | 4,879 km | 0 |
| Venere | 108.2M km | 225 giorni | 12,104 km | 0 |
| Terra | 149.6M km | 365 giorni | 12,756 km | 1 |
| Marte | 227.9M km | 687 giorni | 6,792 km | 2 |
| Giove | 778.5M km | 4.333 giorni | 142,984 km | 95 |
| Saturno | 1.43 MLD km | 10.759 giorni | 120,536 km | 146 |
| Urano | 2.87 MLD km | 30.687 giorni | 51,118 km | 28 |
| Nettuno | 4.50 MLD km | 60.190 giorni | 49,528 km | 16 |

> Le distanze e velocità nella simulazione sono scalate per la visualizzazione.

---

## 📝 Licenza

MIT — libero di usare, modificare e distribuire.

---

*Creato da **Antonio Izzo***
