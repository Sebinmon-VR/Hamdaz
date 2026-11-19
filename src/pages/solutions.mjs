// How We Do (solutions.html): how Hamdaz works. The five-step method used on every project (a timeline), the four ways to work
// with us, what clients can count on (certifications, MCC, ICV, vendor-agnostic supply, one team), then the AI
// products for each industry and custom ChatGPT. The pictures are live (assets/js/svc-live.js and assets/js/live/);
// the photos stay as the fallback without WebGL.
import { products, industries } from '../data.mjs';
import { pageHero, content, head, btn, tlink, tone, pad2, productImg, gptSection, contactSection } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode, numbered } from '../blocks.mjs';
import { icon } from '../icons.mjs';

const firstSentence = (t) => t.split(/(?<=[.!])\s+/)[0];
const live = (kind) => ` data-live="${kind}"`;

const hero = pageHero({
  crumb: 'How We Do',
  eyebrow: 'Our approach',
  title: 'How We Do',
  text: 'One accountable team from the first site survey to long-term support. We design, supply, install and run technology across AI, cloud, cybersecurity, ELV, audio visual and networks, certified to ISO 9001, 14001 and 45001.',
  hero: 'waves',
});

// 01 the method, as a timeline: five points on a line that fills with light as you scroll (main.js), each step's
// card under its point with a promise, what happens and what you get (chosen from docs/steps-options.html, option A)
const steps = [
  { ic: 'search', t: 'Survey and understand', promise: 'We understand before we propose.',
    text: 'We visit your site, or study your systems, data and workflows, and agree with you what the goal is and how success will be measured.',
    get: ['Site survey and needs analysis', 'Risk or gap assessment', 'A scope you agree'] },
  { ic: 'pen-tool', t: 'Design', promise: 'A plan you approve first.',
    text: 'Drawings or architecture, a BOQ and a priced proposal, agreed before anything is bought or built. For CCTV, we prepare the MCC design submission and NOC.',
    get: ['Design drawings or architecture', 'BOQ and proposal', 'Approvals, such as the MCC NOC'] },
  { ic: 'box', t: 'Supply and deliver', promise: 'Built by our engineers, in the open.',
    text: 'Brand-agnostic supply from leading OEMs and authorised distributors, then installation, configuration or development by our engineers, tested as we go.',
    get: ['Equipment from authorised channels', 'Installation or development to spec', 'Regular updates and demos'] },
  { ic: 'handshake', t: 'Hand over and train', promise: 'Tested, signed off, explained.',
    text: 'Testing and commissioning, your sign-off, the as-built documents, and training for the people who will use and run it.',
    get: ['Testing and commissioning', 'As-built documents', 'User and admin training'] },
  { ic: 'life-buoy', t: 'Support and improve', promise: 'Looked after once it is live.',
    text: 'Maintenance, monitoring and a service desk, with 24/7 managed SecOps where you need it, and regular reviews to keep improving.',
    get: ['Preventive maintenance', 'Monitoring and support to agreed SLAs', 'Regular service reviews'] },
];
const method = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Our method', meta: `${steps.length} steps`, title: 'Five steps, on every project', text: 'The same way of working for a CCTV upgrade, a cloud migration or a new ERP: agreed up front, delivered in the open and supported after go-live.' })}
    <ol class="tl" data-tl><span class="tl-track" aria-hidden="true"><span class="tl-fill"></span></span>${steps.map((s, i) => `
      <li class="tl-step">
        <span class="tl-dot" aria-hidden="true">${icon(s.ic)}<b>${pad2(i + 1)}</b></span>
        <div class="tl-card">
          <p class="tl-kick">Step ${pad2(i + 1)}</p>
          <h3 class="tl-title">${s.t}</h3>
          <p class="tl-promise">${s.promise}</p>
          <p class="tl-text">${s.text}</p>
          <ul class="tl-get">${s.get.map((g) => `<li>${icon('check')}<span>${g}</span></li>`).join('')}</ul>
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;

// 02 ways to work with us, each with a live picture
const ways = [
  ['server', 'Projects', 'Design and build', 'A defined scope delivered end to end: survey, design, supply, installation, commissioning and handover.', 'services.html', 'See what we do'],
  ['managed', 'Ongoing', 'Managed services', 'We run it for you against agreed SLAs: monitoring, a service desk, preventive maintenance and a 24/7 SOC and NOC.', 'service/managed-services/', 'Managed services'],
  ['staffing', 'On your site', 'Resident engineers', 'Skilled IT, AV and security engineers placed on your site, chosen for your systems and managed by us.', 'service/it-staffing-resident-engineers/', 'IT staffing'],
  ['genai', 'Ready to adapt', 'AI products', 'AI products for your industry, and custom ChatGPT assistants trained on your own data.', '#industries', 'See the products'],
];
const waysSec = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'Ways to work with us', meta: `${ways.length} models`, title: 'Four ways to work with us', text: 'Start with one project, hand us the day-to-day running, add engineers to your team, or adopt an AI product. Many clients combine them.' })}
    <ul class="ways">${ways.map(([kind, kick, t, d, href, cta]) => `
      <li><a class="way" href="${href}" data-reveal>
        ${tone(productImgFor(kind), '', 1000, 750, live(kind))}
        <span class="way-body"><span class="way-kick">${kick}</span><span class="way-title">${t}</span><span class="way-text">${d}</span><span class="way-go">${cta}</span></span>
      </a></li>`).join('')}
    </ul>
  </div>
</section>`;
// the photo shown without WebGL: the matching service photo
function productImgFor(kind) {
  const slug = { server: 'data-center-infrastructure-services', managed: 'managed-services', staffing: 'it-staffing-resident-engineers', genai: 'generative-ai' }[kind];
  return `assets/img/svc/${slug}.webp`;
}

// 03 what you can count on
const assurances = [
  ['Certified management systems', 'ISO 9001 for quality, ISO 14001 for the environment and ISO 45001 for health and safety, audited by Bureau Veritas. <a href="quality.html">See our certificates</a>'],
  ['MCC certified', 'Approved to design and install CCTV to the requirements of the Abu Dhabi Monitoring &amp; Control Centre.'],
  ['ICV certified, ADNOC registered', 'An ICV certified company and a registered ADNOC supplier.'],
  ['Vendor-agnostic', 'We recommend what fits your needs and budget, sourced from leading OEMs and authorised distributors. <a href="partners.html">See our partners</a>'],
  ['One accountable team', 'One point of contact across design, delivery and support, with teams in Abu Dhabi and India.'],
];
const assure = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '03', label: 'What you can count on', meta: 'Certified · Approved', title: 'What you can count on' })}
    ${numbered(assurances)}
  </div>
