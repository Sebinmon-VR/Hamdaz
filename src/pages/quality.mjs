// Quality & QHSE (quality.html): the QHSE policy, the three certified ISO management systems and how QHSE shows up
// on site, each standard with its certificate (all certifications, with ADNOC ICV, are on certifications.html). Linked from the top bar, the footer and every
// "ISO 9001 · 14001 · 45001" credentials line (certLine in components.mjs, trustRow in blocks.mjs).
import { isoCerts, isoValidTo } from '../data.mjs';
import { pageHero, content, head, tlink, contactSection } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode } from '../blocks.mjs';
import { icon } from '../icons.mjs';

// the company's QHSE policy commitment
const policy = 'We commit to deliver work that meets our clients’ requirements, to send every person home safe, and to reduce our impact on the environment. We set objectives, measure them and keep improving.';

// what each certified management system covers (in the order of isoCerts in data.mjs)
const covers = {
  '9001': 'Documented processes from survey and design through installation, testing, handover and support.',
  '45001': 'Hazards identified and controlled for our teams and for everyone on the sites where we work.',
  '14001': 'Materials, packaging, e-waste and energy managed across our projects and offices.',
};

// how QHSE shows up in day-to-day site work
const practices = [
  'Risk assessment and method statement before work starts',
  'Permit-to-work and site induction on client premises',
  'Daily toolbox talks and the right PPE for each task',
  'Inspection and test plans with recorded sign-off',
  'Incident and near-miss reporting, with follow-up actions',
  'Segregated packaging and e-waste disposal',
];

const policySec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Our policy', meta: 'Quality · Health · Safety · Environment', title: 'One commitment, on every project' })}
    <p class="qh-policy" data-reveal>${policy}</p>
  </div>
</section>`;

const systemsSec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'Certified management systems', meta: 'Bureau Veritas · UKAS', title: 'Three standards, audited independently', text: 'Our quality, health and safety, and environmental management systems are certified by Bureau Veritas, accredited by UKAS.', action: tlink('All certifications', 'certifications.html') })}
    <ul class="qh-ledger">${isoCerts
      .map(
        (c) => `
      <li class="qh-row" data-reveal>
        <p class="qh-num">${c.num}<span>${c.std}</span></p>
        <div class="qh-copy"><h3>${c.name}</h3><p>${covers[c.num]}</p></div>
        <a class="qh-cert" href="assets/docs/hamdaz-${c.file}-certificate.pdf" target="_blank" rel="noopener" aria-label="${c.std} certificate (PDF)"><img src="assets/img/certs/${c.file}.webp" alt="" width="800" height="1131" loading="lazy" decoding="async"><span class="qh-meta">Certificate ${c.no}<br>Valid to ${isoValidTo}</span><span class="qh-go">View PDF${icon('arrow-up-right')}</span></a>
      </li>`,
      )
      .join('')}
    </ul>
  </div>
</section>`;

const siteSec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'On every site', meta: `${practices.length} practices`, title: 'How QHSE shows up in the work' })}
    <ol class="qh-list">${practices.map((p, i) => `<li data-reveal><span>${String(i + 1).padStart(2, '0')}</span>${p}</li>`).join('')}</ol>
  </div>
</section>`;

export default {
  file: 'quality.html',
  path: 'quality.html',
  active: 'quality',
  earth: true,
  fullTitle: 'Quality & QHSE | ISO 9001, 14001 & 45001 Certified | Hamdaz',
  description: 'Hamdaz Technologies is ISO 9001, ISO 14001 and ISO 45001 certified by Bureau Veritas (UKAS): our QHSE policy and how quality, health, safety and the environment are managed on every project.',
  jsonld: ldScript(orgNode(), breadcrumbNode([['Quality & QHSE', 'quality.html']])),
  body: [
    pageHero({ crumb: 'Quality &amp; QHSE', eyebrow: 'QHSE', title: 'Quality &amp; QHSE', text: 'Certified management systems for quality, occupational health and safety, and the environment, applied to every project we deliver across the UAE.', hero: 'layers' }),
    content(policySec, systemsSec, siteSec, contactSection({ idx: '04' })),
  ].join('\n'),
};
