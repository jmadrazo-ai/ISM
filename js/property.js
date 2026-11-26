// Ficha de propiedad. Responde en orden: es para mi, me alcanza, donde esta, como se compara, que sigue.
// Todo sale de store.js; las propiedades individuales (project: null, sin fotos) tambien se ven completas.
import { mount, $, $$, h, T, icon, pcard, timeline, renderTimeline, fmtTotal, countUp, reveal, toast, S, img, COMPANY, TYPES, STATUS, DELIVERY, ROOT } from './ui.js';
import { AMENITIES, NEARBY } from './data.js';

const { L } = S;
const ORIGIN = 'https://www.inmobiliariasanmiguel.mx';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const area = (q) => q.built || q.lot || 0;
const ppm = (q) => (area(q) ? Math.round(q.price / area(q)) : 0);
const locale = () => (S.lang() === 'en' ? 'en-US' : 'es-MX');
const DAY = 864e5;
const dateIn = (days, o = { day: 'numeric', month: 'long', year: 'numeric' }) => new Intl.DateTimeFormat(locale(), o).format(new Date(Date.now() + days * DAY));
const MY = { month: 'long', year: 'numeric' };
const dur = (d) => { const t = fmtTotal(d); return `${t.n} ${t.u}`; };
const arrow = icon('arrow', 18);
const grid = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z"/></svg>';
const kind = (q) => (DELIVERY[q.delivery] ? q.delivery : 'inmediata');

mount({ current: 'propiedades' });
const main = $('#pd');
const id = (new URLSearchParams(location.search).get('id') || '').trim();
const p = id ? S.property(id) : null;
S.track('vista_propiedad', p ? { id } : { id: id || null, missing: true });
if (p) page(p); else notFound();
reveal();

// ---- Cercanas: misma clase de propiedad, precio parecido, disponibles ---------
function closest(base, n = 3, skip = []) {
  return S.search({}).filter((q) => q.id !== base.id && q.status === 'disponible' && !skip.includes(q.id))
    .map((q) => ({ q, s: (q.type === base.type ? 0 : 2) + (q.project === base.project ? 0 : 0.35) + Math.abs(q.price - base.price) / base.price }))
    .sort((a, b) => a.s - b.s).slice(0, n).map((x) => x.q);
}

// ---- Propiedad que no existe: una salida clara -----------------------------------
function notFound() {
  document.title = T('Propiedad no encontrada | Inmobiliaria San Miguel', 'Property not found | Inmobiliaria San Miguel');
  document.head.append(h('<meta name="robots" content="noindex">'));
  const prefix = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; };
  const guess = id && S.properties().map((q) => ({ q, n: prefix(q.id, id) })).sort((a, b) => b.n - a.n)[0];
  const avail = S.search({}).filter((q) => q.status === 'disponible');
  const picks = [...avail.filter((q) => q.featured), ...avail.filter((q) => !q.featured)].slice(0, 3);
  main.innerHTML = `<section class="nf wrap wrap--narrow center">
      <p class="eyebrow">${T('Propiedad no encontrada', 'Property not found')}</p>
      <h1 class="h1">${T('Esta propiedad no está aquí.', 'This property is not here.')}</h1>
      <p class="lede">${T('Puede que el enlace esté incompleto o que la hayamos retirado. Todo lo demás sigue a la vista, con precio.', 'The link may be incomplete, or the listing was removed. Everything else is still here, with prices.')}</p>
      ${guess && guess.n >= 6 ? `<p style="margin:-14px 0 32px"><a class="link" href="${ROOT}propiedad.html?id=${guess.q.id}">${T('¿Buscabas', 'Were you looking for')} ${esc(S.title(guess.q))}? ${arrow}</a></p>` : ''}
      <div class="row"><a class="btn btn--primary btn--lg" href="${ROOT}propiedades.html">${T('Ver todas las propiedades', 'See all properties')}</a>
        <button class="btn btn--ghost btn--lg" data-contact>${T('Preguntar a un asesor', 'Ask an advisor')}</button></div>
    </section>
    ${picks.length ? `<section class="section"><div class="wrap"><div class="shead reveal"><div><p class="eyebrow">${T('Disponibles hoy', 'Available today')}</p><h2 class="h2">${T('Quizá te interese.', 'You may like these.')}</h2></div></div>
      <div class="grid-3">${picks.map((q) => pcard(q)).join('')}</div></div></section>` : ''}`;
}

