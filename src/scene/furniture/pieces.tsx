import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { CHAISE_WIDTH, SOFA_DEPTH, type FurnitureItem } from '../../furniture/types';
import { rng } from '../textures';
import { Toilet as BathToilet } from '../BathFittings';
import {
  art,
  cached,
  bulb,
  ceramic,
  cylinder,
  fabric,
  foliage,
  lacquer,
  mat4,
  merged,
  lathe,
  metal,
  mirrorGlass,
  paint,
  plane,
  rattan,
  roundedBox,
  screen,
  shade,
  sphere,
  stone,
  terracotta,
  torus,
  water,
  wood,
  type Foliage,
  type Weave,
} from './look';

/*
 * Parametric furniture. Each piece is drawn in its own frame: origin at the centre of its
 * footprint on the floor (or at its underside, for pieces with `z`), width along x, depth
 * along z, with the front facing +z. Sizes come from the item, so the same sofa works at
 * 190 or 220 cm.
 */

type Mat = THREE.Material;

/** A mesh with shadows, positioned by its centre. */
function M({ g, m, p = [0, 0, 0], r, s, shadow = true }: { g: THREE.BufferGeometry; m: Mat; p?: [number, number, number]; r?: [number, number, number]; s?: [number, number, number]; shadow?: boolean }) {
  return <mesh geometry={g} material={m} position={p} rotation={r} scale={s} castShadow={shadow} receiveShadow />;
}

/** A rounded box placed by its bottom-centre. */
function Box({ w, h, d, m, x = 0, y = 0, z = 0, r = 0.004, grain = false, rot }: { w: number; h: number; d: number; m: Mat; x?: number; y?: number; z?: number; r?: number; grain?: boolean; rot?: [number, number, number] }) {
  return <M g={roundedBox(w, h, d, r, grain)} m={m} p={[x, y + h / 2, z]} r={rot} />;
}

/** Four tapered round legs inset from the corners. */
function Legs({ w, d, h, inset = 0.06, r = 0.018, m = wood() }: { w: number; d: number; h: number; inset?: number; r?: number; m?: Mat }) {
  return (
    <>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => <M key={`${sx}${sz}`} g={cylinder(r, r * 0.7, h, 12)} m={m} p={[sx * (w / 2 - inset), h / 2, sz * (d / 2 - inset)]} />),
      )}
    </>
  );
}

const weaveOf = (v?: string): Weave => (v === 'boucle' || v === 'wool' || v === 'knit' ? v : 'linen');

/* ---------------------------------------------------------------- seating */

function Sofa({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const weave = weaveOf(it.variant);
  const up = fabric(it.colour ?? '#bdb7ae', weave);
  const legH = 0.12;
  const arm = 0.16;
  const seatH = 0.2;
  const backD = 0.2;
  const seats = w > 2.05 ? 3 : 2;
  const seatW = (w - 2 * arm) / seats;
  const accent = fabric(it.accent ?? '#a3b4bd', 'linen');
  return (
    <group>
      <Legs w={w - 0.1} d={d - 0.1} h={legH} r={0.02} inset={0.05} m={wood()} />
      {/* frame and base */}
      <Box w={w} h={0.18} d={d} y={legH} m={up} r={0.04} />
      {/* arms */}
      {[-1, 1].map((s) => (
        <Box key={s} w={arm} h={0.42} d={d} x={s * (w / 2 - arm / 2)} y={legH} m={up} r={0.06} />
      ))}
      {/* back */}
      <Box w={w - 0.02} h={it.h - legH} d={backD} y={legH} z={-d / 2 + backD / 2} m={up} r={0.06} />
      {/* seat and back cushions, slightly irregular */}
      {Array.from({ length: seats }, (_, i) => {
        const cx = -w / 2 + arm + seatW * (i + 0.5);
        return (
          <group key={i}>
            <Box w={seatW - 0.012} h={seatH} d={d - backD - 0.02} x={cx} y={legH + 0.16} z={backD / 2} m={up} r={0.07} />
            <Box w={seatW - 0.02} h={0.42} d={0.2} x={cx} y={legH + 0.16 + seatH - 0.02} z={-d / 2 + backD + 0.06} m={up} r={0.08} rot={[-0.12, 0, 0]} />
          </group>
        );
      })}
      {/* scatter cushions in the accent colour */}
      {[-1, 1].map((s) => (
        <Box key={s} w={0.44} h={0.42} d={0.13} x={s * (w / 2 - arm - 0.3)} y={legH + 0.3} z={-d / 2 + backD + 0.22} m={s < 0 ? accent : fabric(it.colour ?? '#bdb7ae', 'linen')} r={0.06} rot={[-0.25, s * 0.25, s * 0.05]} />
      ))}
      {/* a folded throw over one arm */}
      <Box w={arm + 0.06} h={0.03} d={d * 0.55} x={w / 2 - arm / 2} y={legH + 0.42} z={0.05} m={fabric(it.accent ?? '#a3b4bd', 'knit')} r={0.012} />
    </group>
  );
}

function LoungeChair({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const up = fabric(it.colour ?? '#34483e', 'wool');
  return (
    <group>
      {/* oak frame: two side runners */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 - 0.03), 0, 0]}>
          <Box w={0.04} h={0.04} d={d} y={0.32} m={wood()} r={0.015} />
          <M g={cylinder(0.02, 0.016, 0.34, 12)} m={wood()} p={[0, 0.17, d / 2 - 0.08]} />
          <M g={cylinder(0.02, 0.016, 0.34, 12)} m={wood()} p={[0, 0.17, -d / 2 + 0.12]} r={[-0.15, 0, 0]} />
          <Box w={0.05} h={0.03} d={d * 0.6} y={0.56} z={0.05} m={wood()} r={0.012} />
        </group>
      ))}
      <Box w={w - 0.1} h={0.13} d={d - 0.18} y={0.3} z={0.05} m={up} r={0.05} />
      <group position={[0, 0.38, -d / 2 + 0.12]} rotation={[-0.32, 0, 0]}>
        <Box w={w - 0.12} h={0.48} d={0.12} m={up} r={0.05} />
      </group>
      <Box w={0.5} h={0.02} d={0.42} x={0.04} y={0.43} z={0.1} m={fabric('#e9e3d6', 'knit')} r={0.008} rot={[0, 0.3, 0]} />
    </group>
  );
}

/**
 * A cantilever chair after Dennis's photo: black upholstered seat and back, brushed steel
 * tube frame on a sled base, and black rope-wrapped arms and back band.
 */
function CantileverChair({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const steel = metal('#b9bbbc', 0.35);
  const rope = fabric('#1b1b1c', 'knit');
  const seat = fabric('#1d1e1f', 'linen');
  const x = w / 2 - 0.035;
  const tube = (pts: [number, number][]) => {
    const curve = new THREE.CatmullRomCurve3(pts.map(([z, y]) => new THREE.Vector3(0, y, z)), false, 'catmullrom', 0.4);
    return new THREE.TubeGeometry(curve, 28, 0.0095, 8, false);
  };
  // One side of the frame, in (z, y): the floor runner curves up in front into the arm.
  const side = metricFrame(d);
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * x, 0, 0]}>
          <M g={tube(side.sled)} m={steel} />
          <M g={cylinder(0.0145, 0.0145, side.arm, 12)} m={rope} p={[0, 0.655, side.armMid]} r={[Math.PI / 2 + 0.03, 0, 0]} />
          <M g={cylinder(0.011, 0.011, 0.3, 8)} m={steel} p={[0, 0.5, -d / 2 + 0.07]} r={[0.0, 0, 0]} />
        </group>
      ))}
      {/* seat and reclined back, upholstered in black */}
      <Box w={w - 0.1} h={0.07} d={d * 0.8} y={0.42} z={0.03} m={seat} r={0.03} />
      <group position={[0, 0.5, -d / 2 + 0.06]} rotation={[-0.16, 0, 0]}>
        <Box w={w - 0.14} h={h - 0.54} d={0.07} y={0.02} m={seat} r={0.03} />
      </group>
      <Box w={w - 0.08} h={0.07} d={0.02} y={0.52} z={-d / 2 + 0.01} m={rope} r={0.008} />
    </group>
  );
}

function metricFrame(d: number) {
  const front = d / 2 - 0.05;
  const back = -d / 2 + 0.08;
  return {
    sled: [
      [back, 0.02],
      [0.0, 0.02],
      [front - 0.06, 0.02],
      [front, 0.08],
      [front + 0.005, 0.3],
      [front - 0.01, 0.5],
      [front - 0.05, 0.64],
      [front - 0.15, 0.655],
    ] as [number, number][],
    arm: front - 0.15 - back + 0.02,
    armMid: (front - 0.15 + back) / 2,
  };
}

function DiningChair({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  if (it.variant === 'cantilever') return <CantileverChair it={it} />;
  const carver = it.variant === 'carver';
  const seat = carver ? fabric(it.colour ?? '#8c8f91', 'wool') : wood();
  return (
    <group>
      <Legs w={w} d={d} h={0.44} inset={0.03} r={0.017} />
      <Box w={w} h={0.035} d={d} y={0.44} m={seat} r={carver ? 0.02 : 0.008} />
      {/* back posts and curved rail */}
      {[-1, 1].map((s) => (
        <M key={s} g={cylinder(0.014, 0.016, it.h - 0.44, 10)} m={wood()} p={[s * (w / 2 - 0.03), 0.44 + (it.h - 0.44) / 2, -d / 2 + 0.03]} r={[-0.08, 0, 0]} />
      ))}
      <Box w={w - 0.02} h={carver ? 0.16 : 0.09} d={0.025} y={it.h - (carver ? 0.2 : 0.12)} z={-d / 2 + 0.01} m={carver ? seat : wood()} r={0.01} />
      {!carver && <Box w={w * 0.7} h={0.03} d={0.3} y={0.475} z={0.02} m={fabric(it.colour ?? '#dcd3c4', 'wool')} r={0.012} />}
      {carver && [-1, 1].map((s) => <Box key={s} w={0.04} h={0.025} d={d * 0.8} x={s * (w / 2 - 0.02)} y={0.66} z={-0.02} m={wood()} r={0.01} />)}
    </group>
  );
}

function DeskChair({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  if (it.variant === 'office') {
    const up = fabric(it.colour ?? '#3c3d3d', 'wool');
    return (
      <group>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <Box w={0.04} h={0.03} d={0.3} z={0.15} y={0.06} m={metal('#2b2b2a', 0.4)} r={0.01} />
              <M g={sphere(0.025, 1)} m={metal('#1c1c1c', 0.3)} p={[0, 0.025, 0.29]} />
            </group>
          );
        })}
        <M g={cylinder(0.025, 0.025, 0.36, 12)} m={metal('#9a9a9a', 0.25)} p={[0, 0.27, 0]} />
        <Box w={w * 0.8} h={0.08} d={d * 0.8} y={0.44} m={up} r={0.035} />
        <group position={[0, 0.55, -d * 0.36]} rotation={[-0.1, 0, 0]}>
          <Box w={w * 0.75} h={0.48} d={0.07} m={up} r={0.035} />
        </group>
        {/* sheepskin */}
        <Box w={w * 0.72} h={0.035} d={d * 0.7} y={0.52} z={0.02} m={fabric('#f3eee4', 'boucle')} r={0.016} />
        <Box w={w * 0.62} h={0.4} d={0.035} y={0.58} z={-d * 0.31} m={fabric('#f3eee4', 'boucle')} r={0.016} rot={[-0.1, 0, 0]} />
      </group>
    );
  }
  const seat = it.variant === 'rattan' ? rattan() : fabric(it.colour ?? '#dcd3c4', 'linen');
  return (
    <group>
      <Legs w={w} d={d} h={0.44} inset={0.03} r={0.016} />
      <Box w={w} h={0.04} d={d} y={0.44} m={seat} r={0.012} />
      {[-1, 1].map((s) => (
        <M key={s} g={cylinder(0.014, 0.016, 0.36, 10)} m={wood()} p={[s * (w / 2 - 0.03), 0.66, -d / 2 + 0.03]} />
      ))}
      <Box w={w - 0.02} h={0.12} d={0.02} y={it.h - 0.15} z={-d / 2 + 0.02} m={wood()} r={0.008} />
    </group>
  );
}

function Pouf({ it }: { it: FurnitureItem }) {
  return <M g={cylinder(it.w / 2, it.w / 2 - 0.02, it.h, 40)} m={fabric(it.colour ?? '#dcd3c4', 'knit')} p={[0, it.h / 2, 0]} />;
}

