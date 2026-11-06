// Zero-dependency static site builder for hamdaz.com
//   node build.mjs           → regenerates the .html pages + sitemap.xml in the project root
//   node build.mjs --serve   → builds, then serves the site at http://localhost:8080
import { writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layout } from './src/layout.mjs';
import { site } from './src/data.mjs';

const root = fileURLToPath(new URL('.', import.meta.url));
const pages = ['home', 'about', 'services', 'solutions', 'contact', 'notfound'];

const built = [];
for (const name of pages) {
  const page = (await import(`./src/pages/${name}.mjs`)).default;
  writeFileSync(join(root, page.file), layout(page));
  built.push(page);
  console.log(`  ✓ ${page.file}`);
}

const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${built
  .filter((p) => p.file !== '404.html')
  .map((p) => `  <url><loc>${site.url}/${p.path}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap);
console.log('  ✓ sitemap.xml');

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
    const file = normalize(join(root, path));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404, { 'content-type': types['.html'] });
      return res.end(readFileSync(join(root, '404.html')));
    }
    // never let the browser reuse an old copy while previewing (every reload shows the latest build)
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(file));
  }).listen(port, () => console.log(`\n  Serving on http://localhost:${port}\n`));
}
