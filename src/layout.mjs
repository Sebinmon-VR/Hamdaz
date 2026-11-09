import { site, contact, services, categories, serviceBySlug, industries, waLink, svcUrl, areaUrl } from './data.mjs';
import { icon } from './icons.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Original hamdaz.com navigation labels
export const NAV = [
  { href: 'index.html', label: 'Home', key: 'home' },
  { href: 'about.html', label: 'Who We Are', key: 'about' },
  { href: 'services.html', label: 'What We Do', key: 'services' },
  { href: 'solutions.html', label: 'How We Do', key: 'solutions' },
  { href: 'projects.html', label: 'Clients & Projects', key: 'clients' },
  { href: 'careers.html', label: 'Careers', key: 'careers' },
  { href: 'contact.html', label: 'Contact Us', key: 'contact' },
];

// shorter names for the menus, where a service's full title is long
const SHORT = {
  'data-analytics-predictive-services': 'Data Analytics & Prediction',
  'business-process-automation-and-digital-transformation-services': 'Process Automation & Transformation',
  'rpa-robotic-process-automation': 'Robotic Process Automation',
  'data-center-infrastructure-services': 'Data Center & Infrastructure',
  'partner-services-msft-azure-aws-gcp-oci': 'Azure, AWS, GCP & OCI Partner',
  'zoho-sap-vodoo-crm-salesforce': 'CRM: Salesforce & Zoho',
  'custom-software-web-development': 'Custom Software & Web',
  'erp-solutions': 'ERP: SAP, Odoo & Zoho',
  'lms-elearning-platforms': 'LMS & e-Learning',
  'network-services-cabling-structured-cabling': 'Structured Cabling',
  'av-setup-meeting-room-solutions': 'AV Setup & Meeting Rooms',
  'information-security-services': 'Information Security',
  'bot-services': 'Chatbots & Bot Services',
  'managed-services': 'Managed IT Services',
  'it-ot-services': 'IT/OT Integration',
  'managed-ai-secops': 'Managed AI SecOps (24/7)',
  'zero-trust-identity-data-security': 'Zero Trust, Identity & Data',
  'it-outsourcing-managed-operations': 'IT Outsourcing & Operations',
  'retail-implementation-services': 'Retail',
  'education-services': 'Education',
  'healthcare-services': 'Healthcare',
};
export const shortName = (slug) => SHORT[slug] || serviceBySlug[slug].title.replace(/ Services$/, '');

// The "What We Do" mega menu: every service area with its services, and a way in when you are not sure
function mega() {
  const office = contact.offices[0];
  return `<div class="megamenu" id="mega" data-mega>
  <div class="mega-in">
    <div class="mega-grid">
      ${categories.map((c) => `<div class="mega-col">
        <a class="mega-cat" href="${areaUrl(c.id)}">${icon(c.icon)}<span>${c.title}</span></a>
        <ul>${c.services.map((slug) => `<li><a href="${svcUrl(slug)}">${shortName(slug)}</a></li>`).join('')}</ul>
      </div>`).join('\n      ')}
    </div>
    <aside class="mega-side">
      <p class="mono">Not sure where to start?</p>
      <p class="mega-side-title">Tell us your goal and see the services that fit.</p>
      <a class="pill" href="index.html#find">Find the right service ${icon('arrow-right')}</a>
      <a class="mega-all" href="services.html">All ${services.length} services ${icon('arrow-up-right')}</a>
      <ul class="mega-certs" aria-label="Certifications">
        <li>MCC certified · Abu Dhabi</li><li>ISO 9001 · 14001 · 45001</li><li>ICV certified · ADNOC supplier</li>
      </ul>
      <p class="mega-contact"><a href="tel:${office.phones[office.phones.length - 1].tel}">${icon('phone')}${office.phones[office.phones.length - 1].label}</a><a href="mailto:${contact.email}">${icon('mail')}${contact.email}</a></p>
    </aside>
  </div>
</div>`;
}

