import * as THREE from 'three';

/*
 * Procedural textures: surface detail (wood, fabric, stone, plaster) with matching normal
 * maps, and the nature prints that hang on the walls. Everything is drawn on canvases at
 * load time, so the app needs no image downloads.
 */

export type Ctx = CanvasRenderingContext2D;

/** Deterministic random numbers, so every load looks the same. */
export function rng(seed: number) {
  let s = Math.max(1, Math.floor(seed) % 2147483647);
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function canvas(w: number, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, ctx: c.getContext('2d', { willReadFrequently: true })! };
}

export function toTexture(c: HTMLCanvasElement, { color = true, repeat = true } = {}) {
  const tex = new THREE.CanvasTexture(c);
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Tileable value noise with octaves, returned as values in 0..1. */
export function fbm(size: number, { seed = 1, cells = 8, octaves = 4, stretchX = 1, stretchY = 1 } = {}) {
  const out = new Float32Array(size * size);
  let amp = 1;
  let total = 0;
  for (let o = 0; o < octaves; o++) {
    const cx = Math.max(1, Math.round(cells * stretchX * 2 ** o));
    const cy = Math.max(1, Math.round(cells * stretchY * 2 ** o));
    const rand = rng(seed * 101 + o * 7919);
    const grid = new Float32Array(cx * cy).map(() => rand());
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * cy;
      const y0 = Math.floor(gy);
      const ty = gy - y0;
      const sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * cx;
        const x0 = Math.floor(gx);
        const tx = gx - x0;
        const sx = tx * tx * (3 - 2 * tx);
        const a = grid[(y0 % cy) * cx + (x0 % cx)];
        const b = grid[(y0 % cy) * cx + ((x0 + 1) % cx)];
        const c = grid[((y0 + 1) % cy) * cx + (x0 % cx)];
        const d = grid[((y0 + 1) % cy) * cx + ((x0 + 1) % cx)];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

/** Turns a height field (0..1) into a tangent-space normal map, wrapping at the edges. */
export function normalMap(height: Float32Array, size: number, strength: number) {
  const { c, ctx } = canvas(size);
  const img = ctx.createImageData(size, size);
  const h = (x: number, y: number) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, { color: false });
}

/** A grey-scale map from a height field, for roughness. */
export function greyMap(values: Float32Array, size: number, lo: number, hi: number) {
  const { c, ctx } = canvas(size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < values.length; i++) {
    const v = (lo + (hi - lo) * values[i]) * 255;
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c, { color: false });
}

/** Colours a height field between two colours. */
export function tintMap(values: Float32Array, size: number, dark: [number, number, number], light: [number, number, number]) {
  const { c, ctx } = canvas(size);
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    for (let k = 0; k < 3; k++) img.data[i * 4 + k] = dark[k] + (light[k] - dark[k]) * v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return toTexture(c);
}

export interface SurfaceMaps {
  map?: THREE.Texture;
  normalMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
}

/** Wood grain running along v: long stretched noise plus fine pores. 1 tile = 1 m. */
export function woodGrain(seed: number, base: [number, number, number], dark: [number, number, number], size = 512): SurfaceMaps {
  const grain = fbm(size, { seed, cells: 3, octaves: 5, stretchX: 6, stretchY: 0.35 });
  const pores = fbm(size, { seed: seed + 3, cells: 40, octaves: 2, stretchX: 2, stretchY: 0.2 });
  const v = new Float32Array(size * size);
  for (let i = 0; i < v.length; i++) {
    const rings = 0.5 + 0.5 * Math.sin(grain[i] * 38);
    v[i] = Math.min(1, Math.max(0, 0.55 * rings + 0.25 * grain[i] + 0.2 * pores[i]));
  }
  return {
    map: tintMap(v, size, dark, base),
    normalMap: normalMap(pores.map((p, i) => p * 0.6 + v[i] * 0.4), size, 3),
    roughnessMap: greyMap(v.map((x) => 1 - x), size, 0.45, 0.7),
  };
}

/** Woven or knotted textiles. */
export function fabricMaps(kind: 'boucle' | 'linen' | 'wool' | 'knit', seed = 1, size = 256): SurfaceMaps {
  let h: Float32Array;
  if (kind === 'linen') {
    const warp = fbm(size, { seed, cells: 64, octaves: 1, stretchX: 1, stretchY: 0.05 });
    const weft = fbm(size, { seed: seed + 1, cells: 64, octaves: 1, stretchX: 0.05, stretchY: 1 });
    const slub = fbm(size, { seed: seed + 2, cells: 6, octaves: 3 });
    h = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const i = y * size + x;
        const weave = (Math.sin((x / size) * Math.PI * 2 * 96) * Math.sin((y / size) * Math.PI * 2 * 96) + 1) / 2;
        h[i] = 0.45 * weave + 0.2 * warp[i] + 0.2 * weft[i] + 0.15 * slub[i];
      }
    }
  } else if (kind === 'knit') {
    h = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const u = (x / size) * 24;
        const v = (y / size) * 32;
        const row = Math.floor(v);
        const lean = row % 2 ? 1 : -1;
        h[y * size + x] = Math.pow(Math.abs(Math.sin(Math.PI * (u + lean * (v - row) * 0.5))), 0.6);
      }
    }
  } else {
    h = fbm(size, { seed, cells: kind === 'boucle' ? 28 : 18, octaves: 3 });
    if (kind === 'boucle') h = h.map((x) => Math.pow(x, 1.6));
  }
  return {
    normalMap: normalMap(h, size, kind === 'boucle' ? 7 : kind === 'wool' ? 5 : 3),
    roughnessMap: greyMap(h, size, 0.85, 1),
  };
}

