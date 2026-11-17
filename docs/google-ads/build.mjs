// Checks docs/google-ads/plan.mjs against Google's limits and the site's services, then writes the files
// to import into Google Ads Editor (docs/google-ads/import/).
//
//     node docs/google-ads/build.mjs
//
// It stops with a list of problems instead of writing anything when a line is too long, a service has no ad
// group, or an ad group names a service the site does not have.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { categories, serviceBySlug, svcUrl } from '../../src/data.mjs';
import { site, locations, languages, shared, negatives, campaigns, adGroups, company, assets } from './plan.mjs';
import { existsSync } from 'node:fs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'import');
const LIMIT = { headline: 30, description: 90, path: 15 };
const problems = [];
const check = (what, text, max) => {
  if (!text || text.length > max) problems.push(`${what}: "${text}" is ${text ? text.length : 0} characters (max ${max})`);
};
const dedupe = (list) => [...new Map(list.map((s) => [s.toLowerCase(), s])).values()];

const campaignName = (c) => `Hamdaz | ${c.title}`;
const rows = { campaigns: [], locations: [], adGroups: [], keywords: [], ads: [], negatives: [] };

for (const c of categories) {
  const camp = campaigns[c.id];
  if (!camp) { problems.push(`no campaign for the "${c.id}" area`); continue; }
  const name = campaignName(c);
  rows.campaigns.push({ Campaign: name, 'Campaign Type': 'Search', Networks: 'Google search', Budget: camp.budget, 'Budget type': 'Daily', Languages: languages, 'Campaign Status': 'Paused' });
  locations.forEach((l) => rows.locations.push({ Campaign: name, Location: l }));
  negatives.forEach((n) => rows.negatives.push({ Campaign: name, 'Ad group': '', Keyword: n, 'Criterion Type': 'Campaign negative phrase' }));
  camp.headlines.forEach((h) => check(`${c.id} headline`, h, LIMIT.headline));
  check(`${c.id} description`, camp.description, LIMIT.description);

  for (const slug of c.services) {
    const g = adGroups[slug];
    const svc = serviceBySlug[slug];
    if (!g) { problems.push(`no ad group for the "${slug}" service`); continue; }
    const group = svc.title;
    const url = `${site}${svcUrl(slug)}`;

    g.headlines.forEach((h) => check(`${slug} headline`, h, LIMIT.headline));
    g.descriptions.forEach((d) => check(`${slug} description`, d, LIMIT.description));
    g.path.forEach((p) => check(`${slug} path`, p, LIMIT.path));

    const headlines = dedupe([...g.headlines, ...camp.headlines, ...shared.headlines]).slice(0, 15);
    const descriptions = [...g.descriptions, camp.description, shared.description].slice(0, 4);
    if (headlines.length < 3) problems.push(`${slug}: needs at least 3 headlines`);

    rows.adGroups.push({ Campaign: name, 'Ad group': group, 'Max CPC': 15, 'Ad group status': 'Enabled' });
    const ad = { Campaign: name, 'Ad group': group, 'Ad type': 'Responsive search ad', 'Final URL': url, 'Path 1': g.path[0], 'Path 2': g.path[1] || '' };
    for (let i = 0; i < 15; i++) ad[`Headline ${i + 1}`] = headlines[i] || '';
    for (let i = 0; i < 4; i++) ad[`Description ${i + 1}`] = descriptions[i] || '';
    rows.ads.push(ad);

    dedupe(g.keywords).forEach((k, i) => {
      rows.keywords.push({ Campaign: name, 'Ad group': group, Keyword: k, 'Criterion Type': 'Phrase', 'Final URL': url });
      if (i < 3) rows.keywords.push({ Campaign: name, 'Ad group': group, Keyword: k, 'Criterion Type': 'Exact', 'Final URL': url });
    });
  }
}
// the company-wide campaign (plan.mjs `company`): broad searches to the What We Do page, and the brand
if (company) {
  const name = campaignName(company);
  rows.campaigns.push({ Campaign: name, 'Campaign Type': 'Search', Networks: 'Google search', Budget: company.budget, 'Budget type': 'Daily', Languages: languages, 'Campaign Status': 'Paused' });
  locations.forEach((l) => rows.locations.push({ Campaign: name, Location: l }));
  negatives.forEach((n) => rows.negatives.push({ Campaign: name, 'Ad group': '', Keyword: n, 'Criterion Type': 'Campaign negative phrase' }));
  company.headlines.forEach((h) => check('company headline', h, LIMIT.headline));
  check('company description', company.description, LIMIT.description);
  // its keywords must not repeat a service ad group's, or the two would bid against each other
  const serviceKeywords = new Set(Object.values(adGroups).flatMap((g) => g.keywords.map((k) => k.toLowerCase())));
  for (const g of company.groups) {
    const url = `${site}${g.url}`;
    g.headlines.forEach((h) => check(`${g.name} headline`, h, LIMIT.headline));
    g.descriptions.forEach((d) => check(`${g.name} description`, d, LIMIT.description));
    g.path.forEach((p) => check(`${g.name} path`, p, LIMIT.path));
    g.keywords.filter((k) => serviceKeywords.has(k.toLowerCase())).forEach((k) => problems.push(`"${k}" in ${g.name} is also a service keyword`));
    const headlines = dedupe([...g.headlines, ...company.headlines, ...shared.headlines]).slice(0, 15);
    const descriptions = [...g.descriptions, company.description, shared.description].slice(0, 4);
    rows.adGroups.push({ Campaign: name, 'Ad group': g.name, 'Max CPC': 15, 'Ad group status': 'Enabled' });
    const ad = { Campaign: name, 'Ad group': g.name, 'Ad type': 'Responsive search ad', 'Final URL': url, 'Path 1': g.path[0], 'Path 2': g.path[1] || '' };
    for (let i = 0; i < 15; i++) ad[`Headline ${i + 1}`] = headlines[i] || '';
    for (let i = 0; i < 4; i++) ad[`Description ${i + 1}`] = descriptions[i] || '';
    rows.ads.push(ad);
    dedupe(g.keywords).forEach((k, i) => {
      rows.keywords.push({ Campaign: name, 'Ad group': g.name, Keyword: k, 'Criterion Type': 'Phrase', 'Final URL': url });
      if (i < 3) rows.keywords.push({ Campaign: name, 'Ad group': g.name, Keyword: k, 'Criterion Type': 'Exact', 'Final URL': url });
    });
  }
}
shared.headlines.forEach((h) => check('shared headline', h, LIMIT.headline));
check('shared description', shared.description, LIMIT.description);
Object.keys(adGroups).filter((s) => !serviceBySlug[s]).forEach((s) => problems.push(`ad group "${s}" is not a service on the site`));
Object.keys(adGroups).filter((s) => !categories.some((c) => c.services.includes(s))).forEach((s) => problems.push(`ad group "${s}" is in no service area`));

