import { site, contact, services, industries, waLink } from './data.mjs';
import { icon } from './icons.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// Original hamdaz.com navigation labels
export const NAV = [
  { href: 'index.html', label: 'Home', key: 'home' },
  { href: 'about.html', label: 'Who We Are', key: 'about' },
  { href: 'services.html', label: 'What We Do', key: 'services' },
  { href: 'solutions.html', label: 'How We Do', key: 'solutions' },
  { href: 'contact.html', label: 'Contact Us', key: 'contact' },
];

export const clock = (o) => `<span class="clock" data-clock="${o.tz}" data-clock-label="${o.tzLabel}">--:-- ${o.tzLabel}</span>`;

function loader() {
  return `<div class="loader" data-loader aria-hidden="true">
  <div class="loader-row"><span>Hamdaz Technologies</span><span>Delivering the Digital Future</span></div>
  <div class="loader-count"><span data-loader-count>000</span></div>
  <div class="loader-foot">
    <div class="loader-bar"><i data-loader-bar></i></div>
    <div class="loader-row"><span>Abu Dhabi · UAE</span><span>Loading</span><span>India</span></div>
  </div>
</div>`;
}

function header(active) {
  const links = NAV.filter((n) => n.key !== 'home')
    .map((n) => `<li><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''} data-hover><span>${n.label}</span><span aria-hidden="true">${n.label}</span></a></li>`)
    .join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="header" data-header>
  <a class="brand" href="index.html" aria-label="${site.name}, home"><img src="assets/img/logo.svg" width="176" height="136" alt=""><span>Technologies</span></a>
  <nav class="nav" aria-label="Primary"><ul>${links}</ul></nav>
  <div class="header-end">
    <a class="pill" href="contact.html" data-magnetic>Contact Now ${icon('arrow-up-right')}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-btn><span class="menu-btn-label">Menu</span><span class="menu-btn-lines"><i></i><i></i></span></button>
  </div>
</header>
<div class="menu" id="menu" data-menu inert>
  <div class="menu-inner">
    <nav aria-label="Menu"><ol class="menu-links">${NAV.map(
      (n, i) => `<li><a href="${n.href}"${active === n.key ? ' aria-current="page"' : ''}><span class="menu-num">0${i + 1}</span>${n.label}</a></li>`,
    ).join('')}</ol></nav>
    <div class="menu-side">
      <p class="mono">What We Do</p>
      <ul class="menu-services">${services.slice(0, 10).map((s) => `<li><a href="services.html#${s.slug}">${s.title}</a></li>`).join('')}<li><a href="services.html">More &gt;&gt;</a></li></ul>
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
        <ul>${NAV.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}</ul>
      </nav>
      <div class="footer-col">
        <h2>Services</h2>
        <ul>${services.slice(0, 6).map((s) => `<li><a href="services.html#${s.slug}">${s.title}</a></li>`).join('')}<li><a href="services.html">More &gt;&gt;</a></li></ul>
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

// Fallback page-switch cover, used only where the 3D morph can't run (no WebGL). main.js animates it.
function curtain() {
  return `<div class="curtain" data-curtain aria-hidden="true">
  <div class="curtain-accent" data-curtain-accent></div>
  <div class="curtain-main" data-curtain-main>
    <div class="curtain-inner">
      <img class="curtain-logo" src="assets/img/logo.svg" width="176" height="136" alt="" data-curtain-logo>
      <p class="curtain-label"><span data-curtain-label></span></p>
      <span class="curtain-line"><i data-curtain-line></i></span>
    </div>
  </div>
</div>`;
}

export function layout({ path = '', title, description = site.description, active = '', body, earth = false, scene = false, jsonld = '', base = '', bodyClass = '' }) {
  const fullTitle = title ? `${title} – Hamdaz` : 'Hamdaz – Delivering the Digital Future';
  const url = `${site.url}/${path}`;
  return `<!doctype html>
<!-- Generated by build.mjs from src/. Edit the source files, then run: node build.mjs -->
<html lang="en">
<head>
<meta charset="utf-8">
${base ? `<base href="${base}">\n` : ''}<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#061423">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}/assets/img/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/img/favicon.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="assets/css/style.css">
<script>(function(d){var r=d.documentElement;r.classList.add('js');if(matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('reduce')}else{r.classList.add('anim');setTimeout(function(){if(!r.classList.contains('ready'))r.classList.remove('anim')},4000)}try{if(sessionStorage.getItem('hz-morph-state')){r.classList.add('morphing');if('onpageswap' in window)r.classList.add('vt-arrive');setTimeout(function(){r.classList.remove('morphing')},4000)}if(sessionStorage.getItem('hz-nav')){r.classList.add('from-nav');setTimeout(function(){if(!r.classList.contains('ready'))r.classList.remove('from-nav')},3000)}}catch(e){}})(document)</script>
${earth || scene ? '<link rel="modulepreload" href="assets/vendor/three.module.min.js">\n' : ''}<script src="assets/vendor/gsap.min.js" defer></script>
<script src="assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="assets/vendor/lenis.min.js" defer></script>
<script src="assets/js/main.js" defer></script>
${earth || scene ? '<script type="module" src="assets/js/morph.js" blocking="render"></script>\n' : ''}${earth ? '<script type="module" src="assets/js/earth.js"></script>\n' : ''}${scene ? '<script type="module" src="assets/js/scenes.js"></script>\n' : ''}${jsonld}</head>
<body id="top" class="${bodyClass}">
${active === 'home' ? loader() : ''}
${header(active)}
<main id="main">
${body}
</main>
${footer()}
${curtain()}
</body>
</html>
`;
}
