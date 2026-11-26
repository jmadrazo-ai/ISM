// Inmobiliaria San Miguel · datos semilla del prototipo.
// VERIFICADO = leido en puntadelcielo.mx / terra-viva.mx / listados abiertos (23-nov-2026).
// EJEMPLO   = inventado para el boceto visual; se reemplaza con datos reales.
// Regla: una sola fuente de verdad. Sitio publico y area de manejo leen de aqui via store.js.

export const FX = 19.02; // MXN por USD. EJEMPLO (derivado de un listado: 5,345,000 / 280,979)

// Raiz del sitio, calculada desde este archivo (js/data.js). Asi las ligas e imagenes locales funcionan igual
// en la raiz de un dominio que dentro de una subcarpeta, como las de GitHub Pages.
export const ROOT = new URL('../', import.meta.url).href;

// Acepta: un id de la galeria Wix o una foto de Unsplash (ambas se piden al tamano exacto), una ruta local
// o cualquier otra URL completa (se usan tal cual).
export const img = (uri, w = 1600, h = 1000, mode = 'fill') =>
  uri.startsWith('https://images.unsplash.com/') ? `${uri}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
    : /^(https?:)?\/\//.test(uri) ? uri : uri.startsWith('img/') ? ROOT + uri
      : `https://static.wixstatic.com/media/${uri}/v1/${mode}/w_${w},h_${h},al_c,q_85/${uri}`;

// Fotos de San Miguel de Allende con licencia libre (Unsplash License: uso comercial sin costo, credito no
// obligatorio; se da de todos modos en /creditos.html). Elegidas el 26-nov-2026 viendo cada una.
// Sustituyen a las fotos de ciudad de los sitios viejos, que eran de 720 x 360 o cuadros de video.
const U = (id) => `https://images.unsplash.com/photo-${id}`;
export const CREDITS = [
  ['smaPanorama', 'Vista de la ciudad al anochecer', 'ydaniels', 'V-QtUsMAIRM'],
  ['smaCalle', 'Calle Aldama y la Parroquia al atardecer', 'mrmarkdejong', 'XeRVnghi1hY'],
  ['smaParroquia', 'La Parroquia y las cúpulas', 'mrmarkdejong', 'rXzmGpxlp9E'],
  ['smaEstrellas', 'Calle con estrellas de luz', 'mrmarkdejong', 'SayUHUMBMp0'],
  ['smaColonial', 'Fachadas coloniales y la torre', 'jorgeel_vm09', 't7IXugwbTKk'],
  ['smaPaseo', 'Paseo por una calle del Centro', 'jorgeel_vm09', 'o3o47HgOBjE'],
  ['smaAzoteas', 'Azoteas del Centro', 'cocosaja', 'xbKl1iVGlLg'],
  ['smaVista', 'Vista aérea de la ciudad', 'mjg_5', 'aaGej_rGBpQ'],
  ['smaPapel', 'Calle empedrada con papel picado', 'sheilane', 'eTVi3vlx-sc'],
];

// Banco de imagenes (hotlink a los sitios oficiales de los desarrollos y a Unsplash)
export const PH = {
  smaPanorama: U('1549605577-519ac7af3458'),
  smaCalle: U('1739582767008-faa274e18ac2'),
  smaParroquia: U('1739582766847-a4051d6d5f04'),
  smaEstrellas: U('1739582767506-fb17a77133b7'),
  smaColonial: U('1775264049145-4506ce3d17e6'),
  smaPaseo: U('1775264049146-084e182f1bbd'),
  smaAzoteas: U('1563085463-3761d7041366'),
  smaVista: U('1598535806497-5e20ce8f71f5'),
  smaPapel: U('1717654543196-4d6826ec4bb8'),
  porton: '44b3a6_e09d47a3ba91455c9507400fc9d293ee~mv2.jpg',
  pdc1: '0807b7_872c8b6dded948fdaf8fe1e5619935fc~mv2.jpg',
  pdc2: '1624d9_bf95627471604c12a2891680e573fa9f~mv2.jpg',
  pdc3: '0807b7_9f0ca9e188cc4f538cfeb1786fcec0d0~mv2.jpg',
  pdc4: '0807b7_2accc9d888684dfbb387758d89deb42f~mv2.jpg',
  pdcPool: '0807b7_72e98f9a339146f8af1bbff391375baf~mv2.jpg',
  pdcPool2: '0807b7_502e191f14d84a29a5c721cc46d4eed4~mv2.jpg',
  dining: '11062b_1d5d8f7ff47b4be2a9c2a3dc16b6ba60~mv2.jpeg',
  padel: '0807b7_96c863e83fb24e259a3d36d7aef283e2~mv2.jpg',
  tvAccess: '44b3a6_dcd6943ba9564917a5fa8a83456a8d85~mv2.jpg',
  picachos: '44b3a6_20c845fbac5d4db8a35df545eafc86ab~mv2.jpg',
  huerto: '44b3a6_ec54a9a4359e42f5a76c253d518a983f~mv2.jpg',
  tvPadel: '44b3a6_cba99f6de9ec4c58b7f782172a12fd48~mv2.jpg',
  casaClub: '44b3a6_de7db3778b6f4989a18b07f526d7df8c~mv2.jpg',
  tvMaster: '7488e2_5209c80578c9448c8f1851c75559e20c~mv2.png',
  tvMap: '0807b7_f2c7009eae3445d1822e8d8c2c5d499e~mv2.jpg',
  // Archivos locales (los mando Julian el 26-nov-2026). Fachadas: PDF del Arq. N. Ruiz.
  fach1: 'img/terraviva/fachada-01.jpg', fach2: 'img/terraviva/fachada-02.jpg', fach3: 'img/terraviva/fachada-03.jpg',
  fach4: 'img/terraviva/fachada-04.jpg', fach5: 'img/terraviva/fachada-05.jpg', fach6: 'img/terraviva/fachada-06.jpg',
  // Renders de casa club de Terraviva (terraza, salon, comedor, acceso, lobby). VERIFICADO: Julian lo confirmo el 26-nov-2026.
  clubTerraza: 'img/club/terraza.jpg', clubSalon: 'img/club/salon.jpg', clubComedor: 'img/club/comedor.jpg',
  clubAcceso: 'img/club/acceso.jpg', clubAcceso2: 'img/club/acceso-2.jpg', clubNoche: 'img/club/acceso-noche.jpg',
  clubLobby: 'img/club/lobby.jpg', clubLobby2: 'img/club/lobby-2.jpg',
};