/** Honed stone with soft veins. */
export function stoneMaps(seed: number, base: [number, number, number], vein: [number, number, number], size = 512): SurfaceMaps {
  const n = fbm(size, { seed, cells: 4, octaves: 6 });
  const v = new Float32Array(size * size);
  for (let i = 0; i < v.length; i++) {
    const veins = Math.pow(1 - Math.abs(Math.sin(n[i] * 14)), 10);
    v[i] = Math.min(1, n[i] * 0.4 + 0.6 - veins * 0.6);
  }
  return {
    map: tintMap(v, size, vein, base),
    normalMap: normalMap(n, size, 0.6),
    roughnessMap: greyMap(n, size, 0.35, 0.55),
  };
}

/** Faint unevenness of painted plaster; mostly visible in grazing light. */
export function plasterMaps(seed = 4, size = 256): SurfaceMaps {
  const n = fbm(size, { seed, cells: 10, octaves: 5 });
  return { normalMap: normalMap(n, size, 1.2), roughnessMap: greyMap(n, size, 0.82, 0.95) };
}

/** Leaves for plants: dappled greens with a waxy normal. */
export function leafMaps(seed: number, dark: [number, number, number], light: [number, number, number], size = 256): SurfaceMaps {
  const n = fbm(size, { seed, cells: 16, octaves: 3 });
  return { map: tintMap(n, size, dark, light), normalMap: normalMap(n, size, 4), roughnessMap: greyMap(n, size, 0.5, 0.75) };
}

/* ---------------------------------------------------------------- prints */

/** One ridge line by midpoint displacement, as heights in 0..1 for each x pixel. */
function ridge(w: number, rand: () => number, rough: number, base: number, amp: number) {
  let pts = [base + (rand() - 0.5) * amp, base + (rand() - 0.5) * amp];
  let disp = amp;
  while (pts.length < w) {
    const next: number[] = [];
    for (let i = 0; i < pts.length - 1; i++) next.push(pts[i], (pts[i] + pts[i + 1]) / 2 + (rand() - 0.5) * disp);
    next.push(pts[pts.length - 1]);
    pts = next;
    disp *= rough;
  }
  return Array.from({ length: w }, (_, x) => pts[Math.floor((x / w) * pts.length)]);
}

