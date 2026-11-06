// Point outlines of each element, in the element's own units, for the particle transitions on the home
// page (stage.js): one element breaks up into these points, they fly, and they settle as the next one.
import * as THREE from '../../vendor/three.module.min.js';
import { CHIP, circuit, along, rng } from '../circuit.js';
import { networkGraph } from './network.js';
import { LAYERS, SIZE, levelY } from './layers.js';

function chip(n, rand) {
  const { half, height: H, pinLen, pins, pinGap } = CHIP;
  const { chip: traces } = circuit();
  const SIDES = [(o, l) => [o, l], (o, l) => [-o, -l], (o, l) => [-l, o], (o, l) => [l, -o]];
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rand();
    let p;
    if (r < 0.2) {
      const side = SIDES[Math.floor(rand() * 4)];
      const [x, z] = side(half, (rand() * 2 - 1) * half);
      p = [x, H, z];
    } else if (r < 0.38) {
      p = [(rand() - 0.5) * 0.88, H + 0.002, (rand() - 0.5) * 0.88];
    } else if (r < 0.46) {
      const side = SIDES[Math.floor(rand() * 4)];
      const [x, z] = side(half + rand() * pinLen, (Math.floor(rand() * pins) - (pins - 1) / 2) * pinGap);
      p = [x, 0.007, z];
    } else {
      const t = traces[Math.floor(rand() * traces.length)];
      const [x, z] = along(t, Math.pow(rand(), 1.3) * Math.min(t.total, 2.6));
      p = [x, 0.002, z];
    }
    out.set(p, i * 3);
  }
  return out;
}

function network(n, rand) {
  const { nodes, pairs } = networkGraph();
  const out = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    if (rand() < 0.35) nodes[Math.floor(rand() * nodes.length)].toArray(out, i * 3);
    else {
      const [a, b] = pairs[Math.floor(rand() * pairs.length)];
      v.lerpVectors(nodes[a], nodes[b], rand()).toArray(out, i * 3);
    }
  }
  return out;
}

function layers(n, rand) {
  const out = new Float32Array(n * 3);
  const h = SIZE / 2;
  for (let i = 0; i < n; i++) {
    const r = rand();
    const y = levelY(Math.floor(rand() * LAYERS.length));
    if (r < 0.55) {
      // platform outlines
      const u = (rand() * 2 - 1) * h;
      const e = Math.floor(rand() * 4);
      const [x, z] = e === 0 ? [u, -h] : e === 1 ? [u, h] : e === 2 ? [-h, u] : [h, u];
      out.set([x, y, z], i * 3);
    } else if (r < 0.85) {
      // the platform surface
      out.set([(rand() * 2 - 1) * h * 0.85, y + 0.04, (rand() * 2 - 1) * h * 0.85], i * 3);
    } else {
      // the beams between them
      const b = [[-0.7, -0.7], [0.7, -0.7], [0.7, 0.7], [-0.7, 0.7], [0, 0]][Math.floor(rand() * 5)];
      out.set([b[0], levelY(0) + rand() * (levelY(LAYERS.length - 1) - levelY(0) + 0.5), b[1]], i * 3);
    }
  }
  return out;
}

// span: the ribbons' half-width (it depends on the screen's shape)
function waves(n, rand, span = 4) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = (rand() * 2 - 1) * span;
    const k = rand() - 0.5;
    const c = 0.12 + 0.55 * Math.sin(x * 0.55) + 0.18 * Math.sin(x * 1.3);
    out.set([x, c + k * (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(x * 0.8))), k * 0.3], i * 3);
  }
  return out;
}

function beacon(n, rand) {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.62) {
      const ring = 0.25 + Math.floor(rand() * 5) * 0.55;
      const a = rand() * Math.PI * 2;
      out.set([Math.cos(a) * ring, 0.003, Math.sin(a) * ring], i * 3);
    } else if (r < 0.92) {
      out.set([(rand() - 0.5) * 0.08, rand() * 2.4, (rand() - 0.5) * 0.08], i * 3);
    } else {
      const a = rand() * Math.PI * 2;
      const d = rand() * 0.12;
      out.set([Math.cos(a) * d, 0.06 + rand() * 0.05, Math.sin(a) * d], i * 3);
    }
  }
  return out;
}

// a sphere (the home hero's Earth): points spread evenly over its surface
function globe(n, rand) {
  const out = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - ((i + rand()) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    out.set([Math.cos(i * golden) * r * 1.01, y * 1.01, Math.sin(i * golden) * r * 1.01], i * 3);
  }
  return out;
}

const SHAPES = { chip, network, layers, waves, beacon, globe };
export function elementPoints(name, n, opts = {}) {
  const make = SHAPES[name] || chip;
  return make(n, rng(400 + name.length * 13), opts.span);
}