const PLANS = {
  oratorio: ['0807b7_b213e046e19a4f93bf355e417d1cf822~mv2.jpg', '0807b7_ff82cd3d84984014afe72cec79b9240c~mv2.jpg', '0807b7_8502126fd511412a89d6ec791384b7a7~mv2.jpg'],
  monjas: ['0807b7_897de4262d754a78b5372495431ee986~mv2.png', '0807b7_700e4b480fc7451fbb99432f24f69193~mv2.png', '0807b7_a2bac5eb7f0947e58c737194bc8764e1~mv2.png'],
  parroquia: ['0807b7_3ae679e2e79443f3b306a182205abe24~mv2.png', '0807b7_6c91a2aea94a4bf4ab256f23a73ba0e6~mv2.png', '0807b7_9f2cbc9738f94c9d9aefc6ce5916a6a3~mv2.png'],
  santacruz: ['0807b7_07fa696fa9c7474dafe894baca1bd10f~mv2.png', '0807b7_2beffef3da8a4ce6a7a82bba2ddf84d2~mv2.png', '0807b7_0dd53d1e2eba476faea47da3a887a8f1~mv2.png'],
  sanantonio: ['0807b7_84a01bc19c1d43b799a51f8f54b31ccd~mv2.jpg', '0807b7_588c112e13f34f4ca9af5773d54aa37c~mv2.jpg', '0807b7_1a757d4be719400db8576cdb2bca68fc~mv2.jpg'],
  sanfrancisco: ['0807b7_f43bf658a61a4c77b65e4998179af203~mv2.jpg', '0807b7_a1d83a90c7fe4e1591c6b049c13b9b77~mv2.jpg', '0807b7_9f2e755540f7419f827845a36cd4dae0~mv2.jpg'],
  sanmiguel: ['0807b7_7b17762b1bc540a28ec5744770c106fb~mv2.jpg', '0807b7_e6fa7af121ec4ec9beb6efd4da512d78~mv2.jpg', '0807b7_0b52e204204545c5a44be8a3b578d2dc~mv2.jpg'],
};

export const COMPANY = {
  name: 'Inmobiliaria San Miguel',
  city: 'San Miguel de Allende, Guanajuato',
  phone: '+52 415 688 4255',      // VERIFICADO (oficina, terra-viva.mx)
  whatsapp: '+52 415 111 2330',   // VERIFICADO
  bilingual: '+52 415 179 3155',  // VERIFICADO (linea bilingue)
  email: 'hola@inmobiliariasanmiguel.mx', // EJEMPLO
  address: 'Prolongación Vicente Araiza s/n, La Lejona, 37765 San Miguel de Allende, Gto.', // VERIFICADO (C.P. corregido)
  years: 20, // VERIFICADO: "más de 20 años desarrollando en San Miguel de Allende" (terra-viva.mx/Nosotros)
};

