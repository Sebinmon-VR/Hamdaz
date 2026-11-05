import { about, whoWeAre } from '../data.mjs';
import { pageHero, content, head, facts, tone, sentences, pad2, techStrip, contactSection } from '../components.mjs';

const hero = pageHero({ crumb: 'Who We Are', eyebrow: about.title, title: 'Who We Are', text: about.intro, scene: 'network' });
const s = sentences(whoWeAre.text);
const first = (t) => t.split(/(?<=[.!])\s+/)[0];

const intro = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Who we are', title: 'A team driven by technology', text: first(about.whoWeAre) })}
    <div class="about-split">
      <div class="about-media" data-reveal>${tone('assets/img/about-inner.jpg', 'A robotic hand holding a glowing circuit brain, representing artificial intelligence', 1000, 1000)}</div>
      <div class="about-copy">
        <p data-reveal>${s[2]}</p>
        <p class="about-strong" data-reveal>We craft intelligent solutions that propel your business forward.</p>
        ${facts()}
      </div>
    </div>
  </div>
</section>`;

const values = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'Why Hamdaz', meta: `${about.points.length} reasons`, title: 'Where technology meets passion' })}
    <div class="values">${about.points
      .map(
        ([t, d], i) => `
      <article class="value" data-reveal>
        <p class="value-num">${pad2(i + 1)}</p>
        <h3>${t}</h3>
        <p>${first(d)}</p>
      </article>`,
      )
      .join('')}
    </div>
  </div>
</section>`;

export default {
  file: 'about.html',
  path: 'about.html',
  active: 'about',
  scene: true,
  title: 'About Us',
  description: `${about.intro} ${about.whoWeAre}`,
  body: [hero, content(intro, values, techStrip(), contactSection({ idx: '03' }))].join('\n'),
};