// ---- Ficha ---------------------------------------------------------------------
function page(p) {
  const imgs = p.images || [];
  const planN = Math.min(p.planCount || 0, imgs.length);
  const photos = imgs.slice(0, imgs.length - planN);
  const plans = imgs.slice(imgs.length - planN);
  const proj = p.project ? S.project(p.project) : null;
  const isLot = p.type === 'terreno';
  const sold = p.status === 'vendido';
  const held = p.status === 'apartado';
  const t = esc(S.title(p)); const sub = esc(S.subtitle(p));
  const other = S.cur() === 'MXN' ? 'USD' : 'MXN';
  const alts = sold || held ? closest(p) : [];
  const similar = closest(p, 3, alts.map((q) => q.id));
  // Los paquetes de casa son del mismo desarrollo que el lote; un lote individual no los ofrece
  const pkgs = isLot && p.project ? S.properties().filter((q) => q.id.startsWith('tv-casa-') && q.project === p.project && q.status !== 'vendido') : [];
  const stCls = { disponible: 'ok', apartado: 'hold', vendido: 'sold' }[p.status] || 'ok';

  // SEO
  const seoT = T(`${S.title(p)} · ${L(TYPES[p.type])} en venta en ${proj ? `${proj.name}, ` : ''}San Miguel de Allende | Inmobiliaria San Miguel`,
    `${S.title(p)} · ${L(TYPES[p.type])} for sale in ${proj ? `${proj.name}, ` : ''}San Miguel de Allende | Inmobiliaria San Miguel`);
  const seoD = [S.subtitle(p), S.fmtPrice(p.price), area(p) ? S.fmtArea(area(p)) : '', !isLot && p.beds ? T(`${p.beds} recámaras`, `${p.beds} bedrooms`) : '', L(DELIVERY[p.delivery]), L(STATUS[p.status])].filter(Boolean).join(' · ')
    + T('. Precio publicado, planos y fecha estimada de entrega.', '. Published price, floor plans and an estimated move-in date.');
  const url = `${ORIGIN}/propiedad.html?id=${encodeURIComponent(p.id)}`;
  document.title = seoT;
  $('meta[name="description"]').content = seoD;
  $('link[rel="canonical"]').href = url;
  $('meta[property="og:title"]').content = seoT;
  $('meta[property="og:description"]').content = seoD;
  $('meta[property="og:url"]').content = url;
  if (photos[0]) $('meta[property="og:image"]').content = img(photos[0], 1200, 630);

  // 0. Apartada o vendida: decirlo arriba y ofrecer la salida
  const notice = sold || held ? `<div class="notice" role="status">
      <div><p class="eyebrow">${L(STATUS[p.status])}</p>
        <h2 class="h3">${sold ? T('Esta propiedad ya se vendió.', 'This property has been sold.') : T('Esta propiedad está apartada.', 'This property is reserved.')}</h2>
        <p class="muted">${sold ? T('La dejamos publicada como referencia de precio y superficie. Estas son las opciones disponibles más parecidas.', 'We keep it published as a reference for price and size. These are the closest available options.')
          : T('Otro comprador la reservó. Estas son las opciones disponibles más parecidas.', 'Another buyer reserved it. These are the closest available options.')}</p>
        ${held ? `<button class="btn btn--ghost btn--sm" data-contact="${p.id}">${T('Avísame si se libera', 'Tell me if it frees up')}</button>` : ''}</div>
      ${alts.length ? `<ul class="alts">${alts.map((q) => `<li><a href="${ROOT}propiedad.html?id=${q.id}">${q.images?.[0] ? `<img src="${img(q.images[0], 160, 120)}" alt="" loading="lazy">` : '<span class="ph"></span>'}
        <span><b>${esc(S.title(q))}</b><small>${esc(S.subtitle(q))}</small></span><span class="num">${S.fmtPrice(q.price)}</span></a></li>`).join('')}</ul>` : ''}
    </div>` : '';

  // 1. Galeria
  const n = photos.length;
  const gallery = n ? `<div class="gal gal--n${Math.min(n, 3)}">${photos.map((u, i) => `<button class="gal__t" data-lb="${i}" aria-label="${T(`Ver foto ${i + 1} de ${n}`, `View photo ${i + 1} of ${n}`)}">
        <img src="${img(u, i === 0 ? 1600 : 900, i === 0 ? 1100 : 700)}" alt="${t}, ${T('foto', 'photo')} ${i + 1}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></button>`).join('')}
      ${n > 1 ? `<button class="btn btn--light btn--sm gal__all" data-lb="0">${grid}${T(`Ver las ${n} fotos`, `See all ${n} photos`)}</button>` : ''}</div>
      ${n > 1 ? `<p class="gal__hint">${T(`Desliza para ver las ${n} fotos. Toca una para verla completa.`, `Swipe to see all ${n} photos. Tap one to view it full screen.`)}</p>` : ''}`
    : `<div class="gal gal--empty"><div><p class="eyebrow eyebrow--gold">${COMPANY.name}</p><p class="h3">${T('Fotos en camino.', 'Photos on the way.')}</p>
        <p>${T('Pide una videollamada y te la mostramos en vivo.', 'Ask for a video call and we will show it to you live.')}</p></div></div>`;

  // 2. Datos clave
  const facts = [
    !isLot && p.beds ? [p.beds, T(p.beds === 1 ? 'recámara' : 'recámaras', p.beds === 1 ? 'bedroom' : 'bedrooms'), 'bed'] : null,
    !isLot && p.baths ? [p.baths, T(p.baths === 1 ? 'baño' : 'baños', p.baths === 1 ? 'bathroom' : 'bathrooms'), 'bath'] : null,
    p.built ? [S.fmtArea(p.built), T('construcción', 'built area'), 'area'] : null,
    p.lot ? [S.fmtArea(p.lot), T('terreno', 'lot'), 'area'] : null,
    p.parking ? [p.parking, T(p.parking === 1 ? 'estacionamiento' : 'estacionamientos', p.parking === 1 ? 'parking space' : 'parking spaces'), 'car'] : null,
    ppm(p) ? [S.fmtPrice(ppm(p)), T('por m²', 'per m²'), null] : null,
  ].filter(Boolean);
  const inCmp = S.compare().includes(p.id);

  const ask = `<aside class="ask" aria-label="${T('Pedir información', 'Ask about this property')}"><div class="card">
      <p class="label ask__st ask__st--${p.status}">${L(STATUS[p.status])}</p>
      <p class="ask__price num">${S.fmtPrice(p.price)}</p>
      <p class="ask__sub">${[ppm(p) ? `${S.fmtPrice(ppm(p))}/m²` : '', L(DELIVERY[p.delivery])].filter(Boolean).join(' · ')}</p>
      <div class="ask__acts">${sold
        ? `<a class="btn btn--primary btn--block" href="#similares">${T('Ver opciones parecidas', 'See similar options')}</a>
           <button class="btn btn--ghost btn--block" data-contact="${p.id}">${T('Hablar con un asesor', 'Talk to an advisor')}</button>`
        : `<button class="btn btn--primary btn--block" data-contact="${p.id}" data-intent="videollamada">${icon('video', 18)}${T('Agendar videollamada', 'Book a video call')}</button>
           <button class="btn btn--ghost btn--block" data-contact="${p.id}" data-intent="visita">${icon('pin', 18)}${T('Visitarla', 'Visit it')}</button>
           <button class="btn btn--ghost btn--block" data-contact="${p.id}" data-intent="precios">${icon('doc', 18)}${T('Lista de precios y planos', 'Price list and floor plans')}</button>`}</div>
      <p class="ask__note">${T('Respondemos el mismo día, en español o en inglés.', 'We answer the same day, in English or Spanish.')}</p>
    </div></aside>`;

  const plansSec = plans.length ? `<section class="pd-plans" id="planos" aria-labelledby="h-plans">
      <p class="eyebrow">${isLot ? T('Plano maestro', 'Master plan') : T('Planos', 'Floor plans')}</p>
      <h2 class="h2" id="h-plans">${isLot ? T('Dónde queda tu lote.', 'Where your lot sits.') : T('Cómo se reparte el espacio.', 'How the space is laid out.')}</h2>
      <div class="plans">${plans.map((u, i) => `<button class="plan" data-plan="${i}" aria-label="${T(`Ampliar plano ${i + 1} de ${plans.length}`, `Enlarge plan ${i + 1} of ${plans.length}`)}"><img src="${img(u, 900, 675, 'fit')}" alt="${T('Plano', 'Plan')} ${i + 1}, ${t}" loading="lazy"></button>`).join('')}</div>
    </section>` : '';

  const top = `<section class="wrap pd-top">
    <div class="pd-main">
      <p class="eyebrow">${proj ? proj.name : T('Propiedad individual', 'Individual property')}</p>
      <h1 class="h1 pd-title">${t}</h1>
      <p class="pd-sub">${sub}</p>
      <div class="row pd-badges"><span class="badge badge--${stCls}">${L(STATUS[p.status])}</span><span class="badge badge--plain">${L(DELIVERY[p.delivery])}</span></div>
      <div class="pd-price"><span>${S.fmtPrice(p.price)}</span><small>≈ ${S.fmtPrice(p.price, other)}</small></div>
      <p class="demo-note">${p.example ? T('Precio y estatus de ejemplo. Tipo de cambio de referencia.', 'Sample price and status. Reference exchange rate.') : T('Tipo de cambio de referencia.', 'Reference exchange rate.')}</p>
      <ul class="facts">${facts.map(([v, l, ic]) => `<li><b>${v}</b><span>${ic ? icon(ic, 16) : ''}${l}</span></li>`).join('')}</ul>
      <div class="row pd-acts">
        <button class="btn btn--ghost btn--sm" data-fav="${p.id}" aria-pressed="${S.favs().includes(p.id)}">${icon('heart', 18)}${T('Guardar', 'Save')}</button>
        <button class="btn btn--ghost btn--sm" id="cmp" aria-pressed="${inCmp}">${icon('compare', 18)}${T('Comparar', 'Compare')}</button>
        <a class="link" id="cmp-go" href="${ROOT}propiedades.html?compare=1" hidden></a>
      </div>
      ${p.description ? `<p class="lede pd-desc">${esc(L(p.description))}</p>` : ''}
      ${plansSec}
    </div>
    ${ask}
  </section>`;

  // 3. Que tan rapido puede ser tuya
  const speedSec = sold ? '' : `<section class="section section--forest speed" id="rapido" aria-labelledby="h-speed">
    <div class="wrap split split--top">
      <div class="reveal">
        <p class="eyebrow">${T('Lo que sigue', 'What happens next')}</p>
        <h2 class="h1" id="h-speed">${T('¿Qué tan rápido puede ser <em>tuya?</em>', 'How fast can it be <em>yours?</em>')}</h2>
        <div class="speed__num"><span class="tl__total" id="sp-n">0</span><span id="sp-u"></span></div>
        <p class="sp-what" id="sp-what"></p>
        <p class="sp-date" id="sp-date" aria-live="polite"></p>
        <p class="sp-2" id="sp-2"></p>
        <div class="stack" style="--gap:24px;margin-top:34px">
          <div><label class="switch"><input type="checkbox" id="sp-foreign" ${S.lang() === 'en' ? 'checked' : ''}><i></i><span>${T('Compro desde el extranjero', 'I am buying from abroad')}</span></label></div>
          <div><button class="btn btn--light btn--lg" data-contact="${p.id}" data-intent="videollamada">${T('Empezar hoy', 'Start today')}</button></div>
          <p class="demo-note">${T('Tiempos de ejemplo. Se confirman con ventas y con tu notario.', 'Sample timelines. Confirmed with sales and your notary.')}</p>
        </div>
      </div>
      <div class="tl tl--dark" id="sp-tl"></div>
    </div>
  </section>`;

  // 4. Hazla tuya
  // Con plan fijo del desarrollador (p.pay) no hay controles que mover: se muestra el calendario real de pagos.
  const pay = p.pay;
  const money = (v) => `$${S.fmtNum(Math.round(S.toCur(v)))} ${S.cur()}`;
  const paySec = !pay || sold ? '' : (() => {
    const D = p.price * pay.down / 100, B = p.price * pay.during / 100, M = B / pay.months, E = p.price * pay.deed / 100;
    const row = (when, what, pct, amt, note) => `<div class="pplan__row"><div><span class="label">${when}</span><b>${what}</b>${note ? `<small>${note}</small>` : ''}</div><div class="pplan__amt"><b class="num">${amt}</b><small>${pct}</small></div></div>`;
    return `<section class="section section--sand" id="pagos" aria-labelledby="h-sim">
    <div class="wrap split split--top">
      <div class="reveal">
        <p class="eyebrow">${T('Plan de pagos', 'Payment plan')}</p>
        <h2 class="h2" id="h-sim" style="margin:14px 0 20px">${T('Hazla <em>tuya.</em>', 'Make it <em>yours.</em>')}</h2>
        <p class="lede">${T(`Tu casa se construye en ${pay.months} meses y la pagas mientras avanza la obra. Al terminar, escrituración inmediata.`, `Your house is built in ${pay.months} months and you pay as construction progresses. Once finished, the deed is issued right away.`)}</p>
        <div class="pplan__bar" aria-hidden="true"><i style="flex:${pay.down}"><span>${pay.down}%</span></i><i style="flex:${pay.during}"><span>${pay.during}%</span></i><i style="flex:${pay.deed}"><span>${pay.deed}%</span></i></div>
      </div>
      <div class="card sim pplan reveal" style="--d:.1s">
        ${row(T('Hoy', 'Today'), T('Enganche', 'Down payment'), `${pay.down}%`, money(D), '')}
        ${row(T(`Meses 1 a ${pay.months}`, `Months 1 to ${pay.months}`), T(`${pay.months} pagos mensuales`, `${pay.months} monthly payments`), `${pay.during}% ${T('en total', 'in total')}`, `${money(M)} ${T('al mes', 'a month')}`, T('Durante la construcción', 'During construction'))}
        ${row(T(`Mes ${pay.months}`, `Month ${pay.months}`), T('Contra escritura', 'At deed signing'), `${pay.deed}%`, money(E), T('Escrituración inmediata', 'Deed issued right away'))}
        <p class="sim__eq">${T(`${money(p.price)} × ${pay.down}% = ${money(D)}. ${money(p.price)} × ${pay.during}% ÷ ${pay.months} meses = ${money(M)} al mes. ${money(p.price)} × ${pay.deed}% = ${money(E)}.`, `${money(p.price)} × ${pay.down}% = ${money(D)}. ${money(p.price)} × ${pay.during}% ÷ ${pay.months} months = ${money(M)} a month. ${money(p.price)} × ${pay.deed}% = ${money(E)}.`)}</p>
        <button class="btn btn--primary btn--block" data-contact="${p.id}" data-intent="precios">${T('Pedir el plan por escrito', 'Get the plan in writing')}</button>
        <p class="demo-note" style="margin-top:14px">${T('Porcentajes y plazos del desarrollador. El precio es un dato de ejemplo.', 'Percentages and terms from the developer. The price is sample data.')}</p>
      </div>
    </div>
  </section>`; })();
  const simSec = sold ? '' : pay ? paySec : `<section class="section section--sand" id="pagos" aria-labelledby="h-sim">
    <div class="wrap split split--top">
      <div class="reveal">
        <p class="eyebrow">${T('Plan de pagos', 'Payment plan')}</p>
        <h2 class="h2" id="h-sim" style="margin:14px 0 20px">${T('Hazla <em>tuya.</em>', 'Make it <em>yours.</em>')}</h2>
        <p class="lede">${T('Un enganche y el resto a meses, sin intereses. Mueve los controles y mira tu mensualidad.', 'A down payment and the rest in monthly installments, interest free. Move the controls to see your monthly amount.')}</p>
        <p class="demo-note" style="margin-top:20px">${T('Plan de ejemplo. Porcentajes y plazos reales se confirman con un asesor.', 'Sample plan. Actual percentages and terms are confirmed with an advisor.')}</p>
      </div>
      <div class="card sim reveal" style="--d:.1s">
        <div class="sim__row"><label class="label" for="sim-dp">${T('Enganche', 'Down payment')}</label><output id="sim-dp-o" for="sim-dp"></output></div>
        <input type="range" id="sim-dp" min="10" max="90" step="5" value="30">
        <div class="sim__ends"><span>10%</span><span>90%</span></div>
        <div class="sim__row"><label class="label" for="sim-m">${T('Meses sin intereses', 'Interest-free months')}</label><output id="sim-m-o" for="sim-m"></output></div>
        <input type="range" id="sim-m" min="3" max="36" step="1" value="12">
        <div class="sim__ends"><span>3</span><span>36</span></div>
        <div class="sim__out" aria-live="polite">
          <div><span class="label">${T('Enganche', 'Down payment')}</span><b id="sim-dp-v"></b></div>
          <div><span class="label">${T('Mensualidad', 'Monthly')}</span><b id="sim-mo-v"></b><small id="sim-mo-n"></small></div>
        </div>
        <p class="sim__eq" id="sim-eq"></p>
        <button class="btn btn--primary btn--block" data-contact="${p.id}" data-intent="precios">${T('Pedir el plan real', 'Get the actual plan')}</button>
      </div>
    </div>
  </section>`;

  // 5. Construye tu casa (solo terrenos)
  const buildSec = isLot && !sold && p.lot && pkgs.length ? `<section class="section" id="construye" aria-labelledby="h-build">
    <div class="wrap">
      <div class="shead reveal"><div><p class="eyebrow">${T('Construye tu casa', 'Build your house')}</p>
        <h2 class="h2" id="h-build">${T('Tu casa, en este terreno.', 'Your house, on this lot.')}</h2></div>
        <p class="lede">${T('Elige un modelo llave en mano o trae a tu propio constructor. Mira el total y cuándo estaría lista.', 'Pick a turnkey model or bring your own builder. See the total and when it would be ready.')}</p></div>
      <div class="build reveal" role="group" aria-label="${T('Opciones de construcción', 'Building options')}">
        ${pkgs.map((q) => `<button class="bopt" data-pkg="${q.id}" aria-pressed="false"><span class="bopt__n">${esc(q.model)}</span>
          <span class="bopt__m">${S.fmtArea(q.built)} · ${T(`${q.beds} rec.`, `${q.beds} bd`)} · ${T(`${q.baths} baños`, `${q.baths} ba`)}</span>
          <span class="bopt__m">${T(`${q.deliveryMonths} meses de obra`, `${q.deliveryMonths} months to build`)}</span></button>`).join('')}
        <button class="bopt" data-pkg="propio" aria-pressed="false"><span class="bopt__n">${T('Mi propio constructor', 'My own builder')}</span>
          <span class="bopt__m">${T('Tú defines el proyecto y el presupuesto.', 'You set the design and the budget.')}</span></button>
      </div>
      <div class="combo" id="combo" aria-live="polite"></div>
    </div>
  </section>` : '';

  // 6. Desarrollo, ubicacion, parecidas
  const devSec = proj ? `<section class="section section--white pd-dev" id="desarrollo" aria-labelledby="h-dev">
    <div class="wrap split split--top">
      <div class="reveal"><p class="eyebrow">${L(proj.kind)}</p><h2 class="h2" id="h-dev">${proj.name}</h2>
        <p class="lede">${L(proj.tagline)}</p><p>${L(proj.blurb)}</p>
        <a class="link" href="${ROOT}desarrollos/${proj.id}.html">${T(`Conoce ${proj.name}`, `Explore ${proj.name}`)} ${arrow}</a></div>
      <div class="reveal" style="--d:.1s"><p class="label">${T('Amenidades', 'Amenities')}</p>
        <ul class="amen">${(proj.amenities || []).filter((k) => AMENITIES[k]).map((k) => `<li>${icon('check', 18)}${L(AMENITIES[k])}</li>`).join('')}</ul></div>
    </div>
  </section>` : '';

  const near = NEARBY.slice(0, 9); const maxMin = Math.max(...near.map((x) => x.min));
  const geo = proj?.geo;
  const locSec = proj ? `<section class="section pd-loc" id="ubicacion" aria-labelledby="h-loc">
    <div class="wrap split split--top">
      <div class="reveal"><p class="eyebrow">${T('Ubicación', 'Location')}</p>
        <h2 class="h2" id="h-loc">${T('Todo lo que importa, a minutos.', 'Everything that matters, minutes away.')}</h2>
        <p class="lede">${T('La Lejona, frente al Club de Golf Malanquín. Cinco minutos en auto al Centro Histórico.', 'La Lejona, across from the Malanquín Golf Club. A five minute drive to the Historic Center.')}</p>
        ${geo ? `<a class="link" href="https://www.openstreetmap.org/?mlat=${geo.lat}&amp;mlon=${geo.lng}#map=16/${geo.lat}/${geo.lng}" target="_blank" rel="noopener">${T('Ver en el mapa', 'View on the map')} ${arrow}</a>` : ''}</div>
      <div class="bars reveal">${near.map((x, i) => `<div class="bar" style="--w:${Math.max(6, (x.min / maxMin) * 100)};--d:${i * 0.07}s"><span class="bar__name">${L(x)}</span><span class="bar__min">${x.min}<small>min</small></span></div>`).join('')}
        <p class="demo-note" style="margin-top:16px">${T('Tiempos en auto. Centro y club de golf según el desarrollador; el resto son estimados de ejemplo.', 'Driving times. Centro and golf club per the developer; the rest are sample estimates.')}</p></div>
    </div>
  </section>` : `<section class="section pd-loc" id="ubicacion" aria-labelledby="h-loc"><div class="wrap wrap--narrow reveal">
      <p class="eyebrow">${T('Ubicación', 'Location')}</p>
      <h2 class="h2" id="h-loc">${esc(L(p.address || p.zone)) || 'San Miguel de Allende, Guanajuato'}</h2>
      <p class="lede">${T('La dirección exacta y lo que hay a minutos te lo mostramos en la videollamada.', 'We share the exact address and what is minutes away on the video call.')}</p>
      <p style="margin-top:28px"><button class="btn btn--ghost" data-contact="${p.id}" data-intent="videollamada">${T('Agendar videollamada', 'Book a video call')}</button></p>
    </div></section>`;

  const simSecSimilar = similar.length ? `<section class="section section--sand" id="similares" aria-labelledby="h-sim2">
    <div class="wrap"><div class="shead reveal"><div><p class="eyebrow">${T('Para comparar', 'To compare')}</p>
      <h2 class="h2" id="h-sim2">${T('Parecidas a esta.', 'Similar to this one.')}</h2></div>
      <a class="link" href="${ROOT}propiedades.html?type=${p.type}">${T(`Ver ${L(TYPES[p.type].pl).toLowerCase()} en venta`, `See ${L(TYPES[p.type].pl).toLowerCase()} for sale`)} ${arrow}</a></div>
      <div class="grid-3 reveal">${similar.map((q) => pcard(q)).join('')}</div></div>
  </section>` : '';

  main.innerHTML = `<div class="wrap">
      <nav class="crumbs" aria-label="${T('Ruta', 'Breadcrumb')}"><a href="${ROOT}">${T('Inicio', 'Home')}</a><span aria-hidden="true">/</span><a href="${ROOT}propiedades.html">${T('Propiedades', 'Properties')}</a><span aria-hidden="true">/</span>
        ${proj ? `<a href="${ROOT}propiedades.html?project=${proj.id}">${proj.name}</a><span aria-hidden="true">/</span>` : ''}<span aria-current="page">${t}</span></nav>
      ${notice}${gallery}</div>
    ${top}${speedSec}${simSec}${buildSec}${devSec}${locSec}${simSecSimilar}`;

  // Barra inferior en movil
  document.body.classList.add('has-dock');
  document.body.append(h(`<div class="dock"><div class="dock__p"><b>${S.fmtPrice(p.price)}</b><small>${L(STATUS[p.status])} · ${L(DELIVERY[p.delivery])}</small></div>
    ${sold ? `<a class="btn btn--primary" href="#similares">${T('Ver parecidas', 'See similar')}</a>` : `<button class="btn btn--primary" data-contact="${p.id}" data-intent="videollamada">${icon('video', 18)}${T('Videollamada', 'Video call')}</button>`}</div>`));

  // ---- Interaccion ----
  const shots = photos.map((u, i) => ({ src: img(u, 2000, 1400, 'fit'), alt: `${S.title(p)}, ${T('foto', 'photo')} ${i + 1}` }));
  const planShots = plans.map((u, i) => ({ src: img(u, 2000, 1500, 'fit'), alt: `${T('Plano', 'Plan')} ${i + 1}, ${S.title(p)}` }));
  main.addEventListener('click', (e) => {
    const g = e.target.closest('[data-lb]'); if (g) return lightbox(shots, +g.dataset.lb, T('Fotos', 'Photos'));
    const pl = e.target.closest('[data-plan]'); if (pl) return lightbox(planShots, +pl.dataset.plan, T('Planos', 'Floor plans'), true);
  });

  // Comparar
  const cmpBtn = $('#cmp'); const go = $('#cmp-go');
  const syncCmp = () => {
    const c = S.compare().filter((x) => S.property(x)); const on = c.includes(p.id);
    cmpBtn.setAttribute('aria-pressed', on);
    go.hidden = !(on && c.length >= 2); go.innerHTML = `${T(`Comparar ${c.length} ahora`, `Compare ${c.length} now`)} ${arrow}`;
  };
  cmpBtn.addEventListener('click', () => {
    const before = S.compare().filter((x) => S.property(x));
    const c = S.toggleCompare(p.id).filter((x) => S.property(x)); const on = c.includes(p.id);
    toast(!on ? T('Quitada de la comparación', 'Removed from comparison')
      : before.length >= 3 ? T('Se comparan hasta tres. Quitamos la primera que elegiste.', 'You can compare up to three. We removed the first one you picked.')
      : c.length < 2 ? T('Agregada. Elige otra para comparar.', 'Added. Pick another one to compare.')
      : T('Agregada a la comparación', 'Added to comparison'));
    syncCmp();
  });
  syncCmp();

  // Que tan rapido + paquete de casa elegido (terrenos)
  let pkg = null;
  if (isLot && pkgs.length) pkg = [...pkgs].filter((q) => q.lot <= p.lot * 1.05).sort((a, b) => b.built - a.built)[0] || pkgs[0];
  const foreign = () => !!$('#sp-foreign')?.checked;

  function speed() {
    if (sold) return;
    const months = isLot ? (pkg?.deliveryMonths || 0) : (p.deliveryMonths || 0);
    const opts = { foreign: foreign(), months };
    const tl = timeline(kind(p), opts);
    renderTimeline($('#sp-tl'), kind(p), opts);
    const firma = tl.steps.find((s) => s.k === 'firma')?.at ?? tl.total;
    const obra = tl.steps.find((s) => s.k === 'obra');
    let big = tl.total; let what; let date; let second = '';
    if (isLot) {
      big = firma;
      what = T('hasta que el terreno es tuyo, con escritura a tu nombre.', 'until the lot is yours, with the deed in your name.');
      date = T(`Si empiezas hoy, el terreno es tuyo el <b>${dateIn(firma)}</b>.`, `Start today and the lot is yours on <b>${dateIn(firma)}</b>.`);
      second = pkg ? T(`Con la ${esc(pkg.model)}, tu casa estaría lista en ${dur(tl.total)}: hacia ${dateIn(tl.total, MY)}.`, `With ${esc(pkg.model)}, your house would be ready in ${dur(tl.total)}: around ${dateIn(tl.total, MY)}.`)
        : T(`Con tu constructor, una casa suele estar lista en ${dur(tl.total)}: hacia ${dateIn(tl.total, MY)}.`, `With your own builder, a house is typically ready in ${dur(tl.total)}: around ${dateIn(tl.total, MY)}.`);
    } else if (kind(p) === 'preventa' && obra) {
      what = T('hasta que recibes las llaves.', 'until you get the keys.');
      date = T(`Si empiezas hoy, las llaves son tuyas el <b>${dateIn(tl.total)}</b>.`, `Start today and the keys are yours on <b>${dateIn(tl.total)}</b>.`);
      second = T(`La obra toma ${Math.round(obra.days / 30)} meses, de ${dateIn(obra.at - obra.days, MY)} a ${dateIn(obra.at, MY)}, con avances en foto y video cada mes.`,
        `Construction takes ${Math.round(obra.days / 30)} months, from ${dateIn(obra.at - obra.days, MY)} to ${dateIn(obra.at, MY)}, with photo and video updates every month.`);
    } else {
      what = T('desde tu primer mensaje hasta las llaves.', 'from your first message to the keys.');
      date = T(`Si empiezas hoy, las llaves son tuyas el <b>${dateIn(tl.total)}</b>.`, `Start today and the keys are yours on <b>${dateIn(tl.total)}</b>.`);
    }
    const f = fmtTotal(big); countUp($('#sp-n'), f.n, 900);
    $('#sp-u').textContent = f.u; $('#sp-what').textContent = what; $('#sp-date').innerHTML = date; $('#sp-2').innerHTML = second;
    if (held) $('#sp-2').innerHTML += ` ${T('Hoy está apartada: estos tiempos aplican si se libera.', 'It is reserved today: these times apply if it frees up.')}`;
  }

  // Simulador
  function sim() {
    if (sold || p.pay) return;
    const dp = $('#sim-dp'); const mo = $('#sim-m');
    const pct = +dp.value; const m = +mo.value;
    const P = Math.round(S.toCur(p.price)); const D = Math.round((P * pct) / 100); const M = Math.round((P - D) / m);
    const f = (v) => `$${S.fmtNum(v)} ${S.cur()}`;
    [dp, mo].forEach((r) => r.style.setProperty('--p', `${((r.value - r.min) / (r.max - r.min)) * 100}%`));
    $('#sim-dp-o').textContent = `${pct}%`; $('#sim-m-o').textContent = m;
    dp.setAttribute('aria-valuetext', `${pct}%, ${f(D)}`); mo.setAttribute('aria-valuetext', T(`${m} meses, ${f(M)} al mes`, `${m} months, ${f(M)} a month`));
    $('#sim-dp-v').textContent = f(D); $('#sim-mo-v').textContent = f(M);
    $('#sim-mo-n').textContent = T(`durante ${m} meses`, `for ${m} months`);
    $('#sim-eq').textContent = T(`(${f(P)} − ${f(D)} de enganche) ÷ ${m} meses = ${f(M)} al mes`, `(${f(P)} − ${f(D)} down) ÷ ${m} months = ${f(M)} a month`);
  }

  // Construye tu casa
  function build(animate) {
    const box = $('#combo'); if (!box) return;
    $$('[data-pkg]').forEach((b) => b.setAttribute('aria-pressed', pkg ? b.dataset.pkg === pkg.id : b.dataset.pkg === 'propio'));
    const tl = timeline('terreno', { foreign: foreign(), months: pkg?.deliveryMonths || 0 });
    const ready = `${dateIn(tl.total, MY)}`;
    if (pkg) {
      const lotPpm = p.price / p.lot;
      const house = Math.max(0, pkg.price - Math.round((pkg.lot || 0) * lotPpm));
      const fits = !pkg.lot || pkg.lot <= p.lot * 1.05;
      box.innerHTML = `<div class="combo__sum">
          <div><span class="label">${T('Este terreno', 'This lot')}</span><b>${S.fmtPrice(p.price)}</b></div><span class="combo__op" aria-hidden="true">+</span>
          <div><span class="label">${T('Casa', 'House')} ${esc(pkg.model)}</span><b>${S.fmtPrice(house)}</b></div><span class="combo__op" aria-hidden="true">=</span>
          <div class="combo__tot"><span class="label">${T('Total estimado', 'Estimated total')}</span><b>${S.fmtPrice(p.price + house)}</b></div></div>
        <ul class="combo__facts"><li>${icon('area', 18)}${T(`${S.fmtArea(pkg.built)} construidos`, `${S.fmtArea(pkg.built)} built`)}</li>
          <li>${icon('bed', 18)}${T(`${pkg.beds} recámaras · ${pkg.baths} baños`, `${pkg.beds} bedrooms · ${pkg.baths} bathrooms`)}</li>
          <li>${icon('key', 18)}${T(`Lista hacia ${ready}`, `Ready around ${ready}`)}</li></ul>
        ${fits ? '' : `<p class="combo__warn">${T(`Este modelo está pensado para lotes de ${S.fmtArea(pkg.lot)} y este mide ${S.fmtArea(p.lot)}. Un asesor confirma si se adapta o te propone otro.`, `This model is designed for ${S.fmtArea(pkg.lot)} lots and this one is ${S.fmtArea(p.lot)}. An advisor will confirm whether it fits or suggest another.`)}</p>`}
        <div class="row"><button class="btn btn--primary" data-contact="${p.id}" data-intent="precios">${T('Pedir planos y presupuesto', 'Get plans and a quote')}</button>
          <a class="link" href="${ROOT}propiedad.html?id=${pkg.id}">${T(`Ver el modelo ${esc(pkg.model)}`, `See the ${esc(pkg.model)} model`)} ${arrow}</a></div>
        <p class="demo-note">${T('Estimado de ejemplo: precio del paquete lote + casa, menos su lote valuado al precio por m² de este terreno.', 'Sample estimate: the lot + house package price, minus its lot valued at this lot’s price per m².')}</p>`;
    } else {
      box.innerHTML = `<div class="combo__sum"><div class="combo__tot"><span class="label">${T('Este terreno', 'This lot')}</span><b>${S.fmtPrice(p.price)}</b></div></div>
        <ul class="combo__facts"><li>${icon('doc', 18)}${T('Te damos el reglamento de construcción y el plano del lote.', 'We give you the building guidelines and the lot plan.')}</li>
          <li>${icon('key', 18)}${T(`Con una obra de ${dur(tl.steps.find((s) => s.k === 'obra').days)}, lista hacia ${ready}`, `With ${dur(tl.steps.find((s) => s.k === 'obra').days)} of construction, ready around ${ready}`)}</li></ul>
        <div class="row"><button class="btn btn--primary" data-contact="${p.id}" data-intent="precios">${T('Pedir reglamento y plano del lote', 'Get the guidelines and lot plan')}</button></div>
        <p class="demo-note">${T('Tiempo de obra de ejemplo; depende de tu proyecto y tu constructor.', 'Sample construction time; it depends on your design and builder.')}</p>`;
    }
    if (animate) { box.classList.remove('is-new'); void box.offsetWidth; box.classList.add('is-new'); }
  }

  if (!sold) {
    $('#sp-foreign').addEventListener('change', () => { speed(); build(false); });
    ['#sim-dp', '#sim-m'].forEach((s) => $(s)?.addEventListener('input', sim));
    speed(); sim();
  }
  if (buildSec) {
    $('.build').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pkg]'); if (!b) return;
      pkg = b.dataset.pkg === 'propio' ? null : pkgs.find((q) => q.id === b.dataset.pkg); build(true); speed();
    });
    build(false);
  }

  // Datos estructurados
  const resType = { departamento: 'Apartment', casa: 'SingleFamilyResidence' }[p.type] || 'Place';
  const avail = sold ? 'SoldOut' : held ? 'Reserved' : kind(p) === 'preventa' ? 'PreSale' : 'InStock';
  const address = { '@type': 'PostalAddress', addressLocality: 'San Miguel de Allende', addressRegion: 'Guanajuato', addressCountry: 'MX', ...(proj ? { streetAddress: 'La Lejona', postalCode: '37765' } : {}) };
  const residence = {
    '@type': resType, name: S.title(p), description: S.subtitle(p), address,
    ...(geo ? { geo: { '@type': 'GeoCoordinates', latitude: geo.lat, longitude: geo.lng } } : {}),
    ...(area(p) ? { floorSize: { '@type': 'QuantitativeValue', value: area(p), unitCode: 'MTK' } } : {}),
    ...(!isLot && p.beds ? { numberOfRooms: p.beds, numberOfBedrooms: p.beds } : {}),
    ...(!isLot && p.baths ? { numberOfBathroomsTotal: p.baths } : {}),
    ...(proj ? { containedInPlace: { '@type': 'Place', name: proj.name } } : {}),
  };
  const crumbs = [[T('Inicio', 'Home'), `${ORIGIN}/`], [T('Propiedades', 'Properties'), `${ORIGIN}/propiedades.html`], ...(proj ? [[proj.name, `${ORIGIN}/propiedades.html?project=${proj.id}`]] : []), [S.title(p), url]];
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
    { '@type': 'RealEstateListing', '@id': `${url}#listing`, url, name: seoT.split(' | ')[0], description: seoD, inLanguage: locale(),
      image: photos.slice(0, 6).map((u) => img(u, 1600, 1000)),
      offers: { '@type': 'Offer', price: p.price, priceCurrency: 'MXN', availability: `https://schema.org/${avail}`, url, seller: { '@type': 'RealEstateAgent', '@id': `${ORIGIN}/#org`, name: COMPANY.name, telephone: COMPANY.phone } },
      mainEntity: residence },
    { '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
  ] });
  document.head.append(ld);
}

