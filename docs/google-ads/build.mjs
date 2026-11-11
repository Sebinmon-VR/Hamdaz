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
import { site, locations, languages, shared, negatives, campaigns, adGroups } from './plan.mjs';

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
shared.headlines.forEach((h) => check('shared headline', h, LIMIT.headline));
check('shared description', shared.description, LIMIT.description);
Object.keys(adGroups).filter((s) => !serviceBySlug[s]).forEach((s) => problems.push(`ad group "${s}" is not a service on the site`));
Object.keys(adGroups).filter((s) => !categories.some((c) => c.services.includes(s))).forEach((s) => problems.push(`ad group "${s}" is in no service area`));

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

const total = rows.campaigns.reduce((s, c) => s + c.Budget, 0);
console.log(`${rows.campaigns.length} campaigns (AED ${total}/day), ${rows.adGroups.length} ad groups, ${rows.keywords.length} keywords, ${rows.ads.length} ads -> docs/google-ads/import/`);