export const TYPES = {
  departamento: { es: 'Departamento', en: 'Apartment', pl: { es: 'Departamentos', en: 'Apartments' } },
  casa: { es: 'Casa', en: 'House', pl: { es: 'Casas', en: 'Houses' } },
  terreno: { es: 'Terreno', en: 'Lot', pl: { es: 'Terrenos', en: 'Lots' } },
};

export const STATUS = {
  disponible: { es: 'Disponible', en: 'Available' },
  apartado: { es: 'Apartado', en: 'Reserved' },
  vendido: { es: 'Vendido', en: 'Sold' },
};

export const DELIVERY = {
  inmediata: { es: 'Entrega inmediata', en: 'Move-in ready' },
  preventa: { es: 'Preventa', en: 'Pre-construction' },
  terreno: { es: 'Listo para construir', en: 'Ready to build' },
};

export const AMENITIES = {
  casaclub: { es: 'Casa club', en: 'Clubhouse' },
  restaurante: { es: 'Restaurante y snack bar', en: 'Restaurant and snack bar' },
  albercas: { es: '4 albercas', en: '4 pools' },
  alberca: { es: 'Alberca', en: 'Pool' },
  jacuzzis: { es: '8 jacuzzis', en: '8 hot tubs' },
  gym: { es: 'Gimnasio', en: 'Gym' },
  vapor: { es: 'Vapor', en: 'Steam room' },
  masaje: { es: 'Área de masaje', en: 'Massage area' },
  padel: { es: 'Pádel', en: 'Padel courts' },
  juegos: { es: 'Juegos infantiles', en: 'Playground' },
  seguridad: { es: 'Acceso controlado 24/7', en: '24/7 gated access' },
  huerto: { es: 'Huerto propio', en: 'Your own vegetable garden' },
  vistas: { es: 'Vistas a Los Picachos', en: 'Views of Los Picachos' },
};

export const PROJECTS = [
  {
    id: 'punta-del-cielo',
    name: 'Punta del Cielo',
    kind: { es: 'Departamentos y casas terminadas', en: 'Finished apartments and houses' },
    tagline: { es: 'Un mundo aparte, a cinco minutos del Centro.', en: 'A world apart, five minutes from Centro.' },
    blurb: {
      es: 'Comunidad cerrada frente al Club de Golf Malanquín. Arquitectura colonial contemporánea en piedra de la región y acero, obra de Escobar Arquitectos. Departamentos de 2 y 3 recámaras con terraza, listos para entrega.',
      en: 'A gated community facing the Malanquín Golf Club. Contemporary colonial architecture in local stone and steel by Escobar Arquitectos. Two and three bedroom apartments with terrace, ready to move in.',
    },
    hero: PH.pdc3, cover: PH.pdc1,
    gallery: [PH.pdc3, PH.pdc1, PH.pdc2, PH.pdc4, PH.pdcPool, PH.pdcPool2, PH.padel, PH.dining],
    amenities: ['casaclub', 'restaurante', 'albercas', 'jacuzzis', 'gym', 'vapor', 'masaje', 'padel', 'juegos', 'seguridad'],
    facts: [
      { v: '5 min', l: { es: 'al Centro Histórico en auto', en: 'drive to the Historic Center' } },
      { v: '7', l: { es: 'modelos de 96 a 303 m²', en: 'models from 96 to 303 m²' } },
      { v: '4', l: { es: 'albercas y 8 jacuzzis', en: 'pools and 8 hot tubs' } },
    ],
    geo: { lat: 20.888, lng: -100.7535 }, // VERIFICADO (coordenadas publicadas en MexHome)
  },
  {
    id: 'terraviva',
    name: 'Terraviva Picachos',
    kind: { es: 'Lotes residenciales', en: 'Residential lots' },
    tagline: { es: 'Donde la naturaleza y el bienestar se unen.', en: 'Where nature and wellbeing meet.' },
    blurb: {
      es: 'Lotes residenciales desde 128 m² con vistas a Los Picachos y a la presa Allende. Elige entre tres modelos de casa, trae a tu propio constructor o deja que la construyamos por ti.',
      en: 'Residential lots from 128 m² with views of Los Picachos and the Allende reservoir. Choose one of three house models, bring your own builder or let us build it for you.',
    },
    hero: PH.picachos, cover: PH.tvAccess,
    gallery: [PH.clubTerraza, PH.fach2, PH.clubSalon, PH.clubAcceso, PH.fach5, PH.clubComedor, PH.clubLobby, PH.fach3, PH.clubNoche, PH.tvAccess, PH.picachos],
    amenities: ['casaclub', 'alberca', 'padel', 'gym', 'vapor', 'juegos', 'huerto', 'vistas', 'seguridad'],
    facts: [
      { v: '128–319', l: { es: 'm² por lote, según el croquis oficial', en: 'm² per lot, per the official plan' } },
      { v: '71', l: { es: 'lotes en total', en: 'lots in total' } },
      { v: '3', l: { es: 'modelos de casa para construir', en: 'house models to build' } },
    ],
    master: PH.tvMaster,
    geo: { lat: 20.8874, lng: -100.7529 }, // EJEMPLO (junto a Punta del Cielo)
  },
];

