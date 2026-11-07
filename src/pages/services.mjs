import { site, services, categories, serviceBySlug, areaUrl } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, content, head, tlink, pad2, svcCard, techStrip, contactSection } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode } from '../blocks.mjs';

const hero = pageHero({ crumb: 'What We Do', eyebrow: 'Services', title: 'What We Do', text: 'AI, cloud, cybersecurity, MCC-certified ELV and security systems, audio visual, networking and software development, delivered across the UAE from Abu Dhabi.', hero: 'layers' });

// One section per category (data.mjs categories), with quick links to each at the top. Each card opens the
// service's own page (service/<slug>/); the row keeps the old anchor (services.html#<slug>), which main.js
// forwards to that page.
let n = 0;
const row = (s) => `
      <li class="svc-row" id="${s.slug}">
        ${svcCard(s, n++)}
      </li>`;

const intro = `<section class="sec cat-intro">
  <div class="wrap">
    ${head({ idx: '01', label: 'Services', meta: `${services.length} services · ${categories.length} areas`, title: 'Everything we do, in one place', text: 'Pick an area to jump to it. Hover a service to see what it includes, or open it for the full page.' })}
    <nav class="cat-nav" aria-label="Service areas"><ul>${categories.map((c) => `<li><a href="#${c.id}">${icon(c.icon)}<span>${c.title}</span><b>${pad2(c.services.length)}</b></a></li>`).join('')}</ul></nav>
  </div>
</section>`;

const list = categories.map((c, ci) => `<section class="sec cat-sec" id="${c.id}">
  <div class="wrap">
    ${head({ idx: pad2(ci + 2), label: c.title, meta: `${c.services.length} services`, title: c.title, text: c.text, action: tlink(`About ${c.title}`, areaUrl(c.id)) })}
    <ol class="svc-grid">${c.services.map((slug) => row(serviceBySlug[slug])).join('')}
    </ol>
  </div>
</section>`).join('\n');

export default {
  file: 'services.html',
  path: 'services.html',
  active: 'services',
  earth: true,
  fullTitle: 'IT, AI, Cybersecurity, ELV & AV Services in Abu Dhabi | Hamdaz',
  description: `${services.length} services across AI, cloud, cybersecurity, MCC-certified CCTV and ELV, audio visual, networking, software development and IT staffing, from Abu Dhabi.`,
  jsonld: ldScript(orgNode(), breadcrumbNode([['What We Do', 'services.html']])),
  body: [hero, content(intro, list, techStrip(), contactSection({ idx: pad2(categories.length + 2) }))].join('\n'),
};