</section>`;

// 04 AI products for each industry (live pictures, the product photos as fallback)
const industryLive = { 'oil-and-gas-industry': 'oilgas', 'small-and-medium-enterprises-smes': 'sme', 'schools-and-educational-institutions': 'school', 'online-education': 'onlineedu', sports: 'sports' };
const list = `<section class="sec" id="industries">
  <div class="wrap">
    ${head({ idx: '04', label: 'AI products', meta: `${industries.length} industries`, title: 'AI products for every industry', text: 'Ready-made AI products we adapt to your sector, from predictive maintenance in oil and gas to performance analysis in sport.', action: btn('Talk to us', 'contact.html', { magnetic: true }) })}
    <div class="feats">${industries
      .map(
        (p, i) => `
      <article class="feat${i % 2 ? ' feat--flip' : ''}" id="${p.slug}">
        <div class="feat-media" data-reveal>${tone(productImg(p), '', 1000, 667, industryLive[p.slug] ? live(industryLive[p.slug]) : '')}</div>
        <div class="feat-copy">
          <p class="feat-num">${pad2(i + 1)} / ${pad2(industries.length)}</p>
          <h2 class="feat-title" data-split>${p.title}</h2>
          <p class="feat-text" data-reveal>${firstSentence(p.desc)}</p>
          <div data-reveal>${tlink('Contact Now', `contact.html?about=${encodeURIComponent(p.title)}`)}</div>
        </div>
      </article>`,
      )
      .join('')}
    </div>
  </div>
</section>`;

export default {
  file: 'solutions.html',
  path: 'solutions.html',
  active: 'solutions',
  earth: true,
  modules: ['assets/js/svc-live.js'],
  fullTitle: 'How We Work: Our Method, AI Products & Custom ChatGPT | Hamdaz',
  jsonld: ldScript(orgNode(), breadcrumbNode([['How We Do', 'solutions.html']])),
  description: 'How Hamdaz works: five steps from survey to support, four ways to work with us, ISO 9001, 14001 and 45001 certified, AI products and custom ChatGPT.',
  body: [hero, content(method, waysSec, assure, list, gptSection({ idx: '05', full: true }), contactSection({ idx: '06' }))].join('\n'),
};