// ---- Inventario semilla -------------------------------------------------
// Areas de modelos de Punta del Cielo: VERIFICADAS (puntadelcielo.mx/residencias).
// Precios, recamaras, banos, niveles y estatus: EJEMPLO, salvo donde se indica.
// Compra de casa en Punta del Cielo. VERIFICADO: lo dicto Julian el 26-nov-2026:
// "30% de enganche. Construccion 8 meses. 50% de saldo repartido en 8 meses. Y 20% contra escritura.
// Escrituracion inmediata." Aplica a las casas (no a los departamentos, que son de entrega inmediata).
// down + during + deed = 30 + 50 + 20 = 100 %. Mensualidad = 50 % / 8 = 6.25 % del precio.
export const PDC_CASA = { delivery: 'preventa', deliveryMonths: 8, pay: { down: 30, during: 50, months: 8, deed: 20 } };
const pdc = (o) => ({
  project: 'punta-del-cielo', delivery: 'inmediata', deliveryMonths: 0, parking: 1, lot: null,
  status: 'disponible', example: true, ...o,
  images: [...(o.photos || [PH.pdc1, PH.pdc2, PH.pdcPool]), ...PLANS[o.plan]],
  planCount: 3,
});

const PDC_UNITS = [
  pdc({ id: 'pdc-oratorio-204', model: 'Oratorio', level: { es: 'Intermedio', en: 'Mid level' }, type: 'departamento', price: 3350000, beds: 2, baths: 2, built: 96, plan: 'oratorio', photos: [PH.pdc2, PH.pdcPool, PH.pdc1] }),
  pdc({ id: 'pdc-oratorio-pg', model: 'Oratorio', level: { es: 'Pent garden', en: 'Pent garden' }, type: 'departamento', price: 3520000, beds: 2, baths: 2, built: 100, plan: 'oratorio', status: 'apartado', photos: [PH.pdc4, PH.pdc1, PH.pdcPool2] }),
  pdc({ id: 'pdc-monjas-pb', model: 'Las Monjas', level: { es: 'Garden, planta baja', en: 'Garden, ground floor' }, type: 'departamento', price: 3790000, beds: 2, baths: 2, built: 108.6, plan: 'monjas', photos: [PH.pdc1, PH.pdc3, PH.pdcPool] }),
  pdc({ id: 'pdc-monjas-rg', model: 'Las Monjas', level: { es: 'Roof garden', en: 'Roof garden' }, type: 'departamento', price: 4650000, beds: 3, baths: 2, built: 173.4, plan: 'monjas', photos: [PH.pdc3, PH.pdcPool2, PH.pdc2] }),
  pdc({ id: 'pdc-parroquia-pg', model: 'Parroquia', level: { es: 'Pent garden', en: 'Pent garden' }, type: 'departamento', price: 4900000, beds: 2, baths: 2, built: 141.6, plan: 'parroquia', featured: true, photos: [PH.pdc3, PH.pdc1, PH.pdcPool] }),
  pdc({ id: 'pdc-parroquia-rg', model: 'Parroquia', level: { es: 'Roof garden', en: 'Roof garden' }, type: 'departamento', price: 5650000, beds: 3, baths: 3, built: 222.9, plan: 'parroquia', photos: [PH.pdcPool2, PH.pdc4, PH.pdc3] }),
  pdc({ id: 'pdc-santacruz-204', model: 'Santa Cruz', level: { es: 'Intermedio', en: 'Mid level' }, type: 'departamento', price: 4250000, beds: 3, baths: 2, built: 126.4, plan: 'santacruz', photos: [PH.pdc2, PH.pdc3, PH.padel] }),
  pdc({ id: 'pdc-santacruz-rg', model: 'Santa Cruz', level: { es: 'Roof garden', en: 'Roof garden' }, type: 'departamento', price: 5345000, beds: 3, baths: 3, built: 203.8, plan: 'santacruz', featured: true, photos: [PH.pdc4, PH.pdcPool, PH.pdc1] }),
  pdc({ id: 'pdc-sanantonio-pb', model: 'San Antonio', level: { es: 'Planta baja', en: 'Ground floor' }, type: 'departamento', price: 5480000, beds: 3, baths: 3, built: 181.3, plan: 'sanantonio', status: 'vendido', photos: [PH.pdc1, PH.pdc2, PH.pdcPool2] }),
  pdc({ id: 'pdc-sanantonio-rg', model: 'San Antonio', level: { es: 'Roof garden', en: 'Roof garden' }, type: 'departamento', price: 6950000, beds: 4, baths: 4, built: 264.9, plan: 'sanantonio', photos: [PH.pdc3, PH.pdc4, PH.pdcPool] }),
  pdc({ id: 'pdc-sanfrancisco', model: 'San Francisco', level: { es: 'Casa en tres niveles', en: 'Three-level house' }, type: 'casa', ...PDC_CASA, price: 6400000, beds: 3, baths: 4, built: 237.8, lot: 190, parking: 2, plan: 'sanfrancisco', photos: [PH.pdc4, PH.pdc3, PH.pdcPool2] }),
  pdc({ id: 'pdc-sanmiguel', model: 'San Miguel', level: { es: 'Casa en tres niveles', en: 'Three-level house' }, type: 'casa', ...PDC_CASA, price: 7500000, beds: 4, baths: 5, built: 303.1, lot: 382, parking: 2, plan: 'sanmiguel', featured: true, photos: [PH.pdc3, PH.pdcPool, PH.pdc2] }),
];

