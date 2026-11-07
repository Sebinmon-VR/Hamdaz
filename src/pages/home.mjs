import { site, contact, heroSlides, services, industries, svcUrl } from '../data.mjs';
import { ldScript, orgNode, officeNodes, websiteNode } from '../blocks.mjs';
import { icon } from '../icons.mjs';
import { earth, content, intro, servicesIndex, productsGrid, serviceFinder, techStrip, contactSection, clientsPartners } from '../components.mjs';

// The hero's artwork: 'glass' (frames of glass tech objects over dissolving photos, heroes/glass.js),
// 'scan' (the scan horizon, assets/js/scan.js) or 'chip' (the AI chip, heroes/chip.js).
// The previous design (the chip) is kept on the local branch backup/chip-hero-2026-11-07.
const HERO = 'glass';

const [first, ...rest] = heroSlides;

// The glass hero's frames after the headline: one service area each, with its details beside the object
// (heroes/glass.js FRAMES shows the matching object; stage.js fades each panel in as its frame arrives)
const FRAME_SERVICES = [
  ['AI', 'generative-ai'],
  ['Cloud', 'cloud-services-migration'],
  ['Data', 'data-analytics-predictive-services'],
  ['Infrastructure', 'data-center-infrastructure-services'],
  ['Security', 'managed-ai-secops'],
];
// where you are in the frames, and a way to jump to any of them (main.js heroFrames)
const frameRail = () => `<nav class="hero-rail" aria-label="Hero sections" data-intro>
      ${[['00', 'Intro'], ...FRAME_SERVICES.map(([area], i) => [String(i + 1).padStart(2, '0'), area])].map(([n, label], i) => `<button type="button" class="hero-rail-item${i === 0 ? ' is-on' : ''}" data-rail="${i}"${i === 0 ? ' aria-current="step"' : ''}><span class="mono">${n}</span><b>${label}</b><i aria-hidden="true"></i></button>`).join('\n')}
      <div class="hero-rail-ctrl">
        <button type="button" class="hero-rail-step hero-rail-step--prev" data-hero-step="-1" aria-label="Previous frame">${icon('arrow-right')}</button>
        <button type="button" class="hero-rail-play" data-hero-play aria-pressed="false" aria-label="Pause the hero"><i aria-hidden="true"></i></button>
        <button type="button" class="hero-rail-step" data-hero-step="1" aria-label="Next frame">${icon('arrow-right')}</button>
      </div>
    </nav>`;
const framePanels = () => `<div class="hero-frames">
      ${FRAME_SERVICES.map(([area, slug], i) => {
        const s = services.find((x) => x.slug === slug);
        return `<article class="hero-frame" data-frame-panel="${i + 1}" aria-hidden="true">
        <p class="mono hf-idx"><span>${String(i + 1).padStart(2, '0')}</span> / ${String(FRAME_SERVICES.length).padStart(2, '0')} · ${area}</p>
        <h2 class="hf-title">${s.title.replace("/", "/<wbr>")}</h2>
        <p class="hf-text">${s.summary}</p>
        <ul class="hf-tags" aria-label="Includes">${s.items.filter(([t]) => t !== 'Latest Technologies').slice(0, 4).map(([t], k) => `<li style="--i:${k}">${t}</li>`).join('')}</ul>
        <a class="hf-go" href="${svcUrl(slug)}">Explore ${area === 'AI' ? 'AI services' : area} ${icon('arrow-right')}</a>
      </article>`;
      }).join('\n      ')}
    </div>`;

