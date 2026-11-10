// Certifications (certifications.html): the ISO certificates (previews that open the PDFs), the ADNOC In-Country
// Value lockup and MCC. The certificate list is isoCerts in data.mjs. Linked from the footer, the Quality & QHSE
// page and the home page's certificates row.
import { isoCerts, isoValidTo, isoScope } from '../data.mjs';
import { pageHero, content, head, btn, contactSection, certCard, icvLockup } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode } from '../blocks.mjs';

const isoSec = `<section class="sec" id="iso">
  <div class="wrap">
    ${head({ idx: '01', label: 'ISO certificates', meta: 'Bureau Veritas · UKAS', title: 'Three management systems, certified independently', text: `Audited by Bureau Veritas, accredited by UKAS. All three certificates were issued on 02 January 2026 and are valid to ${isoValidTo}.` })}
    <div class="cert-grid">
      ${isoCerts.map((c) => certCard(c, { meta: `Certificate ${c.no} · Valid to ${isoValidTo}` })).join('\n      ')}
    </div>
    <div class="cert-scope" data-reveal><p class="cert-scope-label">Scope of certification</p><p>${isoScope}</p></div>
  </div>
</section>`;

const icvSec = `<section class="sec" id="icv">
  <div class="wrap">
    ${head({ idx: '02', label: 'In-Country Value', meta: 'ADNOC ICV Program', title: 'Part of the ADNOC In&#8209;Country Value Program' })}
    <div class="cert-icv">
      <div data-reveal>${icvLockup}</div>
      <div class="cert-icv-copy" data-reveal>
        <p>Hamdaz is ICV certified under the ADNOC In-Country Value Program and is a registered ADNOC supplier, so organisations that score suppliers on In-Country Value can count our work towards it.</p>
        <p>We are also certified by the Abu Dhabi Monitoring &amp; Control Centre (MCC) to deliver security and monitoring systems to its standards.</p>
        <ul class="sp-trust" aria-label="Credentials"><li>ICV certified</li><li>Registered ADNOC supplier</li><li>MCC certified · Abu Dhabi</li></ul>
      </div>
    </div>
  </div>
</section>`;

const qhseSec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'Quality &amp; QHSE', title: 'How these standards shape our work', text: 'Our QHSE policy, our management systems and what they mean on every site we work on.', action: btn('Quality &amp; QHSE', 'quality.html', { magnetic: true }) })}
  </div>
</section>`;

export default {
  file: 'certifications.html',
  path: 'certifications.html',
  active: 'quality',
  earth: true,
  fullTitle: 'Certifications | ISO 9001, 14001, 45001 & ADNOC ICV | Hamdaz',
  description: 'Hamdaz Technologies certificates: ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by Bureau Veritas (UKAS), ADNOC In-Country Value (ICV) and Abu Dhabi MCC certification.',
  jsonld: ldScript(orgNode(), breadcrumbNode([['Certifications', 'certifications.html']])),
  body: [
    pageHero({ crumb: 'Certifications', eyebrow: 'Certifications', title: 'Certifications', text: 'Independently audited management systems for quality, health and safety, and the environment, and ADNOC In-Country Value.', hero: 'layers' }),
    content(isoSec, icvSec, qhseSec, contactSection({ idx: '04' })),
  ].join('\n'),
};