// Terraviva: los 71 lotes del croquis oficial ("Nuevo Sembrado Terraviva Picachos", terra-viva.mx).
// VERIFICADO, leido del croquis el 25-nov-2026: calle, manzana, numero, superficie (S=) y modelo de casa
// segun el color de la leyenda (Luxury crema, Prime gris, Best cafe). El poligono de cada lote esta en
// pixeles de la imagen original (2475 x 2383) para dibujarlo encima del croquis.
// EJEMPLO: precio (superficie x precio por m2 dentro del rango publicado, 10,823 a 11,275) y estatus.
// Unico precio VERIFICADO: "Huizache 1", 162.76 m2 a MXN 1,835,119. El croquis tiene dos lotes Huizache 01
// de 162.76 m2 (manzanas 1 y 2); se asigna a la manzana 1: SUPUESTO a confirmar con ventas.
export const TV_PLAN = { w: 2475, h: 2383, view: [215, 95, 1990, 2215] };
const R = (x1, y1, x2, y2) => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
function seeded(n) { const x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }

const AG_Y = [388, 475, 565, 650, 738, 822, 912, 998, 1087, 1173, 1260, 1348, 1503, 1590, 1678, 1765, 1852, 1940, 2027, 2113, 2278];
const AG_A = { 1: 234.0, 13: 224.0, 21: 237.29 };
const AGAVE = [['Agave', 1, 1, 234.0, 'Best', [[279, 226], [393, 255], [393, 182], [463, 200], [465, 388], [281, 388]]],
  ...AG_Y.slice(1).map((y, k) => ['Agave', 1, k + 2, AG_A[k + 2] || 128.0, 'Best', R(282, AG_Y[k], 467, y)])];

