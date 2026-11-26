// Componentes compartidos del sitio publico.
// Uso en cada pagina:  import { mount } from './js/ui.js';  mount({ over: true|false, current: 'propiedades' });
// Todas las ligas internas se arman con ROOT (raiz del sitio), para que funcionen igual en un dominio
// propio que dentro de una subcarpeta como las de GitHub Pages.
import * as S from './store.js';
import { COMPANY, TYPES, STATUS, DELIVERY, TIMELINES, FOREIGN_STEP, img, PH, ROOT } from './data.js';

const { L, lang } = S;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
export const T = (es, en) => (lang() === 'en' ? en : es);

// ---- Iconos (trazo fino, 20 px) -----------------------------------------
const P = {
  bed: '<path d="M3 17v-6a2 2 0 012-2h10a2 2 0 012 2v6M3 14h14M5.5 9V6.5A1.5 1.5 0 017 5h6a1.5 1.5 0 011.5 1.5V9"/>',
  bath: '<path d="M3 11h14v2a4 4 0 01-4 4H7a4 4 0 01-4-4v-2zM5 11V5.5A1.5 1.5 0 016.5 4c.9 0 1.5.6 1.5 1.5"/>',
  area: '<path d="M4 4h12v12H4zM4 8h2M4 12h2M8 16v-2M12 16v-2"/>',
  heart: '<path d="M10 16.5s-6-3.7-6-8.2A3.3 3.3 0 0110 6a3.3 3.3 0 016 2.3c0 4.5-6 8.2-6 8.2z"/>',
  arrow: '<path d="M4 10h12M11 5l5 5-5 5"/>',
  down: '<path d="M10 4v12M5 11l5 5 5-5"/>',
  shield: '<path d="M10 3l6 2.2v4.3c0 3.6-2.5 6.3-6 7.5-3.5-1.2-6-3.9-6-7.5V5.2L10 3z"/><path d="M7.5 10l1.8 1.8 3.4-3.6"/>',
  close: '<path d="M5 5l10 10M15 5L5 15"/>',
  menu: '<path d="M3 7h14M3 13h14"/>',
  check: '<path d="M4 10.5l4 4 8-9"/>',
  video: '<path d="M3 6.5A1.5 1.5 0 014.5 5h7A1.5 1.5 0 0113 6.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 013 13.5v-7zM13 9l4-2.5v7L13 11"/>',
  pin: '<path d="M10 17s5-4.6 5-8.5a5 5 0 00-10 0C5 12.4 10 17 10 17z"/><circle cx="10" cy="8.5" r="1.8"/>',
  key: '<circle cx="7" cy="13" r="3"/><path d="M9.2 10.8L16 4M13 7l2 2"/>',
  search: '<circle cx="9" cy="9" r="5"/><path d="M13 13l4 4"/>',
  car: '<path d="M4 13V9.5L5.5 6h9L16 9.5V13M4 13v2M16 13v2M4 13h12M6.5 10.5h.01M13.5 10.5h.01"/>',
  compare: '<path d="M7 4v12M13 4v12M4 7l3-3 3 3M10 13l3 3 3-3"/>',
  phone: '<path d="M5 3h3l1.5 4-2 1.2a8 8 0 004.3 4.3l1.2-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A13 13 0 013.5 4.6 1.5 1.5 0 015 3z"/>',
  calendar: '<path d="M4 5.5h12v10.5H4zM4 9h12M7 3.5v3M13 3.5v3"/>',
  doc: '<path d="M6 3h6l3 3v11H6zM12 3v3h3M8.5 10h4M8.5 13h4"/>',
};
export const icon = (n, s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

// ---- Cabecera y pie ------------------------------------------------------
const NAV = [
  ['propiedades', ROOT + 'propiedades.html', 'Propiedades', 'Properties'],
  ['punta', ROOT + 'desarrollos/punta-del-cielo.html', 'Punta del Cielo', 'Punta del Cielo'],
  ['terraviva', ROOT + 'desarrollos/terraviva.html', 'Terraviva', 'Terraviva'],
  ['vivir', ROOT + 'san-miguel.html', 'Vivir aquí', 'Living here'],
  ['comprar', ROOT + '#como-comprar', 'Cómo comprar', 'How to buy', 'nav__opt'], // en pantallas angostas vive en el menu
];

function header({ over = false, current = '' } = {}) {
  const el = h(`<header class="nav ${over ? 'nav--over' : ''}"><div class="wrap nav__in">
    <a class="brand" href="${ROOT}" aria-label="${COMPANY.name}"><b>Inmobiliaria</b><i>San Miguel</i></a>
    <nav class="nav__links" aria-label="${T('Principal', 'Main')}">${NAV.map(([k, u, es, en, cls]) => `<a href="${u}" ${cls ? `class="${cls}"` : ''} ${k === current ? 'aria-current="page"' : ''}>${T(es, en)}</a>`).join('')}
      <a class="nav__extra" href="${ROOT}propiedades.html?favs=1">${T('Mis favoritos', 'My favorites')}</a>
      <a class="nav__extra" href="#" data-act="cur">${T('Ver precios en', 'Show prices in')} ${S.cur() === 'MXN' ? 'USD' : 'MXN'}</a></nav>
    <div class="nav__tools">
      <button class="nav__tog" data-act="lang" aria-label="${T('Cambiar a inglés', 'Switch to Spanish')}">${lang() === 'es' ? 'EN' : 'ES'}</button>
      <button class="nav__tog" data-act="cur" aria-label="${T('Cambiar moneda', 'Switch currency')}">${S.cur() === 'MXN' ? 'USD' : 'MXN'}</button>
      <a class="icon-btn nav__fav" href="${ROOT}propiedades.html?favs=1" aria-label="${T('Mis favoritos', 'My favorites')}">${icon('heart')}</a>
      <button class="btn btn--primary btn--sm nav__cta" data-contact data-intent="videollamada">${T('Videollamada', 'Video call')}</button>
      <button class="icon-btn nav__burger" data-act="menu" aria-label="${T('Menú', 'Menu')}">${icon('menu')}</button>
    </div></div></header>`);
  el.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]')?.dataset.act;
    if (a) e.preventDefault();
    if (a === 'lang') S.setLang(lang() === 'es' ? 'en' : 'es');
    if (a === 'cur') S.setCur(S.cur() === 'MXN' ? 'USD' : 'MXN');
    if (a === 'menu') el.classList.toggle('is-open');
  });
  const onScroll = () => el.classList.toggle('is-solid', scrollY > 24);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  return el;
}

