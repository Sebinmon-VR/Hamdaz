// Builds docs/steps-options.html: three designs for the "Five steps, on every project" section of How We Do
// (A timeline, B 3D steps, C scroll story), made with the site's own layout, components and styles so they look
// as they would on the page. Run: node docs/steps-options.build.mjs
import { writeFileSync } from 'node:fs';
import { layout } from '../src/layout.mjs';
import { head, tone, contactSection } from '../src/components.mjs';
import { icon } from '../src/icons.mjs';

// the steps, rewritten: a promise, what happens, and what you get (all from what the site already says)
const STEPS = [
  { kind: 'survey', ic: 'search', img: 'network-services-cabling-structured-cabling', t: 'Survey and understand', promise: 'We understand before we propose.',
    text: 'We visit your site, or study your systems, data and workflows, and agree with you what the goal is and how success will be measured.',
    get: ['Site survey and needs analysis', 'Risk or gap assessment', 'A scope you agree'] },
  { kind: 'blueprint', ic: 'pen-tool', img: 'cyber-assessment-audit', t: 'Design', promise: 'A plan you approve first.',
    text: 'Drawings or architecture, a BOQ and a priced proposal, agreed before anything is bought or built. For CCTV, we prepare the MCC design submission and NOC.',
    get: ['Design drawings or architecture', 'BOQ and proposal', 'Approvals, such as the MCC NOC'] },
  { kind: 'deliver', ic: 'box', img: 'data-center-infrastructure-services', t: 'Supply and deliver', promise: 'Built by our engineers, in the open.',
    text: 'Brand-agnostic supply from leading OEMs and authorised distributors, then installation, configuration or development by our engineers, tested as we go.',
    get: ['Equipment from authorised channels', 'Installation or development to spec', 'Regular updates and demos'] },
  { kind: 'handover', ic: 'handshake', img: 'av-setup-meeting-room-solutions', t: 'Hand over and train', promise: 'Tested, signed off, explained.',
    text: 'Testing and commissioning, your sign-off, the as-built documents, and training for the people who will use and run it.',
    get: ['Testing and commissioning', 'As-built documents', 'User and admin training'] },
  { kind: 'support', ic: 'life-buoy', img: 'managed-services', t: 'Support and improve', promise: 'Looked after once it is live.',
    text: 'Maintenance, monitoring and a service desk, with 24/7 managed SecOps where you need it, and regular reviews to keep improving.',
    get: ['Preventive maintenance', 'Monitoring and support to agreed SLAs', 'Regular service reviews'] },
];
const pad = (i) => String(i + 1).padStart(2, '0');
const pic = (s, cls = '') => tone(`assets/img/svc/${s.img}.webp`, '', 1000, 750, ` data-live="${s.kind}"${cls ? ` class-extra="${cls}"` : ''}`);
const getList = (s, cls) => `<ul class="${cls}">${s.get.map((g) => `<li>${icon('check')}<span>${g}</span></li>`).join('')}</ul>`;
const header = (idx) => head({ idx, label: 'Our method', meta: '5 steps', title: 'Five steps, on every project', text: 'The same way of working for a CCTV upgrade, a cloud migration or a new ERP: agreed up front, delivered in the open and supported after go-live.' });

// A · timeline: a line with five points that fills with light as you scroll; each step's card under its point
const optA = `<section class="sec">
  <div class="wrap">
    ${header('01')}
    <ol class="tl" data-tl><span class="tl-track" aria-hidden="true"><span class="tl-fill"></span></span>${STEPS.map((s, i) => `
      <li class="tl-step">
        <span class="tl-dot">${icon(s.ic)}<b>${pad(i)}</b></span>
        <div class="tl-card">
          <p class="tl-kick">Step ${pad(i)}</p>
          <h3 class="tl-title">${s.t}</h3>
          <p class="tl-promise">${s.promise}</p>
          <p class="tl-text">${s.text}</p>
          ${getList(s, 'tl-get')}
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;

