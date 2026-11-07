// SEO page content for the service pages (/service/<slug>/), the area pages (/services/<id>/) and the
// insight articles (/insights/<slug>/). Written from the 2026 company profiles and data.mjs.
// Each file holds { areas, services, articles }; this merges them and checks nothing is missing.
import { services as allServices, categories } from '../data.mjs';
import * as av from './av.mjs';
import * as elv from './elv.mjs';
import * as cyber from './cyber.mjs';
import * as aiCloud from './ai-cloud.mjs';
import * as more from './more.mjs';
import * as software from './software.mjs';

const files = [av, elv, cyber, aiCloud, more, software];

export const areaSeo = Object.assign({}, ...files.map((f) => f.areas));
delete areaSeo['apps-business']; // replaced by 'software-development' (software.mjs)
export const serviceSeo = Object.assign({}, ...files.map((f) => f.services));
export const articles = files.flatMap((f) => f.articles || []).sort((a, b) => (a.date < b.date ? 1 : -1));

const missing = [
  ...allServices.filter((s) => !serviceSeo[s.slug]).map((s) => `service ${s.slug}`),
  ...categories.filter((c) => !areaSeo[c.id]).map((c) => `area ${c.id}`),
];
if (missing.length) throw new Error(`SEO content missing for: ${missing.join(', ')}`);
