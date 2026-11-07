// One page per service at /service/<slug>/ (the old WordPress addresses): overview, what's included,
// how we deliver it, brands and sectors, FAQs, related services and contact.
import { site, services, categoryOf, serviceBySlug, svcUrl, areaUrl, waLink } from '../data.mjs';
import { pageHero, content, head, btn, tlink, tone, svcImg, svcCard, contactSection } from '../components.mjs';
import { serviceSeo, areaSeo, articles } from '../content/index.mjs';
import { ldScript, orgNode, breadcrumbNode, faqNode, crumbTrail, prose, numbered, chips, faqList, trustRow, ORG_ID } from '../blocks.mjs';

export default services.map((s) => {
  const seo = serviceSeo[s.slug];
  const cat = categoryOf[s.slug];
  const area = areaSeo[cat.id];
  const url = svcUrl(s.slug);
  const crumbs = [['What We Do', 'services.html'], [cat.title, areaUrl(cat.id)], [s.title, url]];
  const included = s.items.map(([t, d]) => [t === 'Latest Technologies' ? 'Latest technologies' : t, d]);
  const related = cat.services.filter((x) => x !== s.slug).map((x) => serviceBySlug[x]);
  const reading = articles.filter((a) => a.area === cat.id);
  const ask = encodeURIComponent(s.title);

  const hero = pageHero({ crumb: crumbTrail(crumbs.slice(0, -1).concat([[s.title]])), eyebrow: cat.title, title: seo.h1, text: seo.lead, hero: 'layers' });

  const overview = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Overview', meta: cat.title, title: s.title })}
    <div class="sp-ov">
      <div>
        ${prose(seo.overview)}
        <div class="sp-actions" data-reveal>
          ${btn('Talk to an expert', `contact.html?about=${ask}`, { magnetic: true })}
          ${btn('WhatsApp', waLink(`Hello Hamdaz, I would like to know more about ${s.title}.`), { variant: 'ghost', ic: 'whatsapp', ext: true })}
        </div>
      </div>
      <figure class="sp-media" data-reveal>${tone(svcImg(s), `${s.title} by Hamdaz Technologies, Abu Dhabi`)}</figure>
    </div>
    <ul class="sp-benefits">${seo.benefits.map(([t, d]) => `<li data-reveal><h3>${t}</h3><p>${d}</p></li>`).join('')}</ul>
  </div>
</section>`;

  const includes = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'What’s included', meta: `${included.length} areas`, title: 'What’s included' })}
    ${numbered(included)}
  </div>
</section>`;

  const deliver = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'How we deliver', meta: `${area.process.length} steps`, title: 'From first survey to long-term support', text: 'One accountable team across design, delivery and support, with engineers in Abu Dhabi and Kerala, India.' })}
    ${numbered(area.process, 'sp-steps')}
  </div>
</section>`;

  const brands = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '04', label: 'Technology & sectors', meta: 'Vendor-agnostic', title: 'The brands we deliver and the sectors we serve' })}
    <div class="sp-two">
      <div data-reveal><p class="sp-label">Technology partners and brands</p>${chips(area.brands)}</div>
      <div data-reveal><p class="sp-label">Sectors</p>${chips(area.industries)}</div>
    </div>
    ${trustRow}
  </div>
</section>`;

  const faqs = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '05', label: 'FAQs', meta: `${seo.faqs.length} questions`, title: `${s.title}: common questions`, action: tlink(`More on ${cat.title}`, areaUrl(cat.id)) })}
    ${faqList(seo.faqs)}
  </div>
</section>`;

  const more = `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '06', label: 'Related services', meta: cat.title, title: `More in ${cat.title}`, action: btn(`All ${cat.title} services`, areaUrl(cat.id), { variant: 'ghost' }) })}
    <ol class="svc-grid">${related.slice(0, 3).map((r) => `<li>${svcCard(r, services.indexOf(r))}</li>`).join('')}</ol>
    ${reading.length ? `<p class="sp-read">${reading.map((a) => `<a href="insights/${a.slug}/"><span class="mono">Insight</span>${a.title}</a>`).join('')}</p>` : ''}
  </div>
</section>`;

  const jsonld = ldScript(
    {
      '@type': 'Service',
      '@id': `${site.url}/${url}#service`,
      name: s.title,
      serviceType: s.title,
      description: seo.seoDescription,
      url: `${site.url}/${url}`,
      image: `${site.url}/assets/img/svc/${s.slug}.jpg`,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
      category: cat.title,
      hasOfferCatalog: { '@type': 'OfferCatalog', name: `${s.title}: what’s included`, itemListElement: included.map(([t, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: t, description: d } })) },
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
    image: `${site.url}/assets/img/svc/${s.slug}.jpg`,
    jsonld,
    body: [hero, content(overview, includes, deliver, brands, faqs, more, contactSection({ idx: '07' }))].join('\n'),
  };
});