// Arco de Yuca (manzana 3): puntos del borde exterior (P) e interior (Q) entre lotes
const P = { 76: [1057, 562], 65: [1155, 626], 54: [1250, 698], 43: [1342, 777], 32: [1426, 861], 21: [1510, 950] };
const Q = { 76: [945, 730], 65: [1032, 798], 54: [1118, 865], 43: [1207, 935], 32: [1290, 1013], 21: [1368, 1085] };
const YUCA3 = [
  ['Yuca', 3, 1, 237.4, 'Prime', [P[21], [1590, 1030], [1658, 1100], [1658, 1118], [1390, 1118], Q[21]]],
  ['Yuca', 3, 2, 198.71, 'Prime', [P[32], P[21], Q[21], Q[32]]],
  ['Yuca', 3, 3, 198.71, 'Prime', [P[43], P[32], Q[32], Q[43]]],
  ['Yuca', 3, 4, 198.71, 'Luxury', [P[54], P[43], Q[43], Q[54]]],
  ['Yuca', 3, 5, 198.71, 'Luxury', [P[65], P[54], Q[54], Q[65]]],
  ['Yuca', 3, 6, 198.71, 'Luxury', [P[76], P[65], Q[65], Q[76]]],
  ['Yuca', 3, 7, 198.71, 'Prime', [[957, 498], P[76], Q[76], [855, 678]]],
  ['Yuca', 3, 8, 178.63, 'Prime', [[813, 412], [957, 498], [855, 678], [813, 660]]],
  ['Yuca', 3, 9, 266.63, 'Prime', [[690, 358], [813, 412], [813, 660], [690, 660]]],
  ['Yuca', 3, 10, 319.16, 'Prime', [[563, 307], [690, 358], [690, 660], [563, 660]]],
];
const row = (street, mza, model, area, y1, y2, cols) => cols.map(([n, x1, x2]) => [street, mza, n, area, model, R(x1, y1, x2, y2)]);
const LOT_PLAN = [
  ...AGAVE,
  ...row('Yuca', 1, 'Prime', 205.59, 1152, 1354, [[1, 1524, 1648], [2, 1399, 1524], [3, 1276, 1399]]),
  ...row('Yuca', 1, 'Luxury', 225.0, 1078, 1325, [[4, 1168, 1273], [5, 1055, 1168], [6, 950, 1055]]),
  ...row('Yuca', 1, 'Prime', 205.59, 1155, 1355, [[7, 821, 949], [8, 697, 821], [9, 568, 697]]),
  ['Yuca', 2, 1, 240.5, 'Luxury', R(593, 694, 800, 835)], ['Yuca', 2, 2, 240.5, 'Luxury', R(593, 835, 800, 978)], ['Yuca', 2, 3, 240.5, 'Luxury', R(593, 978, 800, 1120)],
  ...YUCA3,
  ...row('Huizache', 1, 'Prime', 162.76, 1962, 2172, [[1, 1557, 1652], [2, 1463, 1557], [3, 1368, 1463], [4, 1276, 1368]]),
  ...row('Huizache', 1, 'Luxury', 215.0, 1905, 2145, [[5, 1165, 1273], [6, 1055, 1165], [7, 950, 1055]]),
  ...row('Huizache', 1, 'Prime', 162.76, 1962, 2170, [[8, 855, 948], [9, 758, 855], [10, 665, 758], [11, 568, 665]]),
  ...row('Huizache', 2, 'Prime', 162.76, 1500, 1708, [[1, 1557, 1652], [2, 1462, 1557], [3, 1367, 1462], [4, 1276, 1367]]),
  ...row('Huizache', 2, 'Luxury', 215.0, 1530, 1765, [[5, 1167, 1273], [6, 1057, 1167], [7, 950, 1057]]),
  ...row('Huizache', 2, 'Prime', 162.76, 1500, 1715, [[8, 853, 948], [9, 755, 853], [10, 658, 755], [11, 562, 658]]),
  ['Salvia', 1, 1, 161.18, 'Luxury', [[1750, 1508], [1992, 1508], [2025, 1588], [1750, 1588]]],
  ['Salvia', 1, 2, 185.03, 'Luxury', [[1752, 1590], [2027, 1590], [2065, 1663], [1752, 1663]]],
  ['Salvia', 1, 3, 207.02, 'Luxury', [[1752, 1665], [2067, 1665], [2098, 1740], [1752, 1740]]],
  ['Salvia', 2, 1, 148.64, 'Luxury', R(1752, 2049, 1992, 2125)],
  ['Salvia', 2, 2, 147.75, 'Best', R(1752, 2127, 1990, 2200)],
  ['Salvia', 2, 3, 146.87, 'Best', R(1752, 2202, 1990, 2275)],
];
const MULTI = { Yuca: true, Huizache: true, Salvia: true }; // calles con mas de una manzana
// Cotas [frente, fondo] en metros. VERIFICADAS: son las cotas rotuladas en el plano oficial y cuadran con la
// superficie (16 x 8 = 128; 18.5 x 13 = 240.5; 10 x 22.5 = 225; 10 x 21.5 = 215; 11.42 x 18 = 205.56;
// 8.57 x 19 = 162.83). Los lotes irregulares (esquinas y curva) no llevan cotas simples: null.
function lotDims(street, mza, n) {
  if (street === 'Agave') return n === 1 ? null : n === 13 ? [14, 16] : n === 21 ? [14.83, 16] : [8, 16];
  if (street === 'Yuca') return mza === 2 ? [13, 18.5] : mza === 1 ? (n >= 4 && n <= 6 ? [10, 22.5] : [11.42, 18]) : null;
  if (street === 'Huizache') return n >= 5 && n <= 7 ? [10, 21.5] : [8.57, 19];
  return null;
}
const LOT_PHOTOS = [PH.picachos, PH.tvAccess, PH.clubTerraza, PH.fach2, PH.huerto];

const TV_LOTS = LOT_PLAN.map(([street, mza, n, area, houseModel, pts], i) => {
  const nn = String(n).padStart(2, '0');
  const known = street === 'Huizache' && mza === 1 && n === 1;
  const ppm = known ? 11275 : Math.round(10823 + seeded(i + 40) * 452);
  const r = seeded(i + 77);
  const status = known ? 'disponible' : r < 0.42 ? 'vendido' : r < 0.52 ? 'apartado' : 'disponible';
  return {
    id: `tv-${street.toLowerCase()}-m${mza}-${nn}`, project: 'terraviva', type: 'terreno',
    model: MULTI[street] ? `${street} ${nn} (Mza ${mza})` : `${street} ${nn}`,
    level: { es: `Manzana ${mza}`, en: `Block ${mza}` },
    street, mza, lotNo: n, houseModel, pts, dims: lotDims(street, mza, n),
    price: known ? 1835119 : Math.round(area * ppm), beds: 0, baths: 0, parking: 0,
    built: null, lot: area, status, delivery: 'terreno', deliveryMonths: 0,
    images: [...LOT_PHOTOS.slice(i % 5), ...LOT_PHOTOS.slice(0, i % 5)].slice(0, 3).concat(PH.casaClub, PH.tvMaster), planCount: 1,
    lotIndex: i, example: !known, areaVerified: true, featured: known,
  };
});

