// Hamdaz: where each page's 3D element sits (earth.js camera: fov 30, z 6).
// The story, one element per page (the page sets it with data-element, see src/components.mjs):
//   chip    : Home        - the core: an AI processor on a circuit board
//   layers  : What We Do  - the technology stack: four glass platforms (Security, Cloud, Data, AI)
//   waves   : How We Do   - the flow: silky ribbons of light
//   globe   : Contact     - the night-side Earth with the Abu Dhabi and India offices, joined by an arc
//   spark   : 404         - the spark on its own (the frame every page switch passes through)
// Who We Are (the people network) is drawn by scenes.js.
//
// Three framings per element: start (top of the home page), end (scrolled to the end of the home hero)
// and page (inner pages). Every numeric field is interpolated between start and end while scrolling.
// x, y: position; s: scale; rx, ry: rotation; labels: label opacity. Elements may add their own fields.
import { presets as chipPresets } from '../circuit.js';

const DEG = Math.PI / 180;
const HALF_H = 6 * Math.tan(15 * DEG);

export function heroFramings(name, aspect) {
  const narrow = aspect < 0.9;
  const halfW = HALF_H * aspect;
  const still = (f) => ({ start: f, end: f, page: f }); // inner-page elements don't move with scroll
  if (name === 'layers') {
    return still(narrow ? { x: 0.15, y: -HALF_H * 0.5, s: 0.42, rx: 0.5, ry: -0.78, open: 0, labels: 0 } : { x: halfW * 0.55, y: -0.08, s: 0.66, rx: 0.5, ry: -0.78, open: 0, labels: 0 });
  }
  if (name === 'waves') {
    // span: half-width of the ribbons; shift: how much the left side fades behind the text
    return narrow
      ? { start: { x: 0, y: 0.35, s: 1, rx: 0, ry: 0, span: halfW * 1.6, shift: 0, labels: 0 }, end: { x: 0, y: -0.6, s: 1, rx: 0, ry: 0, span: halfW * 1.6, shift: 0, labels: 0 }, page: { x: 0, y: -0.2, s: 1, rx: 0, ry: 0, span: halfW * 1.6, shift: 0.3, labels: 0 } }
      : { start: { x: 0, y: 0.15, s: 1, rx: 0, ry: 0, span: halfW * 1.25, shift: 0, labels: 0 }, end: { x: 0, y: -0.05, s: 1, rx: 0, ry: 0, span: halfW * 1.25, shift: 1, labels: 1 }, page: { x: 0, y: -0.1, s: 1, rx: 0, ry: 0, span: halfW * 1.25, shift: 0.7, labels: 0 } };
  }
  if (name === 'beacon') {
    return still(narrow ? { x: 0.25, y: -HALF_H * 0.42, s: 0.62, rx: 0.42, ry: 0, labels: 0 } : { x: halfW * 0.55, y: -0.42, s: 0.92, rx: 0.42, ry: 0, labels: 0 });
  }
  if (name === 'bloom') {
    return {
      start: narrow ? { x: 0, y: 0.1, s: 0.55, rx: 0.45, ry: 0, labels: 0 } : { x: halfW * 0.36, y: -0.15, s: 0.7, rx: 0.45, ry: 0, labels: 0 },
      end: narrow ? { x: 0, y: -0.2, s: 0.55, rx: 0.6, ry: 0.4, labels: 0 } : { x: halfW * 0.44, y: -0.05, s: 0.74, rx: 0.6, ry: 0.5, labels: 0 },
      page: { x: halfW * 0.5, y: 0, s: 0.9, rx: 0.1, ry: 0, labels: 0 },
    };
  }
  if (name === 'globe') {
    // turned so the Gulf and India face the viewer (globe.js FOCUS: 19° N, 63° E)
    const gx = 19 * DEG - 0.08;
    const gy = Math.PI / 2 - (63 + 180) * DEG;
    return still(narrow ? { x: 0.35, y: -HALF_H * 0.95, s: 1.25, rx: gx - 0.35, ry: gy + 0.1, labels: 0 } : { x: halfW * 0.68, y: -0.15, s: 1.3, rx: gx, ry: gy - 0.32, labels: 1 });
  }
  if (name === 'network') {
    return still(narrow ? { x: 0, y: -HALF_H * 0.42, s: 0.3, rx: 0, ry: 0, labels: 0 } : { x: halfW * 0.55, y: 0.02, s: 0.42, rx: 0, ry: 0, labels: 0 });
  }
  if (name === 'spark') {
    return still(narrow ? { x: 0.3, y: -HALF_H * 0.45, s: 0.7, rx: 0, ry: 0, labels: 0 } : { x: halfW * 0.56, y: 0, s: 1, rx: 0, ry: 0, labels: 0 });
  }
  const c = chipPresets(aspect);
  return { start: c.low, end: c.top, page: c.page };
}
