import { site, services, categories, serviceBySlug, defaultServiceCta, waLink } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, content, head, btn, pad2, svcImg, svcCard, techStrip, contactSection } from '../components.mjs';

const hero = pageHero({ crumb: 'What We Do', eyebrow: 'Services', title: 'What We Do', text: site.description, hero: 'layers' });

// One section per category (data.mjs categories), with quick links to each at the top. Every service keeps
// its own anchor (services.html#<slug>) and opens in the pop-up, numbered across the whole page.
let n = 0;
const row = (s) => `
      <li class="svc-row" id="${s.slug}" data-img="${svcImg(s)}">
        ${svcCard(s, n++, { open: true })}
        <div class="svc-detail" hidden>
          <p class="modal-intro">${s.intro}</p>
          <ol class="modal-list">${s.items.map(([t, d], k) => `<li><span class="ml-num">${pad2(k + 1)}</span><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ol>
          <p class="modal-cta">${s.cta || defaultServiceCta}</p>
        </div>
      </li>`;

const intro = `<section class="sec cat-intro">
  <div class="wrap">
    ${head({ idx: '01', label: 'Services', meta: `${services.length} services · ${categories.length} areas`, title: 'Everything we do, in one place', text: 'Pick an area to jump to it. Hover a service to see what it includes, or open it for the full details.' })}
    <nav class="cat-nav" aria-label="Service areas"><ul>${categories.map((c) => `<li><a href="#${c.id}">${icon(c.icon)}<span>${c.title}</span><b>${pad2(c.services.length)}</b></a></li>`).join('')}</ul></nav>
  </div>
</section>`;

const list = categories.map((c, ci) => `<section class="sec cat-sec" id="${c.id}">
  <div class="wrap">
    ${head({ idx: pad2(ci + 2), label: c.title, meta: `${c.services.length} services`, title: c.title, text: c.text })}
    <ol class="svc-grid">${c.services.map((slug) => row(serviceBySlug[slug])).join('')}
    </ol>
  </div>
</section>`).join('\n');

const modal = `<dialog class="modal" data-modal aria-labelledby="modal-title">
  <div class="modal-panel" data-lenis-prevent>
    <button class="modal-close" type="button" data-modal-close aria-label="Close">${icon('x')}</button>
    <div class="modal-media"><img alt="" data-modal-img width="1000" height="667"></div>
    <div class="modal-body">
      <p class="modal-num"><span data-modal-num></span> / ${services.length}</p>
      <h2 class="modal-title" id="modal-title" data-modal-title></h2>
      <div data-modal-body></div>
      <div class="modal-actions">
        ${btn('Contact Now', 'contact.html', { attrs: 'data-modal-contact' })}
        ${btn('WhatsApp', waLink('Hello Hamdaz'), { variant: 'ghost', ic: 'whatsapp', ext: true, attrs: 'data-modal-wa' })}
      </div>
    </div>
  </div>
</dialog>`;

export default {
  file: 'services.html',
  path: 'services.html',
  active: 'services',
  earth: true,
  title: 'Services',
  description:
    'Hamdaz services: Generative AI, data and automation, cybersecurity, cloud and infrastructure, MCC-certified CCTV and ELV, audio visual, networking and Wi-Fi, apps and ERP, industry solutions, and IT staffing and outsourcing.',
  body: [hero, content(intro, list, techStrip(), contactSection({ idx: pad2(categories.length + 2) })), modal].join('\n'),
};
