import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Artwork } from '../../furniture/types';
import {
  birchPrint,
  botanicalPrint,
  fabricMaps,
  forestPrint,
  lakePrint,
  leafMaps,
  mountainPrint,
  plasterMaps,
  riverPrint,
  stoneMaps,
  toTexture,
  woodGrain,
  type SurfaceMaps,
} from '../textures';

/*
 * Materials and geometry helpers for furniture. Materials are physically based
 * (MeshPhysicalMaterial), cached by their settings, and share procedural surface maps.
 * Geometry gets UVs projected in metres, so wood grain and weave keep a real-world scale
 * whatever the size of the piece.
 */

/** Box-projects UVs in metres: each vertex takes the two coordinates across its normal. */
export function metricUVs<T extends THREE.BufferGeometry>(geo: T, metresPerTile = 1, grainAlongY = false): T {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const nor = geo.getAttribute('normal') as THREE.BufferAttribute;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i) / metresPerTile;
    const y = pos.getY(i) / metresPerTile;
    const z = pos.getZ(i) / metresPerTile;
    let u: number;
    let v: number;
    if (ny >= nx && ny >= nz) [u, v] = grainAlongY ? [x, z] : [z, x];
    else if (nx >= nz) [u, v] = grainAlongY ? [z, y] : [y, z];
    else [u, v] = grainAlongY ? [x, y] : [y, x];
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geo;
}

const geoCache = new Map<string, THREE.BufferGeometry>();
const cachedGeo = (key: string, make: () => THREE.BufferGeometry) => {
  let g = geoCache.get(key);
  if (!g) geoCache.set(key, (g = make()));
  return g;
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** A box with softly rounded edges; radius 0 gives a crisp box. */
export function roundedBox(w: number, h: number, d: number, radius = 0.01, grainAlongY = false) {
  const rad = Math.min(radius, w / 2 - 1e-4, h / 2 - 1e-4, d / 2 - 1e-4);
  return cachedGeo(`rb${r3(w)},${r3(h)},${r3(d)},${r3(rad)},${grainAlongY}`, () =>
    metricUVs(rad > 0.002 ? new RoundedBoxGeometry(w, h, d, rad > 0.03 ? 4 : 2, rad) : new THREE.BoxGeometry(w, h, d), 1, grainAlongY),
  );
}

export function cylinder(rTop: number, rBottom: number, h: number, segments = 32) {
  return cachedGeo(`cy${r3(rTop)},${r3(rBottom)},${r3(h)},${segments}`, () => metricUVs(new THREE.CylinderGeometry(rTop, rBottom, h, segments), 1, true));
}

export function sphere(r: number, detail = 2) {
  return cachedGeo(`sp${r3(r)},${detail}`, () => metricUVs(new THREE.IcosahedronGeometry(r, detail)));
}

export function torus(r: number, tube: number, arc = Math.PI * 2) {
  return cachedGeo(`to${r3(r)},${r3(tube)},${r3(arc)}`, () => metricUVs(new THREE.TorusGeometry(r, tube, 12, 48, arc)));
}

export function plane(w: number, h: number) {
  return cachedGeo(`pl${r3(w)},${r3(h)}`, () => new THREE.PlaneGeometry(w, h));
}

/** A transform from position, Euler rotation and scale. */
export function mat4(p: [number, number, number], r: [number, number, number] = [0, 0, 0], s: [number, number, number] = [1, 1, 1]) {
  return new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));
}

/**
 * Many small parts with one material (leaves, leaflets) merged into a single geometry, so a
 * plant is one draw call instead of hundreds. Cached by `key`.
 */
export function merged(key: string, parts: () => { g: THREE.BufferGeometry; m: THREE.Matrix4 }[]) {
  return cachedGeo(`mg${key}`, () => mergeGeometries(parts().map(({ g, m }) => g.clone().applyMatrix4(m)), false)!);
}

/** A round lampshade or pot: open lathe profile from radius list. */
export function lathe(points: [number, number][], segments = 40) {
  return cachedGeo(`la${points.flat().map(r3).join(',')}`, () =>
    metricUVs(new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments), 1, true),
  );
}

/* ---------------------------------------------------------------- materials */

const matCache = new Map<string, THREE.Material>();
const cached = <T extends THREE.Material>(key: string, make: () => T): T => {
  let m = matCache.get(key);
  if (!m) matCache.set(key, (m = make()));
  return m as T;
};

let maps: Record<string, SurfaceMaps> | null = null;
function surface(key: string): SurfaceMaps {
  maps ??= {};
  if (!maps[key]) {
    const make: Record<string, () => SurfaceMaps> = {
      oak: () => woodGrain(31, [214, 184, 142], [184, 148, 104]),
      oakBrushed: () => woodGrain(37, [196, 160, 118], [150, 112, 76]),
      birch: () => woodGrain(41, [236, 222, 198], [214, 194, 164]),
      teak: () => woodGrain(43, [168, 118, 78], [128, 86, 54]),
      boucle: () => fabricMaps('boucle', 3),
      linen: () => fabricMaps('linen', 5),
      wool: () => fabricMaps('wool', 7),
      knit: () => fabricMaps('knit', 9),
      quartzite: () => stoneMaps(51, [204, 202, 196], [132, 132, 128]),
      plaster: () => plasterMaps(4),
      olive: () => leafMaps(61, [70, 88, 62], [138, 152, 118]),
      leaf: () => leafMaps(63, [32, 70, 40], [86, 128, 68]),
      pine: () => leafMaps(65, [24, 52, 36], [62, 96, 64]),
      grass: () => leafMaps(67, [110, 120, 70], [190, 186, 120]),
    };
    maps[key] = make[key]();
    // Fabrics repeat every 12 cm.
    if (['boucle', 'linen', 'wool', 'knit'].includes(key)) {
      for (const t of Object.values(maps[key])) t?.repeat.set(8, 8);
    }
  }
  return maps[key];
}