export const clock = (o) => `<span class="clock" data-clock="${o.tz}" data-clock-label="${o.tzLabel}">--:-- ${o.tzLabel}</span>`;

function header(active) {
  // the bar links to the sections; Contact is the button beside it (the logo goes home)
  const links = NAV.filter((n) => n.key !== 'home' && n.key !== 'contact')
    .map((n) => (n.key === 'services'
      ? `<li class="nav-mega"><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a><button class="nav-caret" type="button" aria-expanded="false" aria-controls="mega" aria-label="Show all services" data-mega-btn>${icon('chevron-down')}</button></li>`
      : `<li><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''}>${n.label}</a></li>`))
    .join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="header" data-header>
  <a class="brand" href="index.html" aria-label="${site.name}, home"><img src="assets/img/logo.svg" width="176" height="136" alt=""><span>Technologies</span></a>
  <nav class="nav" aria-label="Primary"><ul>${links}</ul></nav>
  <div class="header-end">
    <a class="pill" href="contact.html"${active === 'contact' ? ' aria-current="page"' : ''} data-magnetic>Contact Now ${icon('arrow-up-right')}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="menu-btn-label">Menu</span><span class="menu-btn-lines"><i></i><i></i></span></button>
  </div>
</header>
${mega()}
<div class="menu" id="menu" data-menu inert>
  <div class="menu-inner">
    <nav aria-label="Menu"><ol class="menu-links">${NAV.map(
      (n, i) => `<li><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''}><span class="menu-num">0${i + 1}</span>${n.label}</a></li>`,
    ).join('')}</ol></nav>
    <div class="menu-side">
      <p class="mono">What We Do</p>
      <ul class="menu-services">${categories.map((c) => `<li><a href="${areaUrl(c.id)}">${c.title}</a></li>`).join('')}<li><a href="services.html">All ${services.length} services &gt;&gt;</a></li></ul>
      <p class="mono">How We Do</p>
      <ul class="menu-services">${industries.map((i) => `<li><a href="solutions.html#${i.slug}">${i.title}</a></li>`).join('')}</ul>
    </div>
  </div>
  <div class="menu-foot">
    ${contact.offices.map((o) => `<p><span class="mono">${o.region}</span> ${o.city.toUpperCase() === o.region ? '' : o.city} ${clock(o)}</p>`).join('')}
    <p><a href="mailto:${contact.email}">${contact.email}</a></p>
  </div>
</div>`;
}

function footer() {
  return `<footer class="footer" data-dark>
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-about">
        <img src="assets/img/logo.svg" width="176" height="136" alt="Hamdaz">
        <p>${site.description}</p>
        <div class="footer-social">
          <a href="${contact.linkedin}" target="_blank" rel="noopener" aria-label="Hamdaz on LinkedIn">${icon('linkedin')}</a>
          <a href="${waLink()}" target="_blank" rel="noopener" aria-label="Hamdaz on WhatsApp">${icon('whatsapp')}</a>
          <a href="mailto:${contact.email}" aria-label="Email Hamdaz">${icon('mail')}</a>
        </div>
      </div>
      <nav class="footer-col" aria-label="Footer">
        <h2>Company</h2>
        <ul>${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}<li><a href="insights.html">Insights</a></li></ul>
      </nav>
      <div class="footer-col">
        <h2>Services</h2>
        <ul>${categories.map((c) => `<li><a href="${areaUrl(c.id)}">${c.title}</a></li>`).join('')}<li><a href="services.html">All services &gt;&gt;</a></li></ul>
      </div>
      <div class="footer-col footer-offices">
        <h2>Offices</h2>
        ${contact.offices
          .map(
            (o) => `<div class="footer-office">
          <p class="footer-office-head"><strong>${o.region}</strong>${clock(o)}</p>
          <address>${o.lines.join(' ')}</address>
          <p>${o.phones.map((p) => `<a href="tel:${p.tel}">${p.label}</a>`).join(' · ')}</p>
        </div>`,
          )
          .join('')}
        <p><a href="mailto:${contact.email}">${contact.email}</a></p>
      </div>
    </div>
    <div class="footer-base">
      <p>Copyright © <span data-year>${new Date().getFullYear()}</span> Hamdaz. All Rights Reserved.</p>
      <p>HAMDAZTECH TECHNOLOGY SERVICES LLC · HAMDAZ TECHNOLOGIES LLP</p>
      <a href="#top">Back to top ↑</a>
    </div>
  </div>
</footer>
<a class="wa" href="${waLink('Hello Hamdaz, I would like to know more about your services.')}" target="_blank" rel="noopener" aria-label="Chat with Hamdaz on WhatsApp">${icon('whatsapp')}</a>
<div class="cursor" aria-hidden="true"><div class="cursor-ring"><span data-cursor-label></span></div><div class="cursor-dot"></div></div>`;
}

// The page-switch cover (main.js animates it). It carries this page's name, so a page opened through a
// switch shows its own name until the cover lifts.
function curtain(name = '') {
  return `<div class="curtain" data-curtain aria-hidden="true">
  <div class="curtain-accent" data-curtain-accent></div>
  <div class="curtain-main" data-curtain-main>
    <div class="curtain-inner">
      <img class="curtain-logo" src="assets/img/logo.svg" width="176" height="136" alt="" data-curtain-logo>
      <p class="curtain-label"><span data-curtain-label>${name}</span></p>
      <span class="curtain-line"><i data-curtain-line></i></span>
    </div>
  </div>
</div>`;
}

// a version stamp for the stylesheet and scripts, new on every build, so browsers fetch the latest copies
const V = Date.now().toString(36);

// SEO head: `title` gets " – Hamdaz" added (or pass `fullTitle` to set it exactly), `description` is the
// meta description, `image` an absolute social-card image, `ogType` 'website' or 'article'.
// `scripts`: extra scripts for this page only (paths from the site root, loaded deferred after main.js).
export function layout({ path = '', title, fullTitle: ft = '', description = site.description, active = '', body, earth = false, scene = false, stage = false, jsonld = '', base = '', bodyClass = '', image = `${site.url}/assets/img/og.png`, ogType = 'website', noindex = false, scripts = [] }) {
  const three = earth || scene || stage;
  const fullTitle = ft || (title ? `${title} – Hamdaz` : 'Hamdaz – Delivering the Digital Future');
  const url = `${site.url}/${path}`;
  return `<!doctype html>
<!-- Generated by build.mjs from src/. Edit the source files, then run: node build.mjs -->
<html lang="en">
<head>
<meta charset="utf-8">
${base ? `<base href="${base}">\n` : ''}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${url}">
<meta name="theme-color" content="#061423">
<meta property="og:type" content="${ogType}">
<meta property="og:locale" content="en_AE">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/css/style.css?v=${V}">
<script>(function(d){var r=d.documentElement;r.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('reduce')}else{r.classList.add('anim');setTimeout(function(){if(!r.classList.contains('ready'))r.classList.remove('anim')},4000)}try{if(sessionStorage.getItem('hz-nav')){r.classList.add('from-nav');setTimeout(function(){if(!r.classList.contains('ready'))r.classList.remove('from-nav')},3000)}}catch(e){}})(document)</script>
${three ? '<link rel="modulepreload" href="assets/vendor/three.module.min.js">\n' : ''}<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="assets/js/main.js?v=${V}" defer></script>
${scripts.map((s) => `<script src="${s}?v=${V}" defer></script>\n`).join('')}${stage ? `<script type="module" src="assets/js/stage.js?v=${V}"></script>\n` : earth ? `<script type="module" src="assets/js/earth.js?v=${V}"></script>\n` : ''}${scene ? `<script type="module" src="assets/js/scenes.js?v=${V}"></script>\n` : ''}${jsonld}</head>
<body id="top" class="${bodyClass}">
${header(active)}
<main id="main">
${body}
</main>
${footer()}
${curtain(NAV.find((n) => n.key === active)?.label || '')}
</body>
</html>
`;
}