// B · 3D steps: each step with its own live 3D object, joined by a glowing line
const optB = `<section class="sec">
  <div class="wrap">
    ${header('01')}
    <ol class="s3">${STEPS.map((s, i) => `
      <li class="s3-step">
        <div class="s3-media">${pic(s)}<span class="s3-num">${pad(i)}</span></div>
        <div class="s3-body">
          <h3 class="s3-title">${s.t}</h3>
          <p class="s3-promise">${s.promise}</p>
          <p class="s3-text">${s.text}</p>
          ${getList(s, 's3-get')}
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>`;

// C · scroll story: one large live picture stays in view and changes as you scroll through the steps
const optC = `<section class="sec">
  <div class="wrap">
    ${header('01')}
    <div class="st" data-story>
      <div class="st-stage">
        <div class="st-pic">${STEPS.map((s, i) => pic(s).replace('<span class="tone"', `<span class="tone${i ? '' : ' on'}" data-i="${i}"`)).join('')}</div>
        <div class="st-meta"><span class="st-count" data-count>01 / 05</span><span class="st-rail"><span class="st-rail-fill" data-rail></span></span></div>
      </div>
      <ol class="st-steps">${STEPS.map((s, i) => `
        <li class="st-step${i ? '' : ' on'}" data-i="${i}">
          <span class="st-ic">${icon(s.ic)}</span>
          <p class="st-kick">Step ${pad(i)}</p>
          <h3 class="st-title">${s.t}</h3>
          <p class="st-promise">${s.promise}</p>
          <p class="st-text">${s.text}</p>
          ${getList(s, 'st-get')}
        </li>`).join('')}
      </ol>
    </div>
  </div>
