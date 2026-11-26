// Buscador de propiedades. El estado vive en la URL: cada busqueda se puede compartir.
// Errores humanos: min > max se invierte, "5" se entiende como 5 M, filtros sin sentido se desactivan
// y una combinacion sin resultados siempre ofrece ajustes de un toque.
import { mount, $, $$, h, T, icon, pcard, timeline, fmtTotal, countUp, toast, S, img, TYPES, STATUS, DELIVERY, ROOT } from './ui.js';
import { FX, PROJECTS } from './data.js';

const { L } = S;
const ORIGIN = 'https://www.inmobiliariasanmiguel.mx';
const PAGE = 12;
const TKEYS = Object.keys(TYPES);
const area = (p) => p.built || p.lot || 0;
const AREA_MAX = Math.max(100, Math.ceil(Math.max(0, ...S.properties().map(area)) / 50) * 50);
const SORTS = [
  ['relevancia', T('Relevancia', 'Relevance')],
  ['precio_asc', T('Precio: menor a mayor', 'Price: low to high')],
  ['precio_desc', T('Precio: mayor a menor', 'Price: high to low')],
  ['area_desc', T('Superficie: mayor a menor', 'Size: largest first')],
];
const SVG = (d, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICO = {
  sliders: SVG('<path d="M3 6h8M15 6h2M3 14h2M9 14h8"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="14" r="2"/>'),
  caret: SVG('<path d="M5 8l5 5 5-5"/>', 14),
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const plural = (n) => (n === 1 ? T('propiedad', 'property') : T('propiedades', 'properties'));
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Dinero: se muestra en la moneda del visitante y se filtra en MXN ----
const toMXN = (v) => Math.round(S.cur() === 'USD' ? v * FX : v);
const stepFor = (v) => (S.cur() === 'USD' ? (v < 150000 ? 10000 : 25000) : (v < 2.5e6 ? 250000 : 500000));
const nice = (mxn) => { const v = S.toCur(mxn); const st = stepFor(v); return toMXN(Math.max(st, Math.round(v / st) * st)); };
const niceUp = (mxn) => { const v = S.toCur(mxn); const st = stepFor(v); return toMXN(Math.ceil(v / st) * st); };
const short = (mxn) => S.fmtShort(mxn);
const rangeLabel = (min, max) => (min && max ? `${short(min)} – ${short(max)} ${S.cur()}`
  : max ? T(`Hasta ${short(max)} ${S.cur()}`, `Up to ${short(max)} ${S.cur()}`)
  : T(`Desde ${short(min)} ${S.cur()}`, `From ${short(min)} ${S.cur()}`));
function parseMoney(raw) {
  const s = String(raw).toLowerCase().replace(/mxn|usd|\$|\s|,/g, '');
  let v = parseFloat(s.replace(/[^\d.]/g, ''));
  if (!s || !Number.isFinite(v) || v <= 0) return 0;
  if (/m/.test(s)) v *= 1e6;
  else if (/k/.test(s)) v *= 1e3;
  else if (v < 1000) v *= S.cur() === 'USD' ? 1e3 : 1e6; // "5" = 5 millones de pesos; "300" = 300 mil dolares
  return toMXN(v);
}

// ---- Estado ----------------------------------------------------------------
const EMPTY = () => ({ type: [], min: 0, max: 0, beds: 0, baths: 0, project: '', delivery: '', minArea: 0, avail: false, favs: false, q: '', sort: 'relevancia' });
const clone = (s) => ({ ...s, type: [...s.type] });
const lotsOnly = (st) => st.type.length === 1 && st.type[0] === 'terreno';

function norm(st) {
  st.type = [...new Set(st.type)].filter((t) => TKEYS.includes(t));
  st.min = Math.max(0, Math.round(+st.min || 0));
  st.max = Math.max(0, Math.round(+st.max || 0));
  if (st.min && st.max && st.min > st.max) [st.min, st.max] = [st.max, st.min];
  st.beds = Math.min(4, Math.max(0, Math.round(+st.beds || 0)));
  st.baths = Math.min(4, Math.max(0, Math.round(+st.baths || 0)));
  if (lotsOnly(st)) { st.beds = 0; st.baths = 0; }
  if (!PROJECTS.some((p) => p.id === st.project)) st.project = '';
  if (!DELIVERY[st.delivery]) st.delivery = '';
  st.minArea = Math.min(AREA_MAX, Math.max(0, Math.round((+st.minArea || 0) / 10) * 10));
  if (!SORTS.some(([k]) => k === st.sort)) st.sort = 'relevancia';
  return st;
}

function fromURL() {
  const u = new URLSearchParams(location.search); const st = EMPTY();
  const n = (k) => { const v = parseFloat(String(u.get(k) ?? '').replace(/[^\d.]/g, '')); return Number.isFinite(v) && v > 0 ? v : 0; };
  st.type = u.getAll('type').flatMap((v) => v.split(',')).map((v) => v.trim().toLowerCase());
  Object.assign(st, { min: n('min'), max: n('max'), beds: n('beds'), baths: n('baths'), minArea: n('area') });
  st.project = u.get('project') || ''; st.delivery = u.get('delivery') || '';
  st.avail = u.get('avail') === '1'; st.favs = u.get('favs') === '1';
  st.q = (u.get('q') || '').trim().slice(0, 80); st.sort = u.get('sort') || 'relevancia';
  return norm(st);
}

function writeURL() {
  const u = new URLSearchParams();
  if (F.type.length) u.set('type', F.type.join(','));
  [['min', F.min], ['max', F.max], ['beds', F.beds], ['baths', F.baths], ['project', F.project], ['delivery', F.delivery], ['area', F.minArea], ['q', F.q]].forEach(([k, v]) => v && u.set(k, v));
  if (F.avail) u.set('avail', '1');
  if (F.favs) u.set('favs', '1');
  if (F.sort !== 'relevancia') u.set('sort', F.sort);
  const qs = u.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function run(st) {
  let r = S.search({ type: st.type, min: st.min, max: st.max, beds: st.beds, baths: st.baths, project: st.project, delivery: st.delivery, minArea: st.minArea, onlyAvailable: st.avail, sort: st.sort, includeSold: st.favs });
  if (st.favs) { const f = S.favs(); r = r.filter((p) => f.includes(p.id)); }
  if (st.q) { const q = fold(st.q); r = r.filter((p) => fold(`${S.title(p)} ${S.subtitle(p)} ${p.model || ''}`).includes(q)); }
  return r;
}

// Filtros activos, en el orden en que se leen
const moreCount = (st) => [st.project, st.delivery, st.minArea, st.avail].filter(Boolean).length;
const areaLabel = (v) => (v ? T(`Desde ${S.fmtArea(v)}`, `From ${S.fmtArea(v)}`) : T('Cualquier superficie', 'Any size'));
function active(st) {
  const a = st.type.map((t) => ({ k: `type:${t}`, l: L(TYPES[t].pl) }));
  if (st.min || st.max) a.push({ k: 'price', l: rangeLabel(st.min, st.max) });
  if (st.beds) a.push({ k: 'beds', l: T(`${st.beds}+ recámaras`, `${st.beds}+ bedrooms`) });
  if (st.baths) a.push({ k: 'baths', l: T(`${st.baths}+ baños`, `${st.baths}+ bathrooms`) });
  if (st.project) a.push({ k: 'project', l: S.project(st.project).name });
  if (st.delivery) a.push({ k: 'delivery', l: L(DELIVERY[st.delivery]) });
  if (st.minArea) a.push({ k: 'minArea', l: areaLabel(st.minArea) });
  if (st.avail) a.push({ k: 'avail', l: T('Solo disponibles', 'Available only') });
  if (st.favs) a.push({ k: 'favs', l: T('Mis favoritas', 'My favorites') });
  if (st.q) a.push({ k: 'q', l: `“${st.q}”` });
  return a;
}
function without(st, k) {
  const s = clone(st); const [key, v] = k.split(':');
  if (key === 'type') s.type = s.type.filter((t) => t !== v);
  else if (key === 'price') { s.min = 0; s.max = 0; }
  else if (key in s) s[key] = EMPTY()[key];
  return norm(s);
}

// Rangos sugeridos: escalones geometricos entre la mas barata y la mas cara del inventario que se esta viendo,
// redondeados en la moneda del visitante (asi los 43 terrenos no se comen los rangos de las casas)
function presets(st) {
  const pool = S.search({ type: st.type, project: st.project }).map((p) => p.price);
  if (pool.length < 4) return [];
  const lo = Math.min(...pool); const hi = Math.max(...pool);
  const cuts = [...new Set([1, 2, 3].map((k) => nice(lo * (hi / lo) ** (k / 4))))].filter((c) => c > lo && c < hi).sort((a, b) => a - b);
  if (!cuts.length) return [];
  const out = [{ min: 0, max: cuts[0] }];
  for (let i = 1; i < cuts.length; i++) out.push({ min: cuts[i - 1], max: cuts[i] });
  out.push({ min: cuts[cuts.length - 1], max: 0 });
  return out;
}

// ---- Piezas de filtro (se usan en el panel de escritorio y en la hoja de movil) ----
const chip = (f, v, label, on) => `<button type="button" class="chip" data-f="${f}" data-v="${v}" aria-pressed="${on}">${label}</button>`;
const fs = (legend, body) => `<fieldset class="fsec"><legend class="label">${legend}</legend>${body}</fieldset>`;
const na = () => `<p class="fhint" style="margin-top:0">${T('No aplica a terrenos.', 'Does not apply to lots.')}</p>`;
const SEC = {
  type: (st) => fs(T('Tipo', 'Type'), `<div class="opts">${TKEYS.map((k) => chip('type', k, L(TYPES[k].pl), st.type.includes(k))).join('')}</div>`),
  price: (st, x) => {
    const ps = presets(st); const ex = S.cur() === 'USD' ? '250k' : '3.5 M';
    return fs(`${T('Precio', 'Price')} · ${S.cur()}`, `${ps.length ? `<div class="opts">${ps.map((p) => chip('price', `${p.min}-${p.max}`, rangeLabel(p.min, p.max), st.min === p.min && st.max === p.max)).join('')}</div>` : ''}
      <div class="prange">${['min', 'max'].map((k) => `<div class="field"><label for="${x}-${k}">${k === 'min' ? T('Mínimo', 'Minimum') : T('Máximo', 'Maximum')}</label>
        <div class="money"><span>$</span><input class="input" id="${x}-${k}" data-f="${k}" inputmode="decimal" autocomplete="off" enterkeyhint="done" value="${st[k] ? S.fmtNum(Math.round(S.toCur(st[k]))) : ''}" placeholder="${k === 'min' ? T('Sin mínimo', 'No minimum') : T('Sin máximo', 'No maximum')}"><span>${S.cur()}</span></div></div>`).join('')}</div>
      <p class="fhint">${T(`Escribe ${ex} o la cifra completa. Si el mínimo queda arriba del máximo, los invertimos.`, `Type ${ex} or the full amount. If the minimum ends up above the maximum, we swap them.`)}</p>`);
  },
  beds: (st) => fs(T('Recámaras', 'Bedrooms'), lotsOnly(st) ? na() : `<div class="opts">${[0, 1, 2, 3, 4].map((n) => chip('beds', n, n ? `${n}+` : T('Cualquiera', 'Any'), st.beds === n)).join('')}</div>`),
  baths: (st) => fs(T('Baños', 'Bathrooms'), lotsOnly(st) ? na() : `<div class="opts">${[0, 1, 2, 3, 4].map((n) => chip('baths', n, n ? `${n}+` : T('Cualquiera', 'Any'), st.baths === n)).join('')}</div>`),
  more: (st, x) => fs(T('Desarrollo', 'Development'), `<div class="opts">${[['', T('Todos', 'All')], ...PROJECTS.map((p) => [p.id, p.name])].map(([v, l]) => chip('project', v, l, st.project === v)).join('')}</div>`)
    + fs(T('Entrega', 'Delivery'), `<div class="opts">${[['', T('Cualquiera', 'Any')], ...Object.entries(DELIVERY).map(([k, v]) => [k, L(v)])].map(([v, l]) => chip('delivery', v, l, st.delivery === v)).join('')}</div>`)
    + fs(T('Superficie mínima', 'Minimum size'), `<div class="frange"><output class="num" for="${x}-area" id="${x}-area-o">${areaLabel(st.minArea)}</output>
        <input type="range" id="${x}-area" data-f="area" min="0" max="${AREA_MAX}" step="10" value="${st.minArea}" style="--p:${(st.minArea / AREA_MAX) * 100}%" aria-label="${T('Superficie mínima', 'Minimum size')}" aria-valuetext="${areaLabel(st.minArea)}"></div>
        <p class="fhint">${T('Construcción en casas y departamentos; superficie del lote en terrenos.', 'Built area for homes; lot size for lots.')}</p>`)
    + fs(T('Disponibilidad', 'Availability'), `<label class="switch"><input type="checkbox" data-f="avail" ${st.avail ? 'checked' : ''}><i></i><span>${T('Solo disponibles, sin apartadas', 'Available only, hide reserved')}</span></label>`),
};

// Aplica un toque sobre un estado (el real o el borrador de la hoja)
function act(st, el) {
  const { f, v } = el.dataset;
  if (f === 'type') st.type = st.type.includes(v) ? st.type.filter((t) => t !== v) : [...st.type, v];
  else if (f === 'price') { const [a, b] = v.split('-').map(Number); const same = st.min === a && st.max === b; st.min = same ? 0 : a; st.max = same ? 0 : b; }
  else if (f === 'beds' || f === 'baths') st[f] = +v;
  else if (f === 'project' || f === 'delivery') st[f] = st[f] === v ? '' : v;
  else return false;
  return true;
}
function onField(st, el) {
  const f = el.dataset.f;
  if (f === 'min' || f === 'max') {
    st[f] = parseMoney(el.value);
    if (st.min && st.max && st.min > st.max) toast(T('Invertimos mínimo y máximo.', 'We swapped minimum and maximum.'));
    return true;
  }
  if (f === 'area') { st.minArea = +el.value || 0; return true; }
  if (f === 'avail') { st.avail = el.checked; return true; }
  return false;
}
function slide(el) { // etiqueta en vivo del deslizador
  const v = +el.value; const o = el.closest('.frange')?.querySelector('output');
  el.style.setProperty('--p', `${(v / AREA_MAX) * 100}%`); el.setAttribute('aria-valuetext', areaLabel(v)); if (o) o.textContent = areaLabel(v);
}
// Re-pinta sin perder el foco ni el scroll
function keep(root, fn) {
  const a = document.activeElement;
  const parts = a && a !== document.body && root.contains(a) ? ['data-f', 'data-v', 'data-clear', 'data-close-pop'].filter((k) => a.hasAttribute(k)).map((k) => `[${k}="${a.getAttribute(k)}"]`) : [];
  const sel = parts.length ? parts.join('') : null;
  const sc = root.scrollTop; fn(); root.scrollTop = sc;
  if (sel) $(sel, root)?.focus({ preventScroll: true });
}
function trap(root, e) {
  if (e.key !== 'Tab') return;
  const f = $$('button:not([disabled]), [href], input, select', root).filter((x) => x.offsetParent !== null);
  if (!f.length) return; const a = f[0]; const z = f[f.length - 1];
  if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
}

// ---- Montaje -----------------------------------------------------------------
mount({ current: 'propiedades' });
document.body.classList.add('has-dock');

let F = fromURL();
let RES = []; let shown = PAGE; let popKey = null; let draft = null; let trackT = 0;

const bar = $('#fbar');
bar.setAttribute('aria-label', T('Filtros de búsqueda', 'Search filters'));
bar.innerHTML = `<div class="wrap fbar__in">
  <button class="chip fbar__all" type="button" data-open-sheet aria-haspopup="dialog">${ICO.sliders}<span>${T('Filtros', 'Filters')}</span><b class="num" data-nfil></b></button>
  <div class="fbar__types" role="group" aria-label="${T('Tipo de propiedad', 'Property type')}">${TKEYS.map((k) => chip('type', k, L(TYPES[k].pl), false)).join('')}</div>
  <span class="fbar__sep" aria-hidden="true"></span>
  <div class="fbar__desk">${['price', 'beds', 'baths', 'more'].map((k) => `<button class="chip fbtn" type="button" data-pop="${k}" aria-expanded="false" aria-controls="fpop"><span></span>${ICO.caret}</button>`).join('')}</div>
  <div class="pop" id="fpop" role="dialog" aria-label="${T('Filtro', 'Filter')}" hidden></div>
</div>`;
$('#sort').innerHTML = SORTS.map(([k, l]) => `<option value="${k}">${l}</option>`).join('');
$('#sort').setAttribute('aria-label', T('Ordenar resultados', 'Sort results'));

function renderBar() {
  $$('[data-f="type"]', bar).forEach((b) => b.setAttribute('aria-pressed', F.type.includes(b.dataset.v)));
  const lab = {
    price: F.min || F.max ? rangeLabel(F.min, F.max) : T('Precio', 'Price'),
    beds: F.beds ? T(`${F.beds}+ recámaras`, `${F.beds}+ beds`) : T('Recámaras', 'Bedrooms'),
    baths: F.baths ? T(`${F.baths}+ baños`, `${F.baths}+ baths`) : T('Baños', 'Bathrooms'),
    more: moreCount(F) ? `${T('Más filtros', 'More filters')} · ${moreCount(F)}` : T('Más filtros', 'More filters'),
  };
  const set = { price: !!(F.min || F.max), beds: !!F.beds, baths: !!F.baths, more: !!moreCount(F) };
  $$('[data-pop]', bar).forEach((b) => {
    const k = b.dataset.pop; b.firstElementChild.textContent = lab[k]; b.classList.toggle('is-set', set[k]);
    const off = lotsOnly(F) && (k === 'beds' || k === 'baths'); b.disabled = off; b.title = off ? T('No aplica a terrenos', 'Does not apply to lots') : '';
  });
  $$('[data-nfil]').forEach((n) => { n.textContent = active(F).length || ''; });
  $('#sort').value = F.sort;
}

function renderHead() {
  const one = F.type.length === 1 ? F.type[0] : null; const pj = F.project && S.project(F.project);
  const t = F.favs ? T('Tus favoritas.', 'Your favorites.')
    : one ? T(`${L(TYPES[one].pl)} en venta.`, `${L(TYPES[one].pl)} for sale.`)
    : pj ? T(`En venta en ${pj.name}.`, `For sale at ${pj.name}.`)
    : T('Propiedades en venta.', 'Property for sale.');
  $('#h-title').textContent = t;
  document.title = F.favs ? `${t.slice(0, -1)} | Inmobiliaria San Miguel` : `${t.slice(0, -1)} ${T('en San Miguel de Allende', 'in San Miguel de Allende')} | Inmobiliaria San Miguel`;
}

function renderChips() {
  const a = active(F);
  $('#achips').innerHTML = a.length ? a.map((x) => `<button type="button" class="chip chip--x" data-rm="${x.k}" aria-label="${T('Quitar filtro', 'Remove filter')}: ${esc(x.l)}">${esc(x.l)}</button>`).join('')
    + `<button type="button" class="link achips__clear" data-rm="*">${T('Limpiar todo', 'Clear all')}</button>` : '';
}

const cmpIds = () => S.compare().filter((id) => S.property(id));

function renderResults(mode = 'fresh') {
  if (mode !== 'more') RES = run(F);
  const n = RES.length; const grid = $('#grid');
  countUp($('#n'), n, 700); $('#n-u').textContent = plural(n);
  $('#live').textContent = `${n} ${plural(n)}`;
  renderChips(); renderHead();
  $('#empty').hidden = n > 0; if (!n) renderEmpty();
  const from = mode === 'more' ? grid.children.length : 0;
  if (mode !== 'more') grid.innerHTML = '';
  const tmp = document.createElement('div');
  tmp.innerHTML = RES.slice(from, shown).map((p) => pcard(p)).join('');
  const cmp = cmpIds();
  [...tmp.children].forEach((card, i) => {
    const id = card.dataset.id; const name = $('.pcard__title', card)?.textContent.trim() || '';
    $('.pcard__meta', card)?.insertAdjacentHTML('beforeend', `<button type="button" class="cmp" data-cmp="${id}" aria-pressed="${cmp.includes(id)}" aria-label="${T('Comparar', 'Compare')} ${esc(name)}"><i>${icon('check', 12)}</i>${T('Comparar', 'Compare')}</button>`);
    if (mode !== 'quiet') { card.classList.add('rise'); card.style.setProperty('--i', Math.min(i, 11)); card.addEventListener('animationend', () => card.classList.remove('rise'), { once: true }); }
    grid.append(card);
  });
  const left = n - Math.min(shown, n); const more = $('#more');
  more.hidden = left <= 0; more.textContent = T(`Ver ${Math.min(PAGE, left)} más`, `Show ${Math.min(PAGE, left)} more`);
  $('#shown').textContent = n > PAGE ? T(`Mostrando ${Math.min(shown, n)} de ${n}`, `Showing ${Math.min(shown, n)} of ${n}`) : '';
  listLD();
}

// Cero resultados: decir que filtro estorba y ofrecer el ajuste en un toque
function renderEmpty() {
  const box = $('#empty');
  if (F.favs && !S.favs().length) {
    box.innerHTML = `<p class="eyebrow">${T('Favoritas', 'Favorites')}</p><h2 class="h2">${T('Aún no guardas ninguna.', 'Nothing saved yet.')}</h2>
      <p class="lede">${T('Toca el corazón de cualquier propiedad y aparecerá aquí, en este navegador.', 'Tap the heart on any property and it will appear here, on this browser.')}</p>
      <div class="empty__fix"><button type="button" class="choice" data-rm="favs"><span>${T('Ver todas las propiedades', 'See all properties')}</span>${icon('arrow', 18)}</button></div>`;
    return;
  }
  const fixes = [];
  if (F.max) {
    const alt = run({ ...clone(F), max: 0 });
    if (alt.length) { const nm = niceUp(Math.min(...alt.map((p) => p.price))); const n = run({ ...clone(F), max: nm }).length; if (n) fixes.push({ attr: `data-setmax="${nm}"`, l: T(`Subir el máximo a ${short(nm)} ${S.cur()}`, `Raise the maximum to ${short(nm)} ${S.cur()}`), n, raise: true }); }
  }
  const rm = active(F).map((a) => ({ attr: `data-rm="${a.k}"`, l: T(`Quitar «${a.l}»`, `Remove “${a.l}”`), n: run(without(F, a.k)).length, name: a.l })).filter((x) => x.n).sort((a, b) => b.n - a.n);
  const blocker = rm[0]?.name;
  fixes.push(...rm);
  const all = run({ ...EMPTY(), sort: F.sort }).length;
  if (!fixes.length) fixes.push({ attr: 'data-rm="*"', l: T('Limpiar todos los filtros', 'Clear all filters'), n: all });
  box.innerHTML = `<p class="eyebrow">${T('Sin coincidencias', 'No matches')}</p><h2 class="h2">${T('Nada cumple todo a la vez.', 'Nothing matches all of it at once.')}</h2>
    <p class="lede">${blocker ? T(`Lo que más limita es «${esc(blocker)}». Elige un ajuste:`, `The tightest filter is “${esc(blocker)}”. Pick one fix:`) : T('Elige un ajuste:', 'Pick one fix:')}</p>
    <div class="empty__fix">${fixes.slice(0, 3).map((f) => `<button type="button" class="choice" ${f.attr}><span>${esc(f.l)}</span><span class="muted num">${f.n} ${plural(f.n)}</span></button>`).join('')}</div>`;
}

function listLD() {
  let s = $('#ld-list');
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-list'; document.head.append(s); }
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList', name: document.title, numberOfItems: RES.length,
    itemListElement: RES.slice(0, shown).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${ORIGIN}/propiedad.html?id=${encodeURIComponent(p.id)}`, name: `${S.title(p)} · ${S.subtitle(p)}` })) });
}

// Demanda para el area de manejo, incluidas las busquedas sin resultados
function scheduleTrack() {
  clearTimeout(trackT);
  trackT = setTimeout(() => {
    const d = { tipo: F.type.join(','), min: F.min, max: F.max, beds: F.beds, baths: F.baths, project: F.project, delivery: F.delivery, minArea: F.minArea, avail: F.avail, favs: F.favs, q: F.q, sort: F.sort === 'relevancia' ? '' : F.sort };
    S.track('busqueda', { ...Object.fromEntries(Object.entries(d).filter(([, v]) => v)), results: RES.length });
  }, 1200);
}

function commit() {
  norm(F); writeURL(); shown = PAGE;
  renderBar(); renderResults('fresh'); if (popKey) renderPop(); scheduleTrack();
  const top = $('#results').getBoundingClientRect().top;
  if (top < 0) scrollTo({ top: top + scrollY - bar.getBoundingClientRect().bottom - 8, behavior: reduced() ? 'auto' : 'smooth' });
}

// ---- Panel de escritorio --------------------------------------------------------
function renderPop() {
  const pop = $('#fpop');
  if (!popKey) { pop.hidden = true; pop.innerHTML = ''; return; }
  keep(pop, () => {
    pop.innerHTML = SEC[popKey](F, 'p') + `<div class="pop__foot"><button type="button" class="link" data-clear="${popKey}">${T('Borrar', 'Clear')}</button>
      <button type="button" class="btn btn--primary btn--sm" data-close-pop>${T(`Ver ${RES.length} ${plural(RES.length)}`, `Show ${RES.length} ${plural(RES.length)}`)}</button></div>`;
  });
  pop.hidden = false;
  const btn = $(`[data-pop="${popKey}"]`, bar); const inR = $('.fbar__in', bar).getBoundingClientRect(); const bR = btn.getBoundingClientRect();
  pop.style.left = `${Math.max(0, Math.min(bR.left - inR.left, inR.width - pop.offsetWidth))}px`;
}
function openPop(k) {
  popKey = k; $$('[data-pop]', bar).forEach((b) => b.setAttribute('aria-expanded', b.dataset.pop === k)); renderPop();
  $('#fpop button, #fpop input')?.focus({ preventScroll: true });
}
function closePop(focus = false) {
  const k = popKey; popKey = null; $$('[data-pop]', bar).forEach((b) => b.setAttribute('aria-expanded', 'false')); renderPop();
  if (focus && k) $(`[data-pop="${k}"]`, bar).focus();
}
function clearGroup(st, k) {
  if (k === 'price') { st.min = 0; st.max = 0; }
  if (k === 'beds' || k === 'baths') st[k] = 0;
  if (k === 'more') Object.assign(st, { project: '', delivery: '', minArea: 0, avail: false });
}

bar.addEventListener('click', (e) => {
  const t = e.target;
  if (t.closest('[data-open-sheet]')) return openSheet();
  const p = t.closest('[data-pop]'); if (p) return popKey === p.dataset.pop ? closePop() : openPop(p.dataset.pop);
  if (t.closest('[data-close-pop]')) return closePop(true);
  const c = t.closest('[data-clear]'); if (c) { clearGroup(F, c.dataset.clear); return commit(); }
  const f = t.closest('[data-f]'); if (f && f.tagName === 'BUTTON' && act(F, f)) commit();
});
// Los campos de precio se aplican un instante despues: asi el foco ya llego a donde el usuario fue (Tab o un boton)
const later = (fn, el) => (el.matches('input.input') ? setTimeout(fn, 0) : fn());
bar.addEventListener('change', (e) => { const el = e.target; if (el.dataset.f) later(() => { if (onField(F, el)) commit(); }, el); });
bar.addEventListener('input', (e) => { if (e.target.dataset.f === 'area') slide(e.target); });
bar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('input.input')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); }
  if (e.key === 'Escape' && popKey) closePop(true);
});
document.addEventListener('click', (e) => { if (popKey && !e.composedPath().some((n) => n.id === 'fpop' || n.dataset?.pop)) closePop(); });

// ---- Hoja de filtros en movil (borrador; se aplica con un solo boton) ----------
const sheet = $('#fsheet'); let sheetOpener = null;
function renderSheet() {
  norm(draft);
  const body = $('.fsheet__body', sheet);
  keep(body, () => { body.innerHTML = ['type', 'price', 'beds', 'baths', 'more'].map((k) => SEC[k](draft, 's')).join(''); });
  const n = run(draft).length;
  $('[data-apply]', sheet).textContent = n ? T(`Ver ${n} ${plural(n)}`, `Show ${n} ${plural(n)}`) : T('Ninguna coincide · ver cómo ajustar', 'No matches · see how to adjust');
}
function openSheet() {
  sheetOpener = document.activeElement; draft = clone(F); renderSheet();
  sheet.hidden = false; document.body.style.overflow = 'hidden';
  void sheet.offsetWidth; sheet.classList.add('is-open');
  $('.fsheet__x', sheet).focus({ preventScroll: true });
}
function closeSheet() {
  sheet.classList.remove('is-open'); document.body.style.overflow = '';
  setTimeout(() => { sheet.hidden = true; }, 450); sheetOpener?.focus?.({ preventScroll: true });
}
$('.fsheet__head h2', sheet).textContent = T('Filtros', 'Filters');
$('.fsheet__x', sheet).setAttribute('aria-label', T('Cerrar filtros', 'Close filters'));
$('[data-sheet-clear]', sheet).textContent = T('Limpiar', 'Clear');
sheet.addEventListener('click', (e) => {
  const t = e.target;
  if (t === sheet || t.closest('.fsheet__x')) return closeSheet();
  if (t.closest('[data-apply]')) {
    $$('.fsheet__body input.input', sheet).filter((el) => el.value !== el.defaultValue).forEach((el) => onField(draft, el));
    F = draft; closeSheet(); return commit();
  }
  if (t.closest('[data-sheet-clear]')) { draft = { ...EMPTY(), sort: F.sort }; return renderSheet(); }
  const f = t.closest('[data-f]'); if (f && f.tagName === 'BUTTON' && act(draft, f)) renderSheet();
});
sheet.addEventListener('change', (e) => {
  const el = e.target; if (!el.dataset.f) return;
  later(() => { if (sheet.classList.contains('is-open') && onField(draft, el)) renderSheet(); }, el);
});
sheet.addEventListener('input', (e) => { if (e.target.dataset.f === 'area') slide(e.target); });
sheet.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSheet();
  if (e.key === 'Enter' && e.target.matches('input.input')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); }
  trap($('.fsheet__box', sheet), e);
});

// ---- Comparador ------------------------------------------------------------------
const tray = $('#tray');
function syncCmp() {
  const c = cmpIds(); const on = c.length >= 2;
  $$('[data-cmp]').forEach((b) => b.setAttribute('aria-pressed', c.includes(b.dataset.cmp)));
  if (on) {
    $('.tray__th', tray).innerHTML = c.map((id) => { const p = S.property(id); return p.images?.[0] ? `<img src="${img(p.images[0], 96, 96)}" alt="">` : '<span></span>'; }).join('');
    $('.tray__t', tray).textContent = T(`${c.length} para comparar`, `${c.length} to compare`);
  }
  tray.classList.toggle('is-on', on); tray.inert = !on; tray.setAttribute('aria-hidden', String(!on));
}
function toggleCmp(id) {
  const before = cmpIds(); S.toggleCompare(id); const after = cmpIds();
  if (!before.includes(id)) {
    if (before.length >= 3) toast(T('Se comparan hasta tres. Quitamos la primera que elegiste.', 'You can compare up to three. We removed the first one you picked.'));
    else if (after.length === 1) toast(T('Elige una más para comparar.', 'Pick one more to compare.'));
  }
  syncCmp();
}
const daysTo = (p) => {
  const tl = timeline(DELIVERY[p.delivery] ? p.delivery : 'inmediata', { months: p.deliveryMonths || 0 });
  return p.type === 'terreno' ? tl.steps.find((s) => s.k === 'firma').at : tl.total;
};
const fmtDur = (d) => { const t = fmtTotal(d); return `${t.n} ${t.u}`; };
const ROWS = () => [
  { k: T('Precio', 'Price'), v: (p) => p.price, f: (v) => S.fmtPrice(v), best: 'min', bl: T('Menor', 'Lowest') },
  { k: T('Precio por m²', 'Price per m²'), v: (p) => (area(p) ? Math.round(p.price / area(p)) : null), f: (v) => S.fmtPrice(v), best: 'min', bl: T('Menor', 'Lowest') },
  { k: T('Tipo', 'Type'), v: (p) => L(TYPES[p.type]) },
  { k: T('Recámaras', 'Bedrooms'), v: (p) => (p.type === 'terreno' ? null : p.beds), best: 'max', bl: T('Más', 'Most') },
  { k: T('Baños', 'Bathrooms'), v: (p) => (p.type === 'terreno' ? null : p.baths), best: 'max', bl: T('Más', 'Most') },
  { k: T('Construcción', 'Built area'), v: (p) => p.built || null, f: S.fmtArea, best: 'max', bl: T('Mayor', 'Largest') },
  { k: T('Terreno', 'Lot'), v: (p) => p.lot || null, f: S.fmtArea, best: 'max', bl: T('Mayor', 'Largest') },
  { k: T('Entrega', 'Delivery'), v: (p) => L(DELIVERY[p.delivery]) || null },
  { k: T('Estatus', 'Status'), v: (p) => L(STATUS[p.status]) },
  { k: T('Desarrollo', 'Development'), v: (p) => (p.project && S.project(p.project)?.name) || T('Propiedad individual', 'Individual property') },
  { k: T('Puede ser tuya en', 'Can be yours in'), v: daysTo, f: fmtDur, best: 'min', bl: T('Más rápida', 'Fastest') },
];
function drawTable(box, ps) {
  box.style.setProperty('--n', ps.length);
  const head = `<div class="ctab__row ctab__head"><span class="ctab__k"></span>${ps.map((p) => `<div class="ctab__p">${p.images?.[0] ? `<img src="${img(p.images[0], 480, 360)}" alt="" loading="lazy">` : '<span class="ph"></span>'}
    <a href="${ROOT}propiedad.html?id=${p.id}">${esc(S.title(p))}</a><small>${esc(S.subtitle(p))}</small>
    <button type="button" class="ctab__rm" data-cmp-rm="${p.id}">${T('Quitar', 'Remove')}</button></div>`).join('')}</div>`;
  const rows = ROWS().map((r) => {
    const vals = ps.map(r.v); if (vals.every((v) => v == null)) return '';
    const shownV = vals.map((v) => (v == null ? '—' : r.f ? r.f(v) : v));
    const diff = new Set(shownV).size > 1;
    const nums = vals.filter((v) => typeof v === 'number');
    const best = r.best && diff && nums.length > 1 && new Set(nums).size > 1 ? (r.best === 'min' ? Math.min(...nums) : Math.max(...nums)) : null;
    return `<div class="ctab__row ${diff ? 'is-diff' : 'is-same'}"><span class="ctab__k">${r.k}</span>${shownV.map((s, i) => `<span class="ctab__v ${best != null && vals[i] === best ? 'is-best' : ''}" ${best != null && vals[i] === best ? `data-best="${r.bl}"` : ''}>${esc(s)}</span>`).join('')}</div>`;
  }).join('');
  box.innerHTML = head + rows;
}
function openCompare() {
  if (cmpIds().length < 2) return;
  const opener = document.activeElement;
  const m = h(`<div class="modal cmpm" role="dialog" aria-modal="true" aria-labelledby="cmp-h"><div class="modal__box">
    <button type="button" class="icon-btn modal__close" aria-label="${T('Cerrar', 'Close')}">${icon('close')}</button>
    <p class="eyebrow">${T('Comparar', 'Compare')}</p>
    <div class="cmpm__top"><h2 class="h3" id="cmp-h">${T('Lado a lado.', 'Side by side.')}</h2>
      <div class="seg" role="group" aria-label="${T('Qué mostrar', 'What to show')}"><button type="button" data-v="all" aria-pressed="true">${T('Todo', 'Everything')}</button><button type="button" data-v="diff" aria-pressed="false">${T('Solo diferencias', 'Differences only')}</button></div></div>
    <div class="ctab"></div>
    <p class="demo-note">${T('Tiempos de ejemplo. En terrenos, “puede ser tuya” es la firma de la escritura del terreno.', 'Sample timelines. For lots, “can be yours” is when the lot deed is signed.')}</p>
  </div></div>`);
  const box = $('.ctab', m);
  const draw = () => { const ps = cmpIds().map(S.property); if (ps.length < 2) return close(); drawTable(box, ps); };
  const key = (e) => { if (e.key === 'Escape') close(); trap($('.modal__box', m), e); };
  function close() { m.classList.remove('is-open'); document.body.style.overflow = ''; document.removeEventListener('keydown', key); setTimeout(() => m.remove(), 400); opener?.focus?.({ preventScroll: true }); }
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('.modal__close')) return close();
    const r = e.target.closest('[data-cmp-rm]'); if (r) { S.toggleCompare(r.dataset.cmpRm); syncCmp(); return draw(); }
    const s = e.target.closest('.seg button'); if (s) { $$('.seg button', m).forEach((b) => b.setAttribute('aria-pressed', b === s)); box.classList.toggle('only-diff', s.dataset.v === 'diff'); }
  });
  document.addEventListener('keydown', key);
  draw(); document.body.append(m); document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => m.classList.add('is-open')); $('.modal__close', m).focus({ preventScroll: true });
}
tray.innerHTML = `<div class="tray__th"></div><span class="tray__t"></span>
  <button type="button" class="btn btn--light btn--sm" data-cmp-open>${T('Comparar', 'Compare')}</button>
  <button type="button" class="icon-btn" data-cmp-clear aria-label="${T('Vaciar comparación', 'Clear comparison')}">${icon('close', 18)}</button>`;
tray.setAttribute('aria-label', T('Comparación', 'Comparison'));

// ---- Eventos de la pagina ---------------------------------------------------------
document.addEventListener('click', (e) => {
  const t = e.target;
  const c = t.closest('[data-cmp]'); if (c) { e.preventDefault(); return toggleCmp(c.dataset.cmp); }
  if (t.closest('[data-cmp-open]')) return openCompare();
  if (t.closest('[data-cmp-clear]')) { cmpIds().forEach((id) => S.toggleCompare(id)); return syncCmp(); }
  const r = t.closest('[data-rm]'); if (r) { F = r.dataset.rm === '*' ? { ...EMPTY(), sort: F.sort } : without(F, r.dataset.rm); return commit(); }
  const m = t.closest('[data-setmax]'); if (m) { F.max = +m.dataset.setmax; return commit(); }
  if (t.closest('[data-open-sheet]') && !bar.contains(t)) return openSheet();
  // En favoritas, quitar el corazon saca la tarjeta sin animar todo de nuevo
  if (F.favs && t.closest('[data-fav]')) setTimeout(() => renderResults('quiet'), 0);
});
$('#sort').addEventListener('change', (e) => { F.sort = e.target.value; commit(); });
$('#more').addEventListener('click', () => { shown += PAGE; renderResults('more'); });

// Barra inferior en movil
$('.dock').innerHTML = `<button type="button" class="btn btn--ghost" data-open-sheet>${ICO.sliders}${T('Filtros', 'Filters')}<b class="num" data-nfil></b></button>
  <button type="button" class="btn btn--primary" data-contact data-intent="videollamada">${icon('video', 18)}${T('Videollamada', 'Video call')}</button>`;

renderBar(); renderResults('fresh'); syncCmp(); scheduleTrack();
if (new URLSearchParams(location.search).get('compare') === '1') { writeURL(); openCompare(); }
