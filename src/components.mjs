import { site, contact, heroNodes, helpCta, gpt, technologies, services, serviceBySlug, featuredServices, products, industries, whoWeAre, needs, waLink, clients, partners, partnerLogos, svcUrl } from './data.mjs';
import { icon } from './icons.mjs';
import { clock } from './layout.mjs';

const [uae, india] = contact.offices;
export const sentences = (t) => t.split(/(?<=\.)\s+/);
export const pad2 = (n) => String(n).padStart(2, '0');
export const svcImg = (s) => `assets/img/svc/${s.slug}.webp`;
export const productImg = (p) => `assets/img/products/${p.slug}.webp`;
// The India office is labelled "India", so its small label shows the state instead
export const officeLabel = (o) => (o.city.toUpperCase() === o.region ? o.coords : o.region);

/* ---------- Small parts ---------- */
// Button: label + round icon. Variants: ghost, light, ghost-light.
export function btn(label, href, { variant = '', ic = 'arrow-up-right', ext = false, magnetic = false, attrs = '', tag = 'a' } = {}) {
  const cls = `btn${variant ? ` btn--${variant}` : ''}`;
  const inner = `<span>${label}</span><span class="btn-ic">${icon(ic)}</span>`;
  if (tag === 'button') return `<button class="${cls}" ${attrs}>${inner}</button>`;
  return `<a class="${cls}" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}${magnetic ? ' data-magnetic' : ''}${attrs ? ` ${attrs}` : ''}>${inner}</a>`;
}
export const tlink = (label, href, attrs = '') => `<a class="tlink" href="${href}"${attrs ? ` ${attrs}` : ''}>${label}${icon('arrow-right')}</a>`;
// Brand duotone image: navy shadows, full colour on hover
export const tone = (src, alt = '', w = 1000, h = 667) => `<span class="tone"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" width="${w}" height="${h}"></span>`;
const go = `<span class="ix-go" aria-hidden="true">${icon('arrow-up-right')}</span>`;

/* ---------- First section: dark 3D AI chip on a circuit board (assets/js/earth.js) ---------- */
// hero: which element this page shows (assets/js/heroes/framings.js tells the story)
export function earth(mode, hero = 'chip') {
  return `<div class="earth earth--${mode}" data-earth="${mode}" data-element="${hero}">
    <canvas aria-hidden="true"></canvas>
    ${hero === 'bloom' || hero === 'scan' ? '' : hero === 'globe'
      ? [uae, india].map((o) => `<div class="earth-label" data-earth-label="${o.id}"><span>${o.city}</span><span class="dim">${o.coords}</span>${clock(o)}</div>`).join('\n    ')
      : heroNodes.map((n) => `<div class="earth-label"${n.side === 'left' ? ' data-side="left"' : ''} data-earth-label="${n.id}" aria-hidden="true"><span>${n.title}</span><span class="dim">${n.text}</span><span class="tag">${n.tag}</span></div>`).join('\n    ')}
  </div>`;
}

// Each page's own 3D element: scene: 'network' (assets/js/scenes.js), or hero: 'layers' | 'waves' |
// 'globe' | 'beacon' | 'spark' | 'chip' (assets/js/earth.js, heroes/).
export function pageHero({ crumb, eyebrow, title, text, scene, hero = 'chip' }) {
  return `<section class="page-hero" data-dark>
  ${scene ? `<div class="earth earth--scene" data-scene="${scene}"><canvas aria-hidden="true"></canvas></div>` : earth('page', hero)}
  <div class="page-hero-shade" aria-hidden="true"></div>
  <div class="page-hero-inner">
    <p class="mono crumbs"><a href="index.html">Home</a> <span aria-hidden="true">/</span> ${crumb}</p>
    <p class="mono eyebrow">(${eyebrow})</p>
    <h1 class="display" data-split>${title}</h1>
    ${text ? `<p class="lead" data-reveal>${text}</p>` : ''}
  </div>
  <div class="page-hero-foot mono" aria-hidden="true"><span>Scroll</span><span>${uae.city} — ${india.city}</span></div>
</section>`;
}

/* Everything after the first section sits on a light sheet */
export const content = (...sections) => `<div class="content" data-theme="light">\n${sections.join('\n')}\n</div>`;

/* ---------- Section heads: numbered hairline bar + large title ---------- */
export const bar = ({ idx, label, meta = '' }) =>
  `<p class="sh-bar"><span class="sh-idx">${idx}</span><span>${label}</span>${meta ? `<span class="sh-meta">${meta}</span>` : ''}</p>`;