</section>`;

const band = (id, name, what) => `<div class="opt-band" id="${id}"><div class="wrap"><span class="opt-tag">Option ${id.toUpperCase()}</span><b>${name}</b><span>${what}</span><label class="opt-pick"><input type="radio" name="pick" value="${id.toUpperCase()} ${name}"> Pick this</label></div></div>`;

const css = `<style>
/* options page only */
.opt-top { padding: calc(var(--header-h) + 40px) var(--pad) 28px; background: var(--bg); color: var(--fg); }
.opt-top h1 { font-family: var(--display); font-weight: 500; font-size: clamp(28px, 3vw, 44px); letter-spacing: -0.02em; margin: 0 0 12px; }
.opt-top p { max-width: 62rem; color: var(--fg-2); margin: 0 0 18px; }
.opt-top nav { display: flex; flex-wrap: wrap; gap: 10px; }
.opt-top nav a { padding: 9px 16px; border: 1px solid var(--line-2); border-radius: 99px; color: var(--fg); font-size: 14px; }
.opt-band { position: relative; z-index: 3; margin-top: var(--gap); padding: 12px var(--pad); background: #0c2236; color: #eef6fb; }
.opt-band .wrap { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: center; font-size: 14px; }
.opt-tag { font-family: var(--mono); font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
.opt-band span:not(.opt-tag) { color: rgba(238, 246, 251, 0.7); }
.opt-pick { margin-left: auto; display: inline-flex; gap: 8px; align-items: center; padding: 6px 14px; border: 1px solid rgba(238,246,251,0.3); border-radius: 99px; cursor: pointer; }
.opt-pick:has(input:checked) { border-color: var(--accent); color: var(--accent); }
.opt-out { position: fixed; z-index: 90; left: 16px; bottom: 16px; display: flex; gap: 8px; align-items: center; padding: 8px; border-radius: 12px; background: #fff; box-shadow: 0 16px 40px -16px rgba(0,0,0,0.4); }
.opt-out input { width: 220px; padding: 7px 10px; border: 1px solid #d5dde5; border-radius: 8px; font: inherit; font-size: 13px; }
@media (max-width: 640px) { .opt-out input { display: none; } }
.opt-out button { padding: 9px 14px; border: 0; border-radius: 8px; background: #0c2a46; color: #fff; font: inherit; font-size: 14px; cursor: pointer; }
.tone .i, .tl .i, .s3 .i, .st .i { width: 18px; height: 18px; }

/* A · timeline */
.tl { position: relative; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; --p: 0; }
.tl-track { position: absolute; left: 10%; right: 10%; top: 31px; height: 2px; background: var(--rule); border-radius: 2px; }
.tl-fill { position: absolute; inset: 0 auto 0 0; width: calc(var(--p) * 100%); background: linear-gradient(90deg, #30c1f8, #6b50f6); box-shadow: 0 0 14px rgba(48, 193, 248, 0.7); border-radius: 2px; }
.tl-step { position: relative; display: grid; grid-template-rows: 64px 1fr; justify-items: center; gap: 20px; }
.tl-dot { position: relative; z-index: 1; display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #fff; border: 1px solid var(--rule); color: var(--ink); transition: background-color 0.5s, color 0.5s, box-shadow 0.5s, transform 0.5s var(--ease); }
.tl-dot .i { width: 24px; height: 24px; }
.tl-dot b { position: absolute; top: -8px; right: -8px; padding: 2px 7px; border-radius: 99px; background: var(--ink); color: #fff; font: 500 11px/1.4 var(--mono); }
.tl-step.on .tl-dot { background: #061423; color: #30c1f8; box-shadow: 0 0 0 6px rgba(48, 193, 248, 0.14), 0 10px 30px -8px rgba(48, 193, 248, 0.6); transform: translateY(-2px); }
.tl-card { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 8px; padding: 22px 20px 22px; border: 1px solid var(--rule); border-radius: 18px; background: #fff; transition: border-color 0.5s, box-shadow 0.5s, transform 0.5s var(--ease); }
.tl-step.on .tl-card { border-color: transparent; box-shadow: 0 24px 50px -30px rgba(6, 20, 35, 0.35); transform: translateY(-4px); }
.tl-kick, .s3-num, .st-kick { font-family: var(--mono); font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase; color: #5d6976; }
.tl-title, .s3-title { font-family: var(--display); font-weight: 500; font-size: clamp(18px, 1.35vw, 21px); line-height: 1.2; letter-spacing: -0.015em; }
.tl-promise, .s3-promise { font-weight: 500; font-size: 14.5px; color: var(--ink); }
.tl-text, .s3-text { font-size: 14px; line-height: 1.6; color: var(--ink-2); }
.tl-get, .s3-get, .st-get { list-style: none; margin: auto 0 0; padding: 12px 0 0; display: grid; gap: 7px; border-top: 1px solid var(--rule); }
.tl-get li, .s3-get li, .st-get li { display: grid; grid-template-columns: 18px 1fr; gap: 8px; align-items: start; font-size: 13.5px; line-height: 1.45; color: var(--ink); }
.tl-get .i, .s3-get .i, .st-get .i { width: 16px; height: 16px; margin-top: 2px; color: #0d8fc4; }
@media (max-width: 1100px) {
  .tl { grid-template-columns: minmax(0, 1fr); gap: 22px; padding-left: 0; }
  .tl-track { left: 31px; right: auto; top: 32px; bottom: 32px; width: 2px; height: auto; }
  .tl-fill { inset: 0 0 auto 0; width: 2px; height: calc(var(--p) * 100%); }
  .tl-step { grid-template-columns: 64px minmax(0, 1fr); grid-template-rows: auto; justify-items: stretch; align-items: start; gap: 18px; }
}

/* B · 3D steps */
.s3 { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; }
.s3-step { position: relative; display: flex; flex-direction: column; border: 1px solid var(--rule); border-radius: 20px; background: #fff; overflow: hidden; transition: transform 0.6s var(--ease), box-shadow 0.6s var(--ease); }
.s3-step:hover { transform: translateY(-5px); box-shadow: 0 30px 64px -32px rgba(6, 20, 35, 0.42); }
.s3-media { position: relative; }
.s3-media .tone { aspect-ratio: 4 / 3; border-radius: 0; }
.s3-num { position: absolute; z-index: 2; top: 12px; left: 12px; padding: 4px 9px; border-radius: 99px; background: rgba(6, 20, 35, 0.6); color: #bfe9ff; backdrop-filter: blur(6px); }
.s3-step:not(:last-child)::after { content: ""; position: absolute; z-index: 3; top: 37%; right: -19px; width: 20px; height: 2px; background: linear-gradient(90deg, #30c1f8, #6b50f6); box-shadow: 0 0 10px rgba(48, 193, 248, 0.8); }
.s3-body { display: flex; flex-direction: column; gap: 8px; flex: 1; padding: 18px 18px 20px; }
@media (max-width: 1100px) { .s3 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .s3-step::after { display: none; } }
@media (max-width: 640px) { .s3 { grid-template-columns: minmax(0, 1fr); } }

/* C · scroll story */
.st { display: grid; grid-template-columns: minmax(0, 6fr) minmax(0, 5fr); gap: clamp(32px, 5vw, 80px); align-items: start; }
.st-stage { position: sticky; top: calc(var(--header-h) + 72px); display: grid; gap: 14px; }
.st-pic { position: relative; aspect-ratio: 4 / 3; border-radius: 24px; overflow: hidden; background: #061423; }
.st-pic .tone { position: absolute; inset: 0; display: none; aspect-ratio: auto; border-radius: 0; }
.st-pic .tone.on { display: block; animation: st-in 0.7s var(--ease); }
@keyframes st-in { from { opacity: 0; transform: scale(1.03); } to { opacity: 1; transform: none; } }
.st-count { flex: none; white-space: nowrap; }
.st-meta { display: flex; align-items: center; gap: 14px; font: 500 12px var(--mono); letter-spacing: 0.08em; color: #5d6976; }
.st-rail { position: relative; flex: 1; height: 2px; background: var(--rule); border-radius: 2px; }
.st-rail-fill { position: absolute; inset: 0 auto 0 0; width: 20%; background: linear-gradient(90deg, #30c1f8, #6b50f6); border-radius: 2px; transition: width 0.6s var(--ease); }
.st-steps { list-style: none; margin: 0; padding: 0; }
.st-step { min-height: 62vh; display: flex; flex-direction: column; justify-content: center; gap: 10px; opacity: 0.28; transition: opacity 0.5s; }
.st-step.on { opacity: 1; }
.st-ic { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 14px; background: #061423; color: #30c1f8; }
.st-ic .i { width: 22px; height: 22px; }
.st-title { font-family: var(--display); font-weight: 500; font-size: clamp(26px, 2.4vw, 38px); line-height: 1.1; letter-spacing: -0.025em; }
.st-promise { font-size: 18px; font-weight: 500; color: var(--ink); }
.st-text { font-size: 16px; line-height: 1.65; color: var(--ink-2); max-width: 34rem; }
.st-get { max-width: 30rem; margin-top: 8px; }
@media (max-width: 900px) {
  .st { grid-template-columns: minmax(0, 1fr); gap: 0; }
  .st-stage { top: calc(var(--header-h) + 8px); z-index: 2; background: var(--paper, #f1f0ec); padding-bottom: 10px; }
  .st-pic { aspect-ratio: 16 / 10; }
  .st-step { min-height: 88vh; justify-content: flex-end; padding-bottom: 8vh; }
}
</style>`;

const js = `<script>
document.addEventListener('DOMContentLoaded', () => {
  // A: the line fills as the section passes the middle of the screen; each point lights as the fill reaches it
  const tl = document.querySelector('[data-tl]');
  const steps = [...tl.querySelectorAll('.tl-step')];
  const upd = () => {
    const r = tl.getBoundingClientRect(), mid = innerHeight * 0.62;
    const p = Math.max(0, Math.min(1, (mid - r.top) / (r.height * 0.75)));
    tl.style.setProperty('--p', p.toFixed(3));
    steps.forEach((s, i) => s.classList.toggle('on', p >= i / (steps.length - 1) - 0.02));
  };
  addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  // C: the step in the middle of the screen is the active one; its picture shows on the left
  const story = document.querySelector('[data-story]');
  const items = [...story.querySelectorAll('.st-step')], pics = [...story.querySelectorAll('.st-pic .tone')];
  const set = (i) => {
    items.forEach((el, k) => el.classList.toggle('on', k === i)); pics.forEach((el, k) => el.classList.toggle('on', k === i));
    story.querySelector('[data-count]').textContent = String(i + 1).padStart(2, '0') + ' / 05';
    story.querySelector('[data-rail]').style.width = ((i + 1) / items.length) * 100 + '%';
  };
  const io = new IntersectionObserver((list) => list.forEach((e) => { if (e.isIntersecting) set(+e.target.dataset.i); }), { rootMargin: '-45% 0px -45% 0px' });
  items.forEach((el) => io.observe(el));
  // the pick
  document.querySelector('[data-copy]').addEventListener('click', async () => {
    const pick = document.querySelector('input[name="pick"]:checked')?.value || 'none picked', note = document.querySelector('[data-note]').value.trim();
    const text = 'Steps design: ' + pick + (note ? '\\nNotes: ' + note : '');
    try { await navigator.clipboard.writeText(text); } catch (e) {}
    document.querySelector('[data-copy]').textContent = 'Copied';
  });
});
</script>`;

const top = `<section class="opt-top" data-dark><div class="wrap">
  <h1>"Five steps" section: three designs</h1>
  <p>The same new content in each: a promise, what happens, and what you get at each step. Scroll through each option as it would sit on the How We Do page, move the pointer over the 3D pictures, then pick one and press "Copy my pick".</p>
  <nav><a href="docs/steps-options.html#a">A · Timeline</a><a href="docs/steps-options.html#b">B · 3D steps</a><a href="docs/steps-options.html#c">C · Scroll story</a></nav>
</div></section>`;

const body = `${css}${top}
<div class="content">
${band('a', 'Timeline', 'A line with five points that fills with light as you scroll; each step sits under its point.')}
${optA}
${band('b', '3D steps', 'Each step has its own live 3D object (hover them), joined by a glowing line.')}
${optB}
${band('c', 'Scroll story', 'One large 3D picture stays in view and changes as you scroll through the steps.')}
${optC}
<div style="height: 30vh"></div>
</div>
<div class="opt-out"><input data-note placeholder="Notes (optional)"><button type="button" data-copy>Copy my pick</button></div>
${js}`;

const html = layout({ path: 'docs/steps-options.html', title: 'Steps options', body, base: '../', noindex: true, active: 'solutions', modules: ['docs/live2/kinds-f.js', 'assets/js/svc-live.js'] });
writeFileSync(new URL('./steps-options.html', import.meta.url), html);
console.log('docs/steps-options.html written');