function Bench({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  return (
    <group>
      <Box w={w} h={0.04} d={d} y={h - 0.1} m={wood()} r={0.01} />
      {[-1, 1].map((s) => (
        <Box key={s} w={0.04} h={h - 0.1} d={d - 0.04} x={s * (w / 2 - 0.08)} m={wood()} r={0.008} grain />
      ))}
      <Box w={w - 0.04} h={0.06} d={d - 0.04} y={h - 0.06} m={fabric(it.accent ?? '#a7a49b', 'wool')} r={0.025} />
    </group>
  );
}

function FloorCushions({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={0.12} d={it.d} m={fabric(it.colour ?? '#eef0ee', 'linen')} r={0.05} />
      <Box w={0.42} h={0.35} d={0.14} x={-it.w / 4} y={0.1} z={-it.d / 2 + 0.1} m={fabric(it.accent ?? '#8e9a6c', 'linen')} r={0.06} rot={[-0.2, 0.15, 0]} />
      <Box w={0.42} h={0.35} d={0.14} x={it.w / 4} y={0.1} z={-it.d / 2 + 0.1} m={fabric('#8a9fab', 'knit')} r={0.06} rot={[-0.2, -0.15, 0]} />
      <M g={sphere(0.13, 2)} m={fabric('#eef0ee', 'knit')} p={[it.w / 2 - 0.1, 0.2, it.d / 2 - 0.15]} s={[1, 0.6, 1]} />
    </group>
  );
}

/* ---------------------------------------------------------------- tables */

function CoffeeTable({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  return (
    <group>
      <M g={cylinder(r, r, 0.035, 64)} m={stone()} p={[0, it.h - 0.0175, 0]} />
      <M g={cylinder(r * 0.42, r * 0.5, it.h - 0.035, 48)} m={stone()} p={[0, (it.h - 0.035) / 2, 0]} />
    </group>
  );
}

function SideTable({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  const m = wood(it.variant === 'teak' ? 'teak' : 'oak');
  return (
    <group>
      <M g={cylinder(r, r, 0.025, 48)} m={m} p={[0, it.h - 0.0125, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return <M key={i} g={cylinder(0.014, 0.012, it.h - 0.02, 10)} m={m} p={[Math.cos(a) * r * 0.6, (it.h - 0.02) / 2, Math.sin(a) * r * 0.6]} r={[Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08]} />;
      })}
    </group>
  );
}

function Table({ it, desk = false }: { it: FurnitureItem; desk?: boolean }) {
  const { w, d, h } = it;
  const top = desk ? 0.025 : 0.04;
  if (it.variant === 'steel') {
    // After Dennis's photo: a plank oak top on a brushed steel pedestal, two flat posts on a base plate.
    const steel = metal('#b4b6b7', 0.32);
    const long = Math.max(w, d) === d ? 'z' : 'x';
    const plateL = Math.min(0.9, Math.max(w, d) * 0.4);
    const plateW = Math.min(0.5, Math.min(w, d) * 0.55);
    const [pw, pd] = long === 'z' ? [plateW, plateL] : [plateL, plateW];
    return (
      <group>
        <Box w={w} h={top} d={d} y={h - top} m={wood('oakBrushed')} r={0.008} grain />
        <Box w={pw} h={0.018} d={pd} m={steel} r={0.004} />
        {[-1, 1].map((s) => (
          <Box key={s} w={long === 'z' ? pw - 0.06 : 0.07} h={h - top - 0.018} d={long === 'z' ? 0.07 : pd - 0.06} x={long === 'z' ? 0 : s * (pw / 2 - 0.1)} z={long === 'z' ? s * (pd / 2 - 0.1) : 0} y={0.018} m={steel} r={0.004} />
        ))}
        <Box w={long === 'z' ? pw - 0.1 : pw - 0.2} h={0.05} d={long === 'z' ? pd - 0.2 : pd - 0.1} y={h - top - 0.05} m={steel} r={0.004} />
      </group>
    );
  }
  const tw = wood(it.variant === 'teak' ? 'teak' : 'oak');
  return (
    <group>
      <Box w={w} h={top} d={d} y={h - top} m={tw} r={0.006} />
      <Legs w={w} d={d} h={h - top} inset={desk ? 0.04 : 0.09} r={desk ? 0.017 : 0.028} m={tw} />
      {desk && <Box w={w - 0.1} h={0.1} d={0.02} y={h - top - 0.1} z={-d / 2 + 0.06} m={wood()} r={0.004} />}
      {desk && it.room !== 'bastelraum-1' && (
        <>
          <Box w={0.32} h={0.015} d={0.22} x={-0.05} y={h} z={0.05} m={lacquer('#c9c6c0', 0.3)} r={0.004} />
          <Box w={0.24} h={0.04} d={0.3} x={w / 2 - 0.25} y={h} z={-0.05} m={fabric('#d9d1c0', 'linen')} r={0.006} rot={[0, 0.2, 0]} />
        </>
      )}
    </group>
  );
}

/* ---------------------------------------------------------------- beds and storage */

function Bed({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const board = it.variant === 'upholstered' ? fabric('#8a9fab', 'linen') : wood(it.room === 'bedroom' ? 'oakBrushed' : 'oak');
  const frameH = 0.32;
  const mattress = 0.2;
  const headD = 0.07;
  const len = d - headD;
  const duvet = fabric(it.colour ?? '#e9e3d6', 'linen');
  const top = frameH + mattress;
  const pillows = w > 1.4 ? 2 : 1;
  return (
    <group>
      {/* frame on short legs */}
      <Legs w={w - 0.04} d={len - 0.04} h={0.12} inset={0.06} r={0.025} m={wood()} />
      <Box w={w} h={frameH - 0.12} d={len} y={0.12} z={headD / 2} m={wood(it.room === 'bedroom' ? 'oakBrushed' : 'oak')} r={0.01} />
      {/* headboard */}
      <Box w={w} h={it.h} d={headD} z={-d / 2 + headD / 2} m={board} r={it.variant === 'upholstered' ? 0.03 : 0.008} grain={it.variant !== 'upholstered'} />
      {/* mattress, fitted sheet */}
      <Box w={w - 0.06} h={mattress} d={len - 0.06} y={frameH - 0.02} z={headD / 2} m={fabric('#f2efe8', 'linen')} r={0.05} />
      {/* duvet over the lower two thirds, draping over the sides */}
      <Box w={w - 0.02} h={0.08} d={len * 0.72} y={top - 0.03} z={headD / 2 + len * 0.14} m={duvet} r={0.04} />
      <Box w={w + 0.02} h={0.22} d={len * 0.7} y={top - 0.2} z={headD / 2 + len * 0.14} m={duvet} r={0.03} />
      {/* folded top of the duvet */}
      <Box w={w - 0.03} h={0.05} d={0.3} y={top + 0.04} z={headD / 2 + len * 0.14 - len * 0.36 + 0.15} m={duvet} r={0.025} />
      {/* throw across the foot */}
      <Box w={w + 0.04} h={0.025} d={0.45} y={top + 0.05} z={d / 2 - 0.35} m={fabric(it.accent ?? '#5f6e40', 'knit')} r={0.01} />
      <Box w={w + 0.04} h={0.2} d={0.02} y={top - 0.15} z={d / 2 - 0.13} m={fabric(it.accent ?? '#5f6e40', 'knit')} r={0.008} />
      {/* pillows */}
      {Array.from({ length: pillows }, (_, i) => {
        const px = pillows === 1 ? 0 : (i - 0.5) * (w / 2);
        return (
          <group key={i}>
            <Box w={w / pillows - 0.1} h={0.15} d={0.42} x={px} y={top - 0.02} z={-d / 2 + headD + 0.26} m={fabric('#f4f1ea', 'linen')} r={0.07} rot={[0.25, 0, 0]} />
            <Box w={w / pillows - 0.2} h={0.13} d={0.36} x={px} y={top + 0.08} z={-d / 2 + headD + 0.38} m={fabric(it.accent ?? '#5f6e40', 'linen')} r={0.06} rot={[0.4, 0, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function BedsideTable({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  return (
    <group>
      <Legs w={w} d={d} h={h - 0.18} inset={0.03} r={0.014} />
      <Box w={w} h={0.18} d={d} y={h - 0.18} m={wood('oakBrushed')} r={0.008} />
      <Box w={w - 0.04} h={0.004} d={0.004} y={h - 0.09} z={d / 2} m={metal('#1e1e1e', 0.6)} r={0} />
      <Box w={0.16} h={0.04} d={0.12} x={-w / 4} y={h} z={0.06} m={fabric('#6b5242', 'linen')} r={0.006} />
    </group>
  );
}

function Wardrobe({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = it.variant === 'oak';
  const front = oak ? wood('oakBrushed') : lacquer(it.colour ?? '#f1efea', 0.5);
  const doors = Math.max(2, Math.round(w / 0.5));
  const dw = w / doors;
  return (
    <group>
      <Box w={w} h={h - 0.08} d={d - 0.02} y={0.08} z={-0.01} m={front} r={0.004} />
      <Box w={w - 0.04} h={0.08} d={d - 0.08} z={-0.04} m={lacquer('#bdb7ae', 0.7)} r={0} />
      {Array.from({ length: doors }, (_, i) => (
        <group key={i}>
          <Box w={dw - 0.004} h={h - 0.09} d={0.019} x={-w / 2 + dw * (i + 0.5)} y={0.085} z={d / 2 - 0.01} m={front} r={0.003} grain={oak} />
          {it.variant !== 'flush' && (
            <Box w={0.02} h={0.3} d={0.025} x={-w / 2 + dw * (i + 0.5) + (i % 2 ? -1 : 1) * (dw / 2 - 0.05)} y={1.0} z={d / 2 + 0.012} m={oak ? metal('#2b2b2a') : wood()} r={0.006} />
          )}
        </group>
      ))}
    </group>
  );
}

/** A chest of drawers on a low plinth, with finger grooves instead of handles. */
function Dresser({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  const rows = 3;
  const cols = w > 1.0 ? 2 : 1;
  const body = h - 0.1;
  return (
    <group>
      <Box w={w - 0.06} h={0.1} d={d - 0.06} z={-0.02} m={metal('#2b2b2a', 0.6)} r={0.004} />
      <Box w={w} h={body} d={d} y={0.1} m={oak} r={0.006} grain />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <Box key={`${r}${c}`} w={w / cols - 0.03} h={0.006} d={0.01} x={-w / 2 + (w / cols) * (c + 0.5)} y={0.1 + (body * (r + 1)) / rows - 0.03} z={d / 2} m={metal('#3b2f25', 0.8)} r={0} />
        )),
      )}
      {cols > 1 && <Box w={0.004} h={body - 0.02} d={0.004} y={0.11} z={d / 2} m={metal('#3b2f25', 0.8)} r={0} />}
    </group>
  );
}

function Shelf({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const levels = Math.max(2, Math.round(h / 0.37));
  const cols = Math.max(1, Math.round(w / 0.45));
  const rand = rng(Math.round(it.x * 100 + it.y * 7));
  const m = wood();
  const items: ReactNode[] = [];
  for (let l = 0; l < levels; l++) {
    const y = (l * (h - 0.03)) / levels + 0.025;
    for (let c = 0; c < cols; c++) {
      const cx = -w / 2 + (w / cols) * (c + 0.5);
      if (it.variant === 'baskets' && (l + c) % 2 === 0) {
        items.push(<Box key={`b${l}${c}`} w={w / cols - 0.07} h={0.22} d={d - 0.06} x={cx} y={y} m={rattan()} r={0.02} />);
      } else {
        const n = 4 + Math.floor(rand() * 8);
        let bx = cx - w / cols / 2 + 0.04;
        for (let b = 0; b < n && bx < cx + w / cols / 2 - 0.06; b++) {
          const bw = 0.02 + rand() * 0.03;
          const bh = 0.16 + rand() * 0.1;
          const tone = ['#e9e3d6', '#a7b494', it.colour ?? '#8a9fab', '#c8a97e', '#6b5242', '#dcd3c4'][Math.floor(rand() * 6)];
          items.push(<Box key={`k${l}${c}${b}`} w={bw} h={bh} d={d * 0.7} x={bx + bw / 2} y={y} m={lacquer(tone, 0.85)} r={0.002} />);
          bx += bw + 0.002;
        }
      }
    }
  }
  return (
    <group>
      {Array.from({ length: levels + 1 }, (_, l) => (
        <Box key={l} w={w} h={0.025} d={d} y={(l * (h - 0.025)) / levels} m={m} r={0.004} />
      ))}
      {Array.from({ length: cols + 1 }, (_, c) => (
        <Box key={`s${c}`} w={0.02} h={h} d={d} x={-w / 2 + 0.01 + ((w - 0.02) * c) / cols} m={m} r={0.003} grain />
      ))}
      {items}
    </group>
  );
}

function Lowboard({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const doors = 4;
  return (
    <group>
      <Legs w={w - 0.1} d={d - 0.06} h={0.12} inset={0.04} r={0.016} m={metal('#2b2b2a')} />
      <Box w={w} h={h - 0.12} d={d} y={0.12} m={wood()} r={0.006} />
      {Array.from({ length: doors - 1 }, (_, i) => (
        <Box key={i} w={0.004} h={h - 0.16} d={0.004} x={-w / 2 + (w / doors) * (i + 1)} y={0.14} z={d / 2} m={metal('#5a4f48', 0.8)} r={0} />
      ))}
    </group>
  );
}

/* ---------------------------------------------------------------- soft furnishings */

function Rug({ it }: { it: FurnitureItem }) {
  const m = it.variant === 'rubber' ? lacquer(it.colour ?? '#2e3032', 0.95) : fabric(it.colour ?? '#e9e3d6', 'wool');
  if (it.variant === 'round') return <M g={cylinder(it.w / 2, it.w / 2, it.h, 64)} m={m} p={[0, it.h / 2, 0]} shadow={false} />;
  return <M g={roundedBox(it.w, it.h, it.d, 0.006)} m={m} p={[0, it.h / 2, 0]} shadow={false} />;
}

function Curtain({ it }: { it: FurnitureItem }) {
  const folds = Math.max(3, Math.round(it.w / 0.09));
  const m = fabric(it.colour ?? '#5f6e40', 'linen');
  return (
    <group>
      {Array.from({ length: folds }, (_, i) => {
        const x = -it.w / 2 + (it.w / folds) * (i + 0.5);
        return <M key={i} g={cylinder(it.w / folds / 1.6, it.w / folds / 1.5, it.h - 0.05, 10)} m={m} p={[x, (it.h - 0.05) / 2 + 0.02, (i % 2) * 0.03]} s={[1, 1, 0.6]} />;
      })}
      <M g={cylinder(0.012, 0.012, it.w + 0.3, 10)} m={metal()} p={[0, it.h, 0]} r={[0, 0, Math.PI / 2]} />
    </group>
  );
}

function Blind({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={it.h} d={0.004} m={fabric(it.colour ?? '#a7b494', 'linen')} r={0} />
      <M g={cylinder(0.025, 0.025, it.w + 0.04, 16)} m={fabric(it.colour ?? '#a7b494', 'linen')} p={[0, it.h, 0]} r={[0, 0, Math.PI / 2]} />
      <M g={cylinder(0.008, 0.008, it.w, 8)} m={wood()} p={[0, 0, 0]} r={[0, 0, Math.PI / 2]} />
    </group>
  );
}

/* ---------------------------------------------------------------- light */

/** Warm 2700 K. Intensities are tuned against the sun and tone mapping, not true lumens. */
export const LAMP_COLOUR = '#ffbe7a';

/** Lamp light. No shadow maps here (six extra passes per lamp); the photo render traces them. */
function LampLight({ y, intensity, distance = 6 }: { y: number; intensity: number; distance?: number }) {
  return <pointLight position={[0, y, 0]} color={LAMP_COLOUR} intensity={intensity} distance={distance} decay={2} userData={{ lamp: true }} />;
}

function Pendant({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const cord = Math.max(0.05, 2.5 - (it.z ?? 2) - it.h);
  const m = it.variant === 'rattan' ? rattan() : it.variant === 'metal' ? metal(it.colour ?? '#2b2b2a', 0.5) : it.variant === 'veneer' ? wood() : shade(it.colour ?? '#e9e3d6');
  const glow = it.variant === 'rattan' || it.variant === 'metal' || it.variant === 'veneer';
  return (
    <group>
      <M g={cylinder(0.003, 0.003, cord, 6)} m={metal('#1e1e1e')} p={[0, it.h + cord / 2, 0]} shadow={false} />
      <M g={cylinder(0.05, 0.05, 0.02, 20)} m={lacquer('#f3f0e8', 0.6)} p={[0, it.h + cord - 0.01, 0]} shadow={false} />
      {it.variant === 'cloud' ? (
        <group>
          {[
            [-0.3, 0.0, 0.02, 0.13],
            [-0.08, 0.05, -0.04, 0.16],
            [0.15, 0.02, 0.05, 0.15],
            [0.34, -0.01, -0.02, 0.11],
            [0.02, -0.02, 0.12, 0.12],
            [0.0, 0.0, -0.14, 0.11],
          ].map(([x, y, z, r], i) => (
            <M key={i} g={sphere(r, 3)} m={m} p={[x * it.w, y + it.h / 2, z * (it.d / 0.5)]} s={[1.15, 0.75, 1]} />
          ))}
        </group>
      ) : (
        <M
          g={lathe(
            it.variant === 'drum'
              ? [
                  [it.w / 2, 0],
                  [it.w / 2, it.h],
                ]
              : it.variant === 'paper'
                ? Array.from({ length: 13 }, (_, i): [number, number] => {
                    const a = -Math.PI / 2 + (i / 12) * Math.PI;
                    return [Math.max(0.02, (Math.cos(a) * it.w) / 2), it.h / 2 + (Math.sin(a) * it.h) / 2];
                  })
                : [
                    [it.w / 2, 0],
                    [it.w * 0.35, it.h * 0.6],
                    [0.04, it.h],
                  ],
          )}
          m={m}
        />
      )}
      <M g={sphere(0.035, 2)} m={bulb()} p={[0, it.h * 0.35, 0]} shadow={false} />
      {lit && <LampLight y={glow ? it.h * 0.2 : it.h * 0.4} intensity={it.variant === 'metal' ? 1.6 : 2.4} />}
    </group>
  );
}

function FloorLamp({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const h = it.h;
  return (
    <group>
      <M g={cylinder(0.14, 0.15, 0.025, 32)} m={metal()} p={[0, 0.0125, 0]} />
      <M g={cylinder(0.011, 0.011, h - 0.3, 10)} m={metal()} p={[0, (h - 0.3) / 2, 0]} />
      <M
        g={lathe([
          [0.2, 0],
          [0.16, 0.3],
        ])}
        m={shade(it.colour ?? '#e9e3d6')}
        p={[0, h - 0.3, 0]}
      />
      <M g={sphere(0.04, 2)} m={bulb()} p={[0, h - 0.18, 0]} shadow={false} />
      {lit && <LampLight y={h - 0.2} intensity={2.2} />}
    </group>
  );
}

function TableLamp({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const h = it.h;
  const r = it.w / 2;
  const paper = it.variant === 'paper';
  return (
    <group>
      {paper ? (
        <M g={cylinder(0.03, 0.06, 0.08, 16)} m={wood()} p={[0, 0.04, 0]} />
      ) : (
        <M
          g={lathe([
            [0.001, 0],
            [r * 0.55, 0.01],
            [r * 0.7, h * 0.25],
            [r * 0.4, h * 0.5],
            [0.012, h * 0.55],
          ])}
          m={ceramic(it.accent ?? '#bdb7ae', 0.5)}
        />
      )}
      <M
        g={lathe(
          paper
            ? Array.from({ length: 13 }, (_, i): [number, number] => {
                const a = -Math.PI / 2 + (i / 12) * Math.PI;
                return [Math.max(0.03, Math.cos(a) * r), h * 0.6 + Math.sin(a) * h * 0.4];
              })
            : [
                [r, h * 0.52],
                [r * 0.75, h],
              ],
        )}
        m={shade(it.colour ?? '#e9e3d6')}
      />
      <M g={sphere(0.03, 2)} m={bulb()} p={[0, h * 0.65, 0]} shadow={false} />
      {lit && <LampLight y={h * 0.7} intensity={1.1} distance={4} />}
    </group>
  );
}

/* ---------------------------------------------------------------- walls */

function Print({ it }: { it: FurnitureItem }) {
  const frame = it.accent ?? '#2b2b2a';
  const fm = frame === '#c8a97e' ? wood() : lacquer(frame, 0.5);
  const border = 0.025;
  const mount = Math.min(it.w, it.h) * 0.08;
  return (
    <group position={[0, it.h / 2, 0]}>
      <M g={roundedBox(it.w, it.h, it.d, 0.003)} m={fm} />
      <M g={plane(it.w - 2 * border, it.h - 2 * border)} m={paint('#f6f4ef')} p={[0, 0, it.d / 2 + 0.0005]} shadow={false} />
      <M g={plane(it.w - 2 * border - 2 * mount, it.h - 2 * border - 2 * mount)} m={art(it.art ?? 'mountain')} p={[0, 0, it.d / 2 + 0.001]} shadow={false} />
    </group>
  );
}

function Mural({ it }: { it: FurnitureItem }) {
  return <M g={plane(it.w, it.h)} m={art(it.art ?? 'forestMist', true)} p={[0, it.h / 2, 0]} shadow={false} />;
}

function Paint({ it }: { it: FurnitureItem }) {
  return <M g={plane(it.w, it.h)} m={paint(it.colour ?? '#3d6262')} p={[0, it.h / 2, 0]} shadow={false} />;
}

function Slats({ it }: { it: FurnitureItem }) {
  const n = Math.floor(it.w / 0.06);
  const m = wood('birch');
  return (
    <group>
      <M g={plane(it.w, it.h)} m={paint('#3c3d3d')} p={[0, it.h / 2, -it.d / 2 + 0.001]} shadow={false} />
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} w={0.04} h={it.h} d={it.d - 0.004} x={-it.w / 2 + 0.03 + i * (it.w / n)} z={0.002} m={m} r={0.004} grain />
      ))}
    </group>
  );
}

function Mirror({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  return (
    <group position={[0, it.h / 2, 0]}>
      <M g={cylinder(r, r, it.d, 64)} m={wood()} r={[Math.PI / 2, 0, 0]} />
      <M g={cylinder(r - 0.02, r - 0.02, 0.002, 64)} m={mirrorGlass()} p={[0, 0, it.d / 2 + 0.001]} r={[Math.PI / 2, 0, 0]} shadow={false} />
    </group>
  );
}

function Hooks({ it }: { it: FurnitureItem }) {
  const n = 5;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <M key={i} g={sphere(0.035, 2)} m={ceramic(it.colour ?? '#a7a49b', 0.7)} p={[-it.w / 2 + (it.w / (n - 1)) * i, 0.04, 0.02]} s={[1, 0.8, 0.6]} />
      ))}
    </group>
  );
}

function Tv({ it }: { it: FurnitureItem }) {
  return (
    <group position={[0, it.h / 2, 0]}>
      <M g={roundedBox(it.w, it.h, it.d, 0.004)} m={metal('#1b1b1b', 0.5)} />
      <M g={plane(it.w - 0.01, it.h - 0.01)} m={screen()} p={[0, 0, it.d / 2 + 0.001]} shadow={false} />
    </group>
  );
}

/* ---------------------------------------------------------------- plants and small things */

function Pot({ r, h, m }: { r: number; h: number; m: Mat }) {
  return (
    <>
      <M
        g={lathe([
          [r * 0.75, 0],
          [r, h * 0.9],
          [r * 1.02, h],
          [r * 0.95, h],
        ])}
        m={m}
      />
      <M g={cylinder(r * 0.94, r * 0.94, 0.01, 24)} m={terracotta('#4a3b2e')} p={[0, h - 0.02, 0]} shadow={false} />
    </>
  );
}

/** Leaves as clusters of flattened spheres, seeded so each plant is irregular but stable. */
function LeafCloud({ count, spread, height, base, size, kind, seed, flat = 0.55 }: { count: number; spread: number; height: number; base: number; size: number; kind: Foliage; seed: number; flat?: number }) {
  const g = merged(`leaves${count},${spread},${height},${base},${size},${seed},${flat}`, () => {
    const rand = rng(seed);
    return Array.from({ length: count }, () => {
      const a = rand() * Math.PI * 2;
      const t = rand();
      const rr = spread * Math.sqrt(rand()) * (0.6 + 0.4 * (1 - Math.abs(t - 0.5) * 2));
      const sz = size * (0.7 + rand() * 0.6);
      return { g: sphere(sz, 1), m: mat4([Math.cos(a) * rr, base + t * height, Math.sin(a) * rr], [rand(), rand() * 3, rand()], [1, flat, 1]) };
    });
  });
  return <M g={g} m={foliage(kind)} />;
}

/** Arching fronds of paired leaflets that droop towards the tips, merged into one mesh. */
function Fronds({ count, height, base, seed }: { count: number; height: number; base: number; seed: number }) {
  const g = merged(`fronds${count},${height},${base},${seed}`, () => {
    const rand = rng(seed);
    const parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + rand() * 0.4;
      const len = height * (0.75 + rand() * 0.35);
      const lift = 1.15 - rand() * 0.45;
      const n = 11;
      const frond = mat4([0, base, 0], [0, a, 0]);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        // integrate the arc to find where along it this leaflet sits
        let px = 0;
        let py = 0;
        for (let q = 0; q < 6; q++) {
          const tq = (t * (q + 0.5)) / 6;
          px += (Math.cos(lift - tq * 1.5) * len * t) / 6;
          py += (Math.sin(lift - tq * 1.5) * len * t) / 6;
        }
        const leaflet = 0.07 * (1 - t * 0.7) * Math.max(0.6, len / 0.8);
        const pair = frond.clone().multiply(mat4([px, py, 0], [0, 0, lift - t * 1.5]));
        for (const sd of [-1, 1]) {
          parts.push({ g: sphere(1, 1), m: pair.clone().multiply(mat4([0, 0, sd * leaflet * 0.85], [0, sd * 0.35, 0], [(len / n) * 0.55, 0.006, leaflet])) });
        }
      }
    }
    return parts;
  });
  return <M g={g} m={foliage('leaf')} />;
}

function Plant({ it }: { it: FurnitureItem }) {
  const potM = it.variant === 'bonsai' ? ceramic(it.accent ?? '#3c3d3d', 0.4) : it.accent === '#b4704f' || it.accent === '#c9a184' ? terracotta(it.accent) : ceramic(it.accent ?? '#f3f0e8', 0.6);
  const r = it.w / 2;
  const seed = Math.round(it.x * 131 + it.y * 17);
  switch (it.variant) {
    case 'tree': {
      // A small garden tree planted in the ground: a clear trunk and a rounded, airy crown.
      const trunk = it.h * 0.42;
      return (
        <group>
          <M g={cylinder(0.05, 0.08, trunk, 10)} m={lacquer('#7d7467', 0.9)} p={[0, trunk / 2, 0]} />
          <M g={cylinder(0.03, 0.045, trunk * 0.5, 8)} m={lacquer('#7d7467', 0.9)} p={[0.18, trunk * 0.78, 0]} r={[0, 0, -0.7]} />
          <M g={cylinder(0.03, 0.045, trunk * 0.5, 8)} m={lacquer('#7d7467', 0.9)} p={[-0.16, trunk * 0.8, 0.06]} r={[0, 0, 0.65]} />
          <LeafCloud count={150} spread={it.h * 0.3} height={it.h * 0.5} base={it.h * 0.45} size={0.2} kind="leaf" seed={seed} flat={0.5} />
        </group>
      );
    }
    case 'olive': {
      const potH = Math.min(0.42, it.h * 0.22);
      return (
        <group>
          <Pot r={r * 0.8} h={potH} m={potM} />
          <M g={cylinder(0.025, 0.04, it.h * 0.55, 8)} m={wood('teak')} p={[0, potH + it.h * 0.27, 0]} r={[0.05, 0, 0.06]} />
          <LeafCloud count={Math.round(30 * it.h)} spread={r * 1.2} height={it.h * 0.42} base={it.h * 0.52} size={0.07 * Math.max(0.6, it.h / 1.6)} kind="olive" seed={seed} flat={0.4} />
        </group>
      );
    }
    case 'bonsai':
      return (
        <group>
          <M g={cylinder(r, r * 0.85, 0.07, 32)} m={potM} p={[0, 0.035, 0]} />
          <M g={cylinder(0.015, 0.03, it.h * 0.6, 8)} m={wood('teak')} p={[0.02, it.h * 0.35, 0]} r={[0, 0, 0.35]} />
          <LeafCloud count={14} spread={r * 0.9} height={it.h * 0.25} base={it.h * 0.6} size={0.05} kind="pine" seed={seed} flat={0.35} />
        </group>
      );
    case 'snake':
      return (
        <group>
          <Pot r={r * 0.8} h={0.3} m={potM} />
          {Array.from({ length: 9 }, (_, i) => {
            const rand = rng(seed + i);
            return <Box key={i} w={0.06} h={(it.h - 0.3) * (0.6 + rand() * 0.4)} d={0.01} x={(rand() - 0.5) * r} y={0.28} z={(rand() - 0.5) * r} m={foliage('leaf')} r={0.004} rot={[(rand() - 0.5) * 0.3, rand() * 3, (rand() - 0.5) * 0.3]} />;
          })}
        </group>
      );
    case 'trailing':
      return (
        <group>
          <Pot r={r * 0.75} h={it.h * 0.45} m={potM} />
          <LeafCloud count={18} spread={r * 1.1} height={it.h * 0.25} base={it.h * 0.4} size={0.035} kind="leaf" seed={seed} />
          <LeafCloud count={10} spread={r * 1.3} height={-it.h * 0.8} base={it.h * 0.4} size={0.028} kind="leaf" seed={seed + 1} />
        </group>
      );
    default: {
      const potH = Math.min(0.35, it.h * 0.35);
      return (
        <group>
          <Pot r={r * 0.65} h={potH} m={potM} />
          <Fronds count={14} height={it.h - potH} base={potH - 0.02} seed={seed} />
        </group>
      );
    }
  }
}

function Herbs({ it }: { it: FurnitureItem }) {
  return (
    <group>
      {[-1, 0, 1].map((i) => (
        <group key={i} position={[(i * it.w) / 3, 0, 0]}>
          <Pot r={0.06} h={0.12} m={terracotta()} />
          <LeafCloud count={12} spread={0.06} height={0.12} base={0.14} size={0.025} kind={i === 0 ? 'olive' : 'leaf'} seed={i + 7} />
        </group>
      ))}
    </group>
  );
}

function Boards({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w * 0.55} h={it.h} d={0.025} x={-it.w * 0.18} z={0} m={wood()} r={0.01} rot={[-0.12, 0, 0]} grain />
      <Box w={it.w * 0.45} h={it.h * 0.75} d={0.025} x={it.w * 0.22} z={0.03} m={wood('teak')} r={0.01} rot={[-0.1, 0, 0]} grain />
    </group>
  );
}

function Bowl({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  const rand = rng(Math.round(it.x * 50));
  return (
    <group>
      <M
        g={lathe([
          [0.001, 0],
          [r * 0.5, 0.005],
          [r * 0.9, it.h * 0.6],
          [r, it.h],
          [r * 0.94, it.h],
          [r * 0.85, it.h * 0.6],
          [0.001, it.h * 0.15],
        ])}
        m={ceramic(it.colour ?? '#3c3d3d', 0.45)}
      />
      {it.variant === 'fruit' &&
        Array.from({ length: 6 }, (_, i) => (
          <M key={i} g={sphere(0.037, 2)} m={ceramic(['#c9a440', '#a8452f', '#9fb04a'][i % 3], 0.4)} p={[(rand() - 0.5) * r, it.h * 0.7, (rand() - 0.5) * r]} />
        ))}
    </group>
  );
}

function Vase({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  const sprigs = it.variant === 'sprigs';
  return (
    <group>
      <M
        g={lathe([
          [0.001, 0],
          [r, 0.01],
          [r, sprigs ? 0.16 : 0.22],
          [r * 0.5, sprigs ? 0.2 : 0.3],
          [r * 0.55, sprigs ? 0.22 : 0.32],
        ])}
        m={ceramic(it.colour ?? '#bdb7ae', 0.6)}
      />
      {sprigs ? (
        <LeafCloud count={10} spread={0.06} height={0.15} base={0.22} size={0.035} kind="pine" seed={3} flat={0.4} />
      ) : (
        Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          return <M key={i} g={cylinder(0.002, 0.003, it.h, 4)} m={foliage('grass')} p={[Math.cos(a) * 0.04, it.h / 2 + 0.1, Math.sin(a) * 0.04]} r={[Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25]} />;
        })
      )}
    </group>
  );
}

function Books({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={0.035} d={it.d} m={lacquer('#34483e', 0.8)} r={0.003} />
      <Box w={it.w * 0.9} h={0.03} d={it.d * 0.9} y={0.035} m={lacquer('#e9e3d6', 0.8)} r={0.003} rot={[0, 0.1, 0]} />
    </group>
  );
}

function Towels({ it }: { it: FurnitureItem }) {
  if (it.variant === 'rail') {
    return (
      <group>
        <M g={cylinder(0.01, 0.01, it.w, 10)} m={metal('#c9c9c9', 0.25)} p={[0, it.h * 0.5, 0.03]} r={[0, 0, Math.PI / 2]} />
        <Box w={it.w * 0.8} h={it.h * 0.45} d={0.025} y={it.h * 0.05} z={0.035} m={fabric(it.colour ?? '#5f6e40', 'knit')} r={0.01} />
      </group>
    );
  }
  // oak ladder leaning on the wall
  return (
    <group rotation={[-0.12, 0, 0]} position={[0, 0, 0.08]}>
      {[-1, 1].map((s) => (
        <Box key={s} w={0.035} h={it.h} d={0.025} x={(s * it.w) / 2} m={wood()} r={0.008} grain />
      ))}
      {[0.4, 0.75, 1.1, 1.45].map((y) => (
        <M key={y} g={cylinder(0.012, 0.012, it.w, 10)} m={wood()} p={[0, y, 0]} r={[0, 0, Math.PI / 2]} />
      ))}
      <Box w={it.w * 0.85} h={0.5} d={0.03} y={0.62} z={0.02} m={fabric(it.colour ?? '#bdb7ae', 'knit')} r={0.012} />
      <Box w={it.w * 0.8} h={0.4} d={0.03} y={1.08} z={0.02} m={fabric(it.accent ?? '#5f6e40', 'knit')} r={0.012} />
    </group>
  );
}

function Stool({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <M g={cylinder(it.w / 2, it.w / 2, 0.035, 32)} m={wood()} p={[0, it.h - 0.0175, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return <M key={i} g={cylinder(0.016, 0.014, it.h, 8)} m={wood()} p={[Math.cos(a) * it.w * 0.3, it.h / 2, Math.sin(a) * it.w * 0.3]} r={[Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1]} />;
      })}
    </group>
  );
}

function Toilet({ it }: { it: FurnitureItem }) {
  // The same Laufen Pro pan as in the bathrooms, on a flush river-green pre-wall.
  return (
    <group position={[0, 0, -it.d / 2]}>
      <BathToilet w={it.w} d={it.d} />
      <Box w={0.45} h={1.1} d={0.01} z={0.005} m={paint('#3d6262')} r={0.002} />
    </group>
  );
}

function Basin({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={0.03} d={it.d} m={wood()} r={0.006} />
      <M
        g={lathe([
          [0.001, 0.03],
          [0.1, 0.035],
          [0.15, it.h * 0.8],
          [0.16, it.h],
          [0.15, it.h],
          [0.13, it.h * 0.6],
          [0.001, it.h * 0.45],
        ])}
        m={ceramic('#9a988f', 0.5)}
      />
      <M g={cylinder(0.01, 0.01, 0.2, 10)} m={metal('#2b2b2a', 0.4)} p={[0, it.h + 0.12, -it.d / 2 + 0.03]} />
      <M g={cylinder(0.008, 0.008, 0.12, 10)} m={metal('#2b2b2a', 0.4)} p={[0, it.h + 0.2, -it.d / 2 + 0.09]} r={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

/* ---------------------------------------------------------------- outdoor and basement */

function Lounger({ it }: { it: FurnitureItem }) {
  const teak = wood('teak');
  return (
    <group>
      <Legs w={it.w} d={it.d} h={0.25} inset={0.05} r={0.02} m={teak} />
      <Box w={it.w} h={0.05} d={it.d} y={0.25} m={teak} r={0.01} />
      <Box w={it.w - 0.06} h={0.06} d={it.d * 0.65} y={0.3} z={it.d * 0.17} m={fabric(it.colour ?? '#dcd3c4', 'linen')} r={0.025} />
      <group position={[0, 0.3, -it.d / 2 + 0.25]} rotation={[-0.75, 0, 0]}>
        <Box w={it.w - 0.06} h={0.6} d={0.06} y={0} m={fabric(it.colour ?? '#dcd3c4', 'linen')} r={0.025} />
      </group>
    </group>
  );
}

/**
 * A two-person cabin sauna after the photo Dennis chose: a black frame with a full glass
 * front and a glass door, and a dark wood interior with a bench, slatted backrests, infrared
 * panels, low cabinets in the front corners and a warm light strip under the ceiling.
 * The front faces +z.
 */
function Sauna({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const { w, d, h } = it;
  const black = metal('#161616', 0.55);
  const lining = wood('teak');
  const dark = lacquer('#3b2a20', 0.7);
  const t = 0.05;
  const iw = w - 2 * t;
  const back = -d / 2 + t;
  const boards = Math.round((h - 0.1) / 0.11);
  const mullion = -w / 2 + w * 0.3;
  return (
    <group>
      {/* Black shell */}
      <Box w={w} h={t} d={d} m={black} r={0.004} />
      <Box w={w} h={t} d={d} y={h - t} m={black} r={0.004} />
      {[-1, 1].map((sx) => (
        <Box key={sx} w={t} h={h} d={d} x={sx * (w / 2 - t / 2)} m={black} r={0.004} />
      ))}
      <Box w={w} h={h} d={t} z={-d / 2 + t / 2} m={black} r={0.004} />
      {/* Horizontal boards on the back and side walls, a slatted ceiling */}
      {Array.from({ length: boards }, (_, i) => (
        <Box key={`b${i}`} w={iw} h={0.105} d={0.015} y={t + i * 0.11} z={back + 0.008} m={lining} r={0.002} grain />
      ))}
      {[-1, 1].map((sx) => (
        <Box key={`s${sx}`} w={0.015} h={h - 2 * t} d={d - t - 0.04} x={sx * (iw / 2 - 0.008)} y={t} z={t / 2 - 0.02} m={lining} r={0.002} grain />
      ))}
      <Box w={iw} h={0.015} d={d - t - 0.04} y={h - t - 0.015} z={t / 2 - 0.02} m={lining} r={0.002} grain />
      {/* Bench and slatted floor */}
      <Box w={iw} h={0.05} d={0.45} y={0.42} z={back + 0.225} m={lining} r={0.006} grain />
      <Box w={iw - 0.04} h={0.37} d={0.02} y={t} z={back + 0.44} m={dark} r={0.002} />
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={`f${i}`} w={iw - 0.02} h={0.02} d={0.06} y={t} z={back + 0.48 + i * 0.075} m={dark} r={0.003} />
      ))}
      {/* Two slatted backrests with an infrared panel between them */}
      {[-1, 1].map((sx) =>
        Array.from({ length: 6 }, (_, i) => (
          <Box key={`r${sx}${i}`} w={0.3} h={0.035} d={0.03} x={sx * iw * 0.25} y={0.55 + i * 0.075} z={back + 0.05} m={lining} r={0.004} />
        )),
      )}
      <Box w={0.06} h={0.42} d={0.012} y={0.6} z={back + 0.022} m={cached('ir-panel', () => new THREE.MeshStandardMaterial({ color: '#2a0d08', emissive: '#c8321c', emissiveIntensity: 0.45 }))} r={0.002} />
      {/* Low cabinets in the front corners */}
      {[-1, 1].map((sx) => (
        <Box key={`c${sx}`} w={0.27} h={0.85} d={0.1} x={sx * (iw / 2 - 0.15)} y={t} z={d / 2 - t - 0.08} m={dark} r={0.004} grain />
      ))}
      {/* Warm light strip under the ceiling, front and sides */}
      <Box w={iw - 0.04} h={0.015} d={0.015} y={h - t - 0.06} z={d / 2 - t - 0.06} m={cached('sauna-led', () => new THREE.MeshStandardMaterial({ color: '#ffd28a', emissive: '#ffb347', emissiveIntensity: 3 }))} r={0} />
      {lit && <pointLight position={[0, h - 0.3, 0]} color="#ffb347" intensity={1.2} distance={2.5} decay={2} />}
      {/* Front: black frame, a fixed pane and a glass door with a long black handle */}
      <Box w={w} h={t} d={t} y={h - t} z={d / 2 - t / 2} m={black} r={0.004} />
      <Box w={w} h={t} d={t} z={d / 2 - t / 2} m={black} r={0.004} />
      <Box w={0.03} h={h - 2 * t} d={0.04} x={mullion} y={t} z={d / 2 - 0.02} m={black} r={0.004} />
      <Box w={w - 2 * t} h={h - 2 * t} d={0.008} y={t} z={d / 2 - 0.025} m={cached('sauna-glass', () => new THREE.MeshPhysicalMaterial({ color: '#2c2a26', roughness: 0.04, transparent: true, opacity: 0.32, metalness: 0.1 }))} r={0} />
      <M g={cylinder(0.011, 0.011, 0.95, 12)} m={black} p={[mullion + 0.07, h * 0.52, d / 2 + 0.035]} />
      {[0.38, h - 0.45].map((y) => (
        <Box key={y} w={0.035} h={0.07} d={0.02} x={mullion + 0.07} y={y} z={d / 2 + 0.01} m={black} r={0.003} />
      ))}
      {[h * 0.25, h * 0.85].map((y) => (
        <Box key={`h${y}`} w={0.04} h={0.08} d={0.02} x={w / 2 - t - 0.05} y={y} z={d / 2 - 0.005} m={black} r={0.003} />
      ))}
    </group>
  );
}

/** A round cold-plunge tub in teak staves with two steel bands, open and filled to near the rim. */
function IceBath({ it }: { it: FurnitureItem }) {
  const r = Math.min(it.w, it.d) / 2;
  const h = it.h;
  // Outer wall, rim and inner wall in one turned profile, so the tub is open at the top.
  const tub = lathe([
    [0.001, 0],
    [r * 0.96, 0],
    [r, h],
    [r - 0.04, h],
    [r - 0.05, 0.06],
    [0.001, 0.06],
  ], 48);
  return (
    <group>
      <M g={tub} m={wood('teak')} />
      {[0.15, h - 0.15].map((y, i) => (
        <M key={i} g={cylinder(r * (0.96 + (0.04 * y) / h) + 0.006, r * (0.96 + (0.04 * y) / h) + 0.006, 0.04, 48)} m={metal('#2b2b2a', 0.5)} p={[0, y, 0]} />
      ))}
      <M g={cylinder(r - 0.043, r - 0.043, 0.004, 48)} m={water()} p={[0, h - 0.1, 0]} shadow={false} />
    </group>
  );
}

/** A simple black steel bike stand: a row of upright slots on a flat base rail, to lean a bike against. */
function BikeRack({ it }: { it: FurnitureItem }) {
  const black = metal('#1c1c1d', 0.5);
  const slots = Math.max(2, Math.round(it.w / 0.37));
  return (
    <group>
      <Box w={it.w} h={0.03} d={0.05} y={0.02} m={black} r={0.006} />
      {Array.from({ length: slots }, (_, i) => {
        const x = -it.w / 2 + 0.07 + ((it.w - 0.14) * i) / (slots - 1);
        return (
          <group key={i} position={[x, 0, 0]}>
            <M g={cylinder(0.012, 0.012, it.h * 0.75, 8)} m={black} p={[-0.04, it.h * 0.4, 0]} />
            <M g={cylinder(0.012, 0.012, it.h * 0.75, 8)} m={black} p={[0.04, it.h * 0.4, 0]} />
            <M g={torus(0.04, 0.012, Math.PI)} m={black} p={[0, it.h * 0.78, 0]} />
          </group>
        );
      })}
    </group>
  );
}

function Planter({ it }: { it: FurnitureItem }) {
  const seed = Math.round(it.y * 77);
  return (
    <group>
      <Box w={it.w} h={it.h} d={it.d} m={metal('#4a4744', 0.7)} r={0.01} />
      <Box w={it.w - 0.04} h={0.02} d={it.d - 0.04} y={it.h - 0.04} m={terracotta('#4a3b2e')} r={0} />
      {it.variant === 'grass' ? (
        <LeafCloud count={30} spread={it.w / 2.2} height={0.3} base={it.h + 0.1} size={0.08} kind="grass" seed={seed} flat={1.6} />
      ) : it.variant === 'birch' ? (
        <>
          {[-0.4, 0.3].map((x, i) => (
            <group key={i} position={[x * it.w, 0, 0]}>
              <M g={cylinder(0.03, 0.045, 2.4, 10)} m={lacquer('#ecebe6', 0.8)} p={[0, it.h + 1.2, 0]} />
              <LeafCloud count={40} spread={0.55} height={1.0} base={it.h + 1.6} size={0.12} kind="olive" seed={seed + i} flat={0.6} />
            </group>
          ))}
          <LeafCloud count={16} spread={it.w / 2.5} height={0.2} base={it.h + 0.1} size={0.09} kind="leaf" seed={seed + 9} flat={0.4} />
        </>
      ) : (
        [-0.3, 0.25].map((x, i) => (
          <group key={i} position={[x * it.w, 0, 0]}>
            <LeafCloud count={36} spread={0.4} height={0.9} base={it.h + 0.15} size={0.14} kind="pine" seed={seed + i} flat={0.7} />
          </group>
        ))
      )}
    </group>
  );
}

function Workbench({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={0.06} d={it.d} y={it.h - 0.06} m={wood()} r={0.006} />
      <Legs w={it.w} d={it.d} h={it.h - 0.06} inset={0.06} r={0.035} />
      <Box w={it.w - 0.1} h={0.025} d={it.d - 0.1} y={0.18} m={wood()} r={0.004} />
      <Box w={0.3} h={0.12} d={0.2} x={-it.w / 3} y={it.h} m={metal('#7a2b1e', 0.5)} r={0.01} />
    </group>
  );
}

function Pegboard({ it }: { it: FurnitureItem }) {
  return (
    <group position={[0, it.h / 2, 0]}>
      <M g={roundedBox(it.w, it.h, it.d, 0.003)} m={wood('birch')} />
      {[-0.7, -0.4, -0.1, 0.25, 0.55].map((x, i) => (
        <Box key={i} w={0.03} h={0.25 - (i % 2) * 0.08} d={0.02} x={x} y={-0.15} z={it.d / 2 + 0.01} m={metal(i % 2 ? '#2b2b2a' : '#8a8a88', 0.4)} r={0.004} />
      ))}
    </group>
  );
}

function Washer({ it }: { it: FurnitureItem }): ReactNode {
  if (it.variant === 'stack') {
    // A washing machine with the dryer stacked on it.
    const one = { ...it, h: it.h / 2 };
    return (
      <group>
        <Washer it={{ ...one, variant: 'bare' }} />
        <group position={[0, it.h / 2, 0]}>
          <Washer it={{ ...one, variant: 'dryer' }} />
        </group>
      </group>
    );
  }
  return (
    <group>
      <Box w={it.w} h={it.h} d={it.d} m={lacquer('#f4f4f2', 0.3)} r={0.015} />
      <M g={torus(0.17, 0.025)} m={lacquer('#c9c9c9', 0.3)} p={[0, it.h * 0.45, it.d / 2 + 0.005]} />
      <M g={cylinder(0.16, 0.16, 0.01, 40)} m={screen()} p={[0, it.h * 0.45, it.d / 2]} r={[Math.PI / 2, 0, 0]} />
      <Box w={it.w - 0.04} h={0.1} d={0.01} y={it.h - 0.12} z={it.d / 2} m={lacquer('#e2e2df', 0.4)} r={0} />
      {it.variant !== 'dryer' && it.variant !== 'bare' && <Box w={1.3} h={0.03} d={it.d + 0.03} x={0.33} y={it.h + 0.005} m={wood()} r={0.004} />}
    </group>
  );
}

function DryingRack({ it }: { it: FurnitureItem }) {
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[(s * it.w) / 2, 0, 0]}>
          <M g={cylinder(0.012, 0.012, it.h, 8)} m={wood()} p={[0, it.h / 2, it.d / 2 - 0.02]} r={[0.25, 0, 0]} />
          <M g={cylinder(0.012, 0.012, it.h, 8)} m={wood()} p={[0, it.h / 2, -it.d / 2 + 0.02]} r={[-0.25, 0, 0]} />
        </group>
      ))}
      {[-0.2, -0.07, 0.07, 0.2].map((z, i) => (
        <M key={i} g={cylinder(0.006, 0.006, it.w, 6)} m={wood()} p={[0, it.h - 0.05, z]} r={[0, 0, Math.PI / 2]} />
      ))}
      <Box w={0.5} h={0.4} d={0.01} x={-0.15} y={it.h - 0.45} z={0.07} m={fabric('#e9e3d6', 'linen')} r={0.003} />
    </group>
  );
}

