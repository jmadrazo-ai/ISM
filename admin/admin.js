// Area de manejo · Inmobiliaria San Miguel. Solo espanol (herramienta interna).
// Lee y escribe unicamente a traves de /js/store.js: lo que se guarda aqui se ve de inmediato en el sitio publico.
import * as S from '../js/store.js';
import { TYPES, STATUS, DELIVERY, PROJECTS, SEED, FX, ROOT } from '../js/data.js';
import { icon, h, $, $$ } from '../js/ui.js';

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const DAY = 864e5, MIN = 6e4;
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nfs = {};
const nf = (n, d = 0, fixed = false) => (nfs[`${d}${fixed}`] ??= new Intl.NumberFormat('es-MX', { maximumFractionDigits: d, minimumFractionDigits: fixed ? d : 0 })).format(n);
const money = (n) => `$${nf(n)} MXN`;
const pct = (a, b) => (b ? `${nf((a / b) * 100, 1, true)} %` : 'sin datos');
const eqs = (a, b) => (b ? `${nf(a)} ÷ ${nf(b)} = ${pct(a, b)}` : 'sin datos');
const eq = (lbl, a, b) => (b ? `${lbl} = ${eqs(a, b)}` : `${lbl} = sin datos`);
const dFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
const dtFmt = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const dShort = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });
const fdate = (t) => dFmt.format(new Date(t));
const fdt = (t) => dtFmt.format(new Date(t));
const age = (t) => { const m = Math.max(0, Math.round((Date.now() - t) / MIN)); if (m < 60) return `${m} min`; const hh = Math.round(m / 60); return hh < 48 ? `${hh} h` : `${Math.round(hh / 24)} d`; };
const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const lab = (list, k) => list.find((x) => x.k === k)?.es ?? 'Sin respuesta';
const INTENT = { videollamada: 'Videollamada', visita: 'Visita', precios: 'Precios y planos' };
const STAGE = (k) => S.STAGES.find((s) => s.k === k)?.es ?? k;
const TYPE = (k) => TYPES[k]?.es ?? k;
const DEV = { 'punta-del-cielo': 'Punta del Cielo', terraviva: 'Terraviva Picachos', individual: 'Propiedad individual' };
const devOf = (p) => (p ? p.project || 'individual' : 'sin');
const devName = (p) => DEV[devOf(p)] ?? 'Sin propiedad';
const ptitle = (p, lg = 'es') => (p.title ? p.title[lg] || p.title.es : p.type === 'terreno' ? `${TYPES.terreno[lg]} ${p.model}` : p.model);
const pubUrl = (id) => `${ROOT}propiedad.html?id=${encodeURIComponent(id)}`;
const area = (p) => p.built || p.lot || null;
const SRC = { google: 'Google', chatgpt: 'ChatGPT', perplexity: 'Perplexity', instagram: 'Instagram', facebook: 'Facebook', directo: 'Directo', broker: 'Corredor (broker)', otros: 'Otros' };
const lsSource = (() => { try { return JSON.parse(localStorage.getItem('ism.source')); } catch { return null; } })();
const normSrc = (s) => {
  s = String(s || 'directo').toLowerCase();
  if (s.includes('google')) return 'google';
  if (s.includes('chatgpt') || s.includes('openai')) return 'chatgpt';
  if (s.includes('perplexity')) return 'perplexity';
  if (s.includes('instagram')) return 'instagram';
  if (s.includes('facebook') || s === 'fb') return 'facebook';
  if (s.includes('broker')) return 'broker';
  if (['directo', 'direct', '(direct)', 'none'].includes(s)) return 'directo';
  return 'otros';
};
const svg = (p, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IC = {
  resumen: '<path d="M4 16V9M10 16V4M16 16v-5"/>',
  conversion: '<path d="M3 4h14l-5 6v5l-4 2v-7z"/>',
  prospectos: '<circle cx="8" cy="7" r="3"/><path d="M2.5 16c.5-3 2.7-4.5 5.5-4.5s5 1.5 5.5 4.5M14 4.5a2.8 2.8 0 010 5.2M15.5 12c1.5.5 2.5 1.8 3 4"/>',
  inventario: '<path d="M3 17V6l7-3 7 3v11M3 17h14M7 9h2M11 9h2M7 13h2M11 13h2"/>',
  demanda: '<circle cx="9" cy="9" r="5"/><path d="M13 13l4 4M7 10.5l1.5-2 1.5 1.5L11.5 7"/>',
  pencil: '<path d="M4 16l1-4 8.5-8.5 3 3L8 15z"/>',
};
const readLS = (k, d) => { try { return JSON.parse(localStorage.getItem(`ism.${k}`)) ?? d; } catch { return d; } };

// ---------------------------------------------------------------------------
// Datos del periodo
// ---------------------------------------------------------------------------
function dataset(days) {
  const now = Date.now(), from = now - days * DAY;
  const ev = S.events().filter((e) => e.t >= from).map((e) => ({ ...e, src: normSrc(e.source ?? lsSource), lg: e.lang === 'en' ? 'en' : 'es' }));
  const leads = S.leads().filter((l) => l.t >= from);
  return { now, from, days, ev, leads };
}
const ORDER = ['nuevo', 'contactado', 'videollamada', 'visita', 'apartado', 'venta'];
const reached = (l, k) => l.stage !== 'perdido' && ORDER.indexOf(l.stage) >= ORDER.indexOf(k);
const daily = (ev, type, now, n = 30) => { const a = Array(n).fill(0); ev.forEach((e) => { if (e.type !== type) return; const i = n - 1 - Math.floor(Math.max(0, now - e.t) / DAY); if (i >= 0 && i < n) a[i]++; }); return a; };

// ---------------------------------------------------------------------------
// Hash: la vista y sus filtros viven en la URL
// ---------------------------------------------------------------------------
const VIEWS = ['resumen', 'conversion', 'prospectos', 'inventario', 'demanda'];
const TITLES = { resumen: 'Resumen', conversion: 'Conversión', prospectos: 'Prospectos', inventario: 'Inventario', demanda: 'Demanda' };
function parseHash() {
  const [v, q = ''] = location.hash.replace(/^#/, '').split('?');
  return { view: VIEWS.includes(v) ? v : 'resumen', p: Object.fromEntries(new URLSearchParams(q)) };
}
function go(patch, push = false) {
  const { view, p } = parseHash();
  const np = { ...p, ...patch };
  Object.keys(np).forEach((k) => { if (np[k] == null || np[k] === '' || np[k] === 'todos') delete np[k]; });
  const qs = new URLSearchParams(np).toString();
  const hash = `#${view}${qs ? `?${qs}` : ''}`;
  if (push) { location.hash = hash; return; }
  history.replaceState(null, '', hash);
  render();
}

// ---------------------------------------------------------------------------
// Capas: modal, confirmacion, aviso con deshacer
// ---------------------------------------------------------------------------
const layer = $('#layer');
const trapTab = (e, root) => {
  const f = $$('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]', root).filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
};
function openModal(inner, { label = '', wide = false } = {}) {
  const el = h(`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(label)}"><div class="modal__box ${wide ? 'wide' : ''}">${inner}</div></div>`);
  layer.append(el);
  const opener = document.activeElement;
  let closed = false;
  const close = () => { if (closed) return; closed = true; el.classList.remove('is-open'); setTimeout(() => el.remove(), 350); document.removeEventListener('keydown', onKey, true); opener?.focus?.({ preventScroll: true }); };
  const dismiss = () => { close(); el.dispatchEvent(new Event('dismiss')); };
  const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); dismiss(); } else if (e.key === 'Tab') trapTab(e, el); };
  document.addEventListener('keydown', onKey, true);
  el.addEventListener('click', (e) => { if (e.target === el || e.target.closest('[data-x]')) dismiss(); });
  requestAnimationFrame(() => { el.classList.add('is-open'); ($('[autofocus]', el) || $('input:not([type=radio]),select,textarea', el) || $('button', el))?.focus({ preventScroll: true }); });
  return { el, close, dismiss };
}
const closeBtn = `<button class="icon-btn modal__close" type="button" data-x aria-label="Cerrar">${icon('close')}</button>`;
function confirmDlg({ title, body, ok = 'Confirmar', cancel = 'Cancelar' }) {
  return new Promise((res) => {
    const { el, close } = openModal(`${closeBtn}<h2 class="h3">${esc(title)}</h2><div>${body}</div><div class="dlg__act"><button class="btn btn--ghost" type="button" data-r="0">${esc(cancel)}</button><button class="btn btn--primary" type="button" data-r="1">${esc(ok)}</button></div>`, { label: title });
    let done = false; const fin = (v) => { if (done) return; done = true; close(); res(v); };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) fin(b.dataset.r === '1'); });
    el.addEventListener('dismiss', () => fin(false));
  });
}
const LOST = ['No responde', 'Presupuesto insuficiente', 'Compró en otro lugar', 'Ya no busca o solo exploraba', 'La propiedad no se ajusta a lo que busca', 'Otro motivo'];
function askLost(l) {
  return new Promise((res) => {
    const { el, close } = openModal(`${closeBtn}<h2 class="h3">Marcar como perdido</h2><p class="muted">${esc(l.name)}: elige el motivo. Sin motivo no se puede continuar; sirve para entender por qué se pierden los prospectos.</p>
      <fieldset class="reasons"><legend class="sr-only">Motivo</legend>${LOST.map((r) => `<label class="radio"><input type="radio" name="r" value="${esc(r)}"><span>${esc(r)}</span></label>`).join('')}</fieldset>
      <div class="dlg__act"><button class="btn btn--ghost" type="button" data-r="0">Cancelar</button><button class="btn btn--primary" type="button" data-r="1" disabled>Marcar como perdido</button></div>`, { label: 'Motivo de pérdida' });
    let done = false; const fin = (v) => { if (done) return; done = true; close(); res(v); };
    el.addEventListener('change', () => { $('[data-r="1"]', el).disabled = !$('input:checked', el); });
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; fin(b.dataset.r === '1' ? $('input:checked', el)?.value || null : null); });
    el.addEventListener('dismiss', () => fin(null));
  });
}
let toastEl, toastT;
function notify(msg, { undo } = {}) {
  toastEl?.remove(); clearTimeout(toastT);
  toastEl = h(`<div class="atoast"><span>${esc(msg)}</span>${undo ? '<button type="button">Deshacer</button>' : ''}</div>`);
  document.body.append(toastEl);
  $('#live').textContent = msg;
  const t = toastEl;
  if (undo) $('button', t).onclick = () => { clearTimeout(toastT); t.classList.remove('is-on'); undo(); };
  requestAnimationFrame(() => t.classList.add('is-on'));
  toastT = setTimeout(() => t.classList.remove('is-on'), undo ? 9000 : 3400);
}

