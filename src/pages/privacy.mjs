// Privacy policy (privacy.html): what the site and the contact and careers forms collect, why, who else sees it,
// cookies and Google Ads (with the visitor's consent), and how to ask for a copy or deletion. Linked from the footer,
// the contact form and the cookie banner (#cookies). Laid out like an Insights guide (.art in style.css).
// Have it read by whoever handles legal matters before it goes live, and update `updated` with every change.
import { site, contact, tracking } from '../data.mjs';
import { pageHero, content } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode } from '../blocks.mjs';

const updated = '11 November 2026';
const mail = `<a href="mailto:${contact.email}">${contact.email}</a>`;
const [uae, india] = contact.offices;
const addr = ({ postal: p }) => [p.street, p.pobox && `PO Box ${p.pobox}`, p.locality, p.code, p.country === 'AE' ? 'UAE' : 'India'].filter(Boolean).join(', ');

const sections = [
  ['who', 'Who we are', `
    <p>This website is run by ${site.name}: <strong>${uae.entity}</strong> (${addr(uae)}) and <strong>${india.entity}</strong> (${addr(india)}). In this policy, “we” and “us” mean both.</p>
    <p>For anything about your personal data, write to ${mail}.</p>`],
  ['collect', 'What we collect', `
    <ul>
      <li><strong>When you send the contact form:</strong> your name, company, email, phone number, the topics you tick and your message. Alongside it we keep the page you sent it from, the first page of your visit, the website that sent you here, and any campaign tags in that first page’s address (for example from a Google ad). That last part shows us which of our ads and pages lead to real enquiries.</li>
      <li><strong>When you apply for a job:</strong> the answers and files you send with the application form.</li>
      <li><strong>When you contact us directly</strong> by email, phone or WhatsApp: what you choose to send us.</li>
      <li><strong>When you browse:</strong> our servers keep standard logs (such as your IP address, browser and the pages requested) to keep the site running and secure. With your consent, Google’s tag also measures visits and ad clicks (see <a href="#cookies">Cookies and Google</a>).</li>
    </ul>
    <p>We don’t ask for, and ask you not to send, sensitive information such as health or financial details through the forms.</p>`],
  ['use', 'How we use it', `
    <ul>
      <li>To reply to you, prepare a proposal or quote, and deliver and support any work that follows.</li>
      <li>To consider your job application.</li>
      <li>To understand which of our pages and ads bring enquiries, so we spend our advertising sensibly.</li>
      <li>To keep the site and our systems secure, and to meet our legal and accounting obligations.</li>
    </ul>
    <p>We don’t sell your personal data, and we don’t add you to a mailing list unless you ask us to.</p>`],
  ['cookies', 'Cookies and Google', `
    <p>The site itself sets no cookies. It keeps a few small notes in your browser: the first page of your visit (sent with the contact form only if you use it) and whether you just moved between pages, both cleared when you close the tab, and your cookie choice, so we don’t ask again on every page.</p>
    <p>We advertise on Google and use Google’s tag (Google Ads${tracking.analytics ? ' and Google Analytics' : ''}) to see which ads and pages bring enquiries. It sets advertising and analytics cookies <strong>only if you choose “Accept”</strong> in the cookie banner. If you decline, or have not chosen yet, Google’s tag does not store or read those cookies. It may still send Google basic signals without cookies (for example, that a page was viewed or a form sent), which Google uses to estimate how our ads perform in aggregate.</p>
    <p>You can change your choice at any time with “Cookie settings” at the foot of every page, or clear the cookies in your browser. To learn how Google uses this data, see <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses information from sites that use its services</a>.</p>`],
  ['share', 'Who else sees it', `
    <ul>
      <li><strong>Our team</strong>: the colleagues who need it to reply to you or consider your application.</li>
      <li><strong>Microsoft</strong> hosts our internal system and our email. Messages and applications you send through this site are stored there.</li>
      <li><strong>Google</strong> receives the measurement data described above, and serves the site’s fonts (which shares your IP address with Google, as any web font does).</li>
      <li><strong>WhatsApp (Meta)</strong> handles your message if you choose to contact us on WhatsApp.</li>
      <li>Anyone the law requires us to share it with.</li>
    </ul>
    <p>These providers may store data outside the UAE and India. We use large providers with their own published security and privacy commitments.</p>`],
  ['keep', 'How long we keep it', `
    <p>We keep enquiries for as long as we need them to deal with your request and any work that follows, and for as long as our legal and accounting obligations require, then delete them. We keep job applications while the role is open and for a reasonable time afterwards in case another role suits you, unless you ask us to delete yours sooner.</p>`],
  ['rights', 'Your choices and rights', `
    <p>You can ask us for a copy of the personal data we hold about you, to correct it, or to delete it, and you can withdraw any consent you have given. Write to ${mail} and we will reply as soon as we can, within the time the law allows. You can also complain to the data protection authority where you live.</p>`],
  ['changes', 'Changes to this policy', `
    <p>If we change how we use personal data, we will update this page and the date below.</p>
    <p>Last updated: ${updated}.</p>`],
];

const body = `<section class="sec sp-sec art-sec">
  <div class="wrap art">
    <aside class="art-side">
      <p class="mono">Last updated ${updated}</p>
      <nav aria-label="On this page"><p class="sp-label">On this page</p><ol>${sections.map(([id, h]) => `<li><a href="#${id}">${h}</a></li>`).join('')}</ol></nav>
    </aside>
    <article class="art-body legal">
      <p class="art-lead">This policy explains what personal data this website collects, why, and what you can ask us to do with it.</p>
      ${sections.map(([id, h, html]) => `<h2 id="${id}">${h}</h2>${html}`).join('\n')}
    </article>
  </div>
</section>`;

export default {
  file: 'privacy.html',
  path: 'privacy.html',
  active: '',
  earth: true,
  fullTitle: 'Privacy Policy | Hamdaz Technologies',
  description: 'How Hamdaz Technologies uses the personal data sent through hamdaz.com: the contact and careers forms, cookies and Google Ads, who else sees it, and how to ask for a copy or deletion.',
  jsonld: ldScript(orgNode(), breadcrumbNode([['Privacy Policy', 'privacy.html']])),
  body: [pageHero({ crumb: 'Privacy Policy', eyebrow: 'Legal', title: 'Privacy Policy', text: 'What we collect through this website, why, and the choices you have.', hero: 'layers' }), content(body)].join('\n'),
};