// assets (extensions): Google's limits, and every sitelink must open a real page on the site
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pageExists = (u) => existsSync(join(ROOT, u === '' ? 'index.html' : u.endsWith('/') ? `${u}index.html` : u));
if (assets) {
  assets.callouts.forEach((c) => check('callout', c, 25));
  assets.snippets.forEach((sn) => {
    sn.values.forEach((v) => check(`${sn.header} snippet value`, v, 25));
    if (sn.values.length < 3 || sn.values.length > 10) problems.push(`${sn.header} snippet needs 3 to 10 values`);
  });
  Object.values(assets.sitelinks).flat().forEach((l) => {
    check('sitelink text', l.text, 25);
    l.lines.forEach((t) => check(`sitelink "${l.text}" description`, t, 35));
    if (!pageExists(l.url)) problems.push(`sitelink "${l.text}" points to ${l.url}, which is not a page on the site`);
  });
}
if (company) company.groups.forEach((g) => { if (!pageExists(g.url)) problems.push(`${g.name} points to ${g.url}, which is not a page on the site`); });

if (problems.length) {
  console.error(`Nothing written. ${problems.length} problem(s):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}

const csv = (list) => {
  const cols = Object.keys(list[0]);
  const cell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  return `${cols.map(cell).join(',')}\n${list.map((r) => cols.map((k) => cell(r[k] ?? '')).join(',')).join('\n')}\n`;
};
mkdirSync(OUT, { recursive: true });
const files = { '1-campaigns.csv': rows.campaigns, '2-locations.csv': rows.locations, '3-ad-groups.csv': rows.adGroups, '4-keywords.csv': rows.keywords, '5-ads.csv': rows.ads, '6-negative-keywords.csv': rows.negatives };
for (const [file, list] of Object.entries(files)) writeFileSync(join(OUT, file), `﻿${csv(list)}`, 'utf8');
// the same words as one list, to paste into Tools > Shared library > Negative keyword lists
writeFileSync(join(OUT, 'negative-keywords.txt'), `${negatives.map((n) => `"${n}"`).join('\n')}\n`, 'utf8');

// the assets as a plain list, to enter once in Google Ads (Assets), and a preview of how the ads look
if (assets) {
  const L = [];
  L.push('ASSETS FOR GOOGLE ADS (enter in Google Ads > Campaigns > Assets)', '');
  L.push('CALL (account level)', `  ${assets.phone}`, '');
  L.push('CALLOUTS (account level, up to 25 characters each)', ...assets.callouts.map((c) => `  ${c}`), '');
  assets.snippets.forEach((sn) => L.push(`STRUCTURED SNIPPET (account level), header: ${sn.header}`, ...sn.values.map((v) => `  ${v}`), ''));
  L.push('SITELINKS (account level)', ...assets.sitelinks.account.flatMap((l) => [`  ${l.text}  ->  ${site}${l.url}`, ...l.lines.map((t) => `      ${t}`)]), '');
  L.push(`SITELINKS (campaign: ${campaignName(company)} only)`, ...assets.sitelinks.company.flatMap((l) => [`  ${l.text}  ->  ${site}${l.url}`, ...l.lines.map((t) => `      ${t}`)]), '');
  writeFileSync(join(OUT, 'assets.txt'), `${L.join('\n')}\n`, 'utf8');

  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const byGroup = Object.fromEntries(rows.ads.map((a) => [a['Ad group'], a]));
  const kwOf = (group) => (rows.keywords.find((k) => k['Ad group'] === group) || {}).Keyword || '';
  const ad = (group, sitelinks) => {
    const a = byGroup[group];
    const hl = Array.from({ length: 15 }, (_, i) => a[`Headline ${i + 1}`]).filter(Boolean);
    const ds = Array.from({ length: 4 }, (_, i) => a[`Description ${i + 1}`]).filter(Boolean);
    const crumbs = [a['Path 1'], a['Path 2']].filter(Boolean).map((x) => ` › ${esc(x)}`).join('');
    return `<section class="q"><div class="search"><span>${esc(kwOf(group))}</span></div>
  <article class="ad">
    <p class="sp">Sponsored</p>
    <div class="who"><span class="fav">H</span><div><b>Hamdaz Technologies</b><small>https://hamdaz.com${crumbs}</small></div></div>
    <h3>${hl.slice(0, 3).map(esc).join(' | ')}</h3>
    <p class="desc">${ds.slice(0, 2).map(esc).join(' ')}</p>
    <p class="ext">${assets.callouts.slice(0, 4).map(esc).join(' · ')}</p>
    <p class="ext"><span>${esc(assets.snippets[0].header)}:</span> ${assets.snippets[0].values.map(esc).join(', ')}</p>
    <div class="links">${sitelinks.slice(0, 4).map((l) => `<div><a>${esc(l.text)}</a><small>${l.lines.map(esc).join('<br>')}</small></div>`).join('')}</div>
    <p class="call">📞 ${esc(assets.phone)}</p>
  </article>
  <details><summary>All ${hl.length} headlines and ${ds.length} descriptions Google mixes</summary><ul>${hl.map((h) => `<li>${esc(h)} <i>${h.length}</i></li>`).join('')}</ul><ul>${ds.map((d) => `<li>${esc(d)} <i>${d.length}</i></li>`).join('')}</ul><p>Opens: ${esc(a['Final URL'])}</p></details>
</section>`;
  };
  const pick = ['What We Do', 'Hamdaz (brand)', ...['cctv-video-surveillance', 'managed-ai-secops', 'meeting-rooms-video-conferencing', 'erp-solutions'].map((x) => serviceBySlug[x].title)];
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Ad preview – Hamdaz</title><style>
:root{--bg:#fff;--fg:#202124;--muted:#4d5156;--link:#1a0dab;--line:#dadce0;--chip:#f1f3f4}
@media (prefers-color-scheme:dark){:root{--bg:#202124;--fg:#e8eaed;--muted:#bdc1c6;--link:#8ab4f8;--line:#3c4043;--chip:#303134}}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.58 Arial,Helvetica,sans-serif}
main{max-width:720px;margin:0 auto;padding:28px 16px 60px}h1{font-size:22px;margin:0 0 6px}main>p{color:var(--muted);margin:0 0 28px}
.q{padding:22px 0;border-top:1px solid var(--line)}.search{display:inline-block;padding:10px 20px;border:1px solid var(--line);border-radius:24px;margin-bottom:16px;min-width:60%}
.search span::before{content:"🔍 ";}.sp{margin:0 0 6px;font-weight:700;font-size:13px}.who{display:flex;gap:10px;align-items:center}.who div{display:grid;line-height:1.3}
.who small{color:var(--muted);font-size:12px}.fav{width:26px;height:26px;border-radius:50%;background:#eb4b96;color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px}
h3{color:var(--link);font-weight:400;font-size:20px;line-height:1.3;margin:8px 0 4px}.desc{color:var(--muted);margin:0 0 4px}.ext{color:var(--muted);margin:0 0 2px;font-size:13.5px}.ext span{color:var(--fg)}
.links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 24px;margin:12px 0 4px}.links a{color:var(--link);font-size:16px;display:block}.links small{color:var(--muted);font-size:13px}
.call{color:var(--link);margin:8px 0 0}details{margin-top:14px;font-size:13px;color:var(--muted)}summary{cursor:pointer}details ul{columns:2;padding-left:18px}details i{opacity:.6;font-style:normal;font-size:11px}
@media(max-width:560px){.links{grid-template-columns:1fr}details ul{columns:1}h3{font-size:18px}}
</style></head><body><main><h1>How the Hamdaz ads would look</h1>
<p>A preview made from docs/google-ads/plan.mjs, not a real Google page. Google picks which headlines, extensions and sitelinks to show for each search, so the real ads vary; on phones they are shorter.</p>
${pick.map((g) => ad(g, g === 'What We Do' ? assets.sitelinks.company : assets.sitelinks.account)).join('\n')}
</main></body></html>`;
  writeFileSync(join(OUT, '..', 'preview.html'), html, 'utf8');
}

const total = rows.campaigns.reduce((s, c) => s + c.Budget, 0);
console.log(`${rows.campaigns.length} campaigns (AED ${total}/day), ${rows.adGroups.length} ad groups, ${rows.keywords.length} keywords, ${rows.ads.length} ads -> docs/google-ads/import/`);