// ---------------------------------------------------------------------------
// Graficas SVG
// ---------------------------------------------------------------------------
function ticksFor(m) {
  if (m <= 4) { const t = []; for (let v = 0; v <= Math.max(m, 2); v++) t.push(v); return t; }
  const raw = m / 3, p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((x) => x * p).find((s) => s >= raw);
  const top = Math.ceil(m / step) * step, t = [];
  for (let v = 0; v <= top + 1e-9; v += step) t.push(v);
  return t;
}
function chart({ vals, labels, kind, unit, aria }) {
  const W = 760, H = 190, L = 46, R = 8, T = 12, B = 26, iw = W - L - R, ih = H - T - B;
  const tk = ticksFor(Math.max(0, ...vals)), top = tk[tk.length - 1];
  const sx = iw / vals.length, y = (v) => T + ih - (v / top) * ih, cx = (i) => L + sx * i + sx / 2;
  const grid = tk.map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/>`).join('');
  const yl = tk.map((v) => `<text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${nf(v)}</text>`).join('');
  const xl = labels.map((t, i) => (i % 5 === 4 ? `<text x="${cx(i)}" y="${H - 6}" text-anchor="middle">${t}</text>` : '')).join('');
  const marks = kind === 'bar'
    ? vals.map((v, i) => `<rect class="bar-s" x="${L + sx * i + sx * 0.18}" width="${sx * 0.64}" y="${y(v)}" height="${Math.max(0, T + ih - y(v))}" rx="2"/>`).join('')
    : `<polyline class="line-s" points="${vals.map((v, i) => `${cx(i)},${y(v)}`).join(' ')}"/>${vals.map((v, i) => `<circle class="dot" cx="${cx(i)}" cy="${y(v)}" r="2.6"/>`).join('')}`;
  const hits = vals.map((v, i) => `<rect class="hit" x="${L + sx * i}" y="${T}" width="${sx}" height="${ih}" data-f="${1 - v / top}" data-tip="${labels[i]}: ${nf(v)} ${unit}"/>`).join('');
  return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(aria)}"><g class="gl">${grid}</g>${marks}<g class="ax">${yl}${xl}</g>${hits}</svg><div class="tip" hidden></div></div>`;
}
const hb = (rows, cls = '') => `<div class="hb">${rows.map((r) => `<div class="hb__r"><span>${r.label}</span><span class="hb__t"><i class="${r.cls || cls}" style="width:${Math.max(r.n ? 1.5 : 0, r.w)}%"></i></span><span class="hb__v num">${r.v}${r.sub ? `<small>${r.sub}</small>` : ''}</span></div>`).join('')}</div>`;

// ---------------------------------------------------------------------------
// Vista 1 · Resumen
// ---------------------------------------------------------------------------
const periodSeg = (p) => `<div class="seg" role="group" aria-label="Periodo">${[7, 30].map((n) => `<button type="button" data-act="period" data-v="${n}" aria-pressed="${(p.p === '7' ? 7 : 30) === n}">${n} días</button>`).join('')}</div>`;
const kpi = (l, v, u, e) => `<div class="kpi"><div class="kpi__l">${l}</div><div class="kpi__v num">${v}${u ? `<small>${u}</small>` : ''}</div><div class="kpi__e">${e}</div></div>`;

function viewResumen(p) {
  const days = p.p === '7' ? 7 : 30, d = dataset(days);
  const C = (t) => d.ev.filter((e) => e.type === t).length;
  const visitas = C('vista_pagina'), vistas = C('vista_propiedad'), contacto = C('inicio_contacto'), pros = C('lead');
  const stageN = (k) => d.leads.filter((l) => reached(l, k)).length;
  const ventas = stageN('venta');
  const resp = d.leads.filter((l) => typeof l.respMin === 'number');
  const sum = resp.reduce((a, l) => a + l.respMin, 0), avg = resp.length ? sum / resp.length : null;
  const avgV = avg == null ? 'sin datos' : avg < 60 ? nf(avg) : nf(avg / 60, 1), avgU = avg == null ? '' : avg < 60 ? 'min' : 'h';

  const steps = [
    { name: 'Visitas al sitio', eqn: 'visitas al sitio', n: visitas, u: 'visitas' },
    { name: 'Vistas de propiedad', eqn: 'vistas de propiedad', n: vistas, u: 'vistas' },
    { name: 'Inicios de contacto', eqn: 'inicios de contacto', n: contacto, u: 'inicios' },
    { name: 'Prospectos', eqn: 'prospectos', n: pros, u: 'prospectos' },
    { name: 'Videollamada', eqn: 'videollamadas', n: stageN('videollamada'), u: 'prospectos', b: 1 },
    { name: 'Visita a la propiedad', eqn: 'visitas a la propiedad', n: stageN('visita'), u: 'prospectos', b: 1 },
    { name: 'Apartado', eqn: 'apartados', n: stageN('apartado'), u: 'prospectos', b: 1 },
    { name: 'Venta', eqn: 'ventas', n: stageN('venta'), u: 'prospectos', b: 1 },
  ];
  const mx = Math.max(1, ...steps.map((s) => s.n));
  const fn = steps.map((s, i) => {
    const prev = steps[i - 1];
    const rate = prev ? `<div class="fn__rate"><b>${pct(s.n, prev.n)}</b><span>${eq(`${s.eqn} ÷ ${prev.eqn}`, s.n, prev.n)}</span></div>` : '';
    return `${rate}<div class="fn__step"><div class="fn__name">${s.name}</div><div class="fn__bar" aria-hidden="true"><i class="${s.b ? 'is-b' : ''}" style="width:${Math.max(s.n ? 1.2 : 0, Math.sqrt(s.n / mx) * 100)}%"></i></div><div class="fn__n num">${nf(s.n)}<small>${s.u}</small></div></div>`;
  }).join('');

  // Tendencia de 30 dias (independiente del periodo elegido)
  const d30 = days === 30 ? d : dataset(30);
  const vis30 = daily(d30.ev, 'vista_pagina', d30.now), lead30 = daily(d30.ev, 'lead', d30.now);
  const labels = vis30.map((_, i) => dShort.format(new Date(d30.now - (29 - i) * DAY)));
  const sv = vis30.reduce((a, b) => a + b, 0), sl = lead30.reduce((a, b) => a + b, 0);

  // Fuentes
  const bySrc = Object.fromEntries(Object.keys(SRC).map((k) => [k, { v: 0, l: 0 }]));
  const byLang = { es: { v: 0, l: 0 }, en: { v: 0, l: 0 } };
  d.ev.forEach((e) => { const k = e.type === 'vista_pagina' ? 'v' : e.type === 'lead' ? 'l' : null; if (!k) return; bySrc[e.src][k]++; byLang[e.lg][k]++; });
  const row = (name, o, cls = '') => `<tr class="${cls}"><td>${name}</td><td class="r num">${nf(o.v)}</td><td class="r num">${nf(o.l)}</td><td class="r"><span class="num">${pct(o.l, o.v)}</span><small>${eqs(o.l, o.v)}</small></td></tr>`;
  const ai = { v: bySrc.chatgpt.v + bySrc.perplexity.v, l: bySrc.chatgpt.l + bySrc.perplexity.l };
  const srcRows = [row(SRC.google, bySrc.google), row('Buscadores de IA', ai, 'tr--grp'), row(SRC.chatgpt, bySrc.chatgpt, 'tr--sub'), row(SRC.perplexity, bySrc.perplexity, 'tr--sub'),
    ...['instagram', 'facebook', 'directo', 'broker'].map((k) => row(SRC[k], bySrc[k])), bySrc.otros.v + bySrc.otros.l ? row(SRC.otros, bySrc.otros) : ''].join('');

  return `<div class="vhead"><div><h1>Resumen</h1><p>Del ${fdate(d.from)} al ${fdate(d.now)}. Cada tasa muestra su cuenta.</p></div>${periodSeg(p)}</div>
  <div class="kpis">
    ${kpi('Visitas', nf(visitas), 'visitas', `visitas ÷ días = ${nf(visitas)} ÷ ${days} = ${nf(visitas / days, 1)} por día`)}
    ${kpi('Vistas de propiedad', nf(vistas), 'vistas', eq('vistas ÷ visitas', vistas, visitas))}
    ${kpi('Inicios de contacto', nf(contacto), 'inicios', eq('inicios ÷ vistas', contacto, vistas))}
    ${kpi('Prospectos', nf(pros), 'prospectos', eq('prospectos ÷ visitas', pros, visitas))}
    ${kpi('Ventas', nf(ventas), 'ventas', eq('ventas ÷ prospectos', ventas, d.leads.length))}
    <a class="kpi kpi--link" href="#conversion${days === 7 ? '?p=7' : ''}"><div class="kpi__l">Tasa de conversión</div><div class="kpi__v num">${pct(ventas, d.leads.length)}</div><div class="kpi__e">${eq('ventas ÷ prospectos', ventas, d.leads.length)}</div><div class="kpi__e kpi__go">Ver conversión completa <span aria-hidden="true">&rarr;</span></div></a>
    ${kpi('Primera respuesta', avgV, avgU, resp.length ? `promedio = Σ tiempos ÷ respuestas = ${nf(sum)} min ÷ ${nf(resp.length)} = ${nf(avg, 1)} min` : 'sin prospectos con tiempo de respuesta registrado')}
  </div>
  <section class="panel" aria-labelledby="h-fn"><div class="panel__h"><h2 id="h-fn">Embudo de venta</h2><span class="cap">Cada paso muestra cuántos llegan y qué parte del paso anterior continúa.</span></div>
    <div class="fn">${fn}</div>
    <div class="legend"><span><i></i>Eventos del sitio</span><span><i class="is-b"></i>Etapa actual del prospecto (cuenta la etapa y las posteriores; “perdido” no cuenta)</span></div>
    <p class="cap cap--3" style="margin-top:8px">La longitud de la barra usa raíz cuadrada para que los pasos finales no desaparezcan; las cifras son exactas.</p></section>
  <section class="panel" style="margin-top:20px" aria-labelledby="h-tr"><div class="panel__h"><h2 id="h-tr">Últimos 30 días</h2><span class="cap">${nf(sv)} visitas y ${nf(sl)} prospectos. ${eq('prospectos ÷ visitas', sl, sv)}</span></div>
    <div class="chart__t"><i></i>Visitas por día (visitas)</div>${chart({ vals: vis30, labels, kind: 'bar', unit: 'visitas', aria: 'Visitas por día, últimos 30 días' })}
    <div class="chart__t" style="margin-top:14px"><i class="is-l"></i>Prospectos por día (prospectos)</div>${chart({ vals: lead30, labels, kind: 'line', unit: 'prospectos', aria: 'Prospectos por día, últimos 30 días' })}
    <details class="dt"><summary>Ver los datos por día</summary><div class="xs"><table class="tbl"><thead><tr><th>Día</th><th class="r">Visitas</th><th class="r">Prospectos</th></tr></thead><tbody>${labels.map((t, i) => `<tr><td>${t}</td><td class="r num">${nf(vis30[i])}</td><td class="r num">${nf(lead30[i])}</td></tr>`).join('')}</tbody></table></div></details></section>
  <div class="cols-2" style="margin-top:20px">
    <section class="panel" aria-labelledby="h-src"><div class="panel__h"><h2 id="h-src">Por fuente</h2><span class="cap">Conversión = prospectos ÷ visitas</span></div>
      <div class="xs"><table class="tbl"><thead><tr><th>Fuente</th><th class="r">Visitas</th><th class="r">Prospectos</th><th class="r">Conversión</th></tr></thead><tbody>${srcRows}</tbody></table></div>
      <p class="cap cap--3" style="margin-top:10px">“Buscadores de IA” suma ChatGPT y Perplexity: es la fuente nueva que conviene vigilar.</p></section>
    <section class="panel" aria-labelledby="h-lg"><div class="panel__h"><h2 id="h-lg">Por idioma</h2><span class="cap">Conversión = prospectos ÷ visitas</span></div>
      <div class="xs"><table class="tbl"><thead><tr><th>Idioma</th><th class="r">Visitas</th><th class="r">Prospectos</th><th class="r">Conversión</th></tr></thead><tbody>${row('Español', byLang.es)}${row('Inglés', byLang.en)}</tbody></table></div></section>
  </div>`;
}