export type Wood = 'oak' | 'oakBrushed' | 'birch' | 'teak';

export const wood = (kind: Wood = 'oak') =>
  cached(`wood-${kind}`, () => new THREE.MeshPhysicalMaterial({ ...surface(kind), roughness: 1, clearcoat: 0.08, clearcoatRoughness: 0.6 }));

export type Weave = 'boucle' | 'linen' | 'wool' | 'knit';

/** Upholstery and textiles: soft sheen at grazing angles, no specular glare. */
export const fabric = (colour: string, weave: Weave = 'linen') =>
  cached(`fabric-${colour}-${weave}`, () => {
    const s = surface(weave);
    return new THREE.MeshPhysicalMaterial({
      color: colour,
      normalMap: s.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: s.roughnessMap,
      roughness: 1,
      sheen: 0.6,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(colour).lerp(new THREE.Color('#ffffff'), 0.4),
    });
  });

/** Matt wall paint with the plaster's faint unevenness. */
export const paint = (colour: string) =>
  cached(`paint-${colour}`, () => {
    const s = surface('plaster');
    return new THREE.MeshPhysicalMaterial({ color: colour, normalMap: s.normalMap, normalScale: new THREE.Vector2(0.4, 0.4), roughnessMap: s.roughnessMap, roughness: 1 });
  });

/** Satin lacquer for cabinet fronts. */
export const lacquer = (colour: string, roughness = 0.45) =>
  cached(`lacquer-${colour}-${roughness}`, () => new THREE.MeshPhysicalMaterial({ color: colour, roughness, clearcoat: 0.15, clearcoatRoughness: 0.5 }));

export const ceramic = (colour: string, glaze = 0.35) =>
  cached(`ceramic-${colour}-${glaze}`, () => new THREE.MeshPhysicalMaterial({ color: colour, roughness: glaze, clearcoat: 0.4, clearcoatRoughness: 0.3 }));

export const metal = (colour = '#2b2b2a', roughness = 0.45) =>
  cached(`metal-${colour}-${roughness}`, () => new THREE.MeshPhysicalMaterial({ color: colour, roughness, metalness: 0.85 }));

export const stone = () => cached('stone-quartzite', () => new THREE.MeshPhysicalMaterial({ ...surface('quartzite'), roughness: 1, clearcoat: 0.2, clearcoatRoughness: 0.35 }));

export const terracotta = (colour = '#b4704f') => cached(`terracotta-${colour}`, () => new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.9 }));

export type Foliage = 'olive' | 'leaf' | 'pine' | 'grass';
export const foliage = (kind: Foliage) =>
  cached(`leaf-${kind}`, () => new THREE.MeshPhysicalMaterial({ ...surface(kind), roughness: 1, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color('#d8f0c0') }));

export const rattan = () =>
  cached('rattan', () => {
    const s = surface('knit');
    return new THREE.MeshPhysicalMaterial({ color: '#c9a76e', normalMap: s.normalMap, roughnessMap: s.roughnessMap, roughness: 1 });
  });

export const mirrorGlass = () => cached('mirror', () => new THREE.MeshPhysicalMaterial({ color: '#dfe3e4', roughness: 0.02, metalness: 1, envMapIntensity: 1.6 }));

export const water = () => cached('water', () => new THREE.MeshPhysicalMaterial({ color: '#4f7f86', roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.02 }));

export const screen = () => cached('screen', () => new THREE.MeshPhysicalMaterial({ color: '#0d0e0f', roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }));

/**
 * Lamp shades glow when the lamps are on. The material is shared per colour, so switching
 * day and evening only updates the emissive intensity of these.
 */
export const shade = (colour: string) =>
  cached(`shade-${colour}`, () => {
    const m = new THREE.MeshPhysicalMaterial({ color: colour, roughness: 0.9, side: THREE.DoubleSide, emissive: '#ffb966', emissiveIntensity: 0, sheen: 0.4 });
    m.userData.lampShade = true;
    return m;
  });

export const bulb = () =>
  cached('bulb', () => {
    const m = new THREE.MeshStandardMaterial({ color: '#fff3dd', emissive: '#ffc985', emissiveIntensity: 0 });
    m.userData.lampShade = true;
    m.userData.bulb = true;
    return m;
  });

/** Every lamp-shade material, for switching lamps on and off. */
export const lampMaterials = () => [...matCache.values()].filter((m) => m.userData.lampShade) as THREE.MeshStandardMaterial[];

/* ---------------------------------------------------------------- art */

const artCanvas: Record<Artwork, () => HTMLCanvasElement> = {
  mountain: () => mountainPrint(),
  forest: () => forestPrint(900, 1160, 11, { moody: false }),
  forestMist: () => forestPrint(2560, 1500, 5),
  lake: () => lakePrint(),
  birch: () => birchPrint(),
  river: () => riverPrint(),
  botanical1: () => botanicalPrint(0),
  botanical2: () => botanicalPrint(1),
  botanical3: () => botanicalPrint(2),
};

/** Printed paper behind glass: matt print, glossy coat. */
export const art = (key: Artwork, mural = false) =>
  cached(`art-${key}-${mural}`, () => {
    const map = toTexture(artCanvas[key](), { repeat: false });
    const s = surface('plaster');
    return new THREE.MeshPhysicalMaterial(
      mural
        ? { map, normalMap: s.normalMap, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.92 }
        : { map, roughness: 0.75, clearcoat: 0.5, clearcoatRoughness: 0.08 },
    );
  });