export function head({ idx, label, meta = '', title, text = '', action = '' }) {
  const side = text || action;
  return `<header class="sh">
    ${bar({ idx, label, meta })}
    <div class="sh-main${side ? '' : ' sh-main--solo'}">
      <h2 class="sh-title" data-split>${title}</h2>
      ${side ? `<div class="sh-side" data-reveal>${text ? `<p>${text}</p>` : ''}${action}</div>` : ''}
    </div>
  </header>`;
}

/* ---------- Facts row ---------- */
// what stands behind the work: partner brands, round-the-clock support and the security-systems certification
export const facts = (extra = '') => `<div class="facts">
      <div class="fact" data-reveal><span class="fact-label">Technology brands we deliver</span><span class="fact-num">100+</span></div>
      <div class="fact" data-reveal><span class="fact-label">Support · NOC &amp; SOC</span><span class="fact-num">24/7</span></div>
      <div class="fact" data-reveal><span class="fact-label">Certified for security systems · Abu Dhabi</span><span class="fact-num">MCC</span></div>
      ${extra}
    </div>`;
export const certLine = `<p class="fact-certs">ISO 9001 · 14001 · 45001 <span>·</span> ICV certified <span>·</span> Registered ADNOC supplier</p>`;

/* ---------- Home 01: who we are ---------- */
// art: the home page shows the people network (assets/js/stage.js) beside the text
export function intro({ art = false } = {}) {
  const s = sentences(whoWeAre.text);
  const body = `${head({ idx: '01', label: whoWeAre.eyebrow, meta: `${uae.city} — India`, title: 'Excellence in managed software services', text: s[2] })}
    ${facts(`<div class="fact fact--text" data-reveal>${certLine}<p>We craft intelligent solutions that propel your business forward.</p>${tlink('More about Hamdaz', 'about.html')}</div>`)}`;
  return `<section class="sec intro">
  <div class="wrap">
    ${art ? `<div class="intro-grid"><div class="intro-text">${body}</div><div class="intro-art" data-art aria-hidden="true"></div></div>` : body}
  </div>
</section>`;
}

/* ---------- Managed services, as cards (What We Do) ---------- */
// a service as a card: its image, title, summary and main areas; hovering it lists everything included.
// It links to the service's own page (service/<slug>/).
export const svcCard = (s, i) => {
  const areas = s.items.map(([name]) => name).filter((n) => !/^latest technolog/i.test(n));
  return `<a class="svc-card" href="${svcUrl(s.slug)}" data-reveal>
        <span class="svc-media">${tone(svcImg(s))}<span class="svc-num">${pad2(i + 1)}</span>
          <span class="svc-pop"><span class="svc-pop-label">What's included</span><span class="svc-pop-list">${s.items.map(([name]) => `<span>${name}</span>`).join('')}</span></span>
        </span>
        <span class="svc-body">
          <span class="svc-title">${s.title}</span>
          <span class="svc-text">${s.summary}</span>
          <span class="svc-tags">${areas.slice(0, 3).map((n) => `<span class="svc-tag">${n}</span>`).join('')}</span>
          <span class="svc-foot"><span>Explore service</span>${go}</span>
        </span>
      </a>`;
};