// ---------------------------------------------------------------------------
// Vista · Conversion
// ---------------------------------------------------------------------------
const nAp = (l) => l.appts?.length || 0;
const CSTEPS = [
  { name: 'Agenda la primera cita', short: 'Primera cita', f: (l) => nAp(l) >= 1 },
  { name: 'Llega a la segunda cita', short: 'Segunda cita', f: (l) => nAp(l) >= 2 },
  { name: 'Llega a la tercera cita', short: 'Tercera cita', f: (l) => nAp(l) >= 3 },
  { name: 'Visita en persona', short: 'Visita', f: (l) => (l.appts || []).some((x) => x.kind === 'visita') },
  { name: 'Aparta', short: 'Aparta', f: (l) => l.stage === 'apartado' || l.stage === 'venta' },
  { name: 'Cierra la compra', short: 'Compra', f: (l) => l.stage === 'venta' },
];
const stepCounts = (ls) => CSTEPS.map((s) => ls.filter(s.f).length);
const durFmt = (ms) => { const h = ms / 36e5; return h < 48 ? { v: nf(h, 1), u: 'h' } : { v: nf(h / 24, 1), u: 'días' }; };
const cell = (n, b) => `<td class="r"><span class="num">${pct(n, b)}</span><small>${b ? `${nf(n)} ÷ ${nf(b)}` : 'sin datos'}</small></td>`;

function viewConversion(p) {
  const days = p.p === '7' ? 7 : 30, d = dataset(days), L = d.leads, N = L.length;
  const visits = d.ev.filter((e) => e.type === 'vista_pagina').length;
  const cnt = stepCounts(L), sales = cnt[5];
  const firstGaps = L.filter((l) => nAp(l) >= 1).map((l) => Math.max(0, Math.min(...l.appts.map((x) => x.t)) - l.t));
  const fsum = firstGaps.reduce((a, b) => a + b, 0), favg = firstGaps.length ? durFmt(fsum / firstGaps.length) : null, fmed = firstGaps.length ? durFmt(median(firstGaps)) : null;
  const resp = L.filter((l) => typeof l.respMin === 'number'), rsum = resp.reduce((a, l) => a + l.respMin, 0), ravg = resp.length ? rsum / resp.length : null;
  const closes = L.filter((l) => l.stage === 'venta' && l.closedT).map((l) => (l.closedT - l.t) / DAY), csum = closes.reduce((a, b) => a + b, 0);
  const tiles = `<div class="kpis">
    ${kpi('Conversión total', pct(sales, N), '', eq('ventas ÷ prospectos', sales, N))}
    ${kpi('Visita a prospecto', pct(N, visits), '', eq('prospectos ÷ visitas', N, visits))}
    ${kpi('Tiempo a la primera cita', favg ? favg.v : 'sin datos', favg ? favg.u : '', favg ? `promedio = ${nf(fsum / 36e5, 1)} h ÷ ${nf(firstGaps.length)} prospectos con cita. Mediana: ${fmed.v} ${fmed.u}` : 'ningún prospecto con cita en este periodo')}
    ${kpi('Primera respuesta', ravg == null ? 'sin datos' : ravg < 60 ? nf(ravg) : nf(ravg / 60, 1), ravg == null ? '' : ravg < 60 ? 'min' : 'h', resp.length ? `promedio = ${nf(rsum)} min ÷ ${nf(resp.length)} respuestas = ${nf(ravg, 1)} min` : 'sin prospectos con respuesta registrada')}
    ${kpi('Prospecto a cierre', closes.length ? nf(csum / closes.length, 1) : 'sin datos', closes.length ? 'días' : '', closes.length ? `promedio = ${nf(csum, 1)} días ÷ ${nf(closes.length)} ventas con fecha de cierre` : 'ninguna venta con fecha de cierre')}
  </div>`;
  // Probabilidad condicional: de quienes cumplieron el paso base, cuantos cumplen tambien este.
  // La base no siempre es la fila de arriba: la visita en persona puede ocurrir en la 2a cita, asi que su base
  // es "tuvo al menos una cita". Se cuenta la interseccion, por eso nunca pasa de 100 %.
  const BASE = [null, 0, 1, 0, 3, 4];
  const BASE_L = ['de todos los prospectos', 'de quienes tuvieron la primera cita', 'de quienes tuvieron la segunda cita', 'de quienes tuvieron al menos una cita', 'de quienes visitaron en persona', 'de quienes apartaron'];
  const rows = CSTEPS.map((s, i) => {
    const b = BASE[i], pool = b == null ? L : L.filter(CSTEPS[b].f), both = pool.filter(s.f).length;
    return `<div class="pr"><div class="pr__name">${s.name}</div>
      <div class="pr__bar" aria-hidden="true"><i style="width:${N ? Math.max(cnt[i] ? 1.2 : 0, (cnt[i] / N) * 100) : 0}%"></i></div>
      <div class="pr__a"><span class="pr__big num">${pct(cnt[i], N)}</span><span class="pr__l">de todos los prospectos</span><small>${eqs(cnt[i], N)} (${nf(cnt[i])} ÷ ${nf(N)} prospectos)</small></div>
      <div class="pr__a"><span class="pr__big pr__big--2 num">${pct(both, pool.length)}</span><span class="pr__l">${BASE_L[i]}</span><small>${nf(both)} ÷ ${nf(pool.length)}</small></div></div>`;
  }).join('');
  const per100 = (i) => nf((cnt[i] / N) * 100, 0);
  const sentence = N ? `De cada 100 prospectos, ${per100(0)} agendan una cita, ${per100(3)} visitan en persona y ${per100(5)} compran.` : 'Sin prospectos en este periodo: sin datos para calcular.';
  const bySrc = {}; Object.keys(SRC).forEach((k) => { bySrc[k] = L.filter((l) => normSrc(l.source) === k); });
  const grp = (name, ls, subs) => ({ name, ls, subs });
  const groups = [grp(SRC.google, bySrc.google), grp('Buscadores de IA', [...bySrc.chatgpt, ...bySrc.perplexity], [grp(SRC.chatgpt, bySrc.chatgpt), grp(SRC.perplexity, bySrc.perplexity)].sort((a, b) => b.ls.length - a.ls.length)),
    ...['instagram', 'facebook', 'directo', 'broker'].map((k) => grp(SRC[k], bySrc[k])), ...(bySrc.otros.length ? [grp(SRC.otros, bySrc.otros)] : [])].sort((a, b) => b.ls.length - a.ls.length);
  const sold = (g) => g.ls.filter((l) => l.stage === 'venta').length;
  const rate = (g) => (g.ls.length >= 5 ? sold(g) / g.ls.length : -1);
  const bestRate = Math.max(...groups.map(rate)), best = bestRate > 0 ? groups.find((g) => rate(g) === bestRate) : null;
  const gcount = (ls, g) => ls.filter((l) => S.scoreLead(l).grade === g).length;
  const srow = (g, cls = '', isBest = false) => { const ls = g.ls, n = ls.length, c = stepCounts(ls);
    return `<tr class="${cls}${isBest ? ' tr--best' : ''}"><td>${g.name}${isBest ? ' <span class="tag tag--ok">Mejor tasa de venta</span>' : ''}</td><td class="r num">${nf(n)}</td>${cell(n, N)}${cell(c[0], n)}${cell(c[3], n)}${cell(c[5], n)}<td class="r num nw">${['A', 'B', 'C'].map((x) => `${x} ${nf(gcount(ls, x))}`).join(' · ')}</td></tr>`; };
  const srcRows = groups.map((g) => srow(g, g.subs ? 'tr--grp' : '', g === best) + (g.subs ? g.subs.map((s) => srow(s, 'tr--sub')).join('') : '')).join('');
  const brk = (title, id, first, defs) => `<section class="panel" aria-labelledby="${id}"><div class="panel__h"><h2 id="${id}">${title}</h2><span class="cap">Cada cifra = prospectos que llegan al paso ÷ prospectos del grupo</span></div><div class="xs"><table class="tbl"><thead><tr><th>${first}</th><th class="r">Prospectos</th>${CSTEPS.map((s) => `<th class="r">${s.short}</th>`).join('')}</tr></thead><tbody>${defs.map(([name, ls]) => { const c = stepCounts(ls); return `<tr><td>${name}</td><td class="r num">${nf(ls.length)}</td>${c.map((n) => cell(n, ls.length)).join('')}</tr>`; }).join('')}</tbody></table></div></section>`;
  const gradeOf = (g) => L.filter((l) => S.scoreLead(l).grade === g);
  return `<div class="vhead"><div><h1>Conversión</h1><p>Del ${fdate(d.from)} al ${fdate(d.now)}: ${nf(N)} prospectos creados y ${nf(visits)} visitas al sitio. Cada cifra muestra su cuenta.</p></div>${periodSeg(p)}</div>
  ${tiles}
  <section class="panel" aria-labelledby="h-pr"><div class="panel__h"><h2 id="h-pr">Probabilidad de avanzar</h2><span class="cap">Cada prospecto se cuenta en el periodo en que fue creado.</span></div>
    <div class="prs">${rows}</div><p class="pr__sum">${sentence}</p></section>
  <section class="panel" style="margin-top:20px" aria-labelledby="h-fu"><div class="panel__h"><h2 id="h-fu">De dónde vienen los prospectos</h2><span class="cap">Ordenado por prospectos. ${best ? `Mejor tasa de venta (mínimo 5 prospectos): ${best.name}, ${eqs(sold(best), best.ls.length)}.` : 'Se marca la mejor tasa de venta cuando una fuente tiene al menos 5 prospectos y alguna venta.'}</span></div>
    <div class="xs"><table class="tbl"><thead><tr><th>Fuente</th><th class="r">Prospectos</th><th class="r">% del total</th><th class="r">Agendaron cita</th><th class="r">Visitaron en persona</th><th class="r">Ventas</th><th class="r">Grados</th></tr></thead><tbody>${srcRows}</tbody></table></div>
    <p class="cap cap--3" style="margin-top:10px">“Buscadores de IA” suma ChatGPT y Perplexity. Cita, visita y venta = prospectos de esa fuente en ese paso ÷ prospectos de esa fuente.</p></section>
  <div class="stackv" style="margin-top:20px">${brk('Por idioma', 'h-lg2', 'Idioma', [['Español', L.filter((l) => l.lang !== 'en')], ['Inglés', L.filter((l) => l.lang === 'en')]])}
  ${brk('Por grado', 'h-gr', 'Grado', ['A', 'B', 'C'].map((g) => [`Grado ${g}`, gradeOf(g)]))}</div>`;
}

