// Piezas compartidas de las paginas de desarrollo y de la guia "Vivir en San Miguel".
// Solo lee de store.js / data.js a traves de ui.js; no modifica nada compartido.
import { $, $$, h, T, icon, countUp, S, img, COMPANY } from './ui.js';
import { AMENITIES, NEARBY } from './data.js';

const { L } = S;
export const BASE = 'https://www.inmobiliariasanmiguel.mx';
export const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// Ejecuta fn una vez, cuando el elemento entra en pantalla
export function onView(el, fn, threshold = 0.3) {
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
}

// Inventario de un desarrollo. Incluye apartados y vendidos para poder mostrar el estatus.
export function inventory(projectId, keep = () => true) {
  const all = S.properties().filter((p) => p.project === projectId && keep(p));
  const avail = all.filter((p) => p.status === 'disponible');
  const prices = avail.map((p) => p.price);
  return { all, avail, from: prices.length ? Math.min(...prices) : null, to: prices.length ? Math.max(...prices) : null };
}

// "1 lote" / "3 lotes" en el idioma activo
export const plural = (n, es1, esN, en1, enN) => `${S.fmtNum(n)} ${n === 1 ? T(es1, en1) : T(esN, enN)}`;
// "96–100" o "96" si todos son iguales
export function range(vals, f = S.fmtNum) {
  const v = vals.filter((x) => x != null); if (!v.length) return '';
  const lo = Math.min(...v), hi = Math.max(...v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}
export const STATE = { disponible: 'ok', apartado: 'hold', vendido: 'sold' };

// ---- Portada: precio desde y unidades disponibles ------------------------
export function heroMeta(el, inv, [es1, esN, en1, enN]) {
  const n = inv.avail.length;
  el.innerHTML = (inv.from != null ? `<div><b class="num">${S.fmtShort(inv.from)}</b>${T('desde', 'from')} · ${S.cur()}</div>` : '')
    + `<div><b class="num" data-n="${n}">${S.fmtNum(n)}</b>${n === 1 ? T(es1, en1) : T(esN, enN)}</div>`;
  const c = $('[data-n]', el); if (!reduced()) { c.textContent = '0'; setTimeout(() => countUp(c, n, 1400), 500); }
}

// ---- Cifras grandes del desarrollo (data.js: project.facts) ---------------
export function facts(el, p) {
  el.innerHTML = p.facts.map((f, i) => {
    const m = /^(\d+)(\D*)$/.exec(f.v);
    return `<div class="reveal" style="--d:${i * 0.1}s"><div class="stat__v">${m ? `<span data-n="${m[1]}">0</span>${m[2]}` : f.v}</div><p class="stat__l">${L(f.l)}</p></div>`;
  }).join('');
  onView(el, () => $$('[data-n]', el).forEach((n) => countUp(n, +n.dataset.n)), 0.4);
}

// ---- Amenidades como mosaico ---------------------------------------------
const GROUP = {
  casaclub: ['Comunidad', 'Community'], restaurante: ['Comunidad', 'Community'],
  albercas: ['Agua', 'Water'], alberca: ['Agua', 'Water'], jacuzzis: ['Agua', 'Water'],
  gym: ['Wellness', 'Wellness'], vapor: ['Wellness', 'Wellness'], masaje: ['Wellness', 'Wellness'],
  padel: ['Deporte', 'Sport'], juegos: ['Familia', 'Family'], seguridad: ['Tranquilidad', 'Peace of mind'],
  huerto: ['Tierra', 'Land'], vistas: ['Paisaje', 'Landscape'],
};
// photos: { clave: [uri de PH, 'big' | 'wide' | ''] } en el orden en que se muestran.
export function renderAmenities(el, project, photos) {
  const keys = project.amenities;
  const merged = keys.includes('casaclub') && keys.includes('restaurante');
  const used = new Set([...Object.keys(photos), ...(merged ? ['restaurante'] : [])]);
  const tiles = [
    ...Object.entries(photos).filter(([k]) => keys.includes(k)).map(([k, [uri, size]]) => ({ k, uri, size })),
    ...keys.filter((k) => !used.has(k) && k !== 'seguridad').map((k) => ({ k })),
    ...(keys.includes('seguridad') ? [{ k: 'seguridad', size: 'band' }] : []),
  ];
  el.innerHTML = tiles.map((t, i) => {
    const big = t.size === 'big';
    const sub = t.k === 'casaclub' && merged ? `<p class="amen__s">${L(AMENITIES.restaurante)}</p>` : '';
    // Sin foto: fila compacta (nombre y categoria en una linea). La seguridad cierra la reticula como banda.
    if (t.size === 'band') return `<div class="amen__t amen__t--band reveal"><span class="amen__ico">${icon('shield', 26)}</span>
      <div><h3 class="amen__n">${L(AMENITIES[t.k])}</h3><p class="amen__s">${T('Caseta, acceso controlado y vigilancia todo el día.', 'Gatehouse, controlled access and security around the clock.')}</p></div></div>`;
    if (!t.uri) return `<div class="amen__t amen__t--mini reveal" style="--d:${(i % 4) * 0.08}s"><h3 class="amen__n">${L(AMENITIES[t.k])}</h3><p class="amen__k">${T(...GROUP[t.k])}</p></div>`;
    return `<div class="amen__t ${t.uri ? 'amen__t--photo' : ''} ${t.size ? `amen__t--${t.size}` : ''} reveal" style="--d:${(i % 4) * 0.08}s">
      ${t.uri ? `<img src="${img(t.uri, big ? 1200 : 900, big ? 1200 : 640)}" alt="${L(AMENITIES[t.k])}, ${project.name}" loading="lazy" decoding="async">` : ''}
      <p class="amen__k">${T(...GROUP[t.k])}</p><div><h3 class="amen__n">${L(AMENITIES[t.k])}</h3>${sub}</div></div>`;
  }).join('');
}

// ---- Galeria viva: fundido lento, controles y gesto de deslizar -----------
const PAUSE = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M7.5 5v10M12.5 5v10"/></svg>';
const PLAY = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M7 5l8 5-8 5z"/></svg>';
export function gallery(root, uris, alt) {
  const DUR = 6000; const n = uris.length; const pad = (x) => String(x).padStart(2, '0');
  root.classList.add('gal'); root.style.setProperty('--dur', `${DUR}ms`);
  root.innerHTML = `<div class="gal__stage">${uris.map((u, i) => `<img src="${img(u, 1800, 1013)}" alt="${alt(i)}" loading="lazy" decoding="async" draggable="false"${i === 0 ? ' class="is-on"' : ''}>`).join('')}</div>
    <div class="gal__bar"><div class="gal__segs">${uris.map((_, i) => `<button type="button" data-i="${i}" aria-label="${T('Foto', 'Photo')} ${i + 1}" aria-current="${i === 0}"><i></i></button>`).join('')}</div>
    <div class="gal__ctl"><span class="gal__count" aria-live="polite"></span>
      <button class="icon-btn" type="button" data-g="-1" aria-label="${T('Foto anterior', 'Previous photo')}"><span style="display:inline-grid;transform:scaleX(-1)">${icon('arrow')}</span></button>
      <button class="icon-btn" type="button" data-g="play"></button>
      <button class="icon-btn" type="button" data-g="1" aria-label="${T('Foto siguiente', 'Next photo')}">${icon('arrow')}</button></div></div>`;
  const imgs = $$('.gal__stage img', root); const segs = $$('.gal__segs button', root); const play = $('[data-g="play"]', root);
  let i = 0; let t; let playing = !reduced(); let seen = false;
  function show(k) {
    i = (k + n) % n;
    imgs.forEach((im, j) => im.classList.toggle('is-on', j === i));
    segs.forEach((s, j) => { s.setAttribute('aria-current', j === i); s.classList.toggle('is-past', j < i); });
    $('.gal__count', root).textContent = `${pad(i + 1)} / ${pad(n)}`;
    const on = playing && seen; root.classList.toggle('is-paused', !on);
    clearTimeout(t); if (on) t = setTimeout(() => show(i + 1), DUR);
  }
  function setPlay(on) { playing = on; play.innerHTML = on ? PAUSE : PLAY; play.setAttribute('aria-label', on ? T('Pausar fotos', 'Pause photos') : T('Reproducir fotos', 'Play photos')); show(i); }
  root.addEventListener('click', (e) => {
    const s = e.target.closest('[data-i]'); if (s) return show(+s.dataset.i);
    const g = e.target.closest('[data-g]')?.dataset.g; if (!g) return;
    if (g === 'play') setPlay(!playing); else show(i + +g);
  });
  let x0 = null; const stage = $('.gal__stage', root);
  stage.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  stage.addEventListener('pointerup', (e) => { if (x0 != null && Math.abs(e.clientX - x0) > 40) show(i + (e.clientX < x0 ? 1 : -1)); x0 = null; });
  new IntersectionObserver((es) => { seen = es[0].isIntersecting; show(i); }, { threshold: 0.35 }).observe(root);
  setPlay(playing);
}

// ---- Todo a minutos ------------------------------------------------------
export function nearBars(el, list = NEARBY.slice(0, 9)) {
  const max = Math.max(...list.map((n) => n.min));
  el.innerHTML = list.map((n, i) => `<div class="bar" style="--w:${Math.max(6, (n.min / max) * 100)};--d:${i * 0.07}s"><span class="bar__name">${L(n)}</span><span class="bar__min">${n.min}<small>min</small></span></div>`).join('')
    + `<p class="demo-note" style="margin-top:16px">${T('Tiempos en auto. Centro y club de golf según el desarrollador; el resto son estimados de ejemplo.', 'Driving times. Centro and golf club per the developer; the rest are sample estimates.')}</p>`;
}

// ---- Barra fija de contacto en movil ---------------------------------------
export function dock(inv) {
  document.body.classList.add('has-dock');
  const d = h(`<div class="dock">${inv.from != null ? `<div style="line-height:1.25"><span class="small muted">${T('Desde', 'From')}</span><br><b class="num">${S.fmtPrice(inv.from)}</b></div>` : '<span></span>'}
    <button class="btn btn--primary" data-contact data-intent="videollamada">${icon('video', 18)} ${T('Videollamada', 'Video call')}</button></div>`);
  document.body.append(d); return d;
}

// ---- Datos estructurados -------------------------------------------------
export function jsonld(obj) {
  const s = document.createElement('script'); s.type = 'application/ld+json';
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', ...obj }); document.head.append(s);
}
export function postal() {
  const parts = COMPANY.address.split(', ');
  return { '@type': 'PostalAddress', streetAddress: parts.slice(0, 2).join(', '), addressLocality: 'San Miguel de Allende', addressRegion: 'Guanajuato', postalCode: (COMPANY.address.match(/\b\d{5}\b/) || [''])[0], addressCountry: 'MX' };
}
export const aggregateOffer = (inv) => ({ '@type': 'AggregateOffer', priceCurrency: 'MXN', lowPrice: inv.from, highPrice: inv.to, offerCount: inv.avail.length, availability: 'https://schema.org/InStock', seller: { '@id': `${BASE}/#org` } });
export const amenityLd = (p) => p.amenities.map((k) => ({ '@type': 'LocationFeatureSpecification', name: L(AMENITIES[k]), value: true }));
