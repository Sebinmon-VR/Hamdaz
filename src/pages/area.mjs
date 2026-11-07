// One page per service area at /services/<area>/: what the area covers, its services, how we deliver,
// brands and sectors, selected projects (where there are some), FAQs and contact.
import { site, services, categories, serviceBySlug, svcUrl, areaUrl } from '../data.mjs';
import { pageHero, content, head, btn, svcCard, contactSection } from '../components.mjs';
import { areaSeo, articles } from '../content/index.mjs';
import { projects } from '../content/projects.mjs';
import { ldScript, orgNode, breadcrumbNode, faqNode, crumbTrail, prose, numbered, chips, faqList, trustRow, ORG_ID } from '../blocks.mjs';

export default categories.map((c) => {
  const seo = areaSeo[c.id];
  const url = areaUrl(c.id);
  const list = c.services.map((slug) => serviceBySlug[slug]);
  const work = projects.filter((p) => p.areas.includes(c.id));
  const reading = articles.filter((a) => a.area === c.id);
  const crumbs = [['What We Do', 'services.html'], [c.title, url]];
  let n = 1;
  const idx = () => String(n++).padStart(2, '0');

  const hero = pageHero({ crumb: crumbTrail([crumbs[0], [c.title]]), eyebrow: `${list.length} services`, title: seo.h1, text: seo.lead, hero: 'layers' });

  const about = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: c.title, meta: `${list.length} services`, title: c.text })}
    <div class="sp-ov sp-ov--text">${prose(seo.intro)}<div class="sp-aside" data-reveal>${trustRow}${btn('Talk to an expert', `contact.html?about=${encodeURIComponent(c.title)}`, { magnetic: true })}</div></div>
  </div>
</section>`;

  const grid = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: 'Services', meta: c.title, title: `Our ${c.title} services` })}
    <ol class="svc-grid">${list.map((s) => `<li>${svcCard(s, services.indexOf(s))}</li>`).join('')}</ol>
  </div>
</section>`;

  const deliver = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: 'How we deliver', meta: `${seo.process.length} steps`, title: 'How a project runs' })}
    ${numbered(seo.process, 'sp-steps')}
  </div>
</section>`;

  const brands = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: 'Technology & sectors', meta: 'Vendor-agnostic', title: 'The brands we deliver and the sectors we serve' })}
    <div class="sp-two">
      <div data-reveal><p class="sp-label">Technology partners and brands</p>${chips(seo.brands)}</div>
      <div data-reveal><p class="sp-label">Sectors</p>${chips(seo.industries)}</div>
    </div>
  </div>
</section>`;

  const projectsSec = work.length ? `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: 'Selected projects', meta: `${work.length} projects`, title: 'Recent work in the UAE', action: btn('All clients & projects', 'projects.html', { variant: 'ghost' }) })}
    <ul class="pj-list">${work.map((p) => `<li data-reveal><p class="pj-client">${p.client}</p><p class="pj-scope">${p.scope.join(' · ')}</p><p class="pj-where mono">${p.location}</p></li>`).join('')}</ul>
  </div>
</section>` : '';

  const faqs = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: idx(), label: 'FAQs', meta: `${seo.faqs.length} questions`, title: `${c.title}: common questions` })}
    ${faqList(seo.faqs)}
    ${reading.length ? `<p class="sp-read">${reading.map((a) => `<a href="insights/${a.slug}/"><span class="mono">Insight</span>${a.title}</a>`).join('')}</p>` : ''}
  </div>
</section>`;

  const jsonld = ldScript(
    {
      '@type': 'CollectionPage',
      '@id': `${site.url}/${url}#page`,
      name: seo.h1,
      description: seo.seoDescription,
      url: `${site.url}/${url}`,
      about: { '@id': ORG_ID },
      mainEntity: { '@type': 'ItemList', itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: `${site.url}/${svcUrl(s.slug)}` })) },
    },
    orgNode(),
    breadcrumbNode(crumbs),
    faqNode(seo.faqs),
  );

  return {
    file: `${url}index.html`,
    path: url,
    active: 'services',
    earth: true,
    bodyClass: 'page-detail',
    fullTitle: `${seo.seoTitle} | Hamdaz`,
    description: seo.seoDescription,
    image: `${site.url}/assets/img/svc/${list[0].slug}.jpg`,
    jsonld,
    body: [hero, content(about, grid, deliver, brands, projectsSec, faqs, contactSection({ idx: idx() }))].join('\n'),
  };
});
