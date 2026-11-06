import { products, industries } from '../data.mjs';
import { pageHero, content, head, btn, tlink, tone, pad2, productImg, gptSection, contactSection } from '../components.mjs';

const firstSentence = (t) => t.split(/(?<=[.!])\s+/)[0];

const hero = pageHero({ crumb: 'How We Do', eyebrow: products.eyebrow, title: 'How We Do', text: products.intro, hero: 'waves' });

const list = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: products.eyebrow, meta: `${industries.length} industries`, title: 'AI products for every industry', action: btn('Talk to us', 'contact.html', { magnetic: true }) })}
    <div class="feats">${industries
      .map(
        (p, i) => `
      <article class="feat${i % 2 ? ' feat--flip' : ''}" id="${p.slug}">
        <div class="feat-media" data-reveal>${tone(productImg(p))}</div>
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
  title: 'Products',
  description:
    'Hamdaz AI products for the Oil and Gas Industry, Small and Medium Enterprises, Schools and Educational Institutions, Online Education and Sports, plus custom ChatGPT solutions for your business.',
  body: [hero, content(list, gptSection({ idx: '02', full: true }), contactSection({ idx: '03' }))].join('\n'),
};