function footer() {
  return h(`<footer class="footer"><div class="wrap">
    <div class="footer__grid">
      <div class="stack" style="--gap:18px"><a class="brand" href="${ROOT}"><b>Inmobiliaria</b><i>San Miguel</i></a>
        <p style="max-width:34ch">${T('Propiedades en San Miguel de Allende con precios publicados y un proceso claro, en español y en inglés.', 'Property in San Miguel de Allende with published prices and a clear process, in English and Spanish.')}</p>
        <p class="small">${COMPANY.address}</p></div>
      <div><h4>${T('Explorar', 'Explore')}</h4><ul>
        <li><a href="${ROOT}propiedades.html">${T('Todas las propiedades', 'All properties')}</a></li>
        <li><a href="${ROOT}propiedades.html?type=departamento">${T('Departamentos en venta', 'Apartments for sale')}</a></li>
        <li><a href="${ROOT}propiedades.html?type=casa">${T('Casas en venta', 'Houses for sale')}</a></li>
        <li><a href="${ROOT}propiedades.html?type=terreno">${T('Terrenos en venta', 'Lots for sale')}</a></li></ul></div>
      <div><h4>${T('Desarrollos', 'Developments')}</h4><ul>
        <li><a href="${ROOT}desarrollos/punta-del-cielo.html">Punta del Cielo</a></li>
        <li><a href="${ROOT}desarrollos/terraviva.html">Terraviva Picachos</a></li>
        <li><a href="${ROOT}san-miguel.html">${T('Vivir en San Miguel', 'Living in San Miguel')}</a></li>
        <li><a href="${ROOT}admin/">${T('Acceso del equipo', 'Team access')}</a></li></ul></div>
      <div><h4>${T('Contacto', 'Contact')}</h4><ul>
        <li><a href="tel:${COMPANY.phone.replace(/\s/g, '')}">${COMPANY.phone}</a></li>
        <li><a href="https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '')}">WhatsApp ${COMPANY.whatsapp}</a></li>
        <li>${T('Línea en inglés', 'English line')} ${COMPANY.bilingual}</li>
        <li><button class="link" data-contact style="color:#fff">${T('Agendar videollamada', 'Book a video call')} ${icon('arrow', 16)}</button></li></ul></div>
    </div>
    <div class="footer__base"><span>© 2026 ${COMPANY.name} · <a href="${ROOT}creditos.html">${T('Créditos de fotografía', 'Photo credits')}</a></span>
      <span>${T('Prototipo: precios, tiempos e inventario son datos de ejemplo.', 'Prototype: prices, timelines and inventory are sample data.')}</span></div>
  </div></footer>`);
}

