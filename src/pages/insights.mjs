// Insights: practical guides for buyers in the UAE (insights.html) and one page per article
// (insights/<slug>/). Articles are written in src/content/*.mjs (`articles`).
import { site, categories, areaUrl, svcUrl } from '../data.mjs';
import { icon } from '../icons.mjs';
import { shortName } from '../layout.mjs';
import { pageHero, content, head, btn, contactSection } from '../components.mjs';
import { articles } from '../content/index.mjs';
import { ldScript, orgNode, breadcrumbNode, crumbTrail, chips, ORG_ID } from '../blocks.mjs';

const areaOf = Object.fromEntries(categories.map((c) => [c.id, c]));
const fmt = (d) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const words = (a) => a.sections.reduce((n, s) => n + [...s.paras, ...(s.list || [])].join(' ').split(/\s+/).length, 0);
const minutes = (a) => Math.max(1, Math.round(words(a) / 220));
const artUrl = (a) => `insights/${a.slug}/`;

const card = (a) => `<li data-reveal><a class="ins-card" href="${artUrl(a)}">
        <span class="ins-meta mono">${areaOf[a.area].title} · ${minutes(a)} min read</span>
        <span class="ins-title">${a.title}</span>
        <span class="ins-text">${a.summary}</span>
        <span class="ins-go">Read the guide ${icon('arrow-right')}</span>
      </a></li>`;

const index = {
  file: 'insights.html',
  path: 'insights.html',
  active: '',
  earth: true,
  fullTitle: 'Insights: IT, Security & AV Guides for the UAE | Hamdaz',
  description: 'Practical guides from Hamdaz engineers for organisations in Abu Dhabi and the UAE: MCC-approved CCTV, ransomware resilience, video conferencing rooms and more.',
  jsonld: ldScript(orgNode(), breadcrumbNode([['Insights', 'insights.html']])),
  body: [
    pageHero({ crumb: 'Insights', eyebrow: 'Insights', title: 'Guides for buyers in the UAE', text: 'Practical, vendor-neutral notes from our engineers on security systems, cybersecurity and workplace technology.', hero: 'layers' }),
    content(`<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Insights', meta: `${articles.length} guides`, title: 'Latest guides' })}
    <ul class="ins-grid">${articles.map(card).join('')}</ul>
  </div>
</section>`, contactSection({ idx: '02' })),
  ].join('\n'),
};

const pages = articles.map((a) => {
  const area = areaOf[a.area];
  const url = artUrl(a);
  const crumbs = [['Insights', 'insights.html'], [a.title, url]];
  const others = articles.filter((x) => x !== a);
  const body = `<section class="sec sp-sec art-sec">
  <div class="wrap art">
    <aside class="art-side">
      <p class="mono">${fmt(a.date)} · ${minutes(a)} min read</p>
      <p class="art-by">By the ${area.title} team at ${site.name}</p>
      <nav aria-label="In this guide"><p class="sp-label">In this guide</p><ol>${a.sections.map((s, i) => `<li><a href="#s${i + 1}">${s.h2}</a></li>`).join('')}</ol></nav>
    </aside>
    <article class="art-body">
      <p class="art-lead">${a.summary}</p>
      ${a.sections.map((s, i) => `<h2 id="s${i + 1}">${s.h2}</h2>
      ${s.paras.map((p) => `<p>${p}</p>`).join('\n      ')}
      ${s.list && s.list.length ? `<ul>${s.list.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}`).join('\n      ')}
      <div class="art-cta">
        <p>Talk to our ${area.title} team about your project.</p>
        ${btn('Contact Hamdaz', `contact.html?about=${encodeURIComponent(area.title)}`, { magnetic: true })}
        ${btn(`${area.title} services`, areaUrl(area.id), { variant: 'ghost', ic: 'arrow-right' })}
      </div>
      <p class="sp-label">Related services</p>
      ${chips(area.services.map((slug) => `<a href="${svcUrl(slug)}">${shortName(slug)}</a>`))}
    </article>
  </div>
</section>`;
  const more = others.length ? `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'More insights', meta: `${others.length} guides`, title: 'Keep reading' })}
    <ul class="ins-grid">${others.map(card).join('')}</ul>
  </div>
</section>` : '';
  return {
    file: `${url}index.html`,
    path: url,
    active: '',
    earth: true,
    ogType: 'article',
    bodyClass: 'page-detail page-article',
    date: a.date,
    fullTitle: `${a.seoTitle} | Hamdaz`,
    description: a.seoDescription,
    jsonld: ldScript(
      {
        '@type': 'Article',
        '@id': `${site.url}/${url}#article`,
        headline: a.title,
        description: a.seoDescription,
        datePublished: a.date,
        dateModified: a.date,
        inLanguage: 'en',
        mainEntityOfPage: `${site.url}/${url}`,
        image: `${site.url}/assets/img/og.png`,
        author: { '@id': ORG_ID },
        publisher: { '@id': ORG_ID },
        about: area.title,
      },
      orgNode(),
      breadcrumbNode(crumbs),
    ),
    body: [pageHero({ crumb: crumbTrail([crumbs[0], [a.title]]), eyebrow: area.title, title: a.title, text: '', hero: 'layers' }), content(body, more, contactSection({ idx: '03' }))].join('\n'),
  };
});

export default [index, ...pages];