function paperGrain(ctx: Ctx, w: number, h: number, seed: number, alpha = 0.05) {
  const rand = rng(seed);
  for (let i = 0; i < (w * h) / 40; i++) {
    ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${alpha})` : `rgba(0,0,0,${alpha})`;
    ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
  }
}

const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const rgb = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Black and white alpine panorama with snow on the high ridges. */
export function mountainPrint(w = 1536, h = 1024, seed = 21) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#c9ccce');
  sky.addColorStop(0.6, '#eceeee');
  sky.addColorStop(1, '#f4f4f2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const layers = [
    { base: 0.42, amp: 0.5, rough: 0.56, tone: [170, 173, 176], snow: true },
    { base: 0.5, amp: 0.38, rough: 0.55, tone: [128, 132, 136], snow: true },
    { base: 0.62, amp: 0.22, rough: 0.6, tone: [92, 95, 98], snow: false },
    { base: 0.75, amp: 0.14, rough: 0.62, tone: [58, 60, 62], snow: false },
    { base: 0.88, amp: 0.08, rough: 0.65, tone: [30, 31, 32], snow: false },
  ];
  for (const L of layers) {
    const line = ridge(w, rand, L.rough, L.base, L.amp);
    // rock face with vertical striations
    for (let x = 0; x < w; x++) {
      const top = line[x] * h;
      const g = ctx.createLinearGradient(0, top, 0, h);
      g.addColorStop(0, rgb(L.tone));
      g.addColorStop(1, rgb(mix(L.tone, [240, 240, 240], 0.25)));
      ctx.fillStyle = g;
      ctx.fillRect(x, top, 1, h - top);
      if (L.snow) {
        // snow lies above the snow line and thins out on steep, shaded flanks
        const snowLine = (L.base - L.amp * 0.08) * h;
        if (top < snowLine) {
          const slope = (line[Math.min(w - 1, x + 4)] - line[Math.max(0, x - 4)]) * h;
          const depth = (snowLine - top) * (0.55 + 0.25 * Math.sin(x * 0.045 + L.base * 40) + 0.1 * Math.sin(x * 0.21));
          ctx.fillStyle = slope < 0 ? 'rgba(214,218,222,0.95)' : 'rgba(248,248,247,0.95)';
          ctx.fillRect(x, top, 1, Math.max(0, depth));
        }
      }
    }
    // valley fog over each layer
    const fogTop = (L.base + L.amp * 0.15) * h;
    const fog = ctx.createLinearGradient(0, fogTop, 0, fogTop + h * 0.12);
    fog.addColorStop(0, 'rgba(240,241,241,0)');
    fog.addColorStop(1, 'rgba(240,241,241,0.45)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, fogTop, w, h * 0.12);
  }
  paperGrain(ctx, w, h, seed, 0.04);
  return c;
}

/** A spruce silhouette with ragged, drooping branch tiers, drawn as one jagged polygon. */
function spruce(ctx: Ctx, x: number, base: number, height: number, width: number, rand: () => number) {
  const steps = Math.max(24, Math.round(height / 6));
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 at the top
    const y = base - height + t * height * 0.94;
    const env = (width / 2) * Math.pow(t, 0.85) * (0.82 + 0.18 * Math.sin(t * 40 + x));
    const jag = i % 2 ? 0.55 + rand() * 0.2 : 0.9 + rand() * 0.25;
    right.push([x + env * jag, y + (i % 2 ? 0 : height * 0.012)]);
    const jag2 = i % 2 ? 0.9 + rand() * 0.25 : 0.55 + rand() * 0.2;
    left.push([x - env * jag2, y + (i % 2 ? height * 0.012 : 0)]);
  }
  ctx.beginPath();
  ctx.moveTo(x, base - height);
  for (const [px, py] of right) ctx.lineTo(px, py);
  ctx.lineTo(x + width * 0.03, base);
  ctx.lineTo(x - width * 0.03, base);
  for (const [px, py] of left.reverse()) ctx.lineTo(px, py);
  ctx.closePath();
  ctx.fill();
}

/** Misty spruce forest in layered greens: the bedroom mural and forest prints. */
export function forestPrint(w = 2048, h = 1200, seed = 5, { moody = true } = {}) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, moody ? '#e2e6dc' : '#eaeee4');
  sky.addColorStop(0.55, moody ? '#cdd6c9' : '#dbe3d5');
  sky.addColorStop(1, moody ? '#b4c2b2' : '#c7d3c1');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const far = [190, 201, 187];
  const near = moody ? [26, 46, 36] : [40, 66, 50];
  const layers = 7;
  for (let l = 0; l < layers; l++) {
    const t = l / (layers - 1);
    const colour = mix(far, near, Math.pow(t, 1.5));
    ctx.filter = l < 3 ? `blur(${(3 - l) * 1.5}px)` : 'none';
    const ground = h * (0.5 + 0.075 * l);
    const treeH = h * (0.16 + 0.11 * l);
    const spacing = w / (46 - l * 5);
    for (let x = -spacing; x < w + spacing; x += spacing * (0.45 + rand() * 0.75)) {
      const k = 0.92 + rand() * 0.16;
      ctx.fillStyle = rgb(colour.map((v) => Math.min(255, v * k)));
      spruce(ctx, x, ground + rand() * h * 0.04, treeH * (0.7 + rand() * 0.55), treeH * (0.26 + rand() * 0.08), rand);
    }
    ctx.fillStyle = rgb(colour);
    ctx.fillRect(0, ground, w, h - ground);
    ctx.filter = 'none';
    // mist settles between the rows of trees
    const mist = ctx.createLinearGradient(0, ground - treeH * 0.6, 0, ground + h * 0.08);
    mist.addColorStop(0, 'rgba(226,232,222,0)');
    mist.addColorStop(0.7, `rgba(226,232,222,${0.5 - t * 0.35})`);
    mist.addColorStop(1, `rgba(226,232,222,${0.6 - t * 0.4})`);
    ctx.fillStyle = mist;
    ctx.fillRect(0, ground - treeH * 0.6, w, treeH * 0.6 + h * 0.08);
  }
  // morning light falling through the canopy
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + rand() * 0.8);
    const g = ctx.createLinearGradient(x, 0, x - w * 0.18, h);
    g.addColorStop(0, 'rgba(255,248,220,0.16)');
    g.addColorStop(1, 'rgba(255,248,220,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + w * 0.03, 0);
    ctx.lineTo(x - w * 0.14, h);
    ctx.lineTo(x - w * 0.22, h);
    ctx.fill();
  }
  ctx.globalCompositeOperation = 'source-over';
  paperGrain(ctx, w, h, seed, 0.03);
  return c;
}

/** Still alpine lake with the mountains mirrored, in blue-grey. */
export function lakePrint(w = 1200, h = 900, seed = 9) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  const horizon = h * 0.55;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#b9c8d2');
  sky.addColorStop(1, '#e8eef0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);
  const layers = [
    { base: 0.62, amp: 0.55, tone: [150, 168, 182] },
    { base: 0.82, amp: 0.3, tone: [104, 126, 140] },
    { base: 0.95, amp: 0.1, tone: [62, 82, 86] },
  ];
  for (const L of layers) {
    const line = ridge(w, rand, 0.55, L.base, L.amp);
    ctx.fillStyle = rgb(L.tone);
    for (let x = 0; x < w; x++) {
      const top = line[x] * horizon;
      ctx.fillRect(x, top, 1, horizon - top + 1);
      if (L === layers[0] && top < horizon * 0.42) {
        ctx.fillStyle = 'rgba(245,248,250,0.9)';
        ctx.fillRect(x, top, 1, (horizon * 0.42 - top) * 0.7);
        ctx.fillStyle = rgb(L.tone);
      }
    }
  }
  // reflection
  ctx.save();
  ctx.translate(0, horizon * 2);
  ctx.scale(1, -1);
  ctx.globalAlpha = 0.55;
  ctx.drawImage(c, 0, 0, w, horizon, 0, 0, w, horizon);
  ctx.restore();
  const water = ctx.createLinearGradient(0, horizon, 0, h);
  water.addColorStop(0, 'rgba(150,175,190,0.35)');
  water.addColorStop(1, 'rgba(80,105,120,0.6)');
  ctx.fillStyle = water;
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 60; i++) ctx.fillRect(rand() * w, horizon + rand() * (h - horizon), 30 + rand() * 120, 1);
  paperGrain(ctx, w, h, seed, 0.03);
  return c;
}

/** Pressed wildflower on cream paper; three seeds give a matching series. */
export function botanicalPrint(seed: number, w = 600, h = 800) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  ctx.fillStyle = '#f2ecdf';
  ctx.fillRect(0, 0, w, h);
  const blossom = [
    [214, 168, 72],
    [196, 92, 74],
    [236, 226, 196],
  ][seed % 3];
  ctx.lineCap = 'round';
  for (let s = 0; s < 3; s++) {
    let x = w * (0.4 + rand() * 0.2);
    let y = h * 0.9;
    const top = h * (0.2 + rand() * 0.2);
    ctx.strokeStyle = '#6f7d55';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const lean = (rand() - 0.5) * w * 0.35;
    const steps = 30;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const nx = w * 0.5 + lean * t * t + Math.sin(t * 5 + s) * 6 + (s - 1) * 20;
      const ny = y - (h * 0.9 - top) / steps;
      ctx.lineTo(nx, ny);
      if (i % 6 === 3) {
        // leaf
        ctx.save();
        ctx.fillStyle = 'rgba(112,128,84,0.9)';
        ctx.translate(nx, ny);
        ctx.rotate((i % 12 === 3 ? 1 : -1) * (0.6 + rand() * 0.4));
        ctx.beginPath();
        ctx.ellipse(18, 0, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      x = nx;
      y = ny;
    }
    ctx.stroke();
    for (let p = 0; p < 7; p++) {
      const a = (p / 7) * Math.PI * 2;
      ctx.fillStyle = rgb(mix(blossom, [255, 255, 255], rand() * 0.25), 0.9);
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * 12, y + Math.sin(a) * 12, 13, 6, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#7a5a2e';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(80,70,60,0.6)';
  ctx.font = 'italic 18px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(['Arnica montana', 'Papaver rhoeas', 'Leucanthemum vulgare'][seed % 3], w / 2, h * 0.96);
  paperGrain(ctx, w, h, seed, 0.03);
  return c;
}

/** Birch trunks against a winter haze. */
export function birchPrint(w = 900, h = 1200, seed = 13) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#e4e6e6');
  bg.addColorStop(1, '#cfd3d2');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  for (let layer = 0; layer < 3; layer++) {
    const n = 7 - layer * 2;
    for (let i = 0; i < n; i++) {
      const x = rand() * w;
      const tw = (12 + layer * 18) * (0.8 + rand() * 0.5);
      const shade = 236 - layer * 6;
      ctx.fillStyle = `rgba(${shade},${shade},${shade - 4},${0.5 + layer * 0.25})`;
      ctx.fillRect(x, 0, tw, h);
      for (let m = 0; m < 30 + layer * 20; m++) {
        ctx.fillStyle = `rgba(40,40,38,${0.25 + layer * 0.3})`;
        ctx.fillRect(x + rand() * tw * 0.3, rand() * h, tw * (0.3 + rand() * 0.6), 2 + rand() * 5);
      }
    }
  }
  paperGrain(ctx, w, h, seed, 0.03);
  return c;
}

/** The Rhine at low water: smooth pebbles under moving water, in green-blue. */
export function riverPrint(w = 1200, h = 800, seed = 17) {
  const { c, ctx } = canvas(w, h);
  const rand = rng(seed);
  ctx.fillStyle = '#5f7a78';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 420; i++) {
    const g = 110 + rand() * 90;
    ctx.fillStyle = `rgb(${g - 20},${g},${g - 6})`;
    ctx.beginPath();
    ctx.ellipse(rand() * w, rand() * h, 10 + rand() * 40, 7 + rand() * 25, rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(230,245,242,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const y = rand() * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 40) ctx.lineTo(x, y + Math.sin(x / 90 + i) * 12);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(70,110,108,0.35)';
  ctx.fillRect(0, 0, w, h);
  return c;
}

/**
 * Oiled oak parquet: 20 cm planks of random length in a 2 x 2 m tile, each plank with its
 * own grain and tone, bevelled joints in the normal map and slightly glossier latewood.
 */
export function parquetMaps(size = 1024, metres = 2): SurfaceMaps {
  const rand = rng(7);
  const cols = Math.round(metres / 0.2);
  const plankPx = size / cols;
  const grain = fbm(size, { seed: 71, cells: 2, octaves: 5, stretchX: 14, stretchY: 0.3 });
  const pores = fbm(size, { seed: 73, cells: 48, octaves: 2, stretchX: 3, stretchY: 0.15 });
  const colour = new Uint8ClampedArray(size * size * 4);
  const height = new Float32Array(size * size);
  const rough = new Float32Array(size * size);
  for (let col = 0; col < cols; col++) {
    // planks along this column: [start, end) in pixels, wrapping
    const joints: number[] = [];
    let y = rand() * size;
    const start = y;
    while (y < start + size) {
      joints.push(y % size);
      y += size * (0.45 + rand() * 0.45);
    }
    joints.sort((a, b) => a - b);
    const tones = joints.map(() => 0.9 + rand() * 0.16);
    const shifts = joints.map(() => Math.floor(rand() * size));
    for (let py = 0; py < size; py++) {
      let k = joints.length - 1;
      for (let j = 0; j < joints.length; j++) if (py >= joints[j]) k = j;
      const fromJoint = Math.min(...joints.map((jy) => Math.min(Math.abs(py - jy), size - Math.abs(py - jy))));
      for (let px = Math.floor(col * plankPx); px < Math.floor((col + 1) * plankPx); px++) {
        const i = py * size + px;
        const gi = ((py + shifts[k]) % size) * size + ((px + shifts[k] * 7) % size);
        const rings = 0.5 + 0.5 * Math.sin(grain[gi] * 46 + px * 0.02);
        const g = 0.62 * rings + 0.38 * pores[gi];
        const t = tones[k];
        const edge = Math.min(px - col * plankPx, (col + 1) * plankPx - px, fromJoint);
        const bevel = edge < 1.5 ? 0.25 : edge < 3 ? 0.7 : 1;
        colour[i * 4] = (196 - 34 * g) * t * (0.75 + 0.25 * bevel);
        colour[i * 4 + 1] = (164 - 36 * g) * t * (0.75 + 0.25 * bevel);
        colour[i * 4 + 2] = (120 - 34 * g) * t * (0.75 + 0.25 * bevel);
        colour[i * 4 + 3] = 255;
        height[i] = bevel * (0.8 + 0.2 * pores[gi]);
        rough[i] = 0.25 + 0.5 * g;
      }
    }
  }
  const { c, ctx } = canvas(size);
  ctx.putImageData(new ImageData(colour, size, size), 0, 0);
  return { map: toTexture(c), normalMap: normalMap(height, size, 2.5), roughnessMap: greyMap(rough, size, 0.35, 0.7) };
}