// ---- Tarjeta de propiedad ------------------------------------------------
export function pcard(p, { eager = false } = {}) {
  const st = p.status; const fav = S.favs().includes(p.id);
  const cover = p.images?.[0] ? img(p.images[0], 810, 500) : '';
  const meta = p.type === 'terreno'
    ? (p.lot ? `<span>${icon('area', 18)} ${S.fmtArea(p.lot)}</span><span class="num">${S.fmtPrice(Math.round(p.price / p.lot))}/m²</span>` : `<span>${L(TYPES.terreno)}</span>`)
    : `<span>${icon('bed', 18)} ${p.beds ?? '–'}</span><span>${icon('bath', 18)} ${p.baths ?? '–'}</span>${p.built ? `<span>${icon('area', 18)} ${S.fmtArea(p.built)}</span>` : ''}`;
  return `<article class="pcard ${st === 'vendido' ? 'is-sold' : ''}" data-id="${p.id}">
    <div class="pcard__media">${cover ? `<img src="${cover}" alt="${S.title(p)}, ${S.subtitle(p)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">` : ''}
      <div class="pcard__tags">${st !== 'disponible' ? `<span class="badge badge--${st === 'apartado' ? 'hold' : 'sold'}">${L(STATUS[st])}</span>` : `<span class="badge badge--ok">${L(DELIVERY[p.delivery])}</span>`}</div>
      <button class="pcard__fav" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${T('Guardar en favoritos', 'Save to favorites')}">${icon('heart')}</button></div>
    <div class="pcard__body">
      <div class="pcard__price">${S.fmtPrice(p.price)}</div>
      <h3 class="pcard__title"><a class="pcard__link" href="${ROOT}propiedad.html?id=${p.id}">${S.title(p)}</a></h3>
      <p class="pcard__sub">${S.subtitle(p)}</p>
      <div class="pcard__meta">${meta}</div>
    </div></article>`;
}