// ---------------------------------------------------------------------------
// Vista 2 · Prospectos
// ---------------------------------------------------------------------------
const enrich = () => S.leads().map((l) => ({ ...l, ...S.scoreLead(l) }));
const closed = (l) => l.stage === 'venta' || l.stage === 'perdido';
const GR = { A: 0, B: 1, C: 2 };
const queueSort = (a, b) => (a.stage === 'nuevo' ? 0 : closed(a) ? 2 : 1) - (b.stage === 'nuevo' ? 0 : closed(b) ? 2 : 1) || GR[a.grade] - GR[b.grade] || b.t - a.t;
function filteredLeads(p, ignoreStage) {
  return enrich().filter((l) => (!p.grade || l.grade === p.grade) && (ignoreStage || !p.stage || l.stage === p.stage) && (!p.dev || devOf(S.property(l.propertyId)) === p.dev) && (!p.lang || l.lang === p.lang)).sort(queueSort);
}
const gradeBadge = (l) => `<span class="grade grade--${l.grade}" title="${l.score} de 100 puntos">${l.grade}<small>${l.score} pts</small></span>`;
const stageOpts = (cur) => S.STAGES.map((s) => `<option value="${s.k}" ${s.k === cur ? 'selected' : ''}>${s.es}</option>`).join('');
const propLink = (pr, id) => (pr ? `<a href="${pubUrl(pr.id)}" target="_blank" rel="noopener">${esc(ptitle(pr))}</a><small>${esc(devName(pr))}</small>` : `<span class="muted">${id ? esc(id) : 'Sin propiedad'}</span>`);

