/**
 * Dati astronomici dei pianeti e delle loro principali lune.
 * Distanze e velocità sono scalate per la visualizzazione.
 */
export const PLANETS = [
  {
    name: 'Mercurio',
    tag: 'PIANETA ROCCIOSO',
    R: 0.38, dist: 14, spd: 4.74, tilt: 0.034,
    textureKey: 'mercury', emi: 0x1a1a1a, emiI: 0.2, shin: 8,
    info: { dist: '57.9M km', period: '88 giorni', diam: '4,879 km', moons: '0',
      desc: 'Il pianeta più piccolo e più vicino al Sole. La sua superficie è coperta da crateri e le temperature oscillano tra −180°C e +430°C.' },
    moons: [],
  },
  {
    name: 'Venere',
    tag: 'PIANETA GEMELLO',
    R: 0.95, dist: 21, spd: 3.5, tilt: 3.096,
    textureKey: 'venus', emi: 0x251800, emiI: 0.2, shin: 15,
    info: { dist: '108.2M km', period: '225 giorni', diam: '12,104 km', moons: '0',
      desc: "Il pianeta più caldo del sistema solare (462°C in media). Un'atmosfera densa di CO₂ crea un effetto serra estremo." },
    moons: [],
  },
  {
    name: 'Terra',
    tag: 'IL NOSTRO PIANETA',
    R: 1.0, dist: 29, spd: 2.98, tilt: 0.409,
    textureKey: 'earth', emi: 0x001530, emiI: 0.18, shin: 28,
    info: { dist: '149.6M km', period: '365 giorni', diam: '12,756 km', moons: '1',
      desc: "L'unico pianeta conosciuto ad ospitare la vita, con oceani liquidi, atmosfera ricca di ossigeno e una Luna che stabilizza l'asse terrestre." },
    moons: [
      {
        name: 'Luna', tag: 'SATELLITE NATURALE',
        R: 0.27, orbitR: 3.0, spd: 4.0, textureKey: 'luna',
        info: { parentPlanet: 'Terra', dist: '384,400 km', period: '27.3 giorni', diam: '3,474 km',
          desc: "L'unica luna naturale della Terra. Stabilizza l'asse terrestre e provoca le maree oceaniche. È il quinto satellite più grande del sistema solare." },
      },
    ],
  },
  {
    name: 'Marte',
    tag: 'PIANETA ROSSO',
    R: 0.53, dist: 40, spd: 2.41, tilt: 0.44,
    textureKey: 'mars', emi: 0x180000, emiI: 0.18, shin: 8,
    info: { dist: '227.9M km', period: '687 giorni', diam: '6,792 km', moons: '2',
      desc: 'Il pianeta rosso ospita Olympus Mons, il vulcano più alto del sistema solare (21 km). Ha una sottile atmosfera di CO₂.' },
    moons: [
      {
        name: 'Fobos', tag: 'SATELLITE NATURALE',
        R: 0.10, orbitR: 1.2, spd: 16.0, textureKey: 'phobos',
        info: { parentPlanet: 'Marte', dist: '9,376 km', period: '7 ore 39 min', diam: '22.2 km',
          desc: "La luna più grande di Marte. Orbita così velocemente (più veloce della rotazione marziana) che sorge ad ovest e tramonta ad est. Si avvicina di 1.8 m ogni 100 anni." },
      },
      {
        name: 'Deimos', tag: 'SATELLITE NATURALE',
        R: 0.08, orbitR: 1.9, spd: 6.5, textureKey: 'deimos',
        info: { parentPlanet: 'Marte', dist: '23,460 km', period: '30.3 ore', diam: '12.4 km',
          desc: "La più piccola e distante luna di Marte. Ha un aspetto levigato simile ad un asteroide catturato dalla cintura principale. Si sta lentamente allontanando da Marte." },
      },
    ],
  },
  {
    name: 'Giove',
    tag: 'GIGANTE GASSOSO',
    R: 3.5, dist: 63, spd: 1.31, tilt: 0.055,
    textureKey: 'jupiter', emi: 0x201000, emiI: 0.2, shin: 12,
    info: { dist: '778.5M km', period: '4.333 giorni', diam: '142,984 km', moons: '95',
      desc: 'Il più grande pianeta del sistema solare. La Grande Macchia Rossa è una tempesta anticiclonica attiva da almeno 350 anni.' },
    moons: [
      {
        name: 'Io', tag: 'LUNA GALILEIANA',
        R: 0.28, orbitR: 6.5, spd: 8.5, textureKey: 'io',
        info: { parentPlanet: 'Giove', dist: '421,700 km', period: '1.77 giorni', diam: '3,643 km',
          desc: 'Il corpo geologicamente più attivo del sistema solare, con oltre 400 vulcani attivi. La superficie è continuamente ricoperta di zolfo eruttato dai vulcani.' },
      },
      {
        name: 'Europa', tag: 'LUNA GALILEIANA',
        R: 0.24, orbitR: 8.8, spd: 5.8, textureKey: 'europa',
        info: { parentPlanet: 'Giove', dist: '671,000 km', period: '3.55 giorni', diam: '3,122 km',
          desc: "Sotto la crosta di ghiaccio si nasconde un oceano liquido profondo 100 km. È una delle migliori candidate all'ospitalità di vita extraterrestre nel sistema solare." },
      },
      {
        name: 'Ganimede', tag: 'LUNA GALILEIANA',
        R: 0.38, orbitR: 11.5, spd: 3.8, textureKey: 'ganymede',
        info: { parentPlanet: 'Giove', dist: '1,070,400 km', period: '7.15 giorni', diam: '5,268 km',
          desc: "La luna più grande del sistema solare, addirittura più grande del pianeta Mercurio. È l'unico satellite con un campo magnetico proprio e ha un oceano sotterraneo." },
      },
      {
        name: 'Callisto', tag: 'LUNA GALILEIANA',
        R: 0.33, orbitR: 15.0, spd: 2.2, textureKey: 'callisto',
        info: { parentPlanet: 'Giove', dist: '1,882,700 km', period: '16.69 giorni', diam: '4,821 km',
          desc: "La superficie più densamente craterizzata del sistema solare, quasi inalterata da 4 miliardi di anni. Potrebbe ospitare un oceano sotterraneo saline." },
      },
    ],
  },
  {
    name: 'Saturno',
    tag: 'PIANETA CON ANELLI',
    R: 3.0, dist: 90, spd: 0.97, tilt: 0.466,
    textureKey: 'saturn', emi: 0x1c1000, emiI: 0.2, shin: 10,
    hasRings: true,
    info: { dist: '1.43 MLD km', period: '10.759 giorni', diam: '120,536 km', moons: '146',
      desc: "Il sistema di anelli di Saturno si estende per 282.000 km ma è spesso solo poche decine di metri. Densità media inferiore all'acqua." },
    moons: [
      {
        name: 'Mimas', tag: 'SATELLITE NATURALE',
        R: 0.10, orbitR: 5.2, spd: 11.0, textureKey: 'mimas',
        info: { parentPlanet: 'Saturno', dist: '185,520 km', period: '22.6 ore', diam: '396 km',
          desc: "Nota come la \"luna Morte Nera\" per il gigantesco cratere Herschel (130 km). La sua orbita crea la Divisione di Cassini negli anelli di Saturno." },
      },
      {
        name: 'Encelado', tag: 'SATELLITE NATURALE',
        R: 0.14, orbitR: 7.2, spd: 7.8, textureKey: 'enceladus',
        info: { parentPlanet: 'Saturno', dist: '238,020 km', period: '32.9 ore', diam: '504 km',
          desc: "Espelle geyser di acqua ghiacciata nello spazio che alimentano l'anello E di Saturno. Probabilmente ospita un oceano liquido sotto la superficie ghiacciata." },
      },
      {
        name: 'Titano', tag: 'SATELLITE NATURALE',
        R: 0.40, orbitR: 12.0, spd: 3.2, textureKey: 'titan',
        info: { parentPlanet: 'Saturno', dist: '1,221,830 km', period: '15.95 giorni', diam: '5,150 km',
          desc: "L'unica luna del sistema solare con una densa atmosfera (azoto e metano). Ha laghi e fiumi di metano liquido in superficie. La sonda Huygens vi atterrò nel 2005." },
      },
    ],
  },
  {
    name: 'Urano',
    tag: 'GIGANTE DI GHIACCIO',
    R: 1.8, dist: 118, spd: 0.68, tilt: 1.706,
    textureKey: 'uranus', emi: 0x002030, emiI: 0.2, shin: 18,
    info: { dist: '2.87 MLD km', period: '30.687 giorni', diam: '51,118 km', moons: '28',
      desc: 'Urano ruota su un fianco (inclinazione assiale 98°), probabilmente a causa di un impatto cosmico antico. Ha 13 anelli sottili.' },
    moons: [
      {
        name: 'Titania', tag: 'SATELLITE NATURALE',
        R: 0.16, orbitR: 4.2, spd: 5.2, textureKey: 'titania',
        info: { parentPlanet: 'Urano', dist: '435,910 km', period: '8.71 giorni', diam: '1,577 km',
          desc: "La luna più grande di Urano. Presenta canyon profondi e scarpate originati da un'antica attività geologica. La sua superficie mista di ghiaccio e roccia è scarsamente cranerizzata." },
      },
      {
        name: 'Oberon', tag: 'SATELLITE NATURALE',
        R: 0.14, orbitR: 5.8, spd: 3.6, textureKey: 'oberon',
        info: { parentPlanet: 'Urano', dist: '583,520 km', period: '13.46 giorni', diam: '1,523 km',
          desc: "La luna più esterna e massiccia di Urano dopo Titania. La sua superficie molto scura è coperta di antichi crateri e presenta una grande montagna alta circa 6 km." },
      },
    ],
  },
  {
    name: 'Nettuno',
    tag: 'GIGANTE DI GHIACCIO',
    R: 1.7, dist: 147, spd: 0.54, tilt: 0.494,
    textureKey: 'neptune', emi: 0x000e35, emiI: 0.22, shin: 20,
    info: { dist: '4.50 MLD km', period: '60.190 giorni', diam: '49,528 km', moons: '16',
      desc: 'Il pianeta più lontano con venti che raggiungono 2.100 km/h. Il suo grande satellite Tritone orbita in senso retrogrado.' },
    moons: [
      {
        name: 'Tritone', tag: 'SATELLITE NATURALE',
        R: 0.22, orbitR: 4.2, spd: -4.5, textureKey: 'triton', // negativo = retrogrado
        info: { parentPlanet: 'Nettuno', dist: '354,759 km', period: '5.88 giorni (retrogrado)', diam: '2,707 km',
          desc: "L'unica grande luna con orbita retrograda nel sistema solare, probabilmente catturata dalla Fascia di Kuiper. Ha geyser di azoto attivi e si avvicina lentamente a Nettuno." },
      },
    ],
  },
];
