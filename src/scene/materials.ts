import * as THREE from 'three';
import type { FloorFinish } from '../house/types';
import type { FixtureMaterial } from '../house/fixtures';

/*
 * Procedural textures, so the app needs no image downloads. Each texture covers
 * TEXTURE_METRES x TEXTURE_METRES of floor; geometry UVs are set in metres.
 */
export const TEXTURE_METRES = 2;

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Deterministic noise so textures look the same on every load. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function parquet() {
  return canvasTexture((ctx, size) => {
    const rand = rng(7);
    const plankW = size / 10; // 20 cm planks
    for (let col = 0; col < 10; col++) {
      let y = -rand() * size;
      while (y < size) {
        const len = size * (0.5 + rand() * 0.45);
        const tone = 0.9 + rand() * 0.18;
        ctx.fillStyle = `rgb(${Math.round(200 * tone)},${Math.round(169 * tone)},${Math.round(126 * tone)})`;
        ctx.fillRect(col * plankW, y, plankW, len);
        // grain
        ctx.strokeStyle = 'rgba(120,85,50,0.10)';
        for (let g = 0; g < 7; g++) {
          const gx = col * plankW + rand() * plankW;
          ctx.beginPath();
          ctx.moveTo(gx, y);
          ctx.bezierCurveTo(gx + 4, y + len / 3, gx - 4, y + (2 * len) / 3, gx + 2, y + len);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(70,50,30,0.35)';
        ctx.fillRect(col * plankW, y, plankW, 2);
        y += len;
      }
      ctx.fillStyle = 'rgba(70,50,30,0.35)';
      ctx.fillRect(col * plankW, 0, 1.5, size);
    }
  });
}

function tiles(base: [number, number, number], tileMetres: number, joint: string, variation = 0.05) {
  return canvasTexture((ctx, size) => {
    const rand = rng(base[0] + base[1]);
    const n = Math.round(TEXTURE_METRES / tileMetres);
    const t = size / n;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const k = 1 - variation / 2 + rand() * variation;
        ctx.fillStyle = `rgb(${base.map((c) => Math.round(c * k)).join(',')})`;
        ctx.fillRect(i * t, j * t, t, t);
        for (let s = 0; s < 400; s++) {
          ctx.fillStyle = `rgba(0,0,0,${rand() * 0.04})`;
          ctx.fillRect(i * t + rand() * t, j * t + rand() * t, 2, 2);
        }
      }
    }
    ctx.strokeStyle = joint;
    ctx.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      ctx.beginPath();
      ctx.moveTo(i * t, 0);
      ctx.lineTo(i * t, size);
      ctx.moveTo(0, i * t);
      ctx.lineTo(size, i * t);
      ctx.stroke();
    }
  });
}

function speckle(base: [number, number, number], amount: number, seed: number) {
  return canvasTexture((ctx, size) => {
    const rand = rng(seed);
    ctx.fillStyle = `rgb(${base.join(',')})`;
    ctx.fillRect(0, 0, size, size);
    for (let s = 0; s < 40000; s++) {
      const d = (rand() - 0.5) * amount;
      ctx.fillStyle = d > 0 ? `rgba(255,255,255,${d})` : `rgba(0,0,0,${-d})`;
      ctx.fillRect(rand() * size, rand() * size, 2, 2);
    }
  }, 512);
}

function pebbles() {
  return canvasTexture((ctx, size) => {
    const rand = rng(11);
    ctx.fillStyle = '#6f6d68';
    ctx.fillRect(0, 0, size, size);
    for (let s = 0; s < 2600; s++) {
      const g = 110 + rand() * 90;
      ctx.fillStyle = `rgb(${g},${g - 4},${g - 10})`;
      ctx.beginPath();
      ctx.ellipse(rand() * size, rand() * size, 6 + rand() * 10, 4 + rand() * 7, rand() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

let cache: Record<string, THREE.Material> | null = null;

function build() {
  const std = (params: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(params);
  return {
    // Floors
    parquet: std({ map: parquet(), roughness: 0.55 }),
    tile: std({ map: tiles([214, 210, 202], 0.4, 'rgba(150,145,138,0.8)'), roughness: 0.35 }),
    stoneTile: std({ map: tiles([205, 199, 188], 0.6, 'rgba(160,152,140,0.7)', 0.03), roughness: 0.4 }),
    screed: std({ map: speckle([168, 166, 160], 0.12, 3), roughness: 0.9 }),
    carpet: std({ map: speckle([190, 182, 168], 0.18, 5), roughness: 1 }),
    stair: std({ map: speckle([150, 138, 124], 0.15, 9), roughness: 1 }),
    terrace: std({ map: tiles([178, 176, 170], 0.5, 'rgba(110,108,104,0.9)', 0.08), roughness: 0.85 }),
    pebble: std({ map: pebbles(), roughness: 0.6 }),
    lawn: std({ map: speckle([104, 138, 82], 0.2, 13), roughness: 1 }),
    // Fixtures
    taupe: std({ color: '#b39f92', roughness: 0.6 }),
    plinth: std({ color: '#8e7d72', roughness: 0.7 }),
    cream: std({ color: '#efe6d3', roughness: 0.25 }),
    black: std({ color: '#151515', roughness: 0.2, metalness: 0.2 }),
    shadow: std({ color: '#5a4f48', roughness: 0.8 }),
    steel: std({ color: '#c9c9c9', roughness: 0.25, metalness: 0.9 }),
    copper: std({ color: '#c58a63', roughness: 0.3, metalness: 0.9 }),
    white: std({ color: '#f7f7f4', roughness: 0.15 }),
    oak: std({ map: parquet(), roughness: 0.5 }),
    glass: new THREE.MeshPhysicalMaterial({ color: '#dfeeee', roughness: 0.02, transparent: true, opacity: 0.18, metalness: 0 }),
    mirror: std({ color: '#e4e8ea', roughness: 0.05, metalness: 0.9, envMapIntensity: 2.5 }),
    light: std({ color: '#fff4dc', emissive: '#ffe2b0', emissiveIntensity: 2 }),
    slate: std({ map: tiles([92, 96, 98], 0.6, 'rgba(60,62,64,0.9)', 0.08), roughness: 0.5 }),
    forest: std({ map: tiles([52, 82, 64], 0.25, 'rgba(30,45,36,0.9)', 0.12), roughness: 0.3 }),
    // Building
    wall: std({ color: '#f3f0e8', roughness: 0.95 }),
    facade: std({ color: '#ebe7df', roughness: 0.95 }),
    slab: std({ color: '#f6f4ef', roughness: 0.95 }),
    frame: std({ color: '#4a4744', roughness: 0.5, metalness: 0.3 }),
    neighbour: std({ color: '#e9e6e0', roughness: 0.95 }),
    hedge: std({ map: speckle([62, 92, 56], 0.35, 17), roughness: 1 }),
    soil: std({ color: '#8a7663', roughness: 1 }),
    ground: std({ map: speckle([196, 192, 182], 0.1, 19), roughness: 1 }),
  } satisfies Record<string, THREE.Material>;
}

export type MaterialKey = FloorFinish | FixtureMaterial | 'facade' | 'slab' | 'frame' | 'neighbour' | 'hedge' | 'soil' | 'ground';

export function material(key: MaterialKey): THREE.Material {
  cache ??= build();
  return cache[key];
}