// Paquetes lote + casa: terra-viva.mx dice "elige entre tres modelos de casa... o deja que TERRAVIVA
// la construya por ti" (VERIFICADO el concepto). Nombres Best, Prime y Luxury: VERIFICADOS en la
// leyenda del plano oficial; Julian pidio cambiarlos (25-nov-2026). Encino, Mezquite y Picachos son PROPUESTA. Areas, recamaras, precios y plazos: EJEMPLO.
// Fachadas: VERIFICADAS, de "TERRAVIVA_NRUIZ_PRESENTACION FACHADAS.pdf" (Arq. N. Ruiz, seis fachadas 01 a 06).
// Que fachada corresponde a que modelo NO consta en el PDF: la asignacion de abajo es SUPUESTO
// (una planta para la casa chica; 04, 05 y 06 parecen variantes de una misma casa).
const TV_HOMES = [
  { id: 'tv-casa-encino', model: 'Casa Encino', built: 142, lot: 160, beds: 2, baths: 2, price: 4380000, months: 10, fach: [PH.fach3] },
  { id: 'tv-casa-mezquite', model: 'Casa Mezquite', built: 178, lot: 180, beds: 3, baths: 3, price: 5290000, months: 11, fach: [PH.fach1, PH.fach2] },
  { id: 'tv-casa-picachos', model: 'Casa Picachos', built: 214, lot: 210, beds: 3, baths: 4, price: 6180000, months: 12, fach: [PH.fach5, PH.fach6, PH.fach4] },
].map(({ fach, ...h }) => ({
  ...h, project: 'terraviva', type: 'casa', parking: 2, status: 'disponible',
  level: { es: 'Lote + casa llave en mano', en: 'Lot + turnkey house' },
  delivery: 'preventa', deliveryMonths: h.months,
  images: [...fach, PH.clubTerraza, PH.picachos, PH.clubSalon], planCount: 0, example: true,
}));
export const TV_FACADES = [PH.fach1, PH.fach2, PH.fach3, PH.fach4, PH.fach5, PH.fach6];

export const SEED = [...PDC_UNITS, ...TV_HOMES, ...TV_LOTS];

// ---- Ubicacion: todo a minutos -------------------------------------------
// Centro y Club de Golf: VERIFICADO en los sitios oficiales. El resto: EJEMPLO.
export const NEARBY = [
  { k: 'centro', min: 5, cat: 'centro', es: 'Centro Histórico y Parroquia', en: 'Historic Center and Parroquia', verified: true },
  { k: 'golf', min: 1, cat: 'deporte', es: 'Club de Golf Malanquín', en: 'Malanquín Golf Club', verified: true },
  { k: 'super', min: 5, cat: 'super', es: 'Supermercados (City Market, La Comer)', en: 'Supermarkets (City Market, La Comer)' },
  { k: 'hospital', min: 6, cat: 'salud', es: 'Hospitales privados', en: 'Private hospitals' },
  { k: 'escuelas', min: 8, cat: 'escuela', es: 'Colegios bilingües', en: 'Bilingual schools' },
  { k: 'iglesia', min: 4, cat: 'iglesia', es: 'Iglesia más cercana', en: 'Nearest church' },
  { k: 'aurora', min: 9, cat: 'cultura', es: 'Fábrica La Aurora, arte y diseño', en: 'Fábrica La Aurora art and design center' },
  { k: 'charco', min: 12, cat: 'naturaleza', es: 'Jardín botánico El Charco del Ingenio', en: 'El Charco del Ingenio botanical garden' },
  { k: 'termales', min: 20, cat: 'naturaleza', es: 'Aguas termales', en: 'Hot springs' },
  { k: 'vinedos', min: 25, cat: 'cultura', es: 'Viñedos de la región', en: 'Regional vineyards' },
  { k: 'qro', min: 75, cat: 'aeropuerto', es: 'Aeropuerto de Querétaro (QRO)', en: 'Querétaro Airport (QRO)' },
  { k: 'bjx', min: 90, cat: 'aeropuerto', es: 'Aeropuerto del Bajío (BJX)', en: 'Bajío Airport (BJX)' },
];

