// Capa de datos compartida entre el sitio publico y el area de manejo.
// Todo vive en localStorage del navegador (prototipo). En produccion esto es una base de datos.
import { SEED, FX, TYPES, STATUS, DELIVERY, PROJECTS } from './data.js';

const K = (k) => `ism.${k}`;
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(K(k))) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch { /* sin almacenamiento: el sitio sigue funcionando */ } };

// ---- Preferencias --------------------------------------------------------
export const lang = () => read('lang', (navigator.language || 'es').startsWith('en') ? 'en' : 'es');
export const setLang = (l) => { write('lang', l); location.reload(); };
export const cur = () => read('cur', lang() === 'en' ? 'USD' : 'MXN');
export const setCur = (c) => { write('cur', c); location.reload(); };
export const L = (o) => (o == null ? '' : typeof o === 'string' ? o : o[lang()] ?? o.es ?? '');

// ---- Formato (es-MX / en-US) --------------------------------------------
const nf = (n, d = 0) => new Intl.NumberFormat(lang() === 'en' ? 'en-US' : 'es-MX', { maximumFractionDigits: d, minimumFractionDigits: 0 }).format(n);
export const fmtNum = nf;
export const fmtArea = (m2) => (m2 == null ? '' : `${nf(m2, 1)} m²`);
export const toCur = (mxn) => (cur() === 'USD' ? mxn / FX : mxn);
export const fmtPrice = (mxn, c = cur()) => `$${nf(c === 'USD' ? Math.round(mxn / FX / 100) * 100 : mxn)} ${c}`;
export const fmtShort = (mxn, c = cur()) => {
  const v = c === 'USD' ? mxn / FX : mxn;
  return v >= 1e6 ? `$${nf(v / 1e6, 2)} M` : `$${nf(v / 1e3)} k`;
};
export const fmtDate = (ts) => new Intl.DateTimeFormat(lang() === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts));

// ---- Propiedades: semilla + cambios hechos en el area de manejo ----------
// Forcing function: precio y estatus solo se editan en un lugar (overrides) y todo lo demas lee de ahi.
export function properties() {
  const ov = read('overrides', {});
  const added = read('added', []);
  return [...SEED, ...added].map((p) => ({ ...p, ...(ov[p.id] || {}) })).filter((p) => !p.deleted);
}
export const property = (id) => properties().find((p) => p.id === id);
export const project = (id) => PROJECTS.find((p) => p.id === id);
export function updateProperty(id, patch) { const ov = read('overrides', {}); ov[id] = { ...(ov[id] || {}), ...patch }; write('overrides', ov); }
export function addProperty(p) {
  const added = read('added', []);
  const id = `ind-${Date.now().toString(36)}`;
  added.push({ id, project: null, status: 'disponible', delivery: 'inmediata', deliveryMonths: 0, parking: 0, images: [], planCount: 0, example: false, ...p });
  write('added', added); return id;
}
export const title = (p) => (p.title ? L(p.title) : p.type === 'terreno' ? `${L(TYPES.terreno)} ${p.model}` : `${p.model}`);
export const subtitle = (p) => [L(TYPES[p.type]), L(p.level), project(p.project)?.name || L({ es: 'Propiedad individual', en: 'Individual property' })].filter(Boolean).join(' · ');
export const labels = { TYPES, STATUS, DELIVERY };

