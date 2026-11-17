// Tells IndexNow search engines (Bing, which also feeds ChatGPT search and Copilot, plus Yandex, Seznam, Naver)
// which pages on hamdaz.com changed, so they are re-crawled within hours instead of weeks. Google does not use
// IndexNow; it reads sitemap.xml (submitted once in Search Console).
//
//   node tools/indexnow.mjs previous-sitemap.xml   → submits pages that are new, or whose <lastmod> changed,
//                                                     compared with that older copy of sitemap.xml
//   node tools/indexnow.mjs --all                  → submits every page in sitemap.xml
//
// The key is the <32 hex>.txt file in the site root (it must be live at https://hamdaz.com/<key>.txt).
// Run after a deploy (the GitHub workflow does). It never fails the deploy: problems are only reported.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const HOST = 'hamdaz.com';
const keyFile = readdirSync(root).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
if (!keyFile) { console.log('IndexNow: no key file in the site root, nothing sent'); process.exit(0); }
const key = keyFile.slice(0, -4);

const entries = (xml) => new Map([...xml.matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));
const now = entries(readFileSync(join(root, 'sitemap.xml'), 'utf8'));
const arg = process.argv[2];
let urls;
if (arg === '--all') urls = [...now.keys()];
else {
  const before = arg && existsSync(arg) ? entries(readFileSync(arg, 'utf8')) : new Map();
  urls = [...now].filter(([u, d]) => before.get(u) !== d).map(([u]) => u);
}
if (!urls.length) { console.log('IndexNow: no pages changed, nothing sent'); process.exit(0); }

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList: urls.slice(0, 10000) }),
  });
  console.log(`IndexNow: sent ${urls.length} page(s), answer ${res.status} ${res.statusText}`);
  urls.forEach((u) => console.log(`  ${u}`));
} catch (e) {
  console.log(`IndexNow: could not reach the service (${e.message})`);
}