// ---- Linea de tiempo: que tan rapido puede ser tuya ----------------------
// steps(kind, foreign) devuelve los pasos con el dia acumulado; total en dias.
export function timeline(kind = 'inmediata', { foreign = false, months = 0 } = {}) {
  let steps = TIMELINES[kind].map((s) => ({ ...s }));
  if (months) steps = steps.map((s) => (s.k === 'obra' ? { ...s, days: Math.round(months * 30) } : s));
  if (foreign) { const i = steps.findIndex((s) => s.k === 'firma'); steps.splice(i, 0, { ...FOREIGN_STEP }); }
  let acc = 0; steps.forEach((s) => { acc += s.days; s.at = acc; });
  return { steps, total: acc };
}
export const fmtDays = (d) => (d === 0 ? T('Hoy', 'Today') : d < 60 ? T(`Día ${d}`, `Day ${d}`) : T(`Mes ${Math.round(d / 30)}`, `Month ${Math.round(d / 30)}`));
export const fmtTotal = (d) => (d < 90 ? { n: d, u: T('días', 'days') } : { n: Math.round(d / 30), u: T('meses', 'months') });
export function renderTimeline(el, kind, opts = {}) {
  const { steps, total } = timeline(kind, opts);
  el.innerHTML = steps.map((s) => `<div class="tl__step"><div class="tl__day">${fmtDays(s.at)}</div><div class="tl__dot"><i></i></div><div><div class="tl__t">${L(s.t)}</div><div class="tl__d">${L(s.d)}</div></div></div>`).join('');
  const nodes = $$('.tl__step', el); let i = 0;
  clearInterval(el._t); const go = () => { nodes[i]?.classList.add('is-on'); if (++i >= nodes.length) clearInterval(el._t); };
  const start = () => { go(); el._t = setInterval(go, 420); };
  if (el.getBoundingClientRect().top < innerHeight * 0.9) start(); else { const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.2 }); io.observe(el); }
  return total;
}

// Cuenta ascendente para cifras
export function countUp(el, to, ms = 1200) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = S.fmtNum(to); return; }
  const t0 = performance.now(); const from = +el.dataset.from || 0;
  const tick = (t) => { const k = Math.min(1, (t - t0) / ms); const e = 1 - Math.pow(1 - k, 4); el.textContent = S.fmtNum(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(tick); else el.dataset.from = to; };
  requestAnimationFrame(tick);
}

// ---- Aparicion al hacer scroll ------------------------------------------
export function reveal(root = document) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal:not(.in)', root).forEach((n) => io.observe(n));
}

export function toast(msg) {
  let t = $('.toast'); if (!t) { t = h('<div class="toast" role="status"></div>'); document.body.append(t); }
  t.textContent = msg; requestAnimationFrame(() => t.classList.add('is-on')); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 2600);
}

