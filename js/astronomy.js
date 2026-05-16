/**
 * astronomy.js
 * Calcolo delle posizioni eliocentriche dei pianeti tramite elementi orbitali
 * kepleriani (NASA JPL). Valido per date 1800–2050 AD.
 *
 * Fonte: https://ssd.jpl.nasa.gov/planets/approx_pos.html
 */

const DEG = Math.PI / 180;

// ── Elementi orbitali a J2000.0 e loro variazioni per secolo giuliano ─────────
// [a, e, i, L, wp, Om]  →  UA, -, gradi, gradi, gradi, gradi
// [da, de, di, dL, dwp, dOm] per secolo giuliano
const EL = {
  mercury: { a:0.38709927, e:0.20563593, i:7.00497902,  L: 252.25032350, wp: 77.45779628, Om: 48.33076593,
             da:0.00000037,de:0.00001906,di:-0.00594749, dL:149472.67411175,dwp:0.16047689,dOm:-0.12534081 },
  venus:   { a:0.72333566, e:0.00677672, i:3.39467605,  L: 181.97909950, wp:131.60246718, Om: 76.67984255,
             da:0.00000390,de:-0.00004107,di:-0.00078890,dL: 58517.81538729,dwp:0.00268329,dOm:-0.27769418 },
  earth:   { a:1.00000261, e:0.01671123, i:-0.00001531, L: 100.46457166, wp:102.93768193, Om:  0.0,
             da:0.00000562,de:-0.00004392,di:-0.01294668,dL: 35999.37244981,dwp:0.32327364,dOm:  0.0 },
  mars:    { a:1.52371034, e:0.09339410, i:1.84969142,  L:  -4.55343205, wp:-23.94362959, Om: 49.55953891,
             da:0.00001847,de:0.00007882,di:-0.00813131, dL: 19140.30268499,dwp:0.44441088,dOm:-0.29257343 },
  jupiter: { a:5.20288700, e:0.04838624, i:1.30439695,  L:  34.39644051, wp: 14.72847983, Om:100.47390909,
             da:-0.00011607,de:-0.00013253,di:-0.00183714,dL:  3034.74612775,dwp:0.21252668,dOm:0.20469106 },
  saturn:  { a:9.53667594, e:0.05386179, i:2.48599187,  L:  49.95424423, wp: 92.59887831, Om:113.66242448,
             da:-0.00125060,de:-0.00050991,di:0.00193609, dL:  1222.49362201,dwp:-0.41897216,dOm:-0.28867794 },
  uranus:  { a:19.18916464,e:0.04725744, i:0.77263783,  L: 313.23810451, wp:170.95427630, Om: 74.01692503,
             da:-0.00196176,de:-0.00004397,di:-0.00242939,dL:   428.48202785,dwp:0.40805281,dOm:0.04240589 },
  neptune: { a:30.06992276,e:0.00859048, i:1.77004347,  L: -55.12002969, wp: 44.96476227, Om:131.78422574,
             da:0.00026291,de:0.00005105,di:0.00035372,  dL:   218.45945325,dwp:-0.32241464,dOm:-0.00508664 },
};

// Periodi di rotazione siderale in ore (negativi = retrogrado)
export const ROTATION_HOURS = {
  mercury:  1407.6,
  venus:   -5832.5,
  earth:      23.9345,
  mars:       24.6229,
  jupiter:     9.9250,
  saturn:     10.656,
  uranus:    -17.24,
  neptune:    16.11,
};

// Periodi orbitali delle lune in giorni (negativi = retrogrado)
export const MOON_PERIODS_DAYS = {
  luna:       27.3217,
  phobos:      0.31891,
  deimos:      1.26244,
  io:          1.76914,
  europa:      3.55118,
  ganymede:    7.15455,
  callisto:   16.6890,
  mimas:       0.94242,
  enceladus:   1.37022,
  titan:      15.9454,
  titania:     8.70587,
  oberon:     13.4632,
  triton:     -5.87685, // retrogrado
};

// ── Funzioni ──────────────────────────────────────────────────────────────────

/** Converte una Date JavaScript in Data Giuliana (JD). */
export function getJulianDate(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Normalizza un angolo in gradi a [0, 360). */
function norm360(deg) {
  return ((deg % 360) + 360) % 360;
}

/** Risolve l'equazione di Keplero M = E − e sin(E) con Newton-Raphson. */
function solveKepler(M, e) {
  let E = M;
  for (let n = 0; n < 50; n++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

/**
 * Calcola la longitudine eclittica eliocentrica (radianti) di un pianeta a
 * una data JD. Restituisce anche la latitudine eclittica (radianti).
 */
export function getHeliocentricPosition(planetKey, jd) {
  const el = EL[planetKey];
  if (!el) return { lon: 0, lat: 0 };

  // Secoli giuliani da J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // Elementi all'epoca T
  const e  = el.e  + el.de  * T;
  const i  = (el.i  + el.di  * T) * DEG;
  const L  = norm360(el.L  + el.dL  * T) * DEG;
  const wp = (el.wp + el.dwp * T) * DEG;
  const Om = (el.Om + el.dOm * T) * DEG;

  // Argomento del perielio ω = ω̃ − Ω
  const om = wp - Om;

  // Anomalia media M normalizzata a [−π, π]
  let M = L - wp;
  M = Math.atan2(Math.sin(M), Math.cos(M));

  // Anomalia eccentrica E (Newton-Raphson)
  const E = solveKepler(M, e);

  // Anomalia vera ν
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );

  // Argomento di latitudine u = ω + ν
  const u = om + nu;

  // Coordinate eclittiche eliocentriche (cartesiane in UA)
  const cosOm = Math.cos(Om), sinOm = Math.sin(Om);
  const cosu  = Math.cos(u),  sinu  = Math.sin(u);
  const cosi  = Math.cos(i),  sini  = Math.sin(i);

  const xe = cosOm * cosu - sinOm * sinu * cosi;
  const ye = sinOm * cosu + cosOm * sinu * cosi;
  const ze = sinu * sini;

  const lon = Math.atan2(ye, xe);             // longitudine eclittica
  const lat = Math.atan2(ze, Math.hypot(xe, ye)); // latitudine eclittica

  return { lon, lat };
}

/**
 * Angolo di rotazione siderale di un pianeta a una JD data.
 * Determina quale emisfera è rivolta verso il Sole (terminatore giorno/notte).
 */
export function getPlanetRotationAngle(planetKey, jd) {
  const h = ROTATION_HOURS[planetKey];
  if (!h) return 0;
  const hoursSinceJ2000 = (jd - 2451545.0) * 24;
  return (hoursSinceJ2000 / h) * Math.PI * 2;
}

/**
 * Angolo orbitale di una luna a una JD data (intorno al pianeta padre).
 */
export function getMoonAngle(moonKey, jd) {
  const p = MOON_PERIODS_DAYS[moonKey];
  if (!p) return 0;
  const days = jd - 2451545.0;
  return (days / Math.abs(p)) * Math.PI * 2 * Math.sign(p);
}

/**
 * Formatta la JD come stringa ISO UTC (per debug/display).
 */
export function jdToUTC(jd) {
  return new Date((jd - 2440587.5) * 86400000).toISOString();
}
