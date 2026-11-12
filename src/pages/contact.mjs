import { contact, categories, enquiry, waLink } from '../data.mjs';
import { icon } from '../icons.mjs';
import { clock } from '../layout.mjs';
import { pageHero, content, head, btn, tlink, officeLabel } from '../components.mjs';
import { ldScript, orgNode, officeNodes, breadcrumbNode } from '../blocks.mjs';

const hero = pageHero({ crumb: 'Contact Us', eyebrow: 'Contact Us', title: 'Connect with HAMDAZ', text: 'Where Passion Meets Technology, and Your Success is Our Mission!', hero: 'globe' });

const offices = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Offices', meta: 'UAE · India', title: 'Where passion meets technology', text: 'Your success is our mission.' })}
    <div class="offices">${contact.offices
      .map(
        (o) => `
      <article class="office" data-reveal>
        <p class="office-bar"><span>${officeLabel(o)}</span><span class="office-time">${icon('clock')}${clock(o)}</span></p>
        <h3 class="office-city">${o.city}</h3>
        <p class="office-entity">${o.entity}</p>
        <address>${o.lines.join('<br>')}</address>
        <ul class="office-links">
          ${o.phones.map((p) => `<li><a href="tel:${p.tel}"><span>${icon('phone')}${p.label}</span>${icon('arrow-up-right')}</a></li>`).join('')}
          <li><a href="mailto:${contact.email}"><span>${icon('mail')}${contact.email}</span>${icon('arrow-up-right')}</a></li>
          <li><a href="${o.map}" target="_blank" rel="noopener"><span>${icon('map-pin')}Get directions</span>${icon('arrow-up-right')}</a></li>
        </ul>
      </article>`,
      )
      .join('')}
    </div>
  </div>
</section>`;

// one per service area, so every service the ads bring people for has a box to tick
const topics = [...categories.map((c) => c.short), 'AI Products', 'Other'];
const direct = [
  ['WhatsApp', contact.whatsappDisplay, waLink('Hello Hamdaz, I would like to discuss a project.'), true],
  ['Email', contact.email, `mailto:${contact.email}`],
  ['UAE', contact.offices[0].phones[0].label, `tel:${contact.offices[0].phones[0].tel}`],
  ['India', contact.offices[1].phones[0].label, `tel:${contact.offices[1].phones[0].tel}`],
];

const form = `<section class="sec form-sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'Get in touch', title: 'How can we help your business?' })}
    <div class="form-grid">
      <div class="form-side" data-reveal>
        <p class="form-intro">Send us a message, or reach us directly.</p>
        <ul class="direct">${direct
          .map(([k, v, href, ext]) => `<li><a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}><small>${k}</small><strong>${v}</strong><span class="ix-go" aria-hidden="true">${icon('arrow-up-right')}</span></a></li>`)
          .join('')}</ul>
      </div>
      <div class="form-main" data-reveal>
      <form class="form" data-form data-api="${enquiry.url}" data-wa="${contact.whatsapp}" data-email="${contact.email}" novalidate>
        <div class="field"><label for="f-name">Your name *</label><input id="f-name" name="name" autocomplete="name" required></div>
        <div class="field"><label for="f-company">Company</label><input id="f-company" name="company" autocomplete="organization"></div>
        <div class="field"><label for="f-email">Email</label><input id="f-email" name="email" type="email" autocomplete="email" aria-describedby="f-reach"></div>
        <div class="field"><label for="f-phone">Phone / WhatsApp</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" aria-describedby="f-reach"></div>
        <p class="hint full" id="f-reach">Email or phone, so we can reply</p>
        <fieldset class="full topics-set">
          <legend>I'm interested in</legend>
          <div class="topics">${topics.map((t) => `<label class="topic"><input type="checkbox" name="topics" value="${t}"><span>${t}</span></label>`).join('')}</div>
        </fieldset>
        <div class="field full"><label for="f-msg">Message *</label><textarea id="f-msg" name="message" rows="4" required placeholder="Tell us about your project"></textarea></div>
        <div class="hp" aria-hidden="true"><label for="f-website">Leave this empty</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
        <div class="form-actions full">
          ${btn('Send message', '', { tag: 'button', ic: 'send', attrs: 'type="submit" name="via" value="send" data-send' })}
          ${btn('Send on WhatsApp', '', { tag: 'button', variant: 'ghost', ic: 'whatsapp', attrs: 'type="submit" name="via" value="whatsapp"' })}
        </div>
        <p class="hint full">Your message goes straight to our team. We use your details only to reply; see our <a href="privacy.html">privacy policy</a>.</p>
        <p class="status full" role="status" aria-live="polite" data-status></p>
        <noscript><p class="status full">This form needs JavaScript. You can also email <a href="mailto:${contact.email}">${contact.email}</a> or message us on <a href="${waLink()}">WhatsApp</a>.</p></noscript>
      </form>
      <div class="apply-done form-done" data-form-done tabindex="-1" hidden>
        <span class="apply-done-mark" aria-hidden="true">${icon('check')}</span>
        <h3 class="apply-done-title">Message sent</h3>
        <p data-form-done-text></p>
        ${tlink('Explore our services', 'services.html')}
      </div>
      </div>
    </div>
  </div>
</section>`;

export default {
  file: 'contact.html',
  path: 'contact.html',
  active: 'contact',
  earth: true,
  fullTitle: 'Contact Hamdaz | IT & Security Company in Abu Dhabi',
  description: `Contact Hamdaz Technologies in Abu Dhabi (Millennium Tower, Hamdan Street) or Kozhikode, India. Call +971 2 626 5780 or email ${contact.email}.`,
  jsonld: ldScript(orgNode(), officeNodes(), breadcrumbNode([['Contact Us', 'contact.html']])),
  body: [hero, content(offices, form)].join('\n'),
};