// Busqueda. Todos los filtros son opcionales; precios en MXN.
export function search(f = {}) {
  let r = properties().filter((p) => (f.includeSold ? true : p.status !== 'vendido'));
  if (f.type?.length) r = r.filter((p) => [].concat(f.type).includes(p.type));
  if (f.project) r = r.filter((p) => p.project === f.project);
  if (f.min) r = r.filter((p) => p.price >= +f.min);
  if (f.max) r = r.filter((p) => p.price <= +f.max);
  if (f.beds) r = r.filter((p) => p.beds >= +f.beds);
  if (f.baths) r = r.filter((p) => p.baths >= +f.baths);
  if (f.delivery) r = r.filter((p) => p.delivery === f.delivery);
  if (f.minArea) r = r.filter((p) => (p.built || p.lot || 0) >= +f.minArea);
  if (f.onlyAvailable) r = r.filter((p) => p.status === 'disponible');
  const by = {
    relevancia: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.status === 'disponible' ? 0 : 1) - (b.status === 'disponible' ? 0 : 1) || (a.type === 'terreno' ? 1 : 0) - (b.type === 'terreno' ? 1 : 0) || a.price - b.price,
    precio_asc: (a, b) => a.price - b.price,
    precio_desc: (a, b) => b.price - a.price,
    area_desc: (a, b) => (b.built || b.lot || 0) - (a.built || a.lot || 0),
  };
  return r.sort(by[f.sort] || by.relevancia);
}

// ---- Favoritos y comparador ---------------------------------------------
export const favs = () => read('favs', []);
export function toggleFav(id) { const f = favs(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); write('favs', f); track('favorito', { id, on: i < 0 }); return i < 0; }
export const compare = () => read('compare', []);
export function toggleCompare(id) { let c = compare(); const i = c.indexOf(id); if (i < 0) { if (c.length >= 3) c = c.slice(1); c.push(id); } else c.splice(i, 1); write('compare', c); return c; }

// ---- Eventos (analitica propia) -----------------------------------------
// tipos: vista_pagina, vista_propiedad, busqueda, favorito, inicio_contacto, lead
export function track(type, data = {}) {
  const ev = read('events', []);
  ev.push({ t: Date.now(), type, ...data, lang: lang(), path: location.pathname });
  write('events', ev.slice(-9000));
}
export const events = () => read('events', []);

// ---- Prospectos ----------------------------------------------------------
export const STAGES = [
  { k: 'nuevo', es: 'Nuevo', en: 'New' },
  { k: 'contactado', es: 'Contactado', en: 'Contacted' },
  { k: 'videollamada', es: 'Videollamada', en: 'Video call' },
  { k: 'visita', es: 'Visita', en: 'Visit' },
  { k: 'apartado', es: 'Apartado', en: 'Reserved' },
  { k: 'venta', es: 'Venta', en: 'Sale' },
  { k: 'perdido', es: 'Perdido', en: 'Lost' },
];
export const BUDGETS = [
  { k: 'b1', min: 0, max: 2500000, es: 'Hasta $2.5 M MXN', en: 'Up to $130k USD' },
  { k: 'b2', min: 2500000, max: 4500000, es: '$2.5 a $4.5 M MXN', en: '$130k to $235k USD' },
  { k: 'b3', min: 4500000, max: 7000000, es: '$4.5 a $7 M MXN', en: '$235k to $370k USD' },
  { k: 'b4', min: 7000000, max: 1e12, es: 'Más de $7 M MXN', en: 'Over $370k USD' },
];
export const WHEN = [
  { k: 'ya', pts: 40, es: 'En los próximos 3 meses', en: 'Within 3 months' },
  { k: '6m', pts: 25, es: 'En 3 a 6 meses', en: 'In 3 to 6 months' },
  { k: '12m', pts: 10, es: 'En 6 a 12 meses', en: 'In 6 to 12 months' },
  { k: 'explorando', pts: 0, es: 'Solo estoy explorando', en: 'Just exploring' },
];
export const PAY = [
  { k: 'contado', pts: 30, es: 'De contado', en: 'Cash' },
  { k: 'plan', pts: 20, es: 'Plan de pagos del desarrollador', en: 'Developer payment plan' },
  { k: 'credito', pts: 15, es: 'Crédito bancario', en: 'Bank loan' },
  { k: 'nose', pts: 5, es: 'Todavía no lo sé', en: 'Not sure yet' },
];
// Calificacion del prospecto: 0 a 100. A = llamar hoy, B = dar seguimiento, C = nutrir con contenido.
export function scoreLead(l) {
  let s = (WHEN.find((w) => w.k === l.when)?.pts || 0) + (PAY.find((p) => p.k === l.pay)?.pts || 0);
  const p = l.propertyId && property(l.propertyId); const b = BUDGETS.find((x) => x.k === l.budget);
  if (b && p) s += p.price <= b.max ? 20 : p.price <= b.max * 1.15 ? 8 : 0; else if (b) s += 10;
  if (l.intent === 'videollamada' || l.intent === 'visita') s += 10;
  s = Math.min(100, s);
  return { score: s, grade: s >= 70 ? 'A' : s >= 40 ? 'B' : 'C' };
}
export const leads = () => read('leads', []);
export function addLead(l) {
  const all = leads();
  const lead = { id: `L${Date.now().toString(36)}`, t: Date.now(), stage: 'nuevo', source: read('source', 'directo'), lang: lang(), notes: [], ...l };
  Object.assign(lead, scoreLead(lead));
  all.push(lead); write('leads', all); track('lead', { id: lead.id, propertyId: lead.propertyId, grade: lead.grade });
  return lead;
}
export function updateLead(id, patch) { const all = leads(); const i = all.findIndex((l) => l.id === id); if (i >= 0) { all[i] = { ...all[i], ...patch }; write('leads', all); } }
// Citas: cada prospecto lleva appts = [{ n, t, kind: 'videollamada' | 'visita' }]. No se borran, solo se agregan.
export function addAppt(id, kind = 'videollamada', t = Date.now()) {
  const l = leads().find((x) => x.id === id); if (!l) return null;
  const appts = [...(l.appts || []), { n: (l.appts?.length || 0) + 1, t, kind }];
  updateLead(id, { appts }); return appts;
}
export const resetDemo =() => { ['overrides', 'added', 'leads', 'events', 'favs', 'compare', 'seeded'].forEach((k) => localStorage.removeItem(K(k))); };