function viewProspectos(p) {
  const all = enrich();
  const rows = filteredLeads(p);
  const mode = p.mode === 'tablero' ? 'tablero' : 'lista';
  const gc = (g) => all.filter((l) => l.grade === g).length;
  const seg = (k, opts) => `<div class="seg" role="group" aria-label="${k === 'grade' ? 'Grado' : 'Vista'}">${opts.map(([v, t]) => `<button type="button" data-act="f" data-k="${k}" data-v="${v}" aria-pressed="${(p[k] || (k === 'grade' ? 'todos' : 'lista')) === v}">${t}</button>`).join('')}</div>`;
  const sel = (k, label, opts) => `<select class="select select--sm" data-f="${k}" aria-label="${label}">${opts.map(([v, t]) => `<option value="${v}" ${(p[k] || '') === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  const filters = `<div class="filters">${seg('grade', [['todos', 'Todos'], ['A', `A · ${gc('A')}`], ['B', `B · ${gc('B')}`], ['C', `C · ${gc('C')}`]])}
    ${mode === 'lista' ? sel('stage', 'Etapa', [['', 'Todas las etapas'], ...S.STAGES.map((s) => [s.k, s.es])]) : ''}
    ${sel('dev', 'Desarrollo', [['', 'Todos los desarrollos'], ['punta-del-cielo', DEV['punta-del-cielo']], ['terraviva', DEV.terraviva], ['individual', DEV.individual]])}
    ${sel('lang', 'Idioma', [['', 'Todos los idiomas'], ['es', 'Español'], ['en', 'Inglés']])}
    <span style="flex:1"></span>${seg('mode', [['lista', 'Lista'], ['tablero', 'Tablero']])}</div>`;
  let body;
  if (!all.length) body = '<div class="empty">Todavía no hay prospectos. Cuando alguien complete el formulario del sitio público aparecerá aquí.</div>';
  else if (mode === 'lista') {
    body = rows.length ? `<div class="xs"><table class="tbl"><thead><tr><th>Prospecto</th><th>Grado</th><th>Propiedad de interés</th><th>Interés</th><th class="hide-m">Presupuesto</th><th class="hide-m">Plazo</th><th class="hide-m">Pago</th><th class="hide-m">Fuente</th><th class="hide-m">Idioma</th><th class="r">Citas</th><th>Hace</th><th>Etapa</th></tr></thead><tbody>${rows.map((l) => {
      const pr = S.property(l.propertyId);
      return `<tr class="tr--click" data-act="open" data-id="${esc(l.id)}"><td><button type="button" class="rowlink" data-act="open" data-id="${esc(l.id)}">${esc(l.name)}</button>${l.stage === 'nuevo' ? ' <span class="tag">Sin responder</span>' : ''}<small>${esc(l.email || '')}</small></td>
        <td>${gradeBadge(l)}</td><td>${propLink(pr, l.propertyId)}</td><td>${INTENT[l.intent] || '—'}</td>
        <td class="hide-m">${esc(lab(S.BUDGETS, l.budget))}</td><td class="hide-m">${esc(lab(S.WHEN, l.when))}</td><td class="hide-m">${esc(lab(S.PAY, l.pay))}</td>
        <td class="hide-m">${SRC[normSrc(l.source)]}</td><td class="hide-m">${l.lang === 'en' ? 'Inglés' : 'Español'}</td><td class="r num">${nf(l.appts?.length || 0)}</td><td class="nw">${age(l.t)}</td><td class="nw">${STAGE(l.stage)}</td></tr>`;
    }).join('')}</tbody></table></div>` : '<div class="empty">Ningún prospecto coincide con estos filtros.</div>';
  } else {
    const bRows = filteredLeads(p, true);
    body = `<div class="board">${S.STAGES.map((s) => { const cs = bRows.filter((l) => l.stage === s.k);
      return `<section class="col" aria-label="${s.es}"><div class="col__h"><span>${s.es}</span><span class="num">${cs.length}</span></div>${cs.map((l) => { const pr = S.property(l.propertyId);
        return `<article class="card2"><div class="card2__top"><button type="button" class="rowlink" data-act="open" data-id="${esc(l.id)}">${esc(l.name)}</button>${gradeBadge(l)}</div>
          <div class="cap">${pr ? esc(ptitle(pr)) : 'Sin propiedad'} · hace ${age(l.t)}</div>
          <select class="select select--sm" data-act="move" data-id="${esc(l.id)}" aria-label="Mover a ${esc(l.name)} a otra etapa">${stageOpts(l.stage)}</select></article>`; }).join('') || '<p class="cap cap--3" style="padding:6px 4px">Sin prospectos</p>'}</section>`; }).join('')}</div>`;
  }
  return `<div class="vhead"><div><h1>Prospectos</h1><p>Cola de trabajo del equipo.</p></div></div>
  <div class="rule"><b>A</b> (70 a 100 puntos): llamar hoy. <b>B</b> (40 a 69): dar seguimiento. <b>C</b> (0 a 39): nutrir con contenido. Así el equipo dedica su tiempo a compradores reales.</div>
  <section class="panel">${filters}<p class="cap" style="margin:-4px 0 12px">Mostrando ${nf(mode === 'lista' ? rows.length : filteredLeads(p, true).length)} de ${nf(all.length)} prospectos. Orden: nuevos sin responder primero, luego grado A a C y más recientes arriba; los cerrados al final.</p>${body}</section>`;
}

// ---- Movimientos de prospecto ---------------------------------------------
const noteOf = (n, l) => (typeof n === 'string' ? { t: l.t, text: n } : n);
async function moveLead(id, to) {
  const l = S.leads().find((x) => x.id === id);
  if (!l || l.stage === to) { refresh(); return; }
  const patch = { stage: to };
  let text = `Etapa: ${STAGE(l.stage)} → ${STAGE(to)}`;
  if (to === 'perdido') {
    const r = await askLost(l);
    if (!r) { refresh(); return; }
    patch.lostReason = r; text += `. Motivo: ${r}`;
  }
  if (l.stage === 'nuevo' && to !== 'perdido' && typeof l.respMin !== 'number') patch.respMin = Math.max(1, Math.round((Date.now() - l.t) / MIN));
  patch.notes = [...(l.notes || []), { t: Date.now(), text, sys: 1 }];
  S.updateLead(id, patch);
  refresh();
  notify(`${l.name}: ${STAGE(l.stage)} → ${STAGE(to)}`, { undo: () => {
    const cur = S.leads().find((x) => x.id === id);
    S.updateLead(id, { stage: l.stage, lostReason: l.lostReason ?? null, respMin: l.respMin, notes: [...(cur?.notes || []), { t: Date.now(), text: `Cambio deshecho: vuelve a ${STAGE(l.stage)}`, sys: 1 }] });
    refresh();
  } });
}

// ---- Cajon de detalle ------------------------------------------------------
const drawer = h('<aside class="drawer" role="dialog" aria-modal="true" aria-label="Detalle del prospecto" inert></aside>');
const scrim = h('<div class="scrim"></div>');
layer.append(scrim, drawer);
let drawerOpener = null, drawerId = null;
const ART = { departamento: 'el', casa: 'la', terreno: 'el' };
const descEs = (p) => (p.title ? p.title.es : `${ART[p.type] || 'el'} ${TYPE(p.type).toLowerCase()} ${p.model}${p.level?.es ? ` (${p.level.es})` : ''}${p.project ? ` en ${DEV[p.project]}` : ''}`);
const descEn = (p) => (p.title ? p.title.en || p.title.es : `the ${p.model} ${TYPES[p.type].en.toLowerCase()}${p.project ? ` at ${DEV[p.project]}` : ''}`);
function firstMessage(l, pr) {
  const first = (l.name || '').trim().split(/\s+/)[0] || '';
  if (l.lang === 'en') {
    const usd = pr ? `$${nf(Math.round(pr.price / FX / 100) * 100)} USD` : '';
    return `Hi ${first}, this is the Inmobiliaria San Miguel team. Thank you for your interest in ${pr ? `${descEn(pr)} (${usd})` : 'our properties'}. Would you like to book a 30-minute video call this week? We can go over pricing and floor plans and answer any questions${l.intent === 'visita' ? ', and plan your visit' : ''}. What day and time work best for you?`;
  }
  return `Hola ${first}, te escribe el equipo de Inmobiliaria San Miguel. Gracias por tu interés en ${pr ? `${descEs(pr)} (${money(pr.price)})` : 'nuestras propiedades'}. ¿Te gustaría agendar una videollamada de 30 minutos esta semana? En ella revisamos precios y planos y resolvemos tus dudas${l.intent === 'visita' ? ', y coordinamos tu visita' : ''}. ¿Qué día y horario te acomodan mejor?`;
}
function breakdown(l, pr) {
  const w = S.WHEN.find((x) => x.k === l.when), py = S.PAY.find((x) => x.k === l.pay), b = S.BUDGETS.find((x) => x.k === l.budget);
  let bp = 0, why = 'Sin presupuesto indicado';
  if (b && pr) { bp = pr.price <= b.max ? 20 : pr.price <= b.max * 1.15 ? 8 : 0; why = `${money(pr.price)} ${bp === 20 ? 'cabe dentro de' : bp === 8 ? 'excede hasta 15 % el tope de' : 'excede más de 15 % el tope de'} “${b.es}”`; }
  else if (b) { bp = 10; why = `“${b.es}”, sin propiedad elegida`; }
  const ip = l.intent === 'videollamada' || l.intent === 'visita' ? 10 : 0;
  const rows = [['Plazo de compra', w?.es ?? 'Sin respuesta', w?.pts || 0], ['Forma de pago', py?.es ?? 'Sin respuesta', py?.pts || 0], ['Ajuste de presupuesto', why, bp], ['Intención', INTENT[l.intent] || 'Sin respuesta', ip]];
  return { rows, raw: rows.reduce((a, r) => a + r[2], 0) };
}
const KIND = { videollamada: 'Videollamada', visita: 'Visita en persona' };
function apptHTML(l) {
  const a = l.appts || [];
  return `${a.length ? `<ol class="tline">${a.map((x) => `<li><b>Cita ${nf(x.n)}</b><span>${fdt(x.t)} · ${KIND[x.kind] || esc(x.kind)}</span></li>`).join('')}</ol>` : '<p class="cap cap--3">Sin citas registradas.</p>'}
    <div class="row" style="margin-top:12px"><button class="btn btn--ghost btn--sm" type="button" data-act="appt" data-kind="videollamada">Registrar videollamada</button><button class="btn btn--ghost btn--sm" type="button" data-act="appt" data-kind="visita">Registrar visita en persona</button></div>
    <p class="cap cap--3" style="margin-top:8px">Se guarda con la fecha y hora de este momento; las citas no se editan ni se borran.</p>`;
}
function drawerHTML(l) {
  const pr = S.property(l.propertyId); const sc = S.scoreLead(l); const bd = breakdown(l, pr);
  const msg = firstMessage(l, pr); const digits = String(l.phone || '').replace(/\D/g, '');
  const notes = (l.notes || []).map((n) => noteOf(n, l)).slice().reverse();
  const gradeTxt = sc.grade === 'A' ? 'A: llamar hoy' : sc.grade === 'B' ? 'B: dar seguimiento' : 'C: nutrir con contenido';
  return { head: `<div><h2>${esc(l.name)}</h2><p class="cap" style="margin-top:6px">${gradeBadge({ ...l, ...sc })} <span style="margin-left:6px">Recibido ${fdt(l.t)} · hace ${age(l.t)}</span></p></div><button class="icon-btn" type="button" data-act="close" aria-label="Cerrar detalle">${icon('close')}</button>`,
    body: `<div class="dsec"><h3>Etapa</h3><div class="row"><select class="select select--sm" data-act="move" data-id="${esc(l.id)}" aria-label="Cambiar etapa">${stageOpts(l.stage)}</select>${l.stage === 'nuevo' ? '<span class="tag">Sin responder</span>' : ''}</div>${l.stage === 'perdido' && l.lostReason ? `<p class="cap" style="margin-top:8px">Motivo: ${esc(l.lostReason)}</p>` : ''}</div>
    <div class="dsec"><h3>Respuestas del prospecto</h3><dl class="kv">
      <dt>Propiedad</dt><dd>${pr ? `<a class="link" href="${pubUrl(pr.id)}" target="_blank" rel="noopener">${esc(ptitle(pr))}</a><br><span class="cap">${esc(devName(pr))} · ${money(pr.price)}</span>` : esc(l.propertyId || 'Sin propiedad')}</dd>
      <dt>Interés</dt><dd>${INTENT[l.intent] || '—'}</dd><dt>Presupuesto</dt><dd>${esc(lab(S.BUDGETS, l.budget))}</dd><dt>Plazo</dt><dd>${esc(lab(S.WHEN, l.when))}</dd><dt>Forma de pago</dt><dd>${esc(lab(S.PAY, l.pay))}</dd>
      ${l.slot ? `<dt>Horario</dt><dd>${esc(l.slot)}</dd>` : ''}<dt>Correo</dt><dd>${esc(l.email || '—')}</dd><dt>Teléfono</dt><dd>${esc(l.phone || '—')}</dd><dt>Fuente</dt><dd>${SRC[normSrc(l.source)]}</dd><dt>Idioma</dt><dd>${l.lang === 'en' ? 'Inglés' : 'Español'}</dd>
      ${typeof l.respMin === 'number' ? `<dt>1.ª respuesta</dt><dd>${nf(l.respMin)} min</dd>` : ''}</dl></div>
    <div class="dsec"><h3>Citas</h3>${apptHTML(l)}</div>
    <div class="dsec"><h3>Por qué esta calificación</h3><table class="pts"><tbody>${bd.rows.map((r) => `<tr><td>${r[0]}<small>${esc(r[1])}</small></td><td>${r[2] >= 0 ? '+' : ''}${r[2]} pts</td></tr>`).join('')}</tbody></table>
      <p class="cap" style="margin-top:10px">${bd.rows.map((r) => r[2]).join(' + ')} = ${bd.raw} puntos${bd.raw > 100 ? ' (máximo 100)' : ''} → grado ${gradeTxt}. Umbrales: A desde 70, B desde 40.</p></div>
    <div class="dsec"><h3>Primer mensaje (${l.lang === 'en' ? 'inglés' : 'español'})</h3><textarea class="textarea msg" id="msg" aria-label="Primer mensaje">${esc(msg)}</textarea>
      <div class="row" style="margin-top:10px"><button class="btn btn--primary btn--sm" type="button" data-act="copy">Copiar mensaje</button>
      ${digits.length >= 10 ? `<a class="btn btn--ghost btn--sm" id="wa" href="https://wa.me/${digits}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Abrir en WhatsApp</a>` : l.email ? `<a class="btn btn--ghost btn--sm" href="mailto:${esc(l.email)}?body=${encodeURIComponent(msg)}">Abrir en correo</a>` : ''}</div>
      <p class="cap cap--3" style="margin-top:8px">${digits.length >= 10 ? 'WhatsApp solo se abre con el texto escrito; no se envía nada automáticamente. Si editas el mensaje, copia el texto.' : 'Este prospecto no dejó teléfono: usa el correo.'}</p></div>
    <div class="dsec"><h3>Notas</h3><div class="notes">${notes.map((n) => `<div class="note ${n.sys ? 'note--sys' : ''}"><small>${fdt(n.t)}${n.sys ? ' · automática' : ''}</small>${esc(n.text)}</div>`).join('') || '<p class="cap cap--3">Sin notas todavía.</p>'}</div>
      <label class="label" for="note-in" style="display:block;margin-bottom:8px">Nueva nota</label><textarea class="textarea" id="note-in" style="min-height:84px" placeholder="Qué se habló, qué sigue"></textarea>
      <div class="row" style="margin-top:10px"><button class="btn btn--ghost btn--sm" type="button" data-act="note">Agregar nota</button><span class="cap cap--3">Las notas se agregan con fecha y hora; no se editan ni se borran.</span></div></div>` };
}
function fillDrawer(l, same) {
  const keep = same ? $('#note-in', drawer)?.value : '', top = $('.drawer__b', drawer)?.scrollTop || 0;
  const d = drawerHTML(l);
  drawer.innerHTML = `<div class="drawer__h">${d.head}</div><div class="drawer__b">${d.body}</div>`;
  drawer.dataset.id = l.id;
  if (keep) $('#note-in', drawer).value = keep;
  $('.drawer__b', drawer).scrollTop = top;
}
function syncDrawer(id) {
  const l = id && S.leads().find((x) => x.id === id);
  if (!l) {
    if (drawerId) { drawer.classList.remove('is-on'); scrim.classList.remove('is-on'); drawer.inert = true; drawerId = null; drawerOpener?.focus?.({ preventScroll: true }); drawerOpener = null; }
    return;
  }
  const wasOpen = !!drawerId;
  if (!wasOpen) drawerOpener = document.activeElement;
  const same = drawerId === id; drawerId = id; fillDrawer(l, same); drawer.inert = false;
  requestAnimationFrame(() => { drawer.classList.add('is-on'); scrim.classList.add('is-on'); });
  if (!wasOpen) setTimeout(() => $('[data-act="close"]', drawer)?.focus({ preventScroll: true }), 60);
}
scrim.addEventListener('click', () => go({ lead: null }));
drawer.addEventListener('click', async (e) => {
  const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
  const id = drawer.dataset.id;
  if (a === 'close') go({ lead: null });
  if (a === 'copy') {
    const t = $('#msg', drawer).value;
    try { await navigator.clipboard.writeText(t); } catch { $('#msg', drawer).select(); document.execCommand?.('copy'); }
    notify('Mensaje copiado');
  }
  if (a === 'appt') {
    const b = e.target.closest('[data-act]'), kind = b.dataset.kind, l = S.leads().find((x) => x.id === id);
    if (!l || b.disabled || !KIND[kind]) return;
    $$('[data-act="appt"]', drawer).forEach((x) => { x.disabled = true; });
    const ap = S.addAppt(id, kind);
    refresh(); notify(`Registrada: cita ${nf(ap.length)} de ${l.name}, ${KIND[kind].toLowerCase()}, ${fdt(Date.now())}`);
  }
  if (a === 'note') {
    const ta = $('#note-in', drawer), text = ta.value.trim();
    if (!text) { ta.setAttribute('aria-invalid', 'true'); ta.focus(); return; }
    const l = S.leads().find((x) => x.id === id);
    S.updateLead(id, { notes: [...(l.notes || []), { t: Date.now(), text }] });
    ta.value = ''; refresh(); notify('Nota agregada');
  }
});
drawer.addEventListener('change', (e) => { if (e.target.dataset.act === 'move') moveLead(e.target.dataset.id, e.target.value); });
drawer.addEventListener('input', (e) => { if (e.target.id === 'msg') { const wa = $('#wa', drawer); const d = String(S.leads().find((x) => x.id === drawer.dataset.id)?.phone || '').replace(/\D/g, ''); if (wa) wa.href = `https://wa.me/${d}?text=${encodeURIComponent(e.target.value)}`; } if (e.target.id === 'note-in') e.target.removeAttribute('aria-invalid'); });
document.addEventListener('keydown', (e) => {
  if (!drawerId || $('.modal.is-open')) return;
  if (e.key === 'Escape') go({ lead: null });
  else if (e.key === 'Tab') trapTab(e, drawer);
});

// ---------------------------------------------------------------------------
// Vista 3 · Inventario
// ---------------------------------------------------------------------------
let editing = null;
const parseMoney = (s) => { const t = String(s).trim().replace(/[\s$,]|MXN/gi, ''); return /^\d+(\.\d{1,2})?$/.test(t) ? +t : NaN; };
const signed = (x) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${nf(Math.abs(x) * 100, 1, true)} %`;
const statusTag = { disponible: 'tag--ok', apartado: '', vendido: 'tag--sold' };
function invRows(p) {
  const q = (p.q || '').trim().toLowerCase();
  return S.properties().filter((x) => (!p.dev || devOf(x) === p.dev) && (!p.type || x.type === p.type) && (!p.status || x.status === p.status)
    && (!q || `${ptitle(x)} ${x.model} ${x.id} ${x.level?.es || ''} ${devName(x)}`.toLowerCase().includes(q)));
}
function invSummary() {
  const all = S.properties(), av = all.filter((x) => x.status === 'disponible'), tot = av.reduce((a, x) => a + x.price, 0);
  const t = (l, v, u, e) => kpi(l, v, u, e);
  return `<div class="strip">${t('Disponibles', nf(av.length), 'propiedades', `de ${nf(all.length)} en total`)}${t('Apartadas', nf(all.filter((x) => x.status === 'apartado').length), 'propiedades', 'reservadas, precio congelado')}${t('Vendidas', nf(all.filter((x) => x.status === 'vendido').length), 'propiedades', 'se muestran como vendidas en el sitio')}${t('Valor disponible', money(tot), '', `suma de los ${nf(av.length)} precios de las propiedades disponibles`)}</div>`;
}
function invBody(p) {
  const rows = invRows(p), total = S.properties().length;
  const trs = rows.map((x) => {
    const a = area(x), isE = editing === x.id;
    const priceCell = isE
      ? `<form class="inl" data-form="price" data-id="${esc(x.id)}" novalidate><input class="input input--sm" name="v" value="${x.price}" inputmode="decimal" autocomplete="off" aria-label="Nuevo precio de ${esc(ptitle(x))} en MXN" aria-describedby="pv-${esc(x.id)}"><button class="btn btn--primary btn--tiny" type="submit">Guardar</button><button class="btn btn--ghost btn--tiny" type="button" data-act="cancel-edit">Cancelar</button></form>
         <div class="inl__prev" id="pv-${esc(x.id)}" aria-live="polite">Antes ${money(x.price)} · Ahora ${money(x.price)}</div><div class="field__err" hidden></div>`
      : `<button type="button" class="editcell" data-act="edit-price" data-id="${esc(x.id)}" aria-label="Editar precio de ${esc(ptitle(x))}, hoy ${money(x.price)}"><span class="num">${money(x.price)}</span>${svg(IC.pencil, 15)}</button>`;
    return `<tr><td><b>${esc(ptitle(x))}</b><small>${esc(x.level?.es || x.id)}</small></td><td>${esc(devName(x))}</td><td class="hide-m">${TYPE(x.type)}</td><td class="r num hide-m">${a ? `${nf(a, 1)} m²` : 'sin datos'}</td>
      <td>${priceCell}</td><td class="r num hide-m">${a ? `${money(Math.round(x.price / a))}/m²` : 'sin datos'}</td>
      <td><select class="select select--sm" data-act="status" data-id="${esc(x.id)}" aria-label="Estatus de ${esc(ptitle(x))}">${Object.keys(STATUS).map((k) => `<option value="${k}" ${k === x.status ? 'selected' : ''}>${STATUS[k].es}</option>`).join('')}</select></td>
      <td class="hide-m">${DELIVERY[x.delivery]?.es || '—'}</td>
      <td><div class="acts"><a class="btn btn--ghost btn--tiny" href="${pubUrl(x.id)}" target="_blank" rel="noopener">Ver</a><button type="button" class="btn btn--ghost btn--tiny" data-act="archive" data-id="${esc(x.id)}">Archivar</button></div></td></tr>`;
  }).join('');
  return `<p class="cap" style="margin:-4px 0 12px">Mostrando ${nf(rows.length)} de ${nf(total)} propiedades. Precio por m² = precio ÷ área construida (en terrenos, área del lote).</p>
    ${rows.length ? `<div class="xs"><table class="tbl"><thead><tr><th>Propiedad</th><th>Desarrollo</th><th class="hide-m">Tipo</th><th class="r hide-m">Área</th><th>Precio</th><th class="r hide-m">Precio por m²</th><th>Estatus</th><th class="hide-m">Entrega</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${trs}</tbody></table></div>` : '<div class="empty">Ninguna propiedad coincide con estos filtros.</div>'}`;
}
function archivedList() {
  const ov = readLS('overrides', {});
  return [...SEED, ...readLS('added', [])].map((x) => ({ ...x, ...(ov[x.id] || {}) })).filter((x) => x.deleted);
}
function viewInventario(p) {
  const arch = archivedList();
  const sel = (k, label, opts) => `<select class="select select--sm" data-f="${k}" aria-label="${label}">${opts.map(([v, t]) => `<option value="${v}" ${(p[k] || '') === v ? 'selected' : ''}>${t}</option>`).join('')}</select>`;
  return `<div class="vhead"><div><h1>Inventario</h1><p>Fuente única de verdad del sitio público.</p></div><button class="btn btn--primary" type="button" data-act="add">Agregar propiedad individual</button></div>
  <div class="live" role="note"><span><b>Los cambios se publican al instante.</b> Cada precio o estatus que guardes aquí se ve de inmediato en el sitio público. Nada se borra: lo que ya no debe verse se archiva y se puede restaurar.</span></div>
  <div id="inv-summary">${invSummary()}</div>
  <section class="panel"><div class="filters"><input class="input input--sm" type="search" id="inv-q" value="${esc(p.q || '')}" placeholder="Buscar modelo, lote o desarrollo" aria-label="Buscar propiedades" style="width:min(280px,100%)">
    ${sel('dev', 'Desarrollo', [['', 'Todos los desarrollos'], ['punta-del-cielo', DEV['punta-del-cielo']], ['terraviva', DEV.terraviva], ['individual', DEV.individual]])}
    ${sel('type', 'Tipo', [['', 'Todos los tipos'], ...Object.keys(TYPES).map((k) => [k, TYPES[k].pl.es])])}
    ${sel('status', 'Estatus', [['', 'Todos los estatus'], ...Object.keys(STATUS).map((k) => [k, STATUS[k].es])])}</div>
    <div id="inv-body">${invBody(p)}</div>
    ${arch.length ? `<details class="arch"><summary>Archivadas (${arch.length})</summary><div class="xs"><table class="tbl"><tbody>${arch.map((x) => `<tr><td><b>${esc(ptitle(x))}</b><small>${esc(devName(x))}</small></td><td class="num">${money(x.price)}</td><td class="r"><button type="button" class="btn btn--ghost btn--tiny" data-act="restore" data-id="${esc(x.id)}">Restaurar</button></td></tr>`).join('')}</tbody></table></div></details>` : ''}</section>`;
}
function redrawInv() { const { p } = parseHash(); const b = $('#inv-body'); if (b) b.innerHTML = invBody(p); const s = $('#inv-summary'); if (s) s.innerHTML = invSummary(); $('[data-form="price"] input')?.focus(); }

async function savePrice(form) {
  const id = form.dataset.id, x = S.property(id); if (!x) return;
  const err = $('.field__err', form.parentElement), inp = form.elements.v;
  const np = parseMoney(inp.value);
  const fail = (m) => { err.hidden = false; err.textContent = m; inp.setAttribute('aria-invalid', 'true'); inp.focus(); };
  if (!(np > 0)) { fail('Escribe un número positivo en pesos, por ejemplo 3,350,000.'); return; }
  if (np === x.price) { fail('Es el mismo precio de hoy. Cambia el valor o cancela.'); return; }
  const delta = (np - x.price) / x.price;
  if (Math.abs(delta) > 0.2) {
    const ok = await confirmDlg({ title: 'Cambio de precio mayor a 20 %', ok: 'Sí, cambiar el precio', body: `<p class="muted">${esc(ptitle(x))}. Revisa que no falte o sobre un cero.</p><dl class="kv" style="margin-top:14px"><dt>Precio actual</dt><dd class="num">${money(x.price)}</dd><dt>Precio nuevo</dt><dd class="num"><b>${money(np)}</b></dd><dt>Cambio</dt><dd class="num">${signed(delta)} <span class="cap">= (nuevo − actual) ÷ actual = (${nf(np)} − ${nf(x.price)}) ÷ ${nf(x.price)}</span></dd></dl><p class="cap" style="margin-top:12px">Se verá en el sitio público de inmediato.</p>` });
    if (!ok) { inp.focus(); return; }
  }
  const old = x.price;
  S.updateProperty(id, { price: np }); editing = null; redrawInv();
  notify(`Precio actualizado: ${money(old)} → ${money(np)}`, { undo: () => { S.updateProperty(id, { price: old }); redrawInv(); notify('Precio restaurado'); } });
}
async function saveStatus(sel) {
  const id = sel.dataset.id, x = S.property(id); if (!x) return;
  const to = sel.value, old = x.status;
  if (to === 'vendido') {
    const ok = await confirmDlg({ title: 'Marcar como vendido', ok: 'Sí, marcar como vendido', body: `<p class="muted"><b>${esc(ptitle(x))}</b> (${money(x.price)}) aparecerá como vendida en el sitio público de inmediato. Si fue un error, podrás deshacerlo después.</p>` });
    if (!ok) { redrawInv(); return; }
  }
  S.updateProperty(id, { status: to }); redrawInv();
  notify(`${ptitle(x)}: ${STATUS[old].es} → ${STATUS[to].es}`, { undo: () => { S.updateProperty(id, { status: old }); redrawInv(); notify('Estatus restaurado'); } });
}
async function archive(id) {
  const x = S.property(id); if (!x) return;
  const ok = await confirmDlg({ title: 'Archivar propiedad', ok: 'Archivar', body: `<p class="muted"><b>${esc(ptitle(x))}</b> dejará de verse en el sitio público. No se borra: la encuentras en “Archivadas” y puedes restaurarla.</p>` });
  if (!ok) return;
  S.updateProperty(id, { deleted: true }); refresh();
  notify(`${ptitle(x)} archivada`, { undo: () => { S.updateProperty(id, { deleted: false }); refresh(); } });
}

// ---- Agregar propiedad individual -----------------------------------------
function openAdd() {
  const field = (id, label, input, hint = '') => `<div class="field" data-fld="${id}"><label for="np-${id}">${label}</label>${input}${hint ? `<span class="hint">${hint}</span>` : ''}<span class="field__err" hidden></span></div>`;
  const { el, close } = openModal(`${closeBtn}<h2 class="h3">Agregar propiedad individual</h2><p class="muted" style="margin-bottom:18px">Al guardar, la propiedad aparece de inmediato en el sitio público.</p>
    <form id="np" novalidate><div class="grid-f">
      ${field('es', 'Título en español', '<input class="input" id="np-es" name="es" autocomplete="off" placeholder="Casa Los Laureles">')}
      ${field('en', 'Título en inglés', '<input class="input" id="np-en" name="en" autocomplete="off" placeholder="Los Laureles House">')}
      ${field('type', 'Tipo', `<select class="select" id="np-type" name="type"><option value="">Elige un tipo</option>${Object.keys(TYPES).map((k) => `<option value="${k}">${TYPES[k].es}</option>`).join('')}</select>`)}
      ${field('price', 'Precio (MXN)', '<input class="input" id="np-price" name="price" inputmode="decimal" autocomplete="off" placeholder="3,350,000">')}
      <div class="field" data-fld="beds" data-for="build"><label for="np-beds">Recámaras</label><input class="input" id="np-beds" name="beds" inputmode="numeric" autocomplete="off"><span class="field__err" hidden></span></div>
      <div class="field" data-fld="baths" data-for="build"><label for="np-baths">Baños</label><input class="input" id="np-baths" name="baths" inputmode="numeric" autocomplete="off"><span class="field__err" hidden></span></div>
      <div class="field" data-fld="built" data-for="build"><label for="np-built">Área construida (m²)</label><input class="input" id="np-built" name="built" inputmode="decimal" autocomplete="off"><span class="field__err" hidden></span></div>
      <div class="field" data-fld="lot"><label for="np-lot">Área del lote (m²) <span class="hint" id="lot-req">opcional</span></label><input class="input" id="np-lot" name="lot" inputmode="decimal" autocomplete="off"><span class="field__err" hidden></span></div>
      ${field('delivery', 'Entrega', `<select class="select" id="np-delivery" name="delivery">${Object.keys(DELIVERY).map((k) => `<option value="${k}">${DELIVERY[k].es}</option>`).join('')}</select>`)}
      <div class="field span" data-fld="imgs"><label for="np-imgs">Imágenes (opcional, una dirección por línea)</label><textarea class="textarea" id="np-imgs" name="imgs" placeholder="https://static.wixstatic.com/media/…"></textarea><span class="hint">Se aceptan direcciones de static.wixstatic.com. Otras direcciones se guardan, pero el sitio público puede no mostrarlas.</span><span class="field__err" hidden></span></div>
    </div><div class="dlg__act"><button class="btn btn--ghost" type="button" data-x>Cancelar</button><button class="btn btn--primary" type="submit">Guardar y publicar</button></div></form>`, { label: 'Agregar propiedad individual', wide: true });
  const f = $('#np', el);
  const syncType = () => {
    const land = f.elements.type.value === 'terreno';
    $$('[data-for="build"]', f).forEach((n) => { n.hidden = land; });
    $('#lot-req', f).textContent = land ? 'obligatorio' : 'opcional';
    if (land) f.elements.delivery.value = 'terreno'; else if (f.elements.delivery.value === 'terreno') f.elements.delivery.value = 'inmediata';
  };
  f.addEventListener('change', (e) => { if (e.target.name === 'type') syncType(); });
  f.addEventListener('input', (e) => { const w = e.target.closest('[data-fld]'); if (w) { e.target.removeAttribute('aria-invalid'); $('.field__err', w).hidden = true; } });
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (n) => f.elements[n].value.trim(), land = v('type') === 'terreno', errs = [];
    const pos = (s) => { const n = Number(String(s).replace(',', '.')); return Number.isFinite(n) && n > 0 && /^\d+([.,]\d+)?$/.test(s) ? n : NaN; };
    if (!v('es')) errs.push(['es', 'Escribe el título en español.']);
    if (!v('en')) errs.push(['en', 'Escribe el título en inglés: es el que verá el visitante en inglés.']);
    if (!v('type')) errs.push(['type', 'Elige el tipo de propiedad.']);
    const price = parseMoney(v('price')); if (!(price > 0)) errs.push(['price', 'Escribe un precio positivo en pesos, por ejemplo 3,350,000.']);
    if (!land && v('type')) {
      if (!/^\d{1,2}$/.test(v('beds'))) errs.push(['beds', 'Indica las recámaras con un número entero (0 o más).']);
      if (!/^\d{1,2}$/.test(v('baths'))) errs.push(['baths', 'Indica los baños con un número entero (0 o más).']);
      if (!(pos(v('built')) > 0)) errs.push(['built', 'Escribe el área construida en m², mayor que 0.']);
    }
    if (land && !(pos(v('lot')) > 0)) errs.push(['lot', 'En un terreno el área del lote es obligatoria, mayor que 0.']);
    else if (!land && v('lot') && !(pos(v('lot')) > 0)) errs.push(['lot', 'El área del lote debe ser un número mayor que 0.']);
    const lines = v('imgs').split('\n').map((s) => s.trim()).filter(Boolean);
    const badImg = lines.findIndex((s) => !/^https?:\/\/\S+$/i.test(s));
    if (badImg >= 0) errs.push(['imgs', `La línea ${badImg + 1} no es una dirección válida (debe empezar con https://).`]);
    $$('[data-fld]', f).forEach((w) => { $('.field__err', w).hidden = true; $('.input,.select,.textarea', w)?.removeAttribute('aria-invalid'); });
    const order = ['es', 'en', 'type', 'price', 'beds', 'baths', 'built', 'lot', 'delivery', 'imgs'];
    errs.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
    errs.forEach(([k, m]) => { const w = $(`[data-fld="${k}"]`, f); const er = $('.field__err', w); er.hidden = false; er.textContent = m; $('.input,.select,.textarea', w).setAttribute('aria-invalid', 'true'); });
    if (errs.length) { f.elements[errs[0][0]].focus(); return; }
    const images = lines.map((s) => s.match(/static\.wixstatic\.com\/media\/([^/?#]+)/)?.[1] || s);
    const num = (s) => (s ? pos(s) : null);
    const id = S.addProperty({ title: { es: v('es'), en: v('en') }, model: v('es'), level: null, type: v('type'), price, beds: land ? 0 : +v('beds'), baths: land ? 0 : +v('baths'), built: land ? null : num(v('built')), lot: num(v('lot')), images, delivery: v('delivery') });
    $('.modal__box', el).innerHTML = `${closeBtn}<div class="ok-mark">${icon('check', 26)}</div><h2 class="h3">Propiedad publicada</h2><p class="muted"><b>${esc(v('es'))}</b> ya está en vivo en el sitio público, a ${money(price)}.</p>
      <div class="dlg__act"><button class="btn btn--ghost" type="button" data-x>Cerrar</button><a class="btn btn--primary" href="${pubUrl(id)}" target="_blank" rel="noopener">Ver la página pública</a></div>`;
    $('a.btn', el).focus();
    refresh();
  });
  syncType();
}

// ---------------------------------------------------------------------------
// Vista 4 · Demanda
// ---------------------------------------------------------------------------
function viewDemanda(p) {
  const days = p.p === '7' ? 7 : 30, d = dataset(days);
  const sr = d.ev.filter((e) => e.type === 'busqueda'), N = sr.length;
  const tipoOf = (e) => [].concat(e.tipo ?? []).filter(Boolean);
  const props = S.properties();
  const titleOf = (id) => { const x = props.find((q) => q.id === id); return x ? `<a href="${pubUrl(id)}" target="_blank" rel="noopener">${esc(ptitle(x))}</a><small>${esc(devName(x))}</small>` : `<span class="muted">${esc(id)}</span><small>archivada o no encontrada</small>`; };

  // Tipo buscado
  const tc = {}; sr.forEach((e) => { const t = tipoOf(e); (t.length ? t : ['__']).forEach((k) => { tc[k] = (tc[k] || 0) + 1; }); });
  const tRows = [...Object.keys(TYPES), '__'].filter((k) => tc[k]).map((k) => ({ label: k === '__' ? 'Sin tipo específico' : TYPES[k].pl.es, n: tc[k], w: (tc[k] / N) * 100, v: pct(tc[k], N), sub: `${nf(tc[k])} ÷ ${nf(N)}`, cls: k === '__' ? 'is-c' : '' }));
  // Presupuesto maximo
  const bc = {}; let nb = 0;
  sr.forEach((e) => { if (!(e.max > 0)) { bc.sin = (bc.sin || 0) + 1; return; } const b = S.BUDGETS.find((x) => e.max > x.min && e.max <= x.max) || S.BUDGETS[3]; bc[b.k] = (bc[b.k] || 0) + 1; nb++; });
  const bRows = [...S.BUDGETS.map((b) => ({ k: b.k, t: `Tope ${b.es.charAt(0).toLowerCase()}${b.es.slice(1)}` })), { k: 'sin', t: 'Sin tope indicado' }].map((r) => ({ label: r.t, n: bc[r.k] || 0, w: ((bc[r.k] || 0) / Math.max(1, N)) * 100, v: pct(bc[r.k] || 0, N), sub: `${nf(bc[r.k] || 0)} ÷ ${nf(N)}`, cls: r.k === 'sin' ? 'is-c' : '' }));
  // Sin resultados
  const withRes = sr.filter((e) => typeof e.results === 'number'), zeroF = withRes.filter((e) => e.results === 0).length;
  const cache = new Map();
  const noUnit = (e) => { const ts = tipoOf(e); if (!ts.length && !(e.max > 0)) return false; const k = `${ts.join(',')}|${e.max || ''}`; if (!cache.has(k)) cache.set(k, S.search({ type: ts.length ? ts : undefined, max: e.max > 0 ? e.max : undefined, onlyAvailable: true }).length === 0); return cache.get(k); };
  const zeroC = sr.filter(noUnit).length;
  // Demanda sin atender, en palabras
  const sentences = Object.keys(TYPES).map((k) => {
    const av = props.filter((x) => x.type === k && x.status === 'disponible'), cheapest = av.length ? Math.min(...av.map((x) => x.price)) : null;
    const ts = sr.filter((e) => tipoOf(e).includes(k)), under = ts.filter((e) => (cheapest == null ? true : e.max > 0 && e.max < cheapest));
    if (!under.length || !ts.length) return null;
    const cnt = {}; under.forEach((e) => { if (e.max > 0) cnt[e.max] = (cnt[e.max] || 0) + 1; });
    const common = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    const pl = TYPES[k].pl.es.toLowerCase();
    return { n: under.length, html: cheapest == null
      ? `<p><b>${nf(under.length)} de ${nf(ts.length)} búsquedas de ${pl}</b> (${pct(under.length, ts.length)}) no encontraron nada: hoy no hay ${pl} disponibles.</p>`
      : `<p><b>${nf(under.length)} de ${nf(ts.length)} búsquedas de ${pl}</b> (${pct(under.length, ts.length)}) tenían un tope menor a ${money(cheapest)}, el precio de la unidad más barata disponible. Hoy no hay nada que mostrarles${common ? `; el tope más repetido fue ${money(+common[0])}` : ''}.</p>`, eqn: `búsquedas sin unidad ÷ búsquedas de ${pl} = ${eqs(under.length, ts.length)}` };
  }).filter(Boolean).sort((a, b) => b.n - a.n);
  // Mas vistas vs prospectos
  const views = {}; d.ev.forEach((e) => { if (e.type === 'vista_propiedad' && e.id) views[e.id] = (views[e.id] || 0) + 1; });
  const lb = {}; d.leads.forEach((l) => { if (l.propertyId) lb[l.propertyId] = (lb[l.propertyId] || 0) + 1; });
  const tv = Object.values(views).reduce((a, b) => a + b, 0), tl = Object.values(lb).reduce((a, b) => a + b, 0), R = tl ? tv / tl : null;
  const top = Object.entries(views).sort((a, b) => b[1] - a[1]).slice(0, 10), med = median(top.map((t) => t[1]));
  // Mas guardadas
  const fav = {}; d.ev.forEach((e) => { if (e.type === 'favorito' && e.id) fav[e.id] = (fav[e.id] || 0) + (e.on === false ? -1 : 1); });
  const favTop = Object.entries(fav).filter((x) => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return `<div class="vhead"><div><h1>Demanda</h1><p>Lo que pide el mercado. Del ${fdate(d.from)} al ${fdate(d.now)}: ${nf(N)} búsquedas.</p></div>${periodSeg(p)}</div>
  <div class="cols-2">
    <section class="panel"><div class="panel__h"><h2>Tipo buscado</h2><span class="cap">Parte = búsquedas de ese tipo ÷ total de búsquedas</span></div>${N ? hb(tRows) : '<div class="empty">Sin búsquedas en este periodo.</div>'}</section>
    <section class="panel"><div class="panel__h"><h2>Presupuesto máximo</h2><span class="cap">Parte = búsquedas en ese rango ÷ total de búsquedas</span></div>${N ? hb(bRows, 'is-d') : '<div class="empty">Sin búsquedas en este periodo.</div>'}</section>
  </div>
  <section class="panel" style="margin-top:20px"><div class="panel__h"><h2>Búsquedas sin resultados</h2></div>
    <div class="kpis" style="margin-bottom:0">
      ${kpi('Registradas por el sitio', withRes.length ? nf(zeroF) : 'sin datos', withRes.length ? 'búsquedas' : '', withRes.length ? eq('sin resultados ÷ búsquedas con dato', zeroF, withRes.length) : 'el sitio todavía no guarda cuántos resultados devolvió cada búsqueda')}
      ${kpi('Con el inventario de hoy', N ? nf(zeroC) : 'sin datos', N ? 'búsquedas' : '', N ? `${eq('sin unidad disponible ÷ búsquedas', zeroC, N)}. Calculado con el inventario actual` : 'sin búsquedas en este periodo')}
    </div></section>
  <section class="panel" style="margin-top:20px"><div class="panel__h"><h2>Demanda sin atender</h2><span class="cap">En palabras</span></div>
    ${sentences.length ? `<div class="stackv" style="--gap:12px">${sentences.slice(0, 3).map((s) => `<div>${s.html}<p class="cap cap--3">${s.eqn}</p></div>`).join('')}</div>` : `<div class="empty">${N ? 'Con los datos de este periodo, toda búsqueda con tipo y tope encontró al menos una unidad disponible.' : 'Sin búsquedas en este periodo.'}</div>`}</section>
  <section class="panel" style="margin-top:20px"><div class="panel__h"><h2>Más vistas y sus prospectos</h2><span class="cap">Vistas ÷ prospectos = cuántas vistas hacen falta para un prospecto. Marca “muchas vistas, pocas consultas” si supera 1.5 veces el promedio${R ? ` (${nf(tv)} ÷ ${nf(tl)} = ${nf(R, 1)})` : ''}, o si no tiene prospectos y está sobre la mediana de vistas.</span></div>
    ${top.length ? `<div class="xs"><table class="tbl"><thead><tr><th>Propiedad</th><th class="r">Vistas</th><th class="r">Prospectos</th><th class="r">Vistas ÷ prospectos</th><th></th></tr></thead><tbody>${top.map(([id, v]) => { const l = lb[id] || 0; const flag = (l === 0 && v >= med) || (l > 0 && R && v / l > 1.5 * R);
      return `<tr><td>${titleOf(id)}</td><td class="r num">${nf(v)} vistas</td><td class="r num">${nf(l)} prospectos</td><td class="r num">${l ? `${nf(v)} ÷ ${nf(l)} = ${nf(v / l, 1, true)}` : 'sin datos'}<small>${l ? 'vistas por prospecto' : 'sin prospectos'}</small></td><td>${flag ? '<span class="tag">Muchas vistas, pocas consultas</span>' : ''}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="empty">Sin vistas de propiedad en este periodo.</div>'}</section>
  <section class="panel" style="margin-top:20px"><div class="panel__h"><h2>Más guardadas</h2><span class="cap">Guardados = veces que se marcó como favorita menos veces que se quitó</span></div>
    ${favTop.length ? hb(favTop.map(([id, n]) => ({ label: titleOf(id), n, w: (n / favTop[0][1]) * 100, v: `${nf(n)} guardados` }))) : '<div class="empty">Todavía nadie guarda propiedades en este periodo. Los guardados reales del sitio público aparecerán aquí.</div>'}</section>`;
}

// ---------------------------------------------------------------------------
// Render y eventos
// ---------------------------------------------------------------------------
const view = $('#view');
let lastKey = '';
function render() {
  const { view: v, p } = parseHash();
  const { lead, q, ...rest } = p;
  const key = `${v}|${JSON.stringify(rest)}`;
  $$('#nav a').forEach((a) => (a.getAttribute('href') === `#${v}` ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  $('#crumb').textContent = TITLES[v]; document.title = `${TITLES[v]} · Manejo · Inmobiliaria San Miguel`;
  if (key !== lastKey) {
    const y = lastKey.split('|')[0] === v ? scrollY : 0;
    lastKey = key;
    editing = null;
    view.innerHTML = { resumen: viewResumen, conversion: viewConversion, prospectos: viewProspectos, inventario: viewInventario, demanda: viewDemanda }[v](p);
    scrollTo({ top: y, behavior: 'instant' });
  }
  syncDrawer(v === 'prospectos' ? lead : null);
}
function refresh() { const y = scrollY; lastKey = ''; render(); scrollTo({ top: y, behavior: 'instant' }); }

$('#nav').innerHTML = VIEWS.map((k) => `<a href="#${k}">${svg(IC[k])}<span>${TITLES[k]}</span></a>`).join('');
addEventListener('hashchange', render);

document.addEventListener('click', async (e) => {
  const t = e.target.closest('[data-act]'); if (!t || drawer.contains(t)) return;
  const a = t.dataset.act, id = t.dataset.id;
  if (a === 'reset') {
    const ok = await confirmDlg({ title: 'Reiniciar demo', ok: 'Sí, reiniciar', body: '<p class="muted">Se borran los prospectos, eventos, favoritos y cambios de inventario de este navegador, incluidos los que se hayan creado en el sitio público, y se vuelve a generar el historial de ejemplo.</p>' });
    if (ok) { S.resetDemo(); location.reload(); }
  } else if (a === 'period') go({ p: t.dataset.v });
  else if (a === 'f') go({ [t.dataset.k]: t.dataset.v });
  else if (a === 'open') { if (e.target.closest('a,select')) return; go({ lead: id }); }
  else if (a === 'add') openAdd();
  else if (a === 'edit-price') { editing = id; redrawInv(); }
  else if (a === 'cancel-edit') { editing = null; redrawInv(); }
  else if (a === 'archive') archive(id);
  else if (a === 'restore') { S.updateProperty(id, { deleted: false }); refresh(); notify('Propiedad restaurada'); }
});
document.addEventListener('change', (e) => {
  const t = e.target;
  if (t.dataset.f) go({ [t.dataset.f]: t.value });
  else if (t.dataset.act === 'move' && !drawer.contains(t)) moveLead(t.dataset.id, t.value);
  else if (t.dataset.act === 'status') saveStatus(t);
});
document.addEventListener('submit', (e) => { if (e.target.dataset.form === 'price') { e.preventDefault(); savePrice(e.target); } });
let qT;
document.addEventListener('input', (e) => {
  const t = e.target;
  if (t.id === 'inv-q') { clearTimeout(qT); qT = setTimeout(() => { const { view: v, p } = parseHash(); const np = { ...p }; if (t.value) np.q = t.value; else delete np.q; const qs = new URLSearchParams(np).toString(); history.replaceState(null, '', `#${v}${qs ? `?${qs}` : ''}`); redrawInv(); }, 120); }
  const form = t.closest?.('[data-form="price"]');
  if (form) {
    t.removeAttribute('aria-invalid'); const er = $('.field__err', form.parentElement); if (er) er.hidden = true;
    const x = S.property(form.dataset.id), prev = $('.inl__prev', form.parentElement), np = parseMoney(t.value);
    if (!x || !prev) return;
    if (!(np > 0)) { prev.className = 'inl__prev is-warn'; prev.textContent = 'Escribe un número positivo en pesos.'; return; }
    const dl = (np - x.price) / x.price;
    prev.className = `inl__prev ${Math.abs(dl) > 0.2 ? 'is-warn' : ''}`;
    prev.textContent = `Antes ${money(x.price)} · Ahora ${money(np)} (${signed(dl)})${Math.abs(dl) > 0.2 ? '. Supera 20 %: pedirá confirmación' : ''}`;
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && editing && !$('.modal.is-open') && !drawerId) { editing = null; redrawInv(); } });

// Tooltips de las graficas
const showTip = (e) => {
  const box = e.target.closest?.('.chart'); $$('.chart .tip').forEach((t) => { if (!box || t.parentElement !== box) t.hidden = true; });
  if (!box) return;
  const tip = $('.tip', box), hit = e.target.closest('.hit');
  if (!hit) { tip.hidden = true; return; }
  tip.textContent = hit.dataset.tip; tip.hidden = false;
  const bb = box.getBoundingClientRect(), hb2 = hit.getBoundingClientRect();
  tip.style.left = `${hb2.left + hb2.width / 2 - bb.left}px`; tip.style.top = `${hb2.top - bb.top + hb2.height * +hit.dataset.f - 8}px`;
};
document.addEventListener('pointermove', showTip);
document.addEventListener('pointerdown', showTip);

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------
S.seedDemoHistory();
if (!location.hash) history.replaceState(null, '', '#resumen');
render();