// ---- ¿Que tan rapido puede ser tuya? -------------------------------------
// Duraciones en dias: EJEMPLO. Se sustituyen con los tiempos reales del notario y de ventas.
const S = (k, days, es, en, des, den) => ({ k, days, t: { es, en }, d: { es: des, en: den } });
const COMMON = [
  S('contacto', 0, 'Nos escribes', 'You reach out', 'Respondemos el mismo día, en español o en inglés.', 'We answer the same day, in Spanish or English.'),
  S('video', 1, 'Videollamada', 'Video call', 'Treinta minutos con un asesor: precios, planos y dudas.', 'Thirty minutes with an advisor: prices, floor plans, questions.'),
  S('visita', 3, 'Visita o recorrido virtual', 'Visit or virtual tour', 'En persona o en vivo desde tu teléfono.', 'In person or live from your phone.'),
  S('apartado', 2, 'Apartado', 'Reservation', 'Reservas la propiedad y se congela el precio.', 'You reserve the property and the price is locked.'),
  S('legal', 10, 'Revisión legal y contrato', 'Legal review and contract', 'Tu notario revisa documentos; firmamos la promesa de compraventa.', 'Your notary reviews the documents; we sign the purchase agreement.'),
  S('firma', 20, 'Firma ante notario', 'Closing at the notary', 'Escritura a tu nombre.', 'The deed is issued in your name.'),
];
export const TIMELINES = {
  inmediata: [...COMMON, S('llaves', 5, 'Entrega de llaves', 'Keys in hand', 'Te mudas.', 'You move in.')],
  terreno: [...COMMON,
    S('proyecto', 45, 'Proyecto y permiso de construcción', 'Design and building permit', 'Eliges uno de tres modelos o traes tu proyecto.', 'Pick one of three models or bring your own design.'),
    S('obra', 300, 'Construcción', 'Construction', 'Con tu constructor o con nosotros.', 'With your builder or with us.'),
    S('llaves', 5, 'Tu casa lista', 'Your home is ready', 'Te mudas.', 'You move in.')],
  preventa: [...COMMON,
    S('obra', 300, 'Construcción', 'Construction', 'Avances mensuales con fotos y video.', 'Monthly progress with photos and video.'),
    S('llaves', 5, 'Entrega de llaves', 'Keys in hand', 'Te mudas.', 'You move in.')],
};
export const FOREIGN_STEP = S('extranjero', 20, 'Trámite para compradores extranjeros', 'Paperwork for foreign buyers', 'Te acompañamos con el permiso y el notario. Sujeto a confirmación notarial.', 'We guide you through the permit and the notary. Subject to notary confirmation.');

export const FAQ = [
  { q: { es: '¿Puedo comprar si soy extranjero?', en: 'Can I buy as a foreigner?' },
    a: { es: 'Sí. Compradores de Estados Unidos y Canadá adquieren propiedades en San Miguel de Allende todos los años. Te acompañamos en el trámite con el notario y en tu idioma. Cada caso queda sujeto a confirmación notarial.', en: 'Yes. Buyers from the United States and Canada purchase property in San Miguel de Allende every year. We guide you through the notary process in your language. Each case is subject to notary confirmation.' } },
  { q: { es: '¿Qué tan rápido puedo tener mi propiedad?', en: 'How fast can the property be mine?' },
    a: { es: 'Un departamento listo para entrega puede ser tuyo en unas seis semanas desde la primera videollamada. Cada propiedad muestra su propia línea de tiempo.', en: 'A move-in ready apartment can be yours in about six weeks from the first video call. Every property shows its own timeline.' } },
  { q: { es: '¿Los precios publicados son reales?', en: 'Are the published prices real?' },
    a: { es: 'Sí. Publicamos precio, superficie y estatus de cada propiedad. Si una unidad se aparta o se vende, el sitio lo refleja.', en: 'Yes. We publish price, area and status for every property. When a unit is reserved or sold, the site shows it.' } },
  { q: { es: '¿Qué tan lejos está del Centro?', en: 'How far is it from Centro?' },
    a: { es: 'Punta del Cielo y Terraviva están a cinco minutos en auto y veinte caminando del Centro Histórico, frente al Club de Golf Malanquín.', en: 'Punta del Cielo and Terraviva are a five minute drive or a twenty minute walk from the Historic Center, facing the Malanquín Golf Club.' } },
  { q: { es: '¿Puedo pagar a meses?', en: 'Are payment plans available?' },
    a: { es: 'Sí, hay planes de pago a meses sin intereses. En cada propiedad puedes simular tu enganche y tus mensualidades.', en: 'Yes, interest-free monthly payment plans are available. On each property you can simulate your down payment and monthly installments.' } },
  { q: { es: '¿Puedo construir mi casa en un terreno de Terraviva?', en: 'Can I build my house on a Terraviva lot?' },
    a: { es: 'Sí. Eliges entre tres modelos, traes a tu propio constructor o la construimos por ti.', en: 'Yes. Choose one of three models, bring your own builder or let us build it for you.' } },
];
