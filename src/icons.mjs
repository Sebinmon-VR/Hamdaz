// Inlines SVG icons at build time so pages never wait on an icon font or CDN.
// Line icons: Lucide (ISC licence) · Brand marks: Simple Icons (CC0).
import { readFileSync } from 'node:fs';

const cache = new Map();
const dir = new URL('./icons/', import.meta.url);

export function icon(name, cls = 'i') {
  if (!cache.has(name)) {
    let svg = readFileSync(new URL(`${name}.svg`, dir), 'utf8');
    svg = svg
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<title>[\s\S]*?<\/title>/g, '')
      // strip sizing/class from the root <svg> tag only (child <rect>s need their width/height)
      .replace(/<svg[^>]*>/, (tag) => tag.replace(/\s(class|width|height|role)="[^"]*"/g, ''))
      .replace(/stroke-width="2"/, 'stroke-width="1.5"')
      .replace(/\n\s*/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
    // Simple Icons are solid shapes
    if (!/stroke=/.test(svg)) svg = svg.replace('<svg', '<svg fill="currentColor"');
    cache.set(name, svg);
  }
  return cache.get(name).replace('<svg', `<svg class="${cls} i-${name}" aria-hidden="true" focusable="false"`);
}