// ---- Visor a pantalla completa: flechas, deslizar, contador, Esc ---------------------
function lightbox(list, start, label, plansMode = false) {
  if (!list.length) return;
  let i = start; const opener = document.activeElement; const many = list.length > 1;
  const lb = h(`<div class="lb ${plansMode ? 'lb--plans' : ''}" role="dialog" aria-modal="true" aria-label="${label}">
    <p class="lb__count" aria-live="polite"></p>
    <button class="icon-btn lb__x" aria-label="${T('Cerrar', 'Close')}">${icon('close', 22)}</button>
    <figure class="lb__fig"><img alt=""></figure>
    ${many ? `<button class="lb__nav lb__prev" aria-label="${T('Anterior', 'Previous')}">${icon('arrow', 22)}</button><button class="lb__nav lb__next" aria-label="${T('Siguiente', 'Next')}">${icon('arrow', 22)}</button>` : ''}
  </div>`);
  const im = $('img', lb);
  im.addEventListener('load', () => im.classList.add('is-in'));
  const show = (k) => {
    i = (k + list.length) % list.length; im.classList.remove('is-in');
    im.src = list[i].src; im.alt = list[i].alt; if (im.complete) im.classList.add('is-in');
    $('.lb__count', lb).textContent = `${i + 1} / ${list.length}`;
    if (many) { new Image().src = list[(i + 1) % list.length].src; }
  };
  const close = () => { lb.classList.remove('is-open'); document.removeEventListener('keydown', key); document.body.style.overflow = ''; setTimeout(() => lb.remove(), 400); opener?.focus?.({ preventScroll: true }); };
  function key(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' && many) show(i + 1);
    else if (e.key === 'ArrowLeft' && many) show(i - 1);
    else if (e.key === 'Tab') {
      const f = $$('button', lb); const a = f[0]; const z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }
  lb.addEventListener('click', (e) => {
    if (e.target.closest('.lb__x') || e.target === lb || e.target.classList.contains('lb__fig')) return close();
    if (e.target.closest('.lb__next')) show(i + 1);
    if (e.target.closest('.lb__prev')) show(i - 1);
  });
  let x0 = null; let y0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; const dy = e.changedTouches[0].clientY - y0; x0 = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && many) show(i + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  }, { passive: true });
  document.addEventListener('keydown', key);
  document.body.append(lb); document.body.style.overflow = 'hidden'; show(i);
  void lb.offsetWidth; lb.classList.add('is-open'); $('.lb__x', lb).focus({ preventScroll: true });
}
