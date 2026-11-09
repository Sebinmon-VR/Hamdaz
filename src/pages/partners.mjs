// Partners & Clients (partners.html): every client, in groups (the ADNOC group companies first), and every
// technology partner brand, as a wall of logos. Lists and logo files are in src/data.mjs (clientGroups,
// clientLogos, partners, partnerLogos). The top bar's "Partners & Clients" opens this page; the projects
// are on projects.html.
import { clientGroups, clientLogos, partners, partnerLogos } from '../data.mjs';
import { pageHero, content, head, btn, contactSection } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode } from '../blocks.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// One tile: the logo, sized so wide wordmarks and square marks look about equally heavy, with the name under
// it (several ADNOC companies share the ADNOC mark, so the name is what tells them apart). No logo yet: the
// name alone, set large.
const tile = (name, logos, dir) => {
  const [file, ratio] = logos[name] || [];
  if (!file) return `<li class="lw-tile lw-tile--name"><span class="lw-word">${esc(name)}</span></li>`;
  const h = Math.round(Math.min(64, Math.max(30, Math.sqrt(6400 / ratio))));
  const w = Math.round(h * ratio);
  return `<li class="lw-tile"><span class="lw-logo"><img src="assets/img/${dir}/${file}" alt="${esc(name)}" width="${w}" height="${h}" style="max-height:${h}px" loading="lazy" decoding="async" draggable="false"></span><span class="lw-name">${esc(name)}</span></li>`;
};

const wall = (groups, logos, dir) =>
  Object.entries(groups)
    .map(([label, list]) => `<div class="lw-group" data-reveal>
      <p class="lw-head"><span>${esc(label)}</span><span class="lw-count">${list.length}</span></p>
      <ul class="lw-grid">${list.map((n) => tile(n, logos, dir)).join('')}</ul>
    </div>`)
    .join('\n    ');

const count = (groups) => Object.values(groups).reduce((n, l) => n + l.length, 0);
const nClients = count(clientGroups);
const nPartners = count(partners);

const clientsSec = `<section class="sec lw-sec" id="clients">
  <div class="wrap">
    ${head({ idx: '01', label: 'Clients', meta: `${nClients} organisations`, title: 'Who we work with', text: 'ADNOC and its group companies, universities, schools, industrial parks and enterprises across the UAE.' })}
    ${wall(clientGroups, clientLogos, 'clients')}
  </div>
</section>`;

const partnersSec = `<section class="sec lw-sec" id="partners">
  <div class="wrap">
    ${head({ idx: '02', label: 'Technology partners', meta: `${nPartners} brands`, title: 'The brands behind our work', text: 'The technology we supply, install and support, across IT, cloud and cybersecurity, audio visual, ELV and security systems.' })}
    ${wall(partners, partnerLogos, 'logos')}
  </div>
</section>`;

const projectsSec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'Projects', title: 'See the work', text: 'Selected CCTV, access control, ANPR, data centre and structured cabling projects for our clients.', action: btn('Selected projects', 'projects.html', { magnetic: true }) })}
  </div>
</section>`;

export default {
  file: 'partners.html',
  path: 'partners.html',
  active: 'clients',
  earth: true,
  fullTitle: 'Partners & Clients | ADNOC Group, Microsoft, Cisco, Dell & more | Hamdaz',
  description: `Hamdaz clients across the UAE, including ADNOC and its group companies, and ${nPartners} technology partners such as Microsoft, Cisco, Huawei, Dell, Fortinet, Hikvision and Crestron.`,
  jsonld: ldScript(orgNode(), breadcrumbNode([['Partners & Clients', 'partners.html']])),
  body: [
    pageHero({ crumb: 'Partners & Clients', eyebrow: 'Partners & clients', title: 'Partners & Clients', text: 'The organisations we work for, and the technology brands we supply, install and support.', hero: 'layers' }),
    content(clientsSec, partnersSec, projectsSec, contactSection({ idx: '04' })),
  ].join('\n'),
};