/* ---------- Home: our managed services, as a list with a detail panel ---------- */
// The main services as a compact list; the panel beside it shows the one you point at (image, summary,
// what it includes), switched by main.js. On phones each row shows its summary instead.
export function servicesIndex({ idx = '02' } = {}) {
  const featured = featuredServices.map((slug) => serviceBySlug[slug]);
  const rest = services.length - featured.length;
  return `<section class="sec svc-sec">
  <div class="wrap">
    ${head({ idx, label: 'What we do', meta: `${services.length} services`, title: 'Our managed services', text: sentences(site.description)[0], action: btn('View all services', 'services.html', { magnetic: true }) })}
    <div class="svx" data-svx>
      <ol class="svx-list">
        ${featured.map((s, i) => `<li><a class="svx-row${i ? '' : ' is-on'}" href="${svcUrl(s.slug)}" data-svx-row="${i}"><span class="svx-num">${pad2(i + 1)}</span><span class="svx-name"><span class="svx-title">${s.title}</span><span class="svx-text">${s.summary}</span></span><span class="svx-go" aria-hidden="true">${icon('arrow-right')}</span></a></li>`).join('\n        ')}
        <li><a class="svx-row svx-row--more" href="services.html"><span class="svx-num">+${rest}</span><span class="svx-name"><span class="svx-title">More services</span></span><span class="svx-go" aria-hidden="true">${icon('arrow-right')}</span></a></li>
      </ol>
      <div class="svx-panels" aria-hidden="true">
        ${featured.map((s, i) => `<div class="svx-panel${i ? '' : ' is-on'}" data-svx-panel="${i}">
          <div class="svx-media">${tone(svcImg(s))}</div>
          <div class="svx-body">
            <p class="svx-p-title">${s.title}</p>
            <p class="svx-p-text">${s.summary}</p>
            <p class="svx-p-label">What's included</p>
            <ul class="svx-p-list">${s.items.map(([name]) => `<li>${name}</li>`).join('')}</ul>
          </div>
        </div>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- AI products grid ---------- */
export function productsGrid({ idx = '03' } = {}) {
  return `<section class="sec prod-sec">
  <div class="wrap">
    ${head({ idx, label: products.eyebrow, meta: `${industries.length} industries`, title: 'AI products for every industry', text: sentences(products.intro)[0] })}
    <div class="prod-grid">
      ${industries
        .map(
          (p, i) => `<a class="prod" href="solutions.html#${p.slug}" data-reveal>
        ${tone(productImg(p))}
        <span class="prod-meta"><span class="prod-num">${pad2(i + 1)}</span><span class="prod-title">${p.title}</span></span>
      </a>`,
        )
        .join('\n      ')}
      <a class="prod prod--cta" href="solutions.html#custom-gpt" data-reveal>
        <span class="prod-num">Also from Hamdaz</span>
        <span class="prod-cta-title">Custom ChatGPT for your business</span>
        ${go}
      </a>
    </div>
  </div>
</section>`;
}

/* ---------- Custom ChatGPT: the one navy panel ---------- */
export function gptSection({ idx = '04', full = false } = {}) {
  const chat = `<figure class="chat" data-chat data-reveal>
          <div class="chat-head">
            <span class="chat-mark">H</span>
            <div><p class="chat-title">Company Assistant</p><p class="chat-sub"><i></i> Custom ChatGPT · Your data</p></div>
            <span class="chat-note">Illustrative example</span>
          </div>
          <div class="chat-body">
            <p class="msg msg--you">What is the refund policy for annual subscriptions?</p>
            <div class="msg msg--bot"><p>Annual plans are refunded in full within 30 days of purchase. After that, the customer receives a pro-rated credit for the remaining months.</p><p class="msg-src">${icon('file-text')} Billing policy · section 4.2</p></div>
            <p class="msg msg--you">Draft a reply to the customer who asked yesterday</p>
            <div class="msg msg--bot"><p>Thank you for your message. As your plan started 18 days ago, you are within the 30-day window and can receive a full refund. Shall I process it?</p><p class="msg-src">${icon('file-text')} Billing policy · CRM record</p></div>
          </div>
          <div class="chat-input"><span>Ask anything about your business</span><span class="chat-send">${icon('send')}</span></div>
        </figure>`;
  const head = `${bar({ idx, label: 'Custom ChatGPT', meta: 'Customised with your data' })}
        <h2 class="gpt-title" data-split><span class="c">Custom ChatGPT</span> for your business</h2>
        <p class="gpt-text" data-reveal>Advanced chatbots built on ChatGPT and customized with your own data.</p>`;

  // Products page: full text in an accordion beside the chat
  const fullBody = `<div class="gpt-main">
        ${head}
        ${chat}
      </div>
      <div class="gpt-side">
        <h3 class="gpt-sub">${gpt.subtitle}</h3>
        <ol class="steps steps--full">${gpt.items
          .map(([t, d], i) => `<li><details${i === 0 ? ' open' : ''}><summary><span class="st-num">${pad2(i + 1)}</span><span class="st-title">${t}</span><span class="st-plus" aria-hidden="true"></span></summary><p>${d}</p></details></li>`)
          .join('')}</ol>
        <div class="gpt-closing" data-reveal>${btn('Contact Now', 'contact.html?about=Custom%20ChatGPT', { variant: 'light' })}</div>
      </div>`;

  // Home: copy beside the chat, the five steps in a row underneath
  const homeBody = `<div class="gpt-main">
        ${head}
        <div data-reveal>${btn('Learn more', 'solutions.html#custom-gpt', { variant: 'light' })}</div>
      </div>
      <div class="gpt-aside">${chat}</div>
      <ol class="steps steps--row">${gpt.items
        .map(([t], i) => `<li data-reveal><span class="st-num">${pad2(i + 1)}</span><h3 class="st-title">${t}</h3></li>`)
        .join('')}</ol>`;

  return `<section class="sec gpt-sec" id="custom-gpt">
  <div class="wrap">
    <div class="gpt${full ? '' : ' gpt--home'}" data-dark>
      ${full ? fullBody : homeBody}
    </div>
  </div>
</section>`;
}

/* ---------- Home: find the right service (goal -> matching services) ---------- */
export function serviceFinder({ idx = '04' } = {}) {
  const lowerFirst = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  return `<section class="sec finder-sec" id="find">
  <div class="wrap">
    <div class="gpt finder" data-dark>
      <div class="finder-main">
        ${bar({ idx, label: 'Find the right service', meta: `${needs.length} goals · ${services.length} services` })}
        <h2 class="finder-title" data-split>What do you need <span class="c">help with?</span></h2>
        <p class="finder-text" data-reveal>Pick a goal to see the services that fit.</p>
        <div class="needs" role="tablist" aria-label="Business goals" data-tabs data-reveal>
          ${needs
            .map(
              (n, i) => `<button class="need" type="button" role="tab" id="need-${n.id}" aria-controls="np-${n.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><span class="need-num">${pad2(i + 1)}</span>${n.label}</button>`,
            )
            .join('\n          ')}
        </div>
      </div>
      <div class="finder-panels">
        ${needs
          .map(
            (n, i) => `<div class="np" role="tabpanel" id="np-${n.id}" aria-labelledby="need-${n.id}"${i ? ' hidden' : ''}>
          <p class="np-label">${n.services.length} services for “${lowerFirst(n.label)}”</p>
          <ul class="np-list">${n.services
            .map((slug) => {
              const s = serviceBySlug[slug];
              return `<li><a href="${svcUrl(slug)}"><span class="np-title">${s.title}</span><span class="np-text">${s.summary}</span>${go}</a></li>`;
            })
            .join('')}</ul>
          <div class="np-actions">
            ${btn('Ask on WhatsApp', waLink(`Hello Hamdaz, I need help to ${lowerFirst(n.label)}.`), { variant: 'light', ic: 'whatsapp', ext: true })}
            ${btn('Send an enquiry', `contact.html?need=${encodeURIComponent(lowerFirst(n.label))}`, { variant: 'ghost-light' })}
          </div>
        </div>`,
          )
          .join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Technologies marquee ---------- */
export function techStrip() {
  // One moving row; main.js drives it and reacts to scroll speed.
  // Brand marks: Simple Icons (CC0). General topics use Lucide line icons.
  const techIcons = {
    'Generative AI': 'sparkles', OpenAI: 'openai', 'Microsoft Azure': 'microsoftazure', AWS: 'amazonaws',
    'Google Cloud': 'googlecloud', 'Oracle Cloud': 'oracle', Kubernetes: 'kubernetes', Zoho: 'zoho', SAP: 'sap',
    Odoo: 'odoo', Salesforce: 'salesforce', Flutter: 'flutter', 'React Native': 'react', SCADA: 'gauge',
    IIoT: 'radio-tower', Blockchain: 'blocks',
  };
  const ul = `<ul>${technologies.map((t) => `<li>${techIcons[t] ? icon(techIcons[t], 'i mq-ic') : ''}<span>${t}</span></li>`).join('')}</ul>`;
  return `<section class="tech" aria-label="Technologies we work with">
  <div class="tech-head"><p>Technologies we work with</p><p class="tech-meta">AI · Cloud · ERP · Mobile · IoT</p><button class="mq-toggle" type="button" aria-pressed="false" data-marquee-toggle><span class="mq-toggle-icon" aria-hidden="true"></span><span data-marquee-toggle-label>Pause</span></button></div>
  <p class="sr-only">${technologies.join(', ')}</p>
  <div class="mq" data-marquee="1" aria-hidden="true"><div class="mq-track">${ul}${ul}</div></div>
</section>`;
}

/* ---------- Clients and technology partners: moving rows of names ---------- */
export function clientsPartners({ idx = '04' } = {}) {
  const groups = Object.entries(partners);
  const total = groups.reduce((n, [, list]) => n + list.length, 0);
  // a partner as its logo, all logos about equally heavy: wide wordmarks shorter, square marks taller
  const logo = (n) => {
    const [file, ratio, mark] = partnerLogos[n] || [];
    if (!file) return `<li class="mq-name">${n}</li>`;
    const h = mark ? 26 : Math.round(Math.min(38, Math.max(22, Math.sqrt(3000 / ratio))));
    const img = `<img src="assets/img/logos/${file}" alt="${mark ? '' : n}" width="${Math.round(h * ratio)}" height="${h}" style="height:${h}px" loading="lazy" decoding="async" draggable="false">`;
    return mark ? `<li class="mq-logo mq-logo--mark">${img}<span>${n}</span></li>` : `<li class="mq-logo">${img}</li>`;
  };
  // logo rows alternate logos with the names that have none yet, so no stretch reads as a plain list
  const mix = (list) => {
    const [withLogo, without] = [list.filter((n) => partnerLogos[n]), list.filter((n) => !partnerLogos[n])];
    const out = [];
    while (withLogo.length || without.length) { if (withLogo.length) out.push(withLogo.shift()); if (without.length) out.push(without.shift()); }
    return out;
  };
  const row = (list, logos = false) => { const ul = `<ul>${(logos ? mix(list) : list).map((n) => (logos ? logo(n) : `<li>${n}</li>`)).join('')}</ul>`; return `<div class="mq-track">${ul}${ul}</div>`; };
  return `<section class="sec cp-sec" id="clients" aria-labelledby="cp-title">
  <div class="wrap">
    ${head({ idx, label: 'Clients & partners', meta: `${clients.length} featured clients · ${total}+ partners`, title: 'Trusted across the UAE', text: 'Government, energy, education and enterprise clients, backed by the industry\u2019s leading technology brands.', action: tlink('All partners & clients', 'partners.html') }).replace('<h2 class="sh-title"', '<h2 class="sh-title" id="cp-title"')}
  </div>
  <div class="cp-rows">
    <div class="cp-head"><p>Selected clients</p><button class="mq-toggle" type="button" aria-pressed="false" data-marquee-toggle><span class="mq-toggle-icon" aria-hidden="true"></span><span data-marquee-toggle-label>Pause</span></button></div>
    <div class="mq mq--clients" data-marquee="1" aria-hidden="true">${row(clients)}</div>
    ${groups.map(([label, list], i) => `<div class="cp-head"><p>${label}</p></div>
    <div class="mq mq--partners mq--logos" data-marquee="${i % 2 ? 1 : -1}" aria-hidden="true">${row(list, true)}</div>`).join('\n    ')}
    <p class="sr-only">Clients: ${clients.join(', ')}. Partners: ${groups.map(([, l]) => l.join(', ')).join(', ')}.</p>
  </div>
</section>`;
}

/* ---------- Closing call to action, offices and careers ---------- */
export function contactSection({ idx = '05' } = {}) {
  const [first, second] = helpCta.title.replace('Business', 'business').split(/(?=your)/);
  return `<section class="sec cta-sec">
  <div class="wrap">
    ${bar({ idx, label: 'Contact', meta: `<a href="mailto:${contact.email}">${contact.email}</a>` })}
    <h2 class="cta-title" data-split>${first}<span class="c">${second}</span></h2>
    <div class="cta-row">
      <p class="cta-text" data-reveal>${helpCta.text}.</p>
      <div class="cta-actions" data-reveal>
        ${btn(helpCta.button, 'contact.html', { magnetic: true })}
        ${btn('WhatsApp', waLink('Hello Hamdaz, I would like to discuss a project.'), { variant: 'ghost', ic: 'whatsapp', ext: true })}
      </div>
    </div>
    <div class="cta-cols">
      ${contact.offices
        .map(
          (o) => `<div class="cta-col" data-reveal>
        <p class="cta-label"><span>${officeLabel(o)}</span>${clock(o)}</p>
        <p class="cta-city">${o.city}</p>
        <p class="cta-sub">${o.phones.map((p) => `<a href="tel:${p.tel}">${p.label}</a>`).join('<br>')}</p>
      </div>`,
        )
        .join('\n      ')}
      <div class="cta-col" id="careers" data-reveal>
        <p class="cta-label"><span>Careers</span></p>
        <p class="cta-city">Join the Hamdaz Team</p>
        <p class="cta-sub">${tlink('See open roles', 'careers.html')}</p>
      </div>
    </div>
  </div>
</section>`;
}