/* ---------------------------------------------------------------- October 2026 additions */

/**
 * A corner sofa: a full-width back run and a chaise coming forward on one side (`it.chaise`,
 * as seen facing the sofa). `w` and `d` are the whole L.
 */
function CornerSofa({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const up = fabric(it.colour ?? '#a9d6cf', weaveOf(it.variant));
  const accent = fabric(it.accent ?? '#e9e3d6', 'linen');
  const side = it.chaise === 'left' ? -1 : 1;
  const legH = 0.1;
  const arm = 0.16;
  const backD = 0.22;
  const seatH = 0.2;
  const runD = SOFA_DEPTH;
  const chD = d - runD;
  const back = -d / 2;
  const chX = side * (w / 2 - CHAISE_WIDTH / 2);
  const seatTop = legH + 0.16;
  // Two seats on the run beside the chaise.
  const runInner0 = side < 0 ? -w / 2 + CHAISE_WIDTH : -w / 2 + arm;
  const runInner1 = side < 0 ? w / 2 - arm : w / 2 - CHAISE_WIDTH;
  const seats = 2;
  const seatW = (runInner1 - runInner0) / seats;
  const legs: [number, number][] = [
    [-w / 2 + 0.06, back + 0.06],
    [w / 2 - 0.06, back + 0.06],
    [-side * (w / 2 - 0.06), back + runD - 0.06],
    [side * (w / 2 - CHAISE_WIDTH + 0.06), d / 2 - 0.06],
    [side * (w / 2 - 0.06), d / 2 - 0.06],
  ];
  return (
    <group>
      {legs.map(([x, z], i) => (
        <M key={i} g={cylinder(0.02, 0.016, legH, 12)} m={metal('#2b2b2a', 0.5)} p={[x, legH / 2, z]} />
      ))}
      <Box w={w} h={0.18} d={runD} y={legH} z={back + runD / 2} m={up} r={0.04} />
      <Box w={CHAISE_WIDTH} h={0.18} d={chD + 0.02} x={chX} y={legH} z={back + runD + chD / 2 - 0.01} m={up} r={0.04} />
      <Box w={w - 0.02} h={it.h - legH} d={backD} y={legH} z={back + backD / 2} m={up} r={0.06} />
      <Box w={arm} h={0.42} d={runD} x={-side * (w / 2 - arm / 2)} y={legH} z={back + runD / 2} m={up} r={0.06} />
      {/* the chaise's outer side rises a little, as an armrest along its length */}
      <Box w={arm} h={0.36} d={d} x={side * (w / 2 - arm / 2)} y={legH} m={up} r={0.06} />
      {Array.from({ length: seats }, (_, i) => {
        const cx = runInner0 + seatW * (i + 0.5);
        return (
          <group key={i}>
            <Box w={seatW - 0.012} h={seatH} d={runD - backD - 0.02} x={cx} y={seatTop} z={back + backD + (runD - backD) / 2} m={up} r={0.07} />
            <Box w={seatW - 0.02} h={0.42} d={0.2} x={cx} y={seatTop + seatH - 0.02} z={back + backD + 0.06} m={up} r={0.08} rot={[-0.12, 0, 0]} />
          </group>
        );
      })}
      <Box w={CHAISE_WIDTH - arm - 0.012} h={seatH} d={d - backD - 0.02} x={chX - (side * arm) / 2} y={seatTop} z={back + backD + (d - backD) / 2} m={up} r={0.07} />
      <Box w={CHAISE_WIDTH - arm - 0.02} h={0.42} d={0.2} x={chX - (side * arm) / 2} y={seatTop + seatH - 0.02} z={back + backD + 0.06} m={up} r={0.08} rot={[-0.12, 0, 0]} />
      {/* scatter cushions in snow and pine, and a throw on the chaise */}
      <Box w={0.46} h={0.44} d={0.13} x={chX - (side * arm) / 2} y={seatTop + seatH + 0.12} z={back + backD + 0.25} m={accent} r={0.06} rot={[-0.25, side * 0.2, 0]} />
      <Box w={0.42} h={0.4} d={0.13} x={-side * (w / 2 - arm - 0.32)} y={seatTop + seatH + 0.1} z={back + backD + 0.25} m={fabric('#34483e', 'wool')} r={0.06} rot={[-0.25, -side * 0.2, 0]} />
      <Box w={0.42} h={0.4} d={0.13} x={-side * (w / 2 - arm - 0.75)} y={seatTop + seatH + 0.1} z={back + backD + 0.25} m={accent} r={0.06} rot={[-0.25, 0.1, 0]} />
      <Box w={CHAISE_WIDTH - arm - 0.05} h={0.025} d={0.55} x={chX - (side * arm) / 2} y={seatTop + seatH} z={d / 2 - 0.4} m={fabric('#e9e3d6', 'knit')} r={0.01} />
    </group>
  );
}

/** A black aluminium pergola with a louvred roof, after Dennis's photo: front faces +z, the back rests on the facade. */
function Pergola({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const alu = metal('#2a2b2c', 0.55);
  const post = 0.12;
  const beamH = 0.22;
  const louvres = Math.floor((d - 0.2) / 0.16);
  return (
    <group>
      {[-1, 1].map((s) => (
        <Box key={s} w={post} h={h} d={post} x={s * (w / 2 - post / 2)} z={d / 2 - post / 2} m={alu} r={0.004} />
      ))}
      {/* front beam, side beams and a wall plate along the facade */}
      <Box w={w} h={beamH} d={post} y={h - beamH} z={d / 2 - post / 2} m={alu} r={0.004} />
      {[-1, 1].map((s) => (
        <Box key={`b${s}`} w={post} h={beamH} d={d} x={s * (w / 2 - post / 2)} y={h - beamH} m={alu} r={0.004} />
      ))}
      <Box w={w} h={beamH} d={0.08} y={h - beamH} z={-d / 2 + 0.04} m={alu} r={0.004} />
      {/* louvres, parallel to the facade, half open */}
      {Array.from({ length: louvres }, (_, i) => (
        <Box key={`l${i}`} w={w - 2 * post} h={0.025} d={0.15} y={h - 0.12} z={-d / 2 + 0.16 + i * 0.16} m={alu} r={0.003} rot={[0.5, 0, 0]} />
      ))}
    </group>
  );
}

/** Washing lines across the laundry, on two wall brackets, with a few things hanging. */
function ClothesLine({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const lines = 4;
  const steel = metal('#bfc1c2', 0.3);
  const zs = Array.from({ length: lines }, (_, i) => -d / 2 + (d * (i + 0.5)) / lines);
  const hanging: [number, number, string, number, number][] = [
    [-0.9, 0, '#e9e3d6', 0.5, 0.3],
    [-0.3, 0, '#8a9fab', 0.4, 0.28],
    [0.5, 1, '#f3f0e8', 0.7, 0.36],
    [-0.6, 2, '#5f6e40', 0.35, 0.25],
    [0.3, 2, '#dcd3c4', 0.5, 0.4],
    [0.9, 3, '#c8743f', 0.3, 0.22],
  ];
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 - 0.02), h, 0]}>
          <Box w={0.04} h={0.04} d={d + 0.06} m={steel} r={0.006} />
          <Box w={0.03} h={0.12} d={0.03} y={0.02} m={steel} r={0.006} />
        </group>
      ))}
      {zs.map((z, i) => (
        <M key={i} g={cylinder(0.0025, 0.0025, w - 0.04, 6)} m={lacquer('#e8e6e0', 0.6)} p={[0, h + 0.02, z]} r={[0, 0, Math.PI / 2]} shadow={false} />
      ))}
      {hanging.map(([x, l, c, cw, ch], i) => (
        <Box key={`c${i}`} w={cw} h={ch} d={0.008} x={x * (w / 2 - 0.4)} y={h + 0.02 - ch} z={zs[l]} m={fabric(c, 'linen')} r={0.003} />
      ))}
    </group>
  );
}

