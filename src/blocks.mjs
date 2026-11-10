// Sections and structured data shared by the service, area, project and insight pages.
import { site, contact } from './data.mjs';
import { icon } from './icons.mjs';
import { head, pad2 } from './components.mjs';

const [uae, india] = contact.offices;
// the main number for search listings (+971 2 626 5780, as in the 2026 company profiles)
export const MAIN_PHONE = uae.phones[uae.phones.length - 1].tel;
export const ORG_ID = `${site.url}/#organization`;
const abs = (path) => `${site.url}/${path}`;

/* ---------- Structured data (schema.org JSON-LD) ---------- */
export const ldScript = (...nodes) =>
  `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes.flat().filter(Boolean) }).replace(/</g, '\\u003c')}</script>\n`;

// the UAE has no postal codes: the Abu Dhabi office gives its PO Box instead
const postal = (o) => ({ '@type': 'PostalAddress', streetAddress: o.postal.street, addressLocality: o.postal.locality, addressRegion: o.postal.region, ...(o.postal.code ? { postalCode: o.postal.code } : {}), ...(o.postal.pobox ? { postOfficeBoxNumber: o.postal.pobox } : {}), addressCountry: o.postal.country });

// the company, with both offices; referenced by every other node through its @id
export const orgNode = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: site.name,
  legalName: uae.entity,
  alternateName: 'Hamdaz',
  url: `${site.url}/`,
  logo: abs('assets/img/logo.png'),
  email: contact.email,
  telephone: MAIN_PHONE,
  sameAs: [contact.linkedin],
  description: 'Abu Dhabi system integrator for AI, cloud, cybersecurity, MCC-certified CCTV and ELV, audio visual, networking and software development.',
  address: postal(uae),
  hasCredential: ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'Abu Dhabi Monitoring & Control Centre (MCC) certified', 'ICV certified'].map((name) => ({ '@type': 'EducationalOccupationalCredential', name })),
  subOrganization: { '@id': `${site.url}/#kerala` },
  contactPoint: contact.offices.flatMap((o) => o.phones.map((p) => ({ '@type': 'ContactPoint', telephone: p.tel, contactType: 'sales', areaServed: o.postal.country }))),
});

// the two offices as local businesses (search and maps listings)
export const officeNodes = () => [
  {
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#abudhabi`,
    name: `${site.name} – Abu Dhabi`,
    parentOrganization: { '@id': ORG_ID },
    url: `${site.url}/`,
    image: abs('assets/img/og.png'),
    logo: abs('assets/img/logo.png'),
    telephone: MAIN_PHONE,
    email: contact.email,
    address: postal(uae),
    geo: { '@type': 'GeoCoordinates', latitude: uae.lat, longitude: uae.lon },
    hasMap: uae.map,
    areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
  },
  {
    '@type': 'ProfessionalService',
    '@id': `${site.url}/#kerala`,
    name: 'Hamdaz Technologies LLP – Kozhikode, Kerala',
    legalName: india.entity,
    parentOrganization: { '@id': ORG_ID },
    url: `${site.url}/`,
    image: abs('assets/img/og.png'),
    telephone: india.phones[0].tel,
    email: contact.email,
    address: postal(india),
    hasMap: india.map,
  },
];

export const websiteNode = () => ({ '@type': 'WebSite', '@id': `${site.url}/#website`, url: `${site.url}/`, name: site.name, publisher: { '@id': ORG_ID }, inLanguage: 'en' });

// crumbs: [[name, path], ...] from the root; the last one is the page itself
export const breadcrumbNode = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', ''], ...crumbs].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

export const faqNode = (faqs) => faqs.length && ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});

// the visible breadcrumb trail inside the page hero (pageHero adds "Home /" in front)
export const crumbTrail = (crumbs) =>
  crumbs.map(([name, path], i) => (i === crumbs.length - 1 ? `<span aria-current="page">${name}</span>` : `<a href="${path}">${name}</a>`)).join(' <span aria-hidden="true">/</span> ');

/* ---------- Page sections ---------- */
export const prose = (paras) => `<div class="sp-prose">${paras.map((p) => `<p>${p}</p>`).join('')}</div>`;

// numbered items with a title and a line: what a service includes, or how a project runs
export const numbered = (items, cls = 'sp-list') =>
  `<ol class="${cls}">${items.map(([t, d], i) => `<li data-reveal><span class="sp-num">${pad2(i + 1)}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}</ol>`;

export const chips = (list) => `<ul class="sp-chips">${list.map((n) => `<li>${n}</li>`).join('')}</ul>`;

// questions and answers as disclosures (the same text goes into the FAQPage data)
export const faqList = (faqs) =>
  `<div class="faq">${faqs.map(([q, a], i) => `<details${i === 0 ? ' open' : ''} data-reveal><summary><span class="faq-q">${q}</span><span class="faq-plus" aria-hidden="true"></span></summary><p>${a}</p></details>`).join('')}</div>`;

export function faqSection({ idx, faqs, title = 'Questions we often hear', meta = '' }) {
  return `<section class="sec sp-sec">
  <div class="wrap">
    ${head({ idx, label: 'FAQs', meta: meta || `${faqs.length} questions`, title })}
    ${faqList(faqs)}
  </div>
</section>`;
}

// the certifications line under a page's call to action
export const trustRow = `<ul class="sp-trust" aria-label="Credentials"><li>${icon('shield-check')}MCC certified · Abu Dhabi</li><li><a href="quality.html">${icon('award')}ISO 9001 · 14001 · 45001</a></li><li>${icon('check')}ICV certified · ADNOC registered supplier</li></ul>`;
