import { site, contact, heroSlides, services, industries } from '../data.mjs';
import { icon } from '../icons.mjs';
import { earth, content, intro, servicesIndex, productsGrid, serviceFinder, techStrip, contactSection } from '../components.mjs';

// The hero's artwork: 'scan' (the scan horizon, assets/js/scan.js) or 'chip' (the AI chip, heroes/chip.js).
// Switch back to the chip by setting this to 'chip'.
const HERO = 'chip';

const [first, ...rest] = heroSlides;

const hero = `<section class="hero${HERO === 'scan' ? ' hero--scan' : ''}" data-hero data-dark>
  <div class="hero-stage">
    ${HERO === 'scan' ? '<svg class="hero-scan" data-scan viewBox="0 0 1680 944" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>\n    ' : ''}<div class="hero-shade" aria-hidden="true"></div>

    <div class="hero-a" data-hero-a>
      <h1 class="display display--hero" data-split data-split-load><span class="line">${first.title.split(' ').slice(0, 2).join(' ')}</span> <span class="line">${first.title.split(' ').slice(2).join(' ')}</span></h1>
      <div class="hero-a-foot">
        <p class="hero-sub" data-intro>+ ${first.text}</p>
        <div class="hero-actions" data-intro>
          <a class="pill" href="contact.html" data-magnetic>Contact Now ${icon('arrow-up-right')}</a>
          <a class="pill pill--ghost" href="services.html" data-magnetic>What We Do</a>
        </div>
      </div>
    </div>

    <div class="hero-ticker" data-ticker data-intro aria-label="Highlights">
      <p class="mono"><span data-ticker-index>01</span> / 0${rest.length}</p>
      <div class="hero-ticker-items">${rest.map((s, i) => `<div class="hero-ticker-item${i === 0 ? ' is-active' : ''}"><strong>${s.title}</strong><span>${s.text}</span></div>`).join('')}</div>
      <div class="hero-ticker-bar"><i></i></div>
    </div>

    <p class="hero-scroll mono" data-intro aria-hidden="true">Scroll to explore <span>↓</span></p>

    <div class="hero-b" data-hero-b>
      <p class="mono eyebrow">(AI · Cloud · Data)</p>
      <h2 class="display display--md">Where Passion Meets Technology</h2>
      <p class="lead">${contact.heading}</p>
      <div class="hero-offices">
        ${[[services.length, 'Managed services', 'AI, cloud, data & security'], [industries.length, 'AI products', 'Built for industry']].map(([n, label, text]) => `<div><p class="mono">${label}</p><p class="hero-office-city">${String(n).padStart(2, '0')}</p><p class="dim">${text}</p></div>`).join('')}
      </div>
    </div>
  </div>
</section>`;

// The home page's 3D (assets/js/stage.js): the hero's 3D element on a dark layer behind the page (the scan horizon is SVG in the hero itself), and a clear
// layer above the page where its particles fly down and form the network beside "Who we are"
const stage = `<div class="stage" aria-hidden="true">${earth('stage', HERO).replace('data-earth="stage"', 'data-earth="stage" data-stage')}</div>
<div class="stage-light" aria-hidden="true"><canvas data-stage-light></canvas></div>`;

// A dark section before Contact: the network's light streams down into a galaxy here (stage.js)
const galaxy = `<section class="galaxy-sec" data-galaxy data-dark>
  <div class="galaxy-in">
    <p class="mono eyebrow">(Delivering the digital future)</p>
    <h2 class="display display--md">Your success is our mission</h2>
  </div>
</section>`;

const jsonld = `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: `${site.url}/assets/img/logo.png`,
  email: contact.email,
  sameAs: [contact.linkedin],
  description: site.description,
  address: contact.offices.map((o) => ({
    '@type': 'PostalAddress',
    streetAddress: o.postal.street,
    addressLocality: o.postal.locality,
    addressRegion: o.postal.region,
    postalCode: o.postal.code,
    addressCountry: o.postal.country,
  })),
  contactPoint: contact.offices.flatMap((o) =>
    o.phones.map((p) => ({ '@type': 'ContactPoint', telephone: p.tel, contactType: 'sales', areaServed: o.postal.country })),
  ),
})}</script>\n`;

export default {
  file: 'index.html',
  path: '',
  active: 'home',
  stage: true,
  bodyClass: 'page-home',
  jsonld,
  body: [stage, hero, content(intro({ art: true }), servicesIndex(), productsGrid(), serviceFinder({ idx: '04' }), techStrip()), galaxy, content(contactSection({ idx: '05' }))].join('\n'),
};