// ---- Flujo de contacto con calificacion ---------------------------------
// Tres pasos de un toque y al final los datos. Quien "solo explora" no entra a la agenda de ventas:
// recibe la guia y sus favoritos. Asi el equipo solo recibe llamadas de quien quiere comprar.
export function openContact({ propertyId = null, intent = null } = {}) {
  const p = propertyId && S.property(propertyId);
  const st = { step: 0, intent, budget: null, when: null, pay: null };
  S.track('inicio_contacto', { id: propertyId });
  const m = h(`<div class="modal" role="dialog" aria-modal="true" aria-label="${T('Contacto', 'Contact')}"><div class="modal__box">
    <button class="icon-btn modal__close" aria-label="${T('Cerrar', 'Close')}">${icon('close')}</button>
    <div class="steps"><i></i><i></i><i></i><i></i></div><div class="modal__body"></div></div></div>`);
  const body = $('.modal__body', m);
  const close = () => { m.classList.remove('is-open'); setTimeout(() => m.remove(), 400); document.removeEventListener('keydown', esc); };
  const esc = (e) => e.key === 'Escape' && close();
  document.addEventListener('keydown', esc);
  m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.modal__close')) close(); });
  const choices = (key, list) => `<div class="stack" style="--gap:10px">${list.map((o) => `<button class="choice" data-k="${key}" data-v="${o.k}" aria-pressed="${st[key] === o.k}"><span>${o.ico ? `<span style="display:inline-flex;vertical-align:-4px;margin-right:10px;opacity:.7">${icon(o.ico)}</span>` : ''}${L(o)}</span>${icon('arrow', 18)}</button>`).join('')}</div>`;
  const head = (t, d = '') => `<p class="eyebrow">${p ? S.title(p) : COMPANY.name}</p><h2 class="h3" style="margin:10px 0 ${d ? 8 : 22}px">${t}</h2>${d ? `<p class="muted" style="margin-bottom:22px">${d}</p>` : ''}`;
  const INTENTS = [
    { k: 'videollamada', ico: 'video', es: 'Agendar una videollamada de 30 minutos', en: 'Book a 30-minute video call' },
    { k: 'visita', ico: 'pin', es: 'Visitar la propiedad', en: 'Visit the property' },
    { k: 'precios', ico: 'doc', es: 'Recibir lista de precios y planos', en: 'Get the price list and floor plans' },
  ];
  function render() {
    $$('.steps i', m).forEach((n, i) => n.classList.toggle('is-on', i <= st.step));
    const exploring = st.when === 'explorando';
    if (st.step === 0) body.innerHTML = head(T('¿Cómo te ayudamos?', 'How can we help?'), T('Respondemos el mismo día, en español o en inglés.', 'We answer the same day, in English or Spanish.')) + choices('intent', INTENTS);
    if (st.step === 1) body.innerHTML = head(T('¿Cuándo te gustaría comprar?', 'When would you like to buy?')) + choices('when', S.WHEN);
    if (st.step === 2) body.innerHTML = head(T('¿Qué presupuesto tienes en mente?', 'What budget do you have in mind?'), T('Así te mostramos solo lo que te sirve.', 'So we only show you what fits.')) + choices('budget', S.BUDGETS)
      + `<p class="label" style="margin:26px 0 10px">${T('Forma de pago', 'How you plan to pay')}</p><div class="row">${S.PAY.map((o) => `<button class="chip" data-k="pay" data-v="${o.k}" aria-pressed="${st.pay === o.k}">${L(o)}</button>`).join('')}</div>
      <button class="btn btn--primary btn--block" data-next style="margin-top:28px" ${st.budget && st.pay ? '' : 'disabled'}>${T('Continuar', 'Continue')}</button>`;
    if (st.step === 3) body.innerHTML = head(exploring ? T('Te enviamos la guía de San Miguel', 'We will send you the San Miguel guide') : st.intent === 'videollamada' ? T('¿A dónde te enviamos la liga?', 'Where should we send the link?') : T('¿Cómo te contactamos?', 'How do we reach you?'),
      exploring ? T('Sin llamadas de ventas. Recibes la guía, tus favoritos y los cambios de precio.', 'No sales calls. You get the guide, your favorites and price changes.') : T('Un asesor te escribe hoy mismo.', 'An advisor will write to you today.'))
      + `<form class="stack" style="--gap:14px" novalidate>
        <div class="field"><label for="c-name">${T('Nombre', 'Name')}</label><input class="input" id="c-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="c-email">${T('Correo', 'Email')}</label><input class="input" id="c-email" name="email" type="email" autocomplete="email" inputmode="email" required></div>
        ${exploring ? '' : `<div class="field"><label for="c-phone">${T('WhatsApp o teléfono', 'WhatsApp or phone')}</label><input class="input" id="c-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="${T('+52 …', '+1 …')}" required></div>`}
        ${!exploring && st.intent !== 'precios' ? `<div class="field"><label for="c-slot">${T('Horario que prefieres', 'Preferred time')}</label><select class="select" id="c-slot" name="slot"><option>${T('Hoy por la tarde', 'This afternoon')}</option><option>${T('Mañana por la mañana', 'Tomorrow morning')}</option><option>${T('Mañana por la tarde', 'Tomorrow afternoon')}</option><option>${T('Este fin de semana', 'This weekend')}</option></select></div>` : ''}
        <label class="small muted" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" name="consent" required style="margin-top:4px;accent-color:var(--forest)"><span>${T('Acepto el aviso de privacidad y que me contacten sobre esta solicitud.', 'I accept the privacy notice and agree to be contacted about this request.')}</span></label>
        <p class="field__err" hidden></p>
        <button class="btn btn--primary btn--lg btn--block">${exploring ? T('Enviarme la guía', 'Send me the guide') : T('Enviar', 'Send')}</button></form>`;
    if (st.step === 4) body.innerHTML = `<div class="center" style="padding:24px 0 8px"><div style="width:64px;height:64px;border-radius:50%;background:var(--forest);color:#fff;display:grid;place-items:center;margin:0 auto 22px;animation:pop .6s var(--ease-out)">${icon('check', 28)}</div>
      <h2 class="h3">${T('Listo. Ya lo recibimos.', 'Done. We have it.')}</h2>
      <p class="muted" style="margin:10px auto 26px;max-width:36ch">${exploring ? T('Revisa tu correo: la guía llega en unos minutos.', 'Check your inbox: the guide arrives in a few minutes.') : T('Un asesor te escribe hoy mismo para confirmar el horario.', 'An advisor will write to you today to confirm the time.')}</p>
      <button class="btn btn--ghost" data-close>${T('Seguir explorando', 'Keep exploring')}</button></div>`;
    $('input', body)?.focus({ preventScroll: true });
  }
  body.addEventListener('click', (e) => {
    const c = e.target.closest('[data-k]');
    if (c) { st[c.dataset.k] = c.dataset.v; if (c.dataset.k === 'intent') st.step = 1; else if (c.dataset.k === 'when') st.step = 2; render(); return; }
    if (e.target.closest('[data-next]')) { st.step = 3; render(); }
    if (e.target.closest('[data-close]')) close();
  });
  body.addEventListener('submit', (e) => {
    e.preventDefault(); const f = e.target; const d = Object.fromEntries(new FormData(f)); const err = $('.field__err', f);
    // Errores humanos: se valida aqui, se marca el campo exacto y no se pierde lo capturado.
    const bad = [...f.elements].find((x) => x.required && (x.type === 'checkbox' ? !x.checked : !x.value.trim())) || (!/^\S+@\S+\.\S+$/.test(d.email) && f.email) || (f.phone && d.phone.replace(/\D/g, '').length < 10 && f.phone);
    $$('.input', f).forEach((x) => x.removeAttribute('aria-invalid'));
    if (bad) { bad.setAttribute?.('aria-invalid', 'true'); bad.focus(); err.hidden = false;
      err.textContent = bad.name === 'email' ? T('Revisa el correo: falta algo.', 'Check the email address.') : bad.name === 'phone' ? T('El teléfono necesita al menos 10 dígitos, con lada.', 'The phone number needs at least 10 digits, with area code.') : bad.name === 'consent' ? T('Necesitamos tu aceptación para contactarte.', 'We need your consent to contact you.') : T('Falta este dato.', 'This field is required.'); return; }
    S.addLead({ ...d, consent: true, propertyId, intent: st.intent, budget: st.budget, when: st.when, pay: st.pay });
    st.step = 4; render();
  });
  if (st.intent) st.step = 1;
  document.body.append(m); render(); requestAnimationFrame(() => m.classList.add('is-open'));
}

// ---- Montaje -------------------------------------------------------------
export function mount(opts = {}) {
  document.documentElement.lang = lang(); document.documentElement.dataset.lang = lang();
  document.body.prepend(header(opts));
  if (!opts.noFooter) document.body.append(footer());
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-contact]');
    if (c) { e.preventDefault(); openContact({ propertyId: c.dataset.contact || null, intent: c.dataset.intent || null }); return; }
    const f = e.target.closest('[data-fav]');
    if (f) { e.preventDefault(); const on = S.toggleFav(f.dataset.fav); $$(`[data-fav="${f.dataset.fav}"]`).forEach((b) => b.setAttribute('aria-pressed', on)); toast(on ? T('Guardada en tus favoritos', 'Saved to your favorites') : T('Quitada de favoritos', 'Removed from favorites')); }
  });
  reveal();
  S.track('vista_pagina', { title: document.title });
}
export { S, img, PH, COMPANY, TYPES, STATUS, DELIVERY, ROOT };
