// Careers: the open roles (careers.html) and one role with its application form (job.html?id=<token>).
// Nothing about a role is written here. Both pages are shells that assets/js/careers.js fills, live, from
// the Hamdaz ERP (`careers.api` in src/data.mjs): when HR posts an opening in the ERP and lists it publicly,
// it appears here with no rebuild, with the application form HR set up for it, and applications go
// straight back into the ERP. The ERP's share link for a role (/careers/apply/<token>) is redirected to
// job.html by .htaccess.
import { careers, contact } from '../data.mjs';
import { icon } from '../icons.mjs';
import { pageHero, content, head, bar, btn, tlink } from '../components.mjs';
import { ldScript, orgNode, breadcrumbNode, crumbTrail } from '../blocks.mjs';

const cvMail = `mailto:${contact.email}?subject=${encodeURIComponent('Open application – Join the Hamdaz Team')}`;
// where careers.js finds the ERP, and the address it offers when the ERP cannot be reached
const cfg = `data-careers data-api="${careers.api}" data-email="${contact.email}"`;
const scripts = ['assets/js/careers.js'];

/* ---------- careers.html: the open roles ---------- */
const roles = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '01', label: 'Open roles', meta: '<span data-jobs-count>Abu Dhabi · India</span>', title: 'Work on what comes next', text: 'Every role we are hiring for right now. Pick one to read the details and apply in a few minutes.' })}
    <div class="jobs" ${cfg} data-jobs data-state="loading">
      <ol class="index jobs-list" data-jobs-list hidden></ol>
      <div class="jobs-state">
        <p class="jobs-msg" role="status" aria-live="polite" data-jobs-msg>Loading open roles…</p>
        <p class="jobs-alt" data-jobs-alt hidden>
          <button class="tlink" type="button" data-jobs-retry hidden>Try again${icon('arrow-right')}</button>
          ${tlink('Email us your CV', cvMail)}
        </p>
        <noscript><p class="jobs-msg">The open roles need JavaScript to load. You can also email your CV to <a href="${cvMail}">${contact.email}</a>.</p></noscript>
      </div>
    </div>
    <template data-job-tpl><li><a class="ix job-row" href="job.html"><span class="ix-num"></span><span class="job-head"><span class="ix-title"></span><span class="job-meta"></span></span><span class="ix-text"></span><span class="ix-go" aria-hidden="true">${icon('arrow-up-right')}</span></a></li></template>
  </div>
</section>`;

const open = `<section class="sec">
  <div class="wrap">
    ${head({ idx: '02', label: 'Open application', title: 'Don’t see your role?', text: 'Send us your CV and tell us what you do best. We keep good people in mind for what opens next.', action: btn('Email your CV', cvMail, { ic: 'mail', magnetic: true }) })}
  </div>
</section>`;

const list = {
  file: 'careers.html',
  path: 'careers.html',
  active: 'careers',
  earth: true,
  scripts,
  fullTitle: 'Careers at Hamdaz | Jobs in Abu Dhabi & Kerala',
  description: 'Open roles at Hamdaz Technologies in Abu Dhabi and Kozhikode: AI, cloud, cybersecurity, ELV and security systems, audio visual and software development. Apply online.',
  jsonld: ldScript(orgNode(), breadcrumbNode([['Careers', 'careers.html']])),
  body: [
    pageHero({ crumb: 'Careers', eyebrow: 'Careers', title: 'Join the Hamdaz Team', text: 'Elevate your career with innovation. Engineers, consultants and specialists across AI, cloud, security systems and software, in Abu Dhabi and India.', hero: 'beacon' }),
    content(roles, open),
  ].join('\n'),
};

/* ---------- job.html?id=<token>: one role and its application form ---------- */
// The hero's title is the role's, set by careers.js, so it is not split into words for the intro animation.
const jobHero = pageHero({ crumb: crumbTrail([['Careers', 'careers.html'], ['Open role']]), eyebrow: 'Careers', title: 'Open role', text: ' ', hero: 'beacon' })
  .replace('<h1 class="display" data-split>', '<h1 class="display job-title" data-job-title>')
  .replace('<span aria-current="page">Open role</span>', '<span aria-current="page" data-job-crumb>Open role</span>')
  .replace('<p class="lead" data-reveal>', '<p class="lead" data-reveal data-job-lead>');

const role = `<section class="sec job-sec" ${cfg} data-job>
  <div class="wrap">
    ${bar({ idx: '01', label: 'The role', meta: '<span data-job-closes></span>' })}
    <div class="job-grid">
      <dl class="job-facts" data-job-facts hidden></dl>
      <div class="job-body" data-job-body>
        <p class="jobs-msg" role="status" aria-live="polite" data-job-msg>Loading the role…</p>
        <p class="jobs-alt" data-job-alt hidden>${tlink('See all open roles', 'careers.html')}${tlink('Email us your CV', cvMail)}</p>
      </div>
    </div>
  </div>
</section>`;

const apply = `<section class="sec form-sec apply-sec" data-apply-sec hidden>
  <div class="wrap">
    ${head({ idx: '02', label: 'Apply', title: 'Apply for this role', text: 'It takes a few minutes. Your details are used only to consider this application.' })}
    <div class="form-grid">
      <div class="form-side apply-side">
        <p class="apply-for"><small>Applying for</small><strong data-apply-role></strong><span data-apply-meta></span></p>
        <p class="hint">Files: PDF, Word, images or text, up to 15 MB each.</p>
        <p class="hint">Questions? Write to <a href="mailto:${contact.email}">${contact.email}</a>.</p>
      </div>
      <div class="apply-main">
        <form class="apply-form" data-apply novalidate>
          <div class="apply-fields" data-apply-fields></div>
          <div class="form-actions">${btn('Submit application', '', { tag: 'button', ic: 'send', attrs: 'type="submit" data-apply-submit' })}</div>
          <p class="status" role="status" aria-live="polite" data-apply-status></p>
        </form>
        <div class="apply-done" data-apply-done tabindex="-1" hidden>
          <span class="apply-done-mark" aria-hidden="true">${icon('check')}</span>
          <h3 class="apply-done-title">Application sent</h3>
          <p data-apply-done-text></p>
          ${tlink('See other open roles', 'careers.html')}
        </div>
        <div class="apply-done" data-apply-closed hidden>
          <h3 class="apply-done-title">Applications are closed</h3>
          <p>This role is no longer taking applications.</p>
          ${tlink('See open roles', 'careers.html')}
        </div>
      </div>
    </div>
  </div>
</section>`;

const job = {
  file: 'job.html',
  path: 'job.html',
  active: 'careers',
  earth: true,
  scripts,
  // a shell until careers.js loads the role named in ?id=, so it is kept out of search results and the sitemap
  noindex: true,
  fullTitle: 'Open role – Careers – Hamdaz',
  description: 'An open role at Hamdaz Technologies. Read the details and apply online.',
  body: [jobHero, content(role, apply)].join('\n'),
};

export default [list, job];