// Fuente de trafico: ?utm_source=... se guarda una vez por visitante.
(() => { const u = new URLSearchParams(location.search).get('utm_source'); if (u) write('source', u); else if (!read('source') && document.referrer && !document.referrer.includes(location.host)) write('source', new URL(document.referrer).hostname); })();

// ---- Historia de ejemplo para el area de manejo --------------------------
// Genera 30 dias de visitas y prospectos ficticios una sola vez, para que el tablero no arranque vacio.
const SEED_V = 3; // subir cuando cambien los ids del inventario: regenera la historia de ejemplo
export function seedDemoHistory() {
  if (read('seeded', 0) === SEED_V) return;
  write('events', read('events', []).filter((e) => !e.demo));
  write('leads', read('leads', []).filter((l) => !l.demo));
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const props = SEED.filter((p) => p.status !== 'vendido');
  const hot = props.filter((p) => p.project === 'punta-del-cielo').concat(props.slice(0, 6));
  const sources = ['google', 'google', 'google', 'chatgpt', 'instagram', 'facebook', 'directo', 'directo', 'broker', 'perplexity'];
  const names = ['Susan Miller', 'Robert Hayes', 'Mariana Ortega', 'Carlos Rentería', 'Linda Brooks', 'Jorge Salinas', 'Patricia Vogel', 'Andrés Lozano', 'Karen Whitfield', 'Fernanda Ruiz', 'Tom Becker', 'Daniela Paz', 'Michael Stone', 'Lucía Herrera', 'Nancy Cole', 'Ricardo Peña', 'Emily Ward', 'Sofía Cantú', 'David Ross', 'Paola Méndez', 'James Carter', 'Valeria Ibarra', 'Helen Fox', 'Óscar Treviño'];
  const ev = []; const ld = []; const now = Date.now(); const DAY = 864e5;
  for (let d = 30; d >= 0; d--) {
    const visits = 38 + Math.floor(rnd() * 46) + (30 - d);
    for (let v = 0; v < visits; v++) {
      const t = now - d * DAY - Math.floor(rnd() * DAY); const src = pick(sources); const lg = rnd() < 0.58 ? 'en' : 'es';
      ev.push({ t, type: 'vista_pagina', path: '/', lang: lg, source: src, demo: 1 });
      if (rnd() < 0.55) ev.push({ t: t + 4e4, type: 'busqueda', lang: lg, source: src, demo: 1, tipo: pick(['departamento', 'departamento', 'casa', 'terreno']), max: pick([3000000, 4500000, 4500000, 6000000, 8000000]) });
      if (rnd() < 0.42) { const p = pick(hot); ev.push({ t: t + 9e4, type: 'vista_propiedad', id: p.id, lang: lg, source: src, demo: 1 });
        if (rnd() < 0.16) ev.push({ t: t + 15e4, type: 'inicio_contacto', id: p.id, lang: lg, source: src, demo: 1 }); }
    }
    const nl = rnd() < 0.75 ? 1 + Math.floor(rnd() * 3) : 0;
    for (let i = 0; i < nl; i++) {
      const p = pick(hot); const name = pick(names); const en = /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(name) && !/[áéíóúñ]/i.test(name) && rnd() < 0.8;
      const l = { id: `D${d}-${i}`, t: now - d * DAY - Math.floor(rnd() * DAY), name, email: `${name.toLowerCase().normalize('NFD').replace(/[^a-z ]/g, '').replace(' ', '.')}@correo.test`, phone: en ? '+1 512 555 01' + (10 + Math.floor(rnd() * 89)) : '+52 55 5555 01' + (10 + Math.floor(rnd() * 89)),
        propertyId: p.id, intent: pick(['videollamada', 'videollamada', 'visita', 'precios']), budget: pick(['b2', 'b3', 'b3', 'b4', 'b1']), when: pick(['ya', 'ya', '6m', '12m', 'explorando']), pay: pick(['contado', 'contado', 'plan', 'credito', 'nose']),
        lang: en ? 'en' : 'es', source: pick(sources), notes: [], demo: 1, respMin: 5 + Math.floor(rnd() * 240) };
      Object.assign(l, scoreLead(l));
      const age = d; const r = rnd();
      l.stage = age < 2 ? 'nuevo' : r < 0.22 ? 'perdido' : r < 0.45 ? 'contactado' : r < 0.67 ? 'videollamada' : r < 0.83 ? 'visita' : r < 0.93 ? 'apartado' : 'venta';
      if (l.grade === 'C' && l.stage !== 'nuevo') l.stage = rnd() < 0.6 ? 'perdido' : 'contactado';
      // Citas de ejemplo: la 1a siempre es videollamada; las siguientes pueden ser visita en persona.
      const s = l.stage;
      const n = s === 'videollamada' ? (rnd() < 0.35 ? 2 : 1) : s === 'visita' ? (rnd() < 0.5 ? 3 : 2)
        : s === 'apartado' || s === 'venta' ? (rnd() < 0.55 ? 3 : rnd() < 0.5 ? 2 : 4) : s === 'perdido' ? (rnd() < 0.45 ? 0 : rnd() < 0.6 ? 1 : 2) : 0;
      const inPerson = s === 'visita' || s === 'apartado' || s === 'venta' || (s === 'perdido' && n === 2 && rnd() < 0.3);
      l.appts = []; let at = l.t + (1 + rnd() * 71) * 36e5;
      for (let k = 1; k <= n && at < now; k++) { l.appts.push({ n: k, t: Math.round(at), kind: k > 1 && inPerson && k === n ? 'visita' : k > 1 && inPerson && rnd() < 0.3 ? 'visita' : 'videollamada' }); at += (2 + rnd() * 7) * DAY; }
      if (s === 'venta') l.closedT = Math.min(now, Math.round(at + rnd() * 6 * DAY));
      ld.push(l); ev.push({ t: l.t, type: 'lead', id: l.id, propertyId: p.id, grade: l.grade, source: l.source, lang: l.lang, demo: 1 });
    }
  }
  write('events', [...ev, ...read('events', [])].sort((a, b) => a.t - b.t).slice(-9000));
  write('leads', [...ld, ...read('leads', [])]);
  write('seeded', SEED_V);
}
