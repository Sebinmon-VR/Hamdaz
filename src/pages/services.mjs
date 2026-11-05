import { site, services, defaultServiceCta, waLink } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, content, head, btn, pad2, svcImg, techStrip, contactSection } from '../components.mjs';

const hero = pageHero({ crumb: 'What We Do', eyebrow: 'Services', title: 'What We Do', text: site.description, scene: 'blocks' });

const list = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Services', meta: `${services.length} services`, title: 'Our managed services', text: 'Select a service to see everything it includes.' })}
    <ol class="index index--full" data-preview>${services
      .map(
        (s, i) => `
      <li class="svc-row" id="${s.slug}" data-img="${svcImg(s)}">
        <button class="ix" type="button" data-svc-open aria-haspopup="dialog" data-img="${svcImg(s)}"><span class="ix-num">${pad2(i + 1)}</span><span class="ix-title">${s.title}</span><span class="ix-text">${s.summary}</span><span class="ix-go" aria-hidden="true">${icon('arrow-up-right')}</span></button>
        <div class="svc-detail" hidden>
          <p class="modal-intro">${s.intro}</p>
          <ol class="modal-list">${s.items.map(([t, d], k) => `<li><span class="ml-num">${pad2(k + 1)}</span><div><strong>${t}</strong><p>${d}</p></div></li>`).join('')}</ol>
          <p class="modal-cta">${s.cta || defaultServiceCta}</p>
        </div>
      </li>`,
      )
      .join('')}
    </ol>
  </div>
</section>`;

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
  scene: true,
  title: 'Services',
  description:
    'Hamdaz managed services: Generative AI, Data Analytics, Business Process Automation, Data Center, Cloud Services & Migration, Azure, AWS, GCP, OCI, Information Security and more.',
  body: [hero, content(list, techStrip(), contactSection({ idx: '02' })), modal].join('\n'),
};
