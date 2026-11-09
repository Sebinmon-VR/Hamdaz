import { icon } from '../icons.mjs';
import { pageHero, content, head, pad2 } from '../components.mjs';

const links = [
  ['Home', 'index.html', 'Delivering the Digital Future'],
  ['What We Do', 'services.html', 'All 20 managed services'],
  ['How We Do', 'solutions.html', 'AI products and custom ChatGPT'],
  ['Who We Are', 'about.html', 'About HAMDAZ Technologies'],
  ['Contact Us', 'contact.html', 'Offices in the UAE and India'],
];

export default {
  file: '404.html',
  path: '404.html',
  // Served at arbitrary URLs by the host, so resolve assets from the site root.
  base: '/',
  earth: true,
  // The ERP's share link for a job is <CAREERS_URL>/apply/<token>, e.g. .../careers/apply/<token>. Apache
  // redirects it (.htaccess), but hosts without it (GitHub Pages) land here, so forward it to the role's page
  // before anything draws. It keeps whatever folder the site lives in (/Hamdaz/ on GitHub Pages).
  jsonld: `<script>(function(l){var p=l.pathname,m=p.match(/^(.*?)\\/careers\\/apply\\/([A-Za-z0-9_-]+)\\/?$/);if(m){l.replace(m[1]+'/job.html?id='+m[2])}else if(/\\/careers\\/?$/.test(p)){l.replace(p.replace(/\\/careers\\/?$/,'/careers.html'))}})(location)</script>\n`,
  title: 'Page not found',
  description: 'The page you were looking for could not be found.',
  body: `${pageHero({ crumb: '404', eyebrow: 'Error 404', title: 'Lost in orbit', text: 'This page has moved or no longer exists. Everything from the old site now lives on the pages below.', hero: 'spark' })}
${content(`<section class="sec">
  <div class="wrap">
    ${head({ idx: '404', label: 'Not found', title: 'Where would you like to go?' })}
    <ol class="index">${links
      .map(([t, href, d], i) => `<li><a class="ix" href="${href}"><span class="ix-num">${pad2(i + 1)}</span><span class="ix-title">${t}</span><span class="ix-text">${d}</span><span class="ix-go" aria-hidden="true">${icon('arrow-up-right')}</span></a></li>`)
      .join('')}</ol>
  </div>
</section>`)}`,
};
