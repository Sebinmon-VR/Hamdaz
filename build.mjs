// Zero-dependency static site builder for hamdaz.com
//   node build.mjs           → regenerates the .html pages + sitemap.xml in the project root
//   node build.mjs --serve   → builds, then serves the site at http://localhost:8080
//
// A page module's default export is one page or a list of pages ({ file, path, ... } for layout()).
// Pages can live in folders (service/<slug>/index.html): their relative links and asset paths are
// rewritten to climb back to the site root, so the source always writes paths from the root.
import { writeFileSync, readFileSync, existsSync, statSync, mkdirSync, rmSync, readdirSync, cpSync } from 'node:fs';
import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './src/layout.mjs';
import { site } from './src/data.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['home', 'about', 'services', 'area', 'service', 'solutions', 'projects', 'partners', 'quality', 'certifications', 'insights', 'careers', 'contact', 'privacy', 'notfound'];

// leave absolute URLs, root paths, anchors, queries and other schemes (mailto:, tel:, data:) alone
const KEEP = /^(?:[a-z][a-z0-9+.-]*:|\/|#|\?|$)/i;
const relocate = (html, depth) =>
  depth ? html.replace(/\b(href|src|data-img|poster)="([^"]*)"/g, (m, attr, v) => (KEEP.test(v) ? m : `${attr}="${'../'.repeat(depth)}${v}"`)) : html;

// The date each page last changed, for the sitemap: src/sitemap-dates.json keeps a hash of every page, and a page
// whose HTML differs from its hash gets today's date. (Search engines ignore <lastmod> when every page claims to
// have changed on every build, so it has to be true.)
const today = new Date().toISOString().slice(0, 10);
const datesFile = join(root, 'src', 'sitemap-dates.json');
const dates = existsSync(datesFile) ? JSON.parse(readFileSync(datesFile, 'utf8')) : {};

const built = [];
for (const name of pages) {
  const mod = (await import(`./src/pages/${name}.mjs`)).default;
  for (const page of [].concat(mod)) {
    const out = join(root, page.file);
    mkdirSync(dirname(out), { recursive: true });
    const html = relocate(layout(page), page.file.split('/').length - 1);
    writeFileSync(out, html);
    const hash = createHash('sha1').update(html).digest('hex').slice(0, 16);
    if (dates[page.path]?.hash !== hash) dates[page.path] = { hash, date: today };
    built.push({ ...page, changed: dates[page.path].date });
  }
  console.log(`  ✓ ${name}${Array.isArray(mod) ? ` (${mod.length} pages)` : ''}`);
}
writeFileSync(datesFile, `${JSON.stringify(Object.fromEntries(Object.entries(dates).sort()), null, 1)}\n`);

// sitemap.xml: every indexable page, the date it last changed, and its own photo (for Google Images)
const listed = built.filter((p) => p.file !== '404.html' && !p.noindex);
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${listed
  .map((p) => {
    const img = p.image && !/\/og\.png$/.test(p.image) ? `<image:image><image:loc>${xml(p.image)}</image:loc></image:image>` : '';
    return `  <url><loc>${site.url}/${p.path}</loc><lastmod>${p.date || p.changed}</lastmod>${img}</url>`;
  })
  .join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
console.log(`  ✓ sitemap.xml (${listed.length} URLs)`);

// llms.txt: a plain summary of the site and its main pages, for AI assistants and AI search (llmstxt.org)
const strip = (s) => String(s).replace(/&amp;/g, '&').replace(/<[^>]+>/g, '');
const line = (p) => `- [${strip(p.fullTitle || p.title || site.name).replace(/ [–|] Hamdaz.*$/, '')}](${site.url}/${p.path}): ${strip(p.description || site.description)}`;
const group = (re) => listed.filter((p) => re.test(p.path)).map(line).join('\n');
writeFileSync(join(root, 'llms.txt'), `# ${site.name}

> ${strip(site.description)}

Hamdaz Technologies is a system integrator based in Abu Dhabi, UAE, with an office in Kozhikode, India. It is ISO 9001, 14001 and 45001 certified, Abu Dhabi MCC certified for CCTV, and a registered ADNOC supplier (ICV).

## Company
${group(/^(|about\.html|partners\.html|projects\.html|quality\.html|certifications\.html|careers\.html|contact\.html)$/)}

## Service areas
${group(/^services\//)}

## Services
${group(/^service\//)}

## Insights
${group(/^insights/)}
`);
console.log('  ✓ llms.txt');

// --dist: copy only what the live site needs into dist/ (what gets deployed to Azure Static Web Apps);
// the source, the design option pages and the tooling stay out of it.
if (process.argv.includes('--dist')) {
  const skip = new Set(['.git', '.github', '.claude', '.vscode', 'node_modules', 'dist', 'src', 'docs', 'tools', 'build.mjs', 'package.json', 'package-lock.json', 'README.md', '.gitignore', '.htaccess']);
  const out = join(root, 'dist');
  rmSync(out, { recursive: true, force: true });
  for (const f of readdirSync(root)) if (!skip.has(f) && !f.endsWith('.tmp.html')) cpSync(join(root, f), join(out, f), { recursive: true });
  console.log('  ✓ dist/');
}

if (process.argv.includes('--serve')) {
  const port = Number(process.env.PORT) || 8080;
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml',
    '.txt': 'text/plain', '.pdf': 'application/pdf', '.ico': 'image/x-icon', '.webp': 'image/webp',
  };
  createServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    // like .htaccess: the ERP's share links (/careers/apply/<token>) open the role's page
    const share = path.match(/^\/careers(?:\/apply\/([A-Za-z0-9_-]+))?\/?$/);
    if (share) {
      res.writeHead(share[1] ? 302 : 301, { location: share[1] ? `/job.html?id=${share[1]}` : '/careers.html' });
      return res.end();
    }
    if (path.endsWith('/')) path += 'index.html';
    let file = normalize(join(root, path));
    // like Apache: a folder without its trailing slash redirects to it
    if (file.startsWith(root) && existsSync(file) && statSync(file).isDirectory() && existsSync(join(file, 'index.html'))) {
      res.writeHead(301, { location: `${path}/` });
      return res.end();
    }
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': types['.html'] });
      return res.end(readFileSync(join(root, '404.html')));
    }
    // never let the browser reuse an old copy while previewing (every reload shows the latest build)
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  }).listen(port, () => console.log(`\n  Serving on http://localhost:${port}\n`));
}