const hero = `<section class="hero${HERO === 'scan' || HERO === 'glass' ? ` hero--${HERO}` : ''}" data-hero data-dark>
  <div class="hero-stage">
    ${HERO === 'scan' ? '<svg class="hero-scan" data-scan viewBox="0 0 1680 944" preserveAspectRatio="xMidYMid slice" aria-hidden="true"></svg>\n    ' : ''}<div class="hero-shade" aria-hidden="true"></div>

    <div class="hero-a" data-hero-a>
      ${HERO === 'glass' ? '<p class="mono hero-eyebrow" data-intro>AI · Cloud · Data · Security</p>\n      ' : ''}<h1 class="display display--hero" data-split data-split-load><span class="line">${first.title.split(' ').slice(0, 2).join(' ')}</span> <span class="line">${first.title.split(' ').slice(2).join(' ')}</span></h1>
      <div class="hero-a-foot">
        <p class="hero-sub" data-intro>${HERO === 'glass' ? '' : '+ '}${first.text}</p>
        <div class="hero-actions" data-intro>
          <a class="pill" href="contact.html" data-magnetic>Contact Now ${icon('arrow-up-right')}</a>
          <a class="pill pill--ghost" href="services.html" data-magnetic>What We Do</a>
        </div>
        ${HERO === 'glass' ? `<ul class="hero-trust mono" data-intro aria-label="Credentials"><li>MCC certified</li><li>ISO 9001 · 14001 · 45001</li></ul>` : ''}
      </div>
    </div>

    ${HERO === 'glass' ? frameRail() : `<div class="hero-ticker" data-ticker data-intro aria-label="Highlights">
      <p class="mono"><span data-ticker-index>01</span> / 0${rest.length}</p>
      <div class="hero-ticker-items">${rest.map((s, i) => `<div class="hero-ticker-item${i === 0 ? ' is-active' : ''}"><strong>${s.title}</strong><span>${s.text}</span></div>`).join('')}</div>
      <div class="hero-ticker-bar"><i></i></div>
    </div>`}

    <p class="hero-scroll mono" data-intro aria-hidden="true">Scroll to explore <span>↓</span></p>

    ${HERO === 'glass' ? `${framePanels()}\n\n    ` : ''}<div class="hero-b" data-hero-b>
      <p class="mono eyebrow">(AI · Cloud · Data)</p>
      <h2 class="display display--md">Where Passion Meets Technology</h2>
      <p class="lead">${contact.heading}</p>
      <div class="hero-offices">
        ${[[services.length, 'Managed services', 'AI, cloud, data & security'], [industries.length, 'AI products', 'Built for industry']].map(([n, label, text]) => `<div><p class="mono">${label}</p><p class="hero-office-city">${String(n).padStart(2, '0')}</p><p class="dim">${text}</p></div>`).join('')}
      </div>
    </div>
  </div>
</section>`;

// The home page's 3D (assets/js/stage.js): the hero's 3D element on a dark layer behind the page (the scan horizon is SVG in the hero itself), and a clear
// layer above the page where its particles fly down and form the network beside "Who we are"
const stage = `<div class="stage" aria-hidden="true">${earth('stage', HERO).replace('data-earth="stage"', 'data-earth="stage" data-stage')}</div>
<div class="stage-light" aria-hidden="true"><canvas data-stage-light></canvas></div>`;

// A dark section before Contact: the network's light streams down into a galaxy here (stage.js)
const galaxy = `<section class="galaxy-sec" data-galaxy data-dark>
  <div class="galaxy-in">
    <p class="mono eyebrow">(Delivering the digital future)</p>
    <h2 class="display display--md">Your success is our mission</h2>
  </div>
</section>`;

// structured data: the company, its two offices and the website
const jsonld = ldScript(orgNode(), officeNodes(), websiteNode());

export default {
  file: 'index.html',
  path: '',
  active: 'home',
  stage: true,
  bodyClass: 'page-home',
  fullTitle: 'Hamdaz Technologies | IT, AI, Cybersecurity & ELV in Abu Dhabi',
  description: 'Abu Dhabi system integrator for AI, cloud, cybersecurity, MCC-certified CCTV, audio visual, networking and software. ISO certified, registered ADNOC supplier.',
  jsonld,
  body: [stage, hero, content(intro({ art: true }), clientsPartners({ idx: '02' }), servicesIndex({ idx: '03' }), productsGrid({ idx: '04' }), serviceFinder({ idx: '05' }), techStrip()), galaxy, content(contactSection({ idx: '06' }))].join('\n'),
};