/** A white ceramic utility sink on a white base cabinet, with a tall chrome tap. */
function UtilitySink({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const white = lacquer('#f4f4f2', 0.35);
  const sinkH = 0.22;
  return (
    <group>
      <Box w={w - 0.02} h={0.08} d={d - 0.06} z={-0.03} m={lacquer('#d9d8d4', 0.6)} r={0} />
      <Box w={w} h={h - sinkH - 0.08} d={d} y={0.08} m={white} r={0.006} />
      <Box w={0.004} h={h - sinkH - 0.12} d={0.004} y={0.1} z={d / 2} m={lacquer('#c9c7c2', 0.6)} r={0} />
      <Box w={w} h={sinkH} d={d} y={h - sinkH} m={ceramic('#f7f7f4', 0.1)} r={0.03} />
      <Box w={w - 0.1} h={0.005} d={d - 0.1} y={h + 0.001} m={ceramic('#dcdcd8', 0.2)} r={0} />
      <M g={cylinder(0.014, 0.014, 0.32, 16)} m={metal('#d9d9d6', 0.15)} p={[0, h + 0.16, -d / 2 + 0.06]} />
      <M g={torus(0.08, 0.012, Math.PI)} m={metal('#d9d9d6', 0.15)} p={[0, h + 0.32, -d / 2 + 0.14]} r={[0, Math.PI / 2, 0]} />
    </group>
  );
}

/** A height-adjustable standing desk: a white top on two white telescopic legs with T-feet. */
function StandingDesk({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const white = lacquer('#f5f5f3', 0.35);
  const frame = lacquer('#eeeeec', 0.4);
  const top = 0.025;
  return (
    <group>
      <Box w={w} h={top} d={d} y={h - top} m={white} r={0.006} />
      {[-1, 1].map((s) => (
        <group key={s} position={[s * (w / 2 - 0.2), 0, 0]}>
          <Box w={0.07} h={0.03} d={d - 0.04} m={frame} r={0.008} />
          <Box w={0.08} h={(h - top) * 0.55} d={0.06} y={0.03} m={frame} r={0.006} />
          <Box w={0.07} h={(h - top) * 0.5} d={0.05} y={(h - top) * 0.5} m={frame} r={0.006} />
          <Box w={0.06} h={0.03} d={d - 0.1} y={h - top - 0.03} m={frame} r={0.004} />
        </group>
      ))}
      <Box w={w - 0.46} h={0.05} d={0.04} y={h - top - 0.05} m={frame} r={0.004} />
      {/* height control under the front edge, and a felt desk mat */}
      <Box w={0.12} h={0.02} d={0.05} x={w / 2 - 0.15} y={h - top - 0.02} z={d / 2 - 0.04} m={lacquer('#2b2b2a', 0.4)} r={0.004} />
      <Box w={Math.min(0.9, w - 0.3)} h={0.004} d={0.4} y={h} z={0.1} m={fabric('#8c8f91', 'wool')} r={0.002} />
    </group>
  );
}

/** A flat monitor on a stand: `w` is the screen's width, `h` the height to its top edge. */
function Monitor({ it }: { it: FurnitureItem }) {
  const { w, h } = it;
  const black = metal('#1b1b1c', 0.45);
  const sh = w * 0.59;
  const cy = h - sh / 2;
  return (
    <group>
      <Box w={0.24} h={0.012} d={0.18} z={-0.02} m={black} r={0.004} />
      <Box w={0.05} h={cy} d={0.03} z={-0.06} m={black} r={0.006} />
      <M g={roundedBox(w, sh, 0.025, 0.004)} m={black} p={[0, cy, -0.035]} />
      <M g={plane(w - 0.012, sh - 0.03)} m={screen()} p={[0, cy + 0.006, -0.0218]} shadow={false} />
    </group>
  );
}

/** Logitech MX Keys: a low graphite keyboard with round-dished keys. */
function Keyboard({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const rows = 6;
  const cols = 15;
  const kw = (w - 0.03) / cols;
  const kd = (d - 0.03) / rows;
  const keys = merged(`keys${w},${d}`, () =>
    Array.from({ length: rows * cols }, (_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      return { g: roundedBox(kw - 0.004, 0.006, kd - 0.004, 0.002), m: mat4([-w / 2 + 0.015 + kw * (c + 0.5), 0.016, -d / 2 + 0.015 + kd * (r + 0.5)]) };
    }),
  );
  return (
    <group>
      <Box w={w} h={0.014} d={d} m={metal('#3a3b3d', 0.5)} r={0.004} />
      <M g={keys} m={lacquer('#4a4b4e', 0.55)} shadow={false} />
    </group>
  );
}

/** Logitech MX Master: a sculpted graphite mouse with a thumb rest and a steel wheel. */
function Mouse({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const g = metal('#35363a', 0.55);
  return (
    <group>
      <M g={sphere(0.5, 3)} m={g} p={[0, h * 0.45, 0]} s={[w, h * 0.9, d]} />
      <M g={sphere(0.5, 2)} m={g} p={[-w * 0.55, h * 0.18, 0.005]} s={[w * 0.45, h * 0.3, d * 0.55]} />
      <M g={cylinder(0.009, 0.009, 0.008, 16)} m={metal('#b9bbbc', 0.25)} p={[0, h * 0.86, -d * 0.18]} r={[0, 0, Math.PI / 2]} />
    </group>
  );
}

/** A small black speaker on a wall bracket, turned towards the room. */
function Speaker({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  return (
    <group position={[0, 0, 0]}>
      <Box w={0.04} h={0.04} d={0.06} y={h / 2 - 0.02} z={-d / 2} m={metal('#1b1b1c', 0.5)} r={0.004} />
      <Box w={w} h={h} d={d} m={lacquer('#1d1d1e', 0.5)} r={0.012} />
      <Box w={w - 0.02} h={h - 0.03} d={0.004} y={0.015} z={d / 2} m={fabric('#2a2a2b', 'knit')} r={0.002} />
    </group>
  );
}

/** A HÅG Capisco: a saddle seat and a cross-shaped backrest in blue, on a black five-star base. */
function Capisco({ it }: { it: FurnitureItem }) {
  const up = fabric(it.colour ?? '#1f4e79', 'wool');
  const black = metal('#1c1c1d', 0.4);
  const seatY = 0.55;
  return (
    <group>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <Box w={0.045} h={0.03} d={0.32} z={0.16} y={0.06} m={black} r={0.01} rot={[0.08, 0, 0]} />
          <M g={sphere(0.028, 1)} m={black} p={[0, 0.028, 0.31]} />
        </group>
      ))}
      <M g={cylinder(0.03, 0.035, 0.12, 16)} m={black} p={[0, 0.13, 0]} />
      <M g={cylinder(0.018, 0.018, seatY - 0.2, 16)} m={metal('#c9c9c9', 0.2)} p={[0, 0.2 + (seatY - 0.2) / 2, 0]} />
      {/* saddle: wide at the back, with a raised horn at the front and dipped sides */}
      <Box w={0.46} h={0.07} d={0.3} y={seatY} z={-0.03} m={up} r={0.03} />
      <Box w={0.2} h={0.08} d={0.22} y={seatY + 0.01} z={0.13} m={up} r={0.035} />
      {[-1, 1].map((s) => (
        <Box key={s} w={0.1} h={0.07} d={0.22} x={s * 0.19} y={seatY + 0.025} z={0.02} m={up} r={0.03} rot={[0, s * 0.25, s * -0.12]} />
      ))}
      {/* backrest: a stem with a wide crossbar near the top */}
      <Box w={0.05} h={0.3} d={0.03} y={seatY + 0.02} z={-0.19} m={black} r={0.008} rot={[-0.15, 0, 0]} />
      <group position={[0, seatY + 0.3, -0.24]} rotation={[-0.12, 0, 0]}>
        <Box w={0.14} h={0.42} d={0.06} m={up} r={0.03} />
        <Box w={0.58} h={0.13} d={0.06} y={0.22} m={up} r={0.05} />
      </group>
    </group>
  );
}

/** An upright bike stand: a black steel hoop set in the ground, to lean one bike against. */
function BikeHoop({ it }: { it: FurnitureItem }) {
  const black = metal('#1c1c1d', 0.5);
  const r = it.w / 2 - 0.02;
  const legs = it.h - r;
  return (
    <group>
      {[-1, 1].map((s) => (
        <M key={s} g={cylinder(0.02, 0.02, legs, 12)} m={black} p={[s * r, legs / 2, 0]} />
      ))}
      <M g={torus(r, 0.02, Math.PI)} m={black} p={[0, legs, 0]} />
      <M g={cylinder(0.014, 0.014, 2 * r, 10)} m={black} p={[0, 0.3, 0]} r={[0, 0, Math.PI / 2]} />
    </group>
  );
}

/**
 * A barrel sauna after Dennis's photo, to match the ice bath: thermowood staves around a
 * round body, black end rings, vertical boards at the ends and a glass door at the front.
 * The barrel's axis runs along z; the door faces +z.
 */
function BarrelSauna({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const { w, d } = it;
  const R = w / 2 - 0.05;
  const cy = R + 0.09;
  const cedar = wood('cedar');
  const n = 40;
  const sw = ((2 * Math.PI * R) / n) * 0.985;
  const staves = merged(`barrel${R},${d}`, () =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return { g: roundedBox(sw, 0.042, d - 0.12, 0.004), m: mat4([R * Math.cos(a), cy + R * Math.sin(a), 0], [0, 0, a - Math.PI / 2]) };
    }),
  );
  const ring = lathe(
    [
      [R - 0.03, -0.05],
      [R + 0.05, -0.05],
      [R + 0.05, 0.05],
      [R - 0.03, 0.05],
      [R - 0.03, -0.05],
    ],
    16,
  );
  const door = { w: 0.62, y0: cy - R + 0.16, h: 1.62 };
  const board = 0.1;
  const boards = Math.floor((2 * R) / board);
  const end = (front: boolean) =>
    merged(`barrelEnd${R},${front}`, () => {
      const parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
      for (let i = 0; i < boards; i++) {
        const x = -R + board * (i + 0.5);
        const half = Math.sqrt(Math.max(0, R * R - (Math.abs(x) + board / 2) ** 2)) + 0.02;
        if (half < 0.05) continue;
        const y0 = cy - half;
        const y1 = cy + half;
        const inDoor = front && Math.abs(x) < door.w / 2 + 0.04;
        const spans: [number, number][] = inDoor ? [[y0, door.y0], [door.y0 + door.h, y1]] : [[y0, y1]];
        for (const [a, b] of spans) if (b - a > 0.02) parts.push({ g: roundedBox(board - 0.004, b - a, 0.035, 0.002, true), m: mat4([x, (a + b) / 2, 0]) });
      }
      return parts;
    });
  const zEnd = d / 2 - 0.1;
  return (
    <group>
      <M g={staves} m={cedar} />
      {[-1, 1].map((s) => (
        <M key={s} g={ring} m={lacquer('#262728', 0.6)} p={[0, cy, s * (d / 2 - 0.06)]} r={[Math.PI / 2, 0, 0]} />
      ))}
      <M g={end(true)} m={cedar} p={[0, 0, zEnd]} />
      <M g={end(false)} m={cedar} p={[0, 0, -zEnd]} />
      {/* glass door in a cedar frame, with a round wooden handle */}
      <Box w={door.w} h={door.h} d={0.012} y={door.y0} z={zEnd + 0.01} m={cached('sauna-glass', () => new THREE.MeshPhysicalMaterial({ color: '#2c2a26', roughness: 0.04, transparent: true, opacity: 0.32, metalness: 0.1 }))} r={0} />
      {[-1, 1].map((s) => (
        <Box key={s} w={0.04} h={door.h} d={0.04} x={s * (door.w / 2 + 0.02)} y={door.y0} z={zEnd} m={cedar} r={0.004} grain />
      ))}
      <Box w={door.w + 0.08} h={0.04} d={0.04} y={door.y0 + door.h} z={zEnd} m={cedar} r={0.004} />
      <M g={cylinder(0.035, 0.035, 0.05, 20)} m={wood('teak')} p={[-door.w / 2 + 0.08, door.y0 + door.h * 0.55, zEnd + 0.04]} r={[Math.PI / 2, 0, 0]} />
      {/* inside: benches along both sides and a stove at the back */}
      {[-1, 1].map((s) => (
        <Box key={`bench${s}`} w={0.42} h={0.04} d={d - 0.5} x={s * (R - 0.32)} y={cy - 0.3} z={-0.05} m={cedar} r={0.004} />
      ))}
      <Box w={0.36} h={0.6} d={0.32} y={cy - R + 0.06} z={-zEnd + 0.25} m={metal('#1e1e1e', 0.6)} r={0.01} />
      {/* the cradle it rests on */}
      {[-1, 1].map((s) => (
        <Box key={`c${s}`} w={w * 0.72} h={0.14} d={0.12} y={0} z={s * (d / 2 - 0.35)} m={lacquer('#262728', 0.6)} r={0.01} />
      ))}
      {lit && <pointLight position={[0, cy + 0.3, 0]} color="#ffb347" intensity={1.4} distance={2.6} decay={2} />}
    </group>
  );
}

/** A play tipi: natural cotton on five pine poles, open at the front (+z), with a cushion inside. */
function Tipi({ it }: { it: FurnitureItem }) {
  const r = Math.min(it.w, it.d) / 2 - 0.02;
  const h = it.h;
  const cloth = useMemo(() => new THREE.CylinderGeometry(0.06, r, h * 0.86, 5, 1, true, Math.PI * 0.2, Math.PI * 1.6), [r, h]);
  const canvasM = cached('tipi-canvas', () => new THREE.MeshPhysicalMaterial({ color: '#efe7d8', roughness: 0.95, side: THREE.DoubleSide, sheen: 0.5, sheenColor: new THREE.Color('#ffffff') }));
  return (
    <group>
      <mesh geometry={cloth} material={canvasM} position={[0, (h * 0.86) / 2, 0]} castShadow receiveShadow />
      {Array.from({ length: 5 }, (_, i) => {
        const a = Math.PI * 0.2 + (i / 5) * Math.PI * 2;
        const bx = Math.sin(a) * r;
        const bz = Math.cos(a) * r;
        const len = Math.hypot(r, h);
        return <M key={i} g={cylinder(0.014, 0.018, len, 8)} m={wood('birch')} p={[bx * 0.5, len / 2, bz * 0.5]} r={[Math.atan2(bz, h) * 1, 0, -Math.atan2(bx, h)]} />;
      })}
      <M g={cylinder(r * 0.8, r * 0.8, 0.08, 32)} m={fabric('#c9b79c', 'knit')} p={[0, 0.04, 0]} />
      <Box w={0.4} h={0.32} d={0.12} y={0.08} z={-r * 0.45} m={fabric('#c8743f', 'linen')} r={0.06} rot={[-0.25, 0.3, 0]} />
      <Box w={0.38} h={0.3} d={0.12} x={0.2} y={0.08} z={-r * 0.35} m={fabric('#a7b494', 'linen')} r={0.06} rot={[-0.2, -0.4, 0]} />
      {/* a garland of little flags over the entrance */}
      {Array.from({ length: 5 }, (_, i) => (
        <M key={`f${i}`} g={cylinder(0.035, 0.001, 0.07, 3)} m={fabric(['#c8743f', '#e3c96f', '#a7b494'][i % 3], 'linen')} p={[-0.2 + i * 0.1, h * 0.62 - Math.abs(i - 2) * -0.01, r * 0.42]} r={[Math.PI, 0, 0]} shadow={false} />
      ))}
    </group>
  );
}

/** A soft toy: a teddy bear or a fox, sitting. */
function Plush({ it }: { it: FurnitureItem }) {
  const s = it.h;
  const fox = it.variant === 'fox';
  const fur = fabric(fox ? '#c8743f' : '#a67c58', 'boucle');
  const light = fabric('#f4ede1', 'boucle');
  return (
    <group>
      <M g={sphere(s * 0.3, 2)} m={fur} p={[0, s * 0.3, 0]} s={[1, 1.05, 0.9]} />
      <M g={sphere(s * 0.18, 2)} m={light} p={[0, s * 0.3, s * 0.16]} s={[1, 1.2, 0.5]} />
      <M g={sphere(s * 0.24, 2)} m={fur} p={[0, s * 0.74, 0]} />
      <M g={sphere(s * 0.1, 2)} m={fox ? light : fabric('#d8c3a5', 'boucle')} p={[0, s * 0.7, s * 0.2]} s={[1, 0.8, fox ? 1.5 : 1]} />
      <M g={sphere(s * 0.025, 1)} m={lacquer('#1d1d1d', 0.3)} p={[0, s * 0.72, s * (fox ? 0.35 : 0.29)]} />
      {[-1, 1].map((k) => (
        <group key={k}>
          {fox ? (
            <M g={cylinder(0.001, s * 0.08, s * 0.16, 4)} m={fur} p={[k * s * 0.13, s * 0.98, 0]} />
          ) : (
            <M g={sphere(s * 0.08, 2)} m={fur} p={[k * s * 0.17, s * 0.93, 0]} s={[1, 1, 0.6]} />
          )}
          <M g={sphere(s * 0.025, 1)} m={lacquer('#1d1d1d', 0.3)} p={[k * s * 0.09, s * 0.8, s * 0.2]} />
          <M g={sphere(s * 0.1, 2)} m={fur} p={[k * s * 0.27, s * 0.35, s * 0.08]} s={[0.8, 1.4, 0.8]} />
          <M g={sphere(s * 0.11, 2)} m={fur} p={[k * s * 0.15, s * 0.08, s * 0.22]} s={[0.9, 0.8, 1.4]} />
        </group>
      ))}
      {fox && <M g={sphere(s * 0.14, 2)} m={fur} p={[s * 0.3, s * 0.12, -s * 0.2]} s={[1.6, 0.8, 1]} />}
    </group>
  );
}

/**
 * A built-in oak bookcase to the ceiling: open shelves full of books, a few objects, and a
 * warm LED strip under each shelf.
 */
function Bookcase({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  const plinth = 0.08;
  const levels = Math.round((h - plinth) / 0.38);
  const lh = (h - plinth) / levels;
  const cols = Math.max(1, Math.round(w / 0.6));
  const cw = w / cols;
  const rand = rng(Math.round(it.x * 31 + it.y * 7));
  const books: ReactNode[] = [];
  for (let l = 0; l < levels - 1; l++) {
    for (let c = 0; c < cols; c++) {
      const x0 = -w / 2 + c * cw + 0.04;
      const y = plinth + l * lh + 0.025;
      if (rand() < 0.2) {
        books.push(<M key={`o${l}${c}`} g={sphere(0.07, 2)} m={ceramic(['#b4704f', '#e9e3d6', '#5f6e40'][Math.floor(rand() * 3)], 0.4)} p={[x0 + cw / 2, y + 0.07, 0]} s={[1, 1.3, 1]} />);
        continue;
      }
      let bx = x0;
      const end = x0 + cw - 0.08 - rand() * 0.15;
      while (bx < end) {
        const bw = 0.02 + rand() * 0.035;
        const bh = 0.2 + rand() * 0.1;
        const tone = ['#e9e3d6', '#a7b494', '#34483e', '#c8a97e', '#6b5242', '#dcd3c4', '#8a9fab', '#b4704f'][Math.floor(rand() * 8)];
        books.push(<Box key={`k${l}${c}${bx.toFixed(3)}`} w={bw} h={bh} d={d * 0.72} x={bx + bw / 2} y={y} z={-0.01} m={lacquer(tone, 0.85)} r={0.002} />);
        bx += bw + 0.002;
      }
    }
  }
  const led = cached('led-strip', () => new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ffbe7a', emissiveIntensity: 2.2 }));
  return (
    <group>
      <Box w={w} h={plinth} d={d - 0.04} z={-0.02} m={lacquer('#3b2f25', 0.7)} r={0} />
      <Box w={w} h={h - plinth} d={0.015} y={plinth} z={-d / 2 + 0.008} m={oak} r={0} grain />
      {Array.from({ length: levels + 1 }, (_, l) => (
        <Box key={l} w={w} h={0.025} d={d} y={Math.min(h - 0.025, plinth + l * lh)} m={oak} r={0.003} grain />
      ))}
      {Array.from({ length: cols + 1 }, (_, c) => (
        <Box key={`s${c}`} w={0.025} h={h - plinth} d={d} x={-w / 2 + 0.0125 + ((w - 0.025) * c) / cols} y={plinth} m={oak} r={0.003} grain />
      ))}
      {Array.from({ length: levels }, (_, l) => (
        <Box key={`led${l}`} w={w - 0.06} h={0.006} d={0.012} y={plinth + (l + 1) * lh - 0.008} z={d / 2 - 0.03} m={led} r={0} />
      ))}
      {books}
      {lit && <LampLight y={h * 0.55} intensity={1.0} distance={3.5} />}
    </group>
  );
}

/**
 * A built-in lounging nook after Dennis's photos: a deep oak box with a thick frame, a sage
 * plaster back, a wide upholstered mattress that doubles as a guest bed, big cushions, a reading
 * light and a warm LED strip under the canopy. The opening faces +z.
 */
function Nook({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  const t = 0.06;
  const frame = 0.12;
  const base = 0.4;
  const iw = w - 2 * t;
  const led = cached('led-strip', () => new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ffbe7a', emissiveIntensity: 2.2 }));
  const cushions: [number, string, number][] = [
    [-0.62, '#dcd3c4', -0.15],
    [-0.12, '#e9e3d6', 0.05],
    [0.4, '#dcd3c4', -0.1],
    [0.12, '#34483e', 0.15],
  ];
  return (
    <group>
      {/* the box: sides, canopy, a sage plaster back */}
      {[-1, 1].map((s) => (
        <Box key={s} w={t} h={h} d={d} x={s * (w / 2 - t / 2)} m={oak} r={0.004} grain />
      ))}
      <Box w={w} h={t} d={d} y={h - t} m={oak} r={0.004} grain />
      <Box w={iw} h={h - t} d={0.03} z={-d / 2 + 0.015} m={paint('#8f9a8c')} r={0} />
      {/* a deep frame round the opening */}
      <Box w={w} h={0.22} d={0.05} y={h - 0.22} z={d / 2 - 0.025} m={oak} r={0.004} grain />
      {[-1, 1].map((s) => (
        <Box key={`f${s}`} w={frame} h={h} d={0.05} x={s * (w / 2 - frame / 2)} z={d / 2 - 0.025} m={oak} r={0.004} grain />
      ))}
      {/* base and mattress: 140 x 200 cm */}
      <Box w={iw} h={0.04} d={d - 0.08} z={-0.02} m={lacquer('#1e1e1e', 0.7)} r={0} />
      <Box w={w} h={base - 0.04} d={d - 0.03} y={0.04} z={-0.015} m={oak} r={0.004} grain />
      <Box w={iw - 0.02} h={0.16} d={d - 0.08} y={base} z={-0.02} m={fabric('#dcd3c4', 'linen')} r={0.04} />
      {cushions.map(([x, c, r], i) => (
        <Box key={`c${i}`} w={0.55} h={0.5} d={0.16} x={x * (iw / 2)} y={base + 0.12} z={-d / 2 + 0.16 + (i === 3 ? 0.12 : 0)} m={fabric(c, i === 3 ? 'wool' : 'linen')} r={0.08} rot={[-0.2, r, 0]} />
      ))}
      <Box w={0.8} h={0.03} d={0.6} x={iw / 2 - 0.5} y={base + 0.16} z={0.25} m={fabric('#a7b494', 'knit')} r={0.012} rot={[0, 0.2, 0]} />
      {/* LED strip behind the top frame and a black reading light on one side */}
      <Box w={iw - 0.04} h={0.012} d={0.012} y={h - 0.24} z={d / 2 - 0.08} m={led} r={0} />
      <group position={[w / 2 - t, base + 0.75, -d / 2 + 0.45]}>
        <Box w={0.03} h={0.06} d={0.06} x={-0.015} m={metal('#1c1c1d', 0.5)} r={0.008} />
        <M g={cylinder(0.022, 0.028, 0.1, 16)} m={metal('#1c1c1d', 0.5)} p={[-0.07, 0.02, 0.02]} r={[0, 0, Math.PI / 2.6]} />
      </group>
      {lit && (
        <>
          <pointLight position={[0, h - 0.4, d / 2 - 0.3]} color={LAMP_COLOUR} intensity={1.2} distance={3} decay={2} userData={{ lamp: true }} />
          <pointLight position={[w / 2 - 0.25, base + 0.6, -d / 2 + 0.45]} color={LAMP_COLOUR} intensity={0.5} distance={1.6} decay={2} userData={{ lamp: true }} />
        </>
      )}
    </group>
  );
}

const ease = (t: number) => t * t * (3 - 2 * t);

/**
 * A modular wall bed: a 140 x 200 cm bed that folds into an oak cabinet, with an open shelf
 * module beside it. Double-click it to open or close it; the bed swings down on its hinge and
 * its legs fold out as it lands.
 */
function WallBed({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const [open, setOpen] = useState(false);
  const t = useRef(0);
  const pivot = useRef<THREE.Group>(null);
  const leg = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const angle = (k: number) => (-Math.PI / 2) * (1 - ease(k));
  const legAngle = (k: number) => (Math.PI / 2) * (1 - Math.min(1, Math.max(0, (k - 0.7) / 0.3)));
  useFrame((_, dt) => {
    const target = open ? 1 : 0;
    if (t.current === target) return;
    const step = Math.min(dt, 0.2) / 1.8;
    t.current = target > t.current ? Math.min(target, t.current + step) : Math.max(target, t.current - step);
    if (pivot.current) pivot.current.rotation.x = angle(t.current);
    if (leg.current) leg.current.rotation.x = legAngle(t.current);
    invalidate();
  });
  const toggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOpen((o) => !o);
    invalidate();
  };
  const oak = wood('oakBrushed');
  const front = lacquer('#f3f2ee', 0.45);
  const p = 0.025;
  const bw = 1.56;
  const sw = w - bw - 3 * p;
  const shelfX = -w / 2 + p + sw / 2;
  const bedX = w / 2 - p - bw / 2;
  const pivotY = 0.22;
  const L = 2.05;
  return (
    <group onDoubleClick={toggle}>
      {/* carcass */}
      {[-w / 2 + p / 2, -w / 2 + p * 1.5 + sw, w / 2 - p / 2].map((x, i) => (
        <Box key={i} w={p} h={h} d={d} x={x} m={oak} r={0.003} grain />
      ))}
      <Box w={w} h={p} d={d} y={h - p} m={oak} r={0.003} grain />
      <Box w={w - 2 * p} h={h - p} d={0.012} z={-d / 2 + 0.006} m={oak} r={0} grain />
      <Box w={bw} h={0.08} d={d - 0.04} x={bedX} z={-0.02} m={lacquer('#3b2f25', 0.7)} r={0} />
      {/* the shelf module */}
      {[0.1, 0.5, 0.9, 1.3, 1.7].map((y, i) => (
        <Box key={`s${i}`} w={sw} h={0.022} d={d - 0.03} x={shelfX} y={y} z={-0.015} m={oak} r={0.002} grain />
      ))}
      {[0.12, 0.52, 0.92].map((y, i) => (
        <group key={`k${i}`}>
          {Array.from({ length: 6 }, (_, b) => (
            <Box key={b} w={0.028} h={0.22 + ((b * 7 + i * 3) % 5) * 0.015} d={0.2} x={shelfX - sw / 2 + 0.05 + b * 0.031} y={y + 0.022} z={-0.04} m={lacquer(['#e9e3d6', '#8a9fab', '#34483e', '#c8a97e'][(b + i) % 4], 0.85)} r={0.002} />
          ))}
        </group>
      ))}
      <M g={sphere(0.07, 2)} m={ceramic('#e9e3d6', 0.4)} p={[shelfX, 1.39, -0.02]} s={[1, 1.3, 1]} />
      {/* the bed on its hinge at the cabinet's foot */}
      <group ref={pivot} position={[0, pivotY, d / 2]} rotation={[angle(t.current), 0, 0]}>
        <Box w={bw - 0.01} h={0.025} d={L} x={bedX} z={L / 2} m={front} r={0.004} />
        <Box w={0.3} h={0.012} d={0.03} x={bedX} y={-0.012} z={L - 0.12} m={oak} r={0.003} />
        {[-1, 1].map((s) => (
          <Box key={s} w={0.03} h={0.25} d={L} x={bedX + s * (bw / 2 - 0.02)} y={0.025} z={L / 2} m={oak} r={0.003} grain />
        ))}
        <Box w={bw - 0.02} h={0.25} d={0.03} x={bedX} y={0.025} z={L - 0.015} m={oak} r={0.003} grain />
        <Box w={bw - 0.08} h={0.2} d={L - 0.06} x={bedX} y={0.03} z={L / 2} m={fabric('#f2efe8', 'linen')} r={0.05} />
        <Box w={bw - 0.06} h={0.06} d={L * 0.62} x={bedX} y={0.21} z={L * 0.62} m={fabric('#e9e3d6', 'linen')} r={0.03} />
        <Box w={bw - 0.04} h={0.03} d={0.4} x={bedX} y={0.26} z={L - 0.3} m={fabric('#8a9fab', 'knit')} r={0.01} />
        {[-1, 1].map((s) => (
          <Box key={`p${s}`} w={0.62} h={0.13} d={0.4} x={bedX + s * 0.36} y={0.22} z={0.3} m={fabric('#f4f1ea', 'linen')} r={0.06} />
        ))}
        <group ref={leg} position={[bedX, 0.02, L - 0.08]} rotation={[legAngle(t.current), 0, 0]}>
          <Box w={bw - 0.3} h={pivotY + 0.02} d={0.035} y={-pivotY - 0.02} m={metal('#2b2b2a', 0.5)} r={0.004} />
        </group>
      </group>
    </group>
  );
}

/** A bike on a floor stand that holds its front wheel, so each of the four comes out on its own. Front faces +z. */
function ParkedBike({ it }: { it: FurnitureItem }) {
  const { d } = it;
  const black = metal('#1c1c1d', 0.5);
  const frameM = lacquer(it.colour ?? '#34483e', 0.35);
  const wheelR = 0.34;
  const wb = Math.min(1.05, d - 2 * wheelR - 0.05);
  const fz = wb / 2;
  const rz = -wb / 2;
  const tube = (a: [number, number], b: [number, number], r = 0.016) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return <M key={`${a}${b}`} g={cylinder(r, r, len, 10)} m={frameM} p={[0, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2]} r={[Math.atan2(b[0] - a[0], b[1] - a[1]), 0, 0]} />;
  };
  // frame points in (z, y)
  const bb: [number, number] = [-0.05, 0.3];
  const seat: [number, number] = [-0.18, 0.82];
  const head: [number, number] = [fz - 0.13, 0.8];
  const headLow: [number, number] = [fz - 0.1, 0.62];
  return (
    <group>
      {/* the stand: a rail on the floor and a cradle round the front wheel */}
      <Box w={0.08} h={0.03} d={d - 0.1} m={black} r={0.006} />
      {[-1, 1].map((s) => (
        <M key={s} g={cylinder(0.008, 0.008, 0.36, 8)} m={metal('#9a9a9a', 0.3)} p={[s * 0.045, 0.2, fz + 0.05]} r={[0.5, 0, 0]} />
      ))}
      {[fz, rz].map((z) => (
        <group key={z} position={[0, wheelR + 0.03, z]} rotation={[0, Math.PI / 2, 0]}>
          <M g={torus(wheelR - 0.02, 0.022)} m={black} />
          <M g={torus(wheelR - 0.05, 0.008)} m={metal('#b9bbbc', 0.3)} />
          <M g={cylinder(0.03, 0.03, 0.08, 12)} m={metal('#b9bbbc', 0.3)} r={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      {tube([rz, wheelR + 0.03], bb)}
      {tube([rz, wheelR + 0.03], seat, 0.012)}
      {tube(bb, seat, 0.019)}
      {tube(bb, headLow, 0.022)}
      {tube(seat, head, 0.019)}
      {tube(headLow, head, 0.024)}
      {tube([fz, wheelR + 0.03], headLow, 0.016)}
      <Box w={0.13} h={0.04} d={0.26} y={0.86} z={seat[0] - 0.03} m={lacquer('#1d1d1d', 0.6)} r={0.015} />
      <M g={cylinder(0.012, 0.012, 0.6, 10)} m={black} p={[0, 0.92, head[0] + 0.02]} r={[0, 0, Math.PI / 2]} />
      <M g={cylinder(0.015, 0.015, 0.12, 10)} m={black} p={[0, 0.86, head[0] + 0.01]} />
    </group>
  );
}

/** Open pantry shelving against the wall: dry stock in jars, tins and boxes. */
function Pantry({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = wood();
  const levels = 5;
  const lh = (h - 0.1) / levels;
  const rand = rng(Math.round(it.x * 13 + 5));
  const stock: ReactNode[] = [];
  for (let l = 0; l < levels; l++) {
    let x = -w / 2 + 0.04;
    const y = 0.1 + l * lh + 0.022;
    while (x < w / 2 - 0.1) {
      const kind = rand();
      if (kind < 0.4) {
        const r = 0.045 + rand() * 0.02;
        const jh = 0.16 + rand() * 0.08;
        stock.push(<M key={`j${l}${x.toFixed(2)}`} g={cylinder(r, r, jh, 16)} m={cached('jar', () => new THREE.MeshPhysicalMaterial({ color: '#e8e6dc', roughness: 0.1, transparent: true, opacity: 0.55 }))} p={[x + r, y + jh / 2, 0]} />);
        stock.push(<M key={`f${l}${x.toFixed(2)}`} g={cylinder(r * 0.92, r * 0.92, jh * 0.7, 12)} m={lacquer(['#d6bf8a', '#b4704f', '#e9e3d6', '#8e9a6c'][Math.floor(rand() * 4)], 0.9)} p={[x + r, y + jh * 0.36, 0]} shadow={false} />);
        stock.push(<M key={`l${l}${x.toFixed(2)}`} g={cylinder(r, r, 0.02, 16)} m={wood()} p={[x + r, y + jh + 0.01, 0]} />);
        x += 2 * r + 0.02;
      } else if (kind < 0.7) {
        const bw = 0.16 + rand() * 0.1;
        const bh = 0.2 + rand() * 0.1;
        stock.push(<Box key={`b${l}${x.toFixed(2)}`} w={bw} h={bh} d={d * 0.7} x={x + bw / 2} y={y} m={lacquer(['#c9a184', '#e9e3d6', '#a7a49b', '#d6bf8a'][Math.floor(rand() * 4)], 0.85)} r={0.004} />);
        x += bw + 0.02;
      } else {
        for (let k = 0; k < 3; k++) stock.push(<M key={`t${l}${x.toFixed(2)}${k}`} g={cylinder(0.038, 0.038, 0.11, 16)} m={metal('#c9c9c6', 0.3)} p={[x + 0.04 + k * 0.08, y + 0.055, 0.02]} />);
        x += 0.26;
      }
    }
  }
  return (
    <group>
      {Array.from({ length: levels + 1 }, (_, l) => (
        <Box key={l} w={w} h={0.022} d={d} y={0.08 + l * lh} m={oak} r={0.003} grain />
      ))}
      {[-1, 0, 1].map((s) => (
        <Box key={`u${s}`} w={0.03} h={h} d={d} x={s * (w / 2 - 0.015)} m={metal('#2b2b2a', 0.5)} r={0.004} />
      ))}
      {stock}
    </group>
  );
}

/** A wall rack for skis and poles standing upright, with boots and helmets on a shelf below. */
function SkiRack({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = wood();
  const pairs = Math.floor((w - 0.2) / 0.22);
  const colours = ['#c8743f', '#34483e', '#e9e3d6', '#2f4f6f', '#bf5640'];
  return (
    <group>
      <Box w={w} h={0.1} d={0.03} y={h - 0.4} z={-d / 2 + 0.015} m={oak} r={0.004} />
      <Box w={w} h={0.03} d={d} y={0.35} m={oak} r={0.004} />
      {[-1, 1].map((s) => (
        <Box key={s} w={0.03} h={0.38} d={d} x={s * (w / 2 - 0.015)} m={oak} r={0.004} />
      ))}
      {Array.from({ length: pairs }, (_, i) => {
        const x = -w / 2 + 0.15 + i * 0.22;
        const c = colours[i % colours.length];
        return (
          <group key={i} position={[x, 0.4, -d / 2 + 0.08]}>
            {[-0.035, 0.035].map((o) => (
              <Box key={o} w={0.07} h={h - 0.45} d={0.02} x={o} m={lacquer(c, 0.4)} r={0.008} />
            ))}
            <M g={cylinder(0.008, 0.008, 1.2, 8)} m={metal('#2b2b2a', 0.4)} p={[0.09, 0.6, 0.03]} r={[0, 0, -0.04]} />
          </group>
        );
      })}
      {Array.from({ length: Math.min(4, Math.floor(w / 0.38)) }, (_, i) => (
        <group key={`boot${i}`} position={[-w / 2 + 0.22 + i * 0.36, 0, 0.02]}>
          <Box w={0.12} h={0.3} d={0.3} x={-0.07} m={lacquer(i % 2 ? '#2b2b2a' : '#e9e3d6', 0.5)} r={0.03} />
          <Box w={0.12} h={0.3} d={0.3} x={0.07} m={lacquer(i % 2 ? '#2b2b2a' : '#e9e3d6', 0.5)} r={0.03} />
          <M g={sphere(0.12, 2)} m={lacquer(colours[(i + 2) % colours.length], 0.3)} p={[0, 0.48, 0]} s={[1, 0.85, 1.15]} />
        </group>
      ))}
    </group>
  );
}

/** A low steel rack with pairs of hex dumbbells on top and kettlebells on the shelf below. */
function DumbbellRack({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const black = metal('#1c1c1d', 0.5);
  const pairs = 5;
  return (
    <group>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => <Box key={`${sx}${sz}`} w={0.04} h={h} d={0.04} x={sx * (w / 2 - 0.02)} z={sz * (d / 2 - 0.02)} m={black} r={0.004} />),
      )}
      <Box w={w} h={0.03} d={d} y={h - 0.03} m={black} r={0.004} rot={[0.15, 0, 0]} />
      <Box w={w} h={0.03} d={d} y={0.12} m={black} r={0.004} />
      {Array.from({ length: pairs }, (_, i) => {
        const x = -w / 2 + 0.13 + i * ((w - 0.26) / (pairs - 1));
        const s = 0.035 + i * 0.006;
        return [-0.05, 0.05].map((o) => (
          <group key={`${i}${o}`} position={[x + o, h + 0.02 + s, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <M g={cylinder(0.014, 0.014, 0.14, 10)} m={metal('#b9bbbc', 0.3)} />
            {[-1, 1].map((e) => (
              <M key={e} g={cylinder(s, s, 0.05, 6)} m={black} p={[0, e * 0.085, 0]} />
            ))}
          </group>
        ));
      })}
      {[-0.4, -0.1, 0.2, 0.45].map((x, i) => (
        <group key={`kb${i}`} position={[x * w, 0.15, 0]}>
          <M g={sphere(0.08 + i * 0.012, 2)} m={black} p={[0, 0.09 + i * 0.01, 0]} />
          <M g={torus(0.05, 0.012, Math.PI)} m={black} p={[0, 0.17 + i * 0.02, 0]} />
        </group>
      ))}
    </group>
  );
}

/** A soft wall ball (medicine ball). */
function WallBall({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  return (
    <group>
      <M g={sphere(r, 3)} m={fabric(it.colour ?? '#2b2b2a', 'linen')} p={[0, r, 0]} />
      <M g={torus(r * 0.995, 0.006)} m={lacquer(it.accent ?? '#c8743f', 0.5)} p={[0, r, 0]} r={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

/** A plywood plyo box. */
function PlyoBox({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={it.h} d={it.d} m={wood('birch')} r={0.01} grain />
      {[-1, 1].map((s) => (
        <Box key={s} w={0.14} h={0.04} d={0.004} x={0} y={it.h * 0.7} z={s * (it.d / 2)} m={lacquer('#2b2b2a', 0.6)} r={0.002} />
      ))}
    </group>
  );
}

/** Draws one furniture item in its own frame. */
export function Piece({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  switch (it.kind) {
    case 'sofa':
      return it.chaise ? <CornerSofa it={it} /> : <Sofa it={it} />;
    case 'loungeChair':
      return <LoungeChair it={it} />;
    case 'diningChair':
      return <DiningChair it={it} />;
    case 'deskChair':
      return it.variant === 'capisco' ? <Capisco it={it} /> : <DeskChair it={it} />;
    case 'pouf':
      return <Pouf it={it} />;
    case 'bench':
      return <Bench it={it} />;
    case 'floorCushions':
      return <FloorCushions it={it} />;
    case 'coffeeTable':
      return <CoffeeTable it={it} />;
    case 'sideTable':
      return <SideTable it={it} />;
    case 'diningTable':
      return <Table it={it} />;
    case 'desk':
      return it.variant === 'standing' ? <StandingDesk it={it} /> : <Table it={it} desk />;
    case 'bed':
      return <Bed it={it} />;
    case 'bedsideTable':
      return <BedsideTable it={it} />;
    case 'wardrobe':
      return <Wardrobe it={it} />;
    case 'shelf':
      return <Shelf it={it} />;
    case 'lowboard':
      return <Lowboard it={it} />;
    case 'dresser':
      return <Dresser it={it} />;
    case 'rug':
      return <Rug it={it} />;
    case 'curtain':
      return <Curtain it={it} />;
    case 'blind':
      return <Blind it={it} />;
    case 'pendant':
      return <Pendant it={it} lit={lit} />;
    case 'floorLamp':
      return <FloorLamp it={it} lit={lit} />;
    case 'tableLamp':
      return <TableLamp it={it} lit={lit} />;
    case 'print':
      return <Print it={it} />;
    case 'mural':
      return <Mural it={it} />;
    case 'paint':
      return <Paint it={it} />;
    case 'slats':
      return <Slats it={it} />;
    case 'mirror':
      return <Mirror it={it} />;
    case 'hooks':
      return <Hooks it={it} />;
    case 'tv':
      return <Tv it={it} />;
    case 'plant':
      return <Plant it={it} />;
    case 'herbs':
      return <Herbs it={it} />;
    case 'boards':
      return <Boards it={it} />;
    case 'bowl':
      return <Bowl it={it} />;
    case 'vase':
      return <Vase it={it} />;
    case 'books':
      return <Books it={it} />;
    case 'towels':
      return <Towels it={it} />;
    case 'stool':
      return <Stool it={it} />;
    case 'toilet':
      return <Toilet it={it} />;
    case 'basin':
      return <Basin it={it} />;
    case 'lounger':
      return <Lounger it={it} />;
    case 'planter':
      return <Planter it={it} />;
    case 'workbench':
      return <Workbench it={it} />;
    case 'pegboard':
      return <Pegboard it={it} />;
    case 'washer':
      return <Washer it={it} />;
    case 'dryingRack':
      return <DryingRack it={it} />;
    case 'sauna':
      return it.variant === 'barrel' ? <BarrelSauna it={it} lit={lit} /> : <Sauna it={it} lit={lit} />;
    case 'iceBath':
      return <IceBath it={it} />;
    case 'bikeRack':
      return it.variant === 'hoop' ? <BikeHoop it={it} /> : <BikeRack it={it} />;
    case 'pergola':
      return <Pergola it={it} />;
    case 'clothesLine':
      return <ClothesLine it={it} />;
    case 'utilitySink':
      return <UtilitySink it={it} />;
    case 'monitor':
      return <Monitor it={it} />;
    case 'keyboard':
      return <Keyboard it={it} />;
    case 'mouse':
      return <Mouse it={it} />;
    case 'speaker':
      return <Speaker it={it} />;
    case 'wallBed':
      return <WallBed it={it} />;
    case 'nook':
      return <Nook it={it} lit={lit} />;
    case 'bookcase':
      return <Bookcase it={it} lit={lit} />;
    case 'tipi':
      return <Tipi it={it} />;
    case 'plush':
      return <Plush it={it} />;
    case 'bike':
      return <ParkedBike it={it} />;
    case 'pantry':
      return <Pantry it={it} />;
    case 'skiRack':
      return <SkiRack it={it} />;
    case 'dumbbells':
      return <DumbbellRack it={it} />;
    case 'wallBall':
      return <WallBall it={it} />;
    case 'plyoBox':
      return <PlyoBox it={it} />;
  }
}
