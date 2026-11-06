// Hamdaz: geometry of the AI processor in the first section, shared by earth.js (the hero scene)
// and heroes/framings.js.
// Units: the chip is 1 x 1, centred at the origin, lying on the board plane (x, z) with +y up.

export const CHIP = { half: 0.5, height: 0.09, pinLen: 0.13, pins: 10, pinGap: 0.082 };
export const BOARD_R = 6.2; // the board fades out before this radius
const DEG = Math.PI / 180;

// Camera framings of the chip (earth.js camera: fov 30, z 6).
// Framings: rx tilts the board towards the camera, ry spins it. Values depend on the viewport aspect.
export function presets(aspect) {
  const narrow = aspect < 0.9;
  const halfH = 6 * Math.tan(15 * DEG);
  const halfW = halfH * aspect;
  return {
    // low view across the board, the chip on the horizon
    low: narrow
      ? { x: 0, y: 0.2, s: 1.35, rx: 0.42, ry: -0.62, labels: 0 }
      : { x: halfW * 0.18, y: 0.34, s: 1.5, rx: 0.4, ry: -0.62, labels: 0 },
    // whole chip from above, beside the text (labels only where there is room for them)
    top: narrow
      ? { x: 0, y: -0.62, s: 0.74, rx: 0.92, ry: -0.78, labels: 0 }
      : { x: halfW * 0.42, y: -0.08, s: 1.02, rx: 0.95, ry: -0.78, labels: 1 },
    page: narrow
      ? { x: 0.25, y: -halfH * 0.62, s: 0.9, rx: 0.78, ry: -0.7, labels: 0 }
      : { x: halfW * 0.56, y: -0.12, s: 1.2, rx: 0.82, ry: -0.7, labels: 0 },
  };
}


// Seeded random so every visit draws the same board.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// side frame (o = outward, l = lateral) -> board (x, z)
const SIDES = [
  (o, l) => [o, l], // right
  (o, l) => [-o, -l], // left
  (o, l) => [-l, o], // front (towards the viewer)
  (o, l) => [l, -o], // back
];

const withLengths = (pts) => {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, total: len[len.length - 1] };
};

// Point at distance d along a trace.
export function along(tr, d) {
  const { pts, len } = tr;
  if (d <= 0) return pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (d <= len[i]) {
      const k = (d - len[i - 1]) / (len[i] - len[i - 1] || 1);
      return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k];
    }
  }
  return pts[pts.length - 1];
}

// PCB traces, routed like a real board: out from each pin, a 45° fan-out, then straight to a via.
// Returns { chip: traces that start at a pin, field: loose traces that fill the rest of the board }.
let cached;
export function circuit() {
  if (cached) return cached;
  const rand = rng(11);
  const { half, pinLen, pins, pinGap } = CHIP;
  const chip = [];
  SIDES.forEach((map, side) => {
    for (let k = 0; k < pins; k++) {
      const l0 = (k - (pins - 1) / 2) * pinGap;
      const dir = Math.sign(l0) || 1;
      const o0 = half + pinLen;
      const o1 = o0 + 0.08 + rand() * 0.45 + (1 - Math.abs(l0) / 0.4) * 0.2;
      const fan = Math.abs(l0) * (1.2 + rand() * 2.2) + rand() * 0.35;
      const o2 = o1 + fan;
      const l2 = l0 + dir * fan;
      const short = rand() < 0.3;
      const o3 = short ? o2 + 0.2 + rand() * 0.7 : o2 + 1.2 + rand() * 3.2;
      const pts = [[o0, l0], [o1, l0], [o2, l2], [o3, l2]];
      // some long traces jog sideways once more on their way out
      if (!short && rand() < 0.5) {
        const o4 = o3 + 0.3 + rand() * 0.6;
        const jog = dir * (0.3 + rand() * 0.6);
        pts.push([o4, l2 + jog], [o4 + 0.6 + rand() * 1.4, l2 + jog]);
      }
      chip.push({ ...withLengths(pts.map(([o, l]) => map(o, l))), side, seed: rand(), pink: rand() < 0.22 });
    }
  });

  // loose traces across the board, each two octilinear segments ending in vias
  const field = [];
  const DIRS = [[1, 0], [0.7071, 0.7071], [0, 1], [-0.7071, 0.7071], [-1, 0], [-0.7071, -0.7071], [0, -1], [0.7071, -0.7071]];
  let guard = 0;
  while (field.length < 90 && guard++ < 2000) {
    const r = 1.5 + Math.pow(rand(), 0.7) * (BOARD_R - 1.5);
    const a = rand() * Math.PI * 2;
    const p0 = [Math.cos(a) * r, Math.sin(a) * r];
    const d = Math.floor(rand() * 8);
    const turn = (d + (rand() < 0.5 ? 1 : 7)) % 8;
    const l1 = 0.3 + rand() * 1.2;
    const l2 = 0.3 + rand() * 1.4;
    const p1 = [p0[0] + DIRS[d][0] * l1, p0[1] + DIRS[d][1] * l1];
    const p2 = [p1[0] + DIRS[turn][0] * l2, p1[1] + DIRS[turn][1] * l2];
    // keep the area around the chip clear for its own fan-out
    if ([p0, p1, p2].some((p) => Math.max(Math.abs(p[0]), Math.abs(p[1])) < 1.3)) continue;
    field.push({ ...withLengths([p0, p1, p2]), seed: rand() });
  }
  cached = { chip, field };
  return cached;
}

