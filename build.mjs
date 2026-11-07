// Zero-dependency static site builder for hamdaz.com
//   node build.mjs           → regenerates the .html pages + sitemap.xml in the project root
//   node build.mjs --serve   → builds, then serves the site at http://localhost:8080
//
// A page module's default export is one page or a list of pages ({ file, path, ... } for layout()).
// Pages can live in folders (service/<slug>/index.html): their relative links and asset paths are
// rewritten to climb back to the site root, so the source always writes paths from the root.
import { writeFileSync, readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './src/layout.mjs';
import { site } from './src/data.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['home', 'about', 'services', 'area', 'service', 'solutions', 'projects', 'insights', 'contact', 'notfound'];

// leave absolute URLs, root paths, anchors, queries and other schemes (mailto:, tel:, data:) alone
const KEEP = /^(?:[a-z][a-z0-9+.-]*:|\/|#|\?|$)/i;
const relocate = (html, depth) =>
  depth ? html.replace(/\b(href|src|data-img|poster)="([^"]*)"/g, (m, attr, v) => (KEEP.test(v) ? m : `${attr}="${'../'.repeat(depth)}${v}"`)) : html;

const built = [];
for (const name of pages) {
  const mod = (await import(`./src/pages/${name}.mjs`)).default;
  for (const page of [].concat(mod)) {
    const out = join(root, page.file);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, relocate(layout(page), page.file.split('/').length - 1));
    built.push(page);
  }
  console.log(`  ✓ ${name}${Array.isArray(mod) ? ` (${mod.length} pages)` : ''}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .filter((p) => p.file !== '404.html' && !p.noindex)
  .map((p) => `  <url><loc>${site.url}/${p.path}</loc><lastmod>${p.date || today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
console.log(`  ✓ sitemap.xml (${built.length - 1} URLs)`);

if (process.argv.includes('--serve')) {
  const port = Number(process.env.PORT) || 8080;
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.xml': 'application/xml',
    '.txt': 'text/plain', '.ico': 'image/x-icon', '.webp': 'image/webp',
  };
  createServer((req, res) => {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
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
