// Clients & projects: selected projects, the clients and partners rows, sectors and credentials.
import { site, clients, categories, areaUrl } from '../data.mjs';
import { pageHero, content, head, btn, clientsPartners, contactSection } from '../components.mjs';
import { projects } from '../content/projects.mjs';
import { ldScript, orgNode, breadcrumbNode, chips, trustRow } from '../blocks.mjs';

const areaName = Object.fromEntries(categories.map((c) => [c.id, c]));
const hero = pageHero({ crumb: 'Clients & Projects', eyebrow: 'Clients & projects', title: 'Trusted across the UAE', text: 'Government, energy, education and enterprise clients rely on Hamdaz for security systems, data centres, networks and IT.', hero: 'layers' });

const list = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Selected projects', meta: `${projects.length} projects`, title: 'Recent work', text: 'A selection of CCTV, access control, ANPR, data centre and structured cabling projects delivered by our teams.' })}
    <ul class="pj-list">${projects.map((p) => `<li data-reveal><p class="pj-client">${p.client}</p><p class="pj-scope">${p.scope.join(' · ')}</p>${p.location ? `<p class="pj-where mono">${p.location}</p>` : ''}<p class="pj-areas">${p.areas.map((a) => `<a href="${areaUrl(a)}">${areaName[a].title}</a>`).join('')}</p></li>`).join('')}</ul>
  </div>
</section>`;

const sectors = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'Sectors & credentials', meta: 'UAE', title: 'Built for regulated, high-uptime sites', action: btn('Talk to us about your project', 'contact.html', { magnetic: true }) })}
    ${chips(['Government & Defence', 'Oil, Gas & Energy', 'Education', 'Healthcare', 'Banks & Finance', 'Industrial & Warehousing', 'Hospitality & Leisure', 'Retail & Malls', 'Transportation', 'Residential Towers'])}
    ${trustRow}
  </div>
</section>`;

export default {
  file: 'projects.html',
  path: 'projects.html',
  active: 'clients',
  earth: true,
  fullTitle: 'Clients & Projects in Abu Dhabi and the UAE | Hamdaz',
  description: `Selected Hamdaz projects for ${clients.slice(0, 2).join(', ')} and more: MCC-certified CCTV, access control, ANPR, data centres and cabling in the UAE.`,
  jsonld: ldScript(orgNode(), breadcrumbNode([['Clients & Projects', 'projects.html']])),
  body: [hero, content(list, clientsPartners({ idx: '02' }), sectors, contactSection({ idx: '04' }))].join('\n'),
};
