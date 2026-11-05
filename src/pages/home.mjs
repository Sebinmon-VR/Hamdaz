import { site, contact, heroSlides } from '../data.mjs';
import { icon } from '../icons.mjs';
import { clock } from '../layout.mjs';
import { earth, content, intro, servicesIndex, productsGrid, serviceFinder, techStrip, contactSection } from '../components.mjs';

const [first, ...rest] = heroSlides;
const [uae, india] = contact.offices;

const hero = `<section class="hero" data-hero data-dark>
  <div class="hero-stage">
    ${earth('hero')}
    <div class="hero-shade" aria-hidden="true"></div>

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
      <p class="mono eyebrow">(UAE · India)</p>
      <h2 class="display display--md">Where Passion Meets Technology</h2>
      <p class="lead">${contact.heading}</p>
      <div class="hero-offices">
        ${[uae, india].map((o) => `<div><p class="mono">${clock(o)}</p><p class="hero-office-city">${o.city}</p><p class="dim">${o.coords}</p></div>`).join('')}
      </div>
    </div>
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
  earth: true,
  bodyClass: 'page-home',
  jsonld,
  body: [hero, content(intro(), servicesIndex(), productsGrid(), serviceFinder({ idx: '04' }), techStrip(), contactSection({ idx: '05' }))].join('\n'),
};
