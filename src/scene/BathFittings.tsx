import { useMemo } from 'react';
import * as THREE from 'three';
import type { Fitting } from '../house/fixtures';
import { cylinder, lathe, metal, roundedBox } from './furniture/look';
import { material } from './materials';

/*
 * Bathroom fittings after the products Dennis chose: the Laufen Pro wall-hung WC, the
 * Villeroy & Boch Loop & Friends oval countertop basin with a tall rose gold mixer, and a
 * rose gold single-lever bath mixer. Each is drawn in its own frame with the wall at z = 0
 * and the front along +z.
 */

const porcelain = () => material('white');

/**
 * A rounded, tapering body: a flat-backed oval outline at each level, scaled towards the
 * wall as it narrows. The front half is rounder than the back, which stays almost square.
 */
function loft(levels: { y: number; sx: number; sz: number }[], hw: number, d: number, n = 48) {
  const outline = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const e = s > 0 ? 2 / 2.3 : 2 / 6;
    return [hw * Math.sign(c) * Math.abs(c) ** (2 / 3), d / 2 + (d / 2) * Math.sign(s) * Math.abs(s) ** e] as const;
  });
  const pos: number[] = [];
  const idx: number[] = [];
  for (const l of levels) for (const [x, z] of outline) pos.push(x * l.sx, l.y, z * l.sz);
  for (let j = 0; j < levels.length - 1; j++) {
    for (let i = 0; i < n; i++) {
      const a = j * n + i;
      const b = j * n + ((i + 1) % n);
      idx.push(a, a + n, b, b, a + n, b + n);
    }
  }
  // Caps: a centre point fanned to the first and the last ring.
  for (const [j, up] of [
    [0, false],
    [levels.length - 1, true],
  ] as const) {
    const l = levels[j];
    const c = pos.length / 3;
    pos.push(0, l.y, (d / 2) * l.sz);
    for (let i = 0; i < n; i++) {
      const a = j * n + i;
      const b = j * n + ((i + 1) % n);
      if (up) idx.push(c, b, a);
      else idx.push(c, a, b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Laufen Pro, wall-hung, rimless, 36 x 53 cm, with a slim closed seat and lid. */
export function Toilet({ w = 0.36, d = 0.53 }: { w?: number; d?: number }) {
  const { bowl, seat, lid } = useMemo(() => {
    const hw = w / 2;
    // The pan curves in towards its base, mostly from the front and sides.
    const bowl = loft(
      Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        const k = Math.sin((t * Math.PI) / 2) ** 0.7;
        return { y: 0.14 + t * 0.25, sx: 0.55 + 0.45 * k, sz: 0.5 + 0.5 * k };
      }),
      hw,
      d,
    );
    const seat = loft(
      [
        { y: 0.39, sx: 1.0, sz: 0.995 },
        { y: 0.4, sx: 1.02, sz: 1.0 },
        { y: 0.41, sx: 1.0, sz: 0.995 },
      ],
      hw,
      d,
    );
    const lid = loft(
      [
        { y: 0.413, sx: 0.98, sz: 0.985 },
        { y: 0.42, sx: 1.0, sz: 0.995 },
        { y: 0.428, sx: 0.97, sz: 0.98 },
      ],
      hw,
      d,
    );
    return { bowl, seat, lid };
  }, [w, d]);
  const m = porcelain();
  return (
    <group>
      <mesh geometry={bowl} material={m} castShadow receiveShadow />
      <mesh geometry={seat} material={m} castShadow receiveShadow />
      <mesh geometry={lid} material={m} castShadow receiveShadow />
      {/* Hinges */}
      {[-1, 1].map((s) => (
        <mesh key={s} geometry={cylinder(0.012, 0.012, 0.03, 16)} material={metal('#d9d9d6', 0.3)} position={[s * 0.09, 0.405, 0.045]} rotation={[0, 0, Math.PI / 2]} />
      ))}
    </group>
  );
}

/** Villeroy & Boch Loop & Friends: an oval countertop basin, 56 x 38 x 12 cm, with an overflow and a waste. */
export function VesselBasin({ w = 0.56, d = 0.38, h = 0.12 }: { w?: number; d?: number; h?: number }) {
  const g = lathe(
    [
      [0.001, 0],
      [0.62, 0],
      [0.84, h * 0.25],
      [0.96, h * 0.62],
      [1, h],
      [0.965, h],
      [0.9, h * 0.6],
      [0.72, h * 0.28],
      [0.4, 0.016],
      [0.001, 0.014],
    ],
    64,
  );
  return (
    <group>
      <mesh geometry={g} material={porcelain()} scale={[w / 2, 1, d / 2]} castShadow receiveShadow />
      <mesh geometry={cylinder(0.022, 0.022, 0.003, 24)} material={material('roseGold')} position={[0, 0.016, 0]} />
    </group>
  );
}

/** A tall single-lever basin mixer that stands behind a countertop basin and reaches over it. */
export function TallMixer({ reach = 0.17, rise = 0.3 }: { reach?: number; rise?: number }) {
  const gold = material('roseGold');
  const r = 0.014;
  return (
    <group>
      <mesh geometry={cylinder(0.026, 0.026, 0.012, 32)} material={gold} position={[0, 0.006, 0]} castShadow />
      <mesh geometry={cylinder(r, r, rise, 24)} material={gold} position={[0, rise / 2, 0]} castShadow />
      <mesh geometry={roundedBox(r * 2, r * 2, reach, 0.006)} material={gold} position={[0, rise - r, reach / 2]} castShadow />
      <mesh geometry={cylinder(0.011, 0.011, 0.012, 16)} material={metal('#3b3532', 0.5)} position={[0, rise - 2 * r - 0.004, reach - 0.012]} />
      {/* Lever on the side of the column */}
      <mesh geometry={cylinder(0.017, 0.017, 0.03, 24)} material={gold} position={[0.024, rise * 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow />
      <mesh geometry={roundedBox(0.012, 0.008, 0.07, 0.003)} material={gold} position={[0.04, rise * 0.62 + 0.012, 0.03]} rotation={[0.3, 0, 0]} castShadow />
    </group>
  );
}

/** The single-lever bath mixer from Dennis's photo: round wall roses, a horizontal body, a lever on top and a curved spout. */
export function BathMixer() {
  const gold = material('roseGold');
  const spout = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0.07), new THREE.Vector3(0, -0.005, 0.12), new THREE.Vector3(0, -0.03, 0.16), new THREE.Vector3(0, -0.06, 0.175)]);
    return new THREE.TubeGeometry(c, 24, 0.014, 16, false);
  }, []);
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.075, 0, 0]}>
          <mesh geometry={cylinder(0.032, 0.032, 0.014, 40)} material={gold} position={[0, 0, 0.007]} rotation={[Math.PI / 2, 0, 0]} castShadow />
          <mesh geometry={cylinder(0.012, 0.012, 0.04, 16)} material={gold} position={[0, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      <mesh geometry={cylinder(0.026, 0.026, 0.22, 40)} material={gold} position={[0, 0, 0.062]} rotation={[0, 0, Math.PI / 2]} castShadow />
      {/* Cartridge and lever */}
      <mesh geometry={cylinder(0.022, 0.022, 0.05, 32)} material={gold} position={[0, 0.045, 0.062]} castShadow />
      <mesh geometry={roundedBox(0.016, 0.01, 0.09, 0.004)} material={gold} position={[0, 0.074, 0.1]} rotation={[-0.25, 0, 0]} castShadow />
      <mesh geometry={spout} material={gold} castShadow />
      <mesh geometry={cylinder(0.006, 0.006, 0.04, 12)} material={gold} position={[0, 0.02, 0.125]} />
    </group>
  );
}

/** All the fittings of one floor, placed on their walls. */
export function Fittings({ items, level }: { items: Fitting[]; level: number }) {
  return (
    <group>
      {items.map((f, i) => (
        <group key={i} position={[f.x, level + f.z, f.y]} rotation={[0, (f.facing * Math.PI) / 180, 0]}>
          {f.kind === 'toilet' && <Toilet />}
          {f.kind === 'basin' && <VesselBasin />}
          {f.kind === 'tallMixer' && <TallMixer reach={f.reach} />}
          {f.kind === 'bathMixer' && <BathMixer />}
        </group>
      ))}
    </group>
  );
}
