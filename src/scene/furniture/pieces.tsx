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

const ease = (t: number) => t * t * (3 - 2 * t);

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

/**
 * A part of a cabinet that opens when clicked: a door that swings on its hinge, or a drawer
 * or box that slides out (+z). Clicking it again closes it. The click stops here, so the
 * size card only opens when the cabinet itself is clicked.
 */
function Opens({ swing, slide, at = [0, 0, 0], children }: { swing?: number; slide?: number; at?: [number, number, number]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const t = useRef(0);
  const g = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, dt) => {
    const target = open ? 1 : 0;
    if (t.current === target) return;
    const step = Math.min(dt, 0.2) / 0.7;
    t.current = target > t.current ? Math.min(target, t.current + step) : Math.max(target, t.current - step);
    const k = ease(t.current);
    if (g.current) {
      if (swing) g.current.rotation.y = swing * k;
      if (slide) g.current.position.z = at[2] + slide * k;
    }
    invalidate();
  });
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOpen((o) => !o);
    invalidate();
  };
  return (
    <group ref={g} position={at} onClick={click}>
      {children}
    </group>
  );
}

/** A drawer: its front, an open box behind it, and something folded inside. Drawn with the front's centre at the origin. */
function Drawer({ w, h, depth, front, seed = 1 }: { w: number; h: number; depth: number; front: Mat; seed?: number }) {
  const side = wood('birch');
  const rand = rng(seed);
  const bh = Math.max(0.06, h - 0.05);
  const y0 = -h / 2 + 0.02;
  const n = Math.max(1, Math.floor((w - 0.1) / 0.24));
  return (
    <group>
      <Box w={w} h={h} d={0.019} y={-h / 2} m={front} r={0.003} />
      {[-1, 1].map((sx) => (
        <Box key={sx} w={0.012} h={bh} d={depth} x={sx * (w / 2 - 0.03)} y={y0} z={-0.0095 - depth / 2} m={side} r={0} />
      ))}
      <Box w={w - 0.06} h={bh} d={0.012} y={y0} z={-depth} m={side} r={0} />
      <Box w={w - 0.06} h={0.008} d={depth} y={y0} z={-0.0095 - depth / 2} m={side} r={0} />
      {Array.from({ length: n }, (_, i) => (
        <Box key={`c${i}`} w={(w - 0.1) / n - 0.02} h={Math.min(bh - 0.02, 0.06 + rand() * 0.04)} d={depth * 0.7} x={-w / 2 + 0.05 + ((w - 0.1) / n) * (i + 0.5)} y={y0 + 0.008} z={-0.0095 - depth / 2} m={fabric(['#dcd3c4', '#a7b494', '#e9e3d6', '#8a9fab', '#6b5242'][Math.floor(rand() * 5)], 'knit')} r={0.01} />
      ))}
    </group>
  );
}

function BedsideTable({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  return (
    <group>
      <Legs w={w} d={d} h={h - 0.18} inset={0.03} r={0.014} />
      <Box w={w} h={0.02} d={d} y={h - 0.18} m={oak} r={0.004} />
      <Box w={w} h={0.02} d={d} y={h - 0.02} m={oak} r={0.004} />
      {[-1, 1].map((sx) => (
        <Box key={sx} w={0.02} h={0.14} d={d} x={sx * (w / 2 - 0.01)} y={h - 0.16} m={oak} r={0} />
      ))}
      <Box w={w - 0.04} h={0.14} d={0.01} y={h - 0.16} z={-d / 2 + 0.005} m={oak} r={0} />
      <Opens slide={d * 0.6} at={[0, h - 0.02, d / 2 - 0.0095]}>
        <Drawer w={w - 0.045} h={0.135} depth={d - 0.04} front={oak} seed={Math.round(it.x * 10)} />
        <Box w={w * 0.4} h={0.004} d={0.004} y={-0.07} z={0.011} m={metal('#1e1e1e', 0.6)} r={0} />
      </Opens>
      <Box w={0.16} h={0.04} d={0.12} x={-w / 4} y={h} z={0.06} m={fabric('#6b5242', 'linen')} r={0.006} />
    </group>
  );
}

/** Clothes on a rail: thin hanging shapes in quiet colours. */
function Hanging({ w, d, top, seed }: { w: number; d: number; top: number; seed: number }) {
  const rand = rng(seed);
  const n = Math.max(2, Math.floor(w / 0.07));
  return (
    <>
      <M g={cylinder(0.012, 0.012, w - 0.04, 10)} m={metal('#9a9a98', 0.3)} p={[0, top, 0]} r={[0, 0, Math.PI / 2]} />
      {Array.from({ length: n }, (_, i) => {
        const len = 0.7 + rand() * 0.45;
        return (
          <Box key={i} w={0.03} h={len} d={Math.min(d, 0.5)} x={-w / 2 + 0.05 + ((w - 0.1) * i) / (n - 1)} y={top - 0.04 - len} m={fabric(['#e9e3d6', '#8a9fab', '#34483e', '#dcd3c4', '#6b5242', '#c9a184', '#3c3d3d'][Math.floor(rand() * 7)], 'linen')} r={0.01} />
        );
      })}
    </>
  );
}

/** A wardrobe whose doors each open when clicked, with shelves and a hanging rail inside. */
function Wardrobe({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = it.variant === 'oak';
  const front = oak ? wood('oakBrushed') : lacquer(it.colour ?? '#f1efea', 0.5);
  const inside = oak ? wood('oakBrushed') : lacquer('#f4f3ef', 0.6);
  const doors = Math.max(2, Math.round(w / 0.5));
  const dw = w / doors;
  const t = 0.019;
  const body = h - 0.08;
  const back = -d / 2 + 0.01;
  const innerD = d - 0.04;
  const zc = back + innerD / 2;
  const pairs = Math.ceil(doors / 2);
  const bayW = w / pairs;
  const deep = d >= 0.45;
  return (
    <group>
      <Box w={w - 0.04} h={0.08} d={d - 0.08} z={-0.04} m={lacquer('#bdb7ae', 0.7)} r={0} />
      {/* the carcass: back, sides, top, bottom and a divider between each pair of doors */}
      <Box w={w} h={body} d={0.012} y={0.08} z={-d / 2 + 0.006} m={inside} r={0} />
      {Array.from({ length: pairs + 1 }, (_, i) => (
        <Box key={`v${i}`} w={t} h={body} d={d - 0.02} x={i === 0 ? -w / 2 + t / 2 : i === pairs ? w / 2 - t / 2 : -w / 2 + bayW * i} y={0.08} z={-0.01} m={i === 0 || i === pairs ? front : inside} r={0.002} />
      ))}
      <Box w={w} h={t} d={d - 0.02} y={h - t} z={-0.01} m={front} r={0.003} />
      <Box w={w} h={t} d={d - 0.02} y={0.08} z={-0.01} m={inside} r={0} />
      {/* inside each bay: shelves, and on deep wardrobes a hanging rail in every other bay */}
      {Array.from({ length: pairs }, (_, b) => {
        const cx = -w / 2 + bayW * (b + 0.5);
        const rail = deep && b % 2 === 0;
        const shelves = rail ? [body + 0.08 - 0.42] : [0.5, 0.9, 1.3, 1.7, 2.1].filter((y) => y < h - 0.2);
        return (
          <group key={`b${b}`}>
            {shelves.map((y, i) => (
              <Box key={i} w={bayW - 2 * t} h={t} d={innerD - 0.02} x={cx} y={y} z={zc} m={inside} r={0} />
            ))}
            {!rail &&
              shelves.slice(0, -1).map((y, i) => (
                <Box key={`f${i}`} w={bayW * 0.55} h={0.12} d={innerD * 0.7} x={cx - bayW * 0.12} y={y + t} z={zc} m={fabric(['#dcd3c4', '#8a9fab', '#a7b494', '#e9e3d6'][(i + b) % 4], 'knit')} r={0.015} />
              ))}
            {rail && <Hanging w={bayW - 2 * t} d={innerD} top={shelves[0] - 0.08} seed={Math.round(it.x * 7 + b)} />}
          </group>
        );
      })}
      {Array.from({ length: doors }, (_, i) => {
        const leftHinge = i % 2 === 0;
        const hx = -w / 2 + dw * (leftHinge ? i : i + 1);
        const sign = leftHinge ? 1 : -1;
        return (
          <Opens key={i} swing={-sign * 1.75} at={[hx, 0, d / 2 - 0.01]}>
            <Box w={dw - 0.004} h={h - 0.09} d={t} x={(sign * dw) / 2} y={0.085} m={front} r={0.003} grain={oak} />
            {it.variant !== 'flush' && <Box w={0.02} h={0.3} d={0.025} x={sign * (dw - 0.05)} y={1.0} z={0.022} m={oak ? metal('#2b2b2a') : wood()} r={0.006} />}
          </Opens>
        );
      })}
    </group>
  );
}

/** A chest of drawers on a low plinth, with finger grooves; each drawer slides out when clicked. */
function Dresser({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  const rows = 3;
  const cols = w > 1.0 ? 2 : 1;
  const body = h - 0.1;
  const rh = (body - 0.02) / rows;
  const cw = (w - 0.02) / cols;
  return (
    <group>
      <Box w={w - 0.06} h={0.1} d={d - 0.06} z={-0.02} m={metal('#2b2b2a', 0.6)} r={0.004} />
      {/* the carcass, set back so the drawer fronts sit flush with its edges */}
      <Box w={w} h={body} d={d - 0.02} y={0.1} z={-0.01} m={oak} r={0.006} grain />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => (
          <Opens key={`${r}${c}`} slide={d * 0.65} at={[-w / 2 + 0.01 + cw * (c + 0.5), 0.1 + 0.01 + rh * (rows - r), d / 2 - 0.0095]}>
            <Drawer w={cw - 0.006} h={rh - 0.006} depth={d - 0.06} front={oak} seed={r * 3 + c + 1} />
            <Box w={cw - 0.04} h={0.006} d={0.004} y={-0.02} z={0.0105} m={metal('#3b2f25', 0.8)} r={0} />
          </Opens>
        )),
      )}
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
  const dw = w / doors;
  const oak = wood();
  const t = 0.018;
  const body = h - 0.12;
  const rand = rng(Math.round(it.x * 11));
  return (
    <group>
      <Legs w={w - 0.1} d={d - 0.06} h={0.12} inset={0.04} r={0.016} m={metal('#2b2b2a')} />
      {/* an open carcass with a shelf, so the opened doors show what is inside */}
      <Box w={w} h={t} d={d} y={0.12} m={oak} r={0.003} />
      <Box w={w} h={t} d={d} y={h - t} m={oak} r={0.004} />
      <Box w={w} h={body} d={0.01} y={0.12} z={-d / 2 + 0.005} m={oak} r={0} />
      {[-w / 2 + t / 2, 0, w / 2 - t / 2].map((x, i) => (
        <Box key={i} w={t} h={body} d={d} x={x} y={0.12} m={oak} r={0.002} />
      ))}
      <Box w={w - 2 * t} h={t} d={d - 0.04} y={0.12 + body / 2} z={-0.01} m={oak} r={0} />
      {Array.from({ length: 6 }, (_, i) => (
        <Box key={`k${i}`} w={0.12 + rand() * 0.1} h={0.08 + rand() * 0.08} d={d * 0.6} x={-w / 2 + 0.15 + i * (w / 6.3)} y={i % 2 ? 0.12 + t : 0.12 + body / 2 + t} z={-0.03} m={lacquer(['#e9e3d6', '#3c3d3d', '#8a9fab', '#c8a97e'][i % 4], 0.8)} r={0.006} />
      ))}
      {Array.from({ length: doors }, (_, i) => {
        const leftHinge = i % 2 === 0;
        const sign = leftHinge ? 1 : -1;
        return (
          <Opens key={i} swing={-sign * 1.6} at={[-w / 2 + dw * (leftHinge ? i : i + 1), 0, d / 2 + 0.009]}>
            <Box w={dw - 0.004} h={body - 0.004} d={t} x={(sign * dw) / 2} y={0.122} m={oak} r={0.003} grain />
          </Opens>
        );
      })}
    </group>
  );
}

/* ---------------------------------------------------------------- soft furnishings */

function Rug({ it }: { it: FurnitureItem }) {
  const m = it.variant === 'rubber' ? lacquer(it.colour ?? '#2e3032', 0.95) : fabric(it.colour ?? '#e9e3d6', it.variant === 'shaggy' ? 'boucle' : 'wool');
  if (it.variant === 'shaggy') return <M g={roundedBox(it.w, it.h, it.d, Math.min(0.02, it.h / 2))} m={m} p={[0, it.h / 2, 0]} shadow={false} />;
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
/**
 * The lounging nook along the window wall: a 140 x 200 cm mattress with a bookcase built into
 * one end (-x) and a shelf of books across the top. The back stays low so the high basement
 * window above the mattress still lets light in.
 */
function BookNook({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const { w, d, h } = it;
  const oak = wood('oakBrushed');
  const t = 0.04;
  const base = 0.4;
  const caseW = 0.38;
  const bedX0 = -w / 2 + caseW + t;
  const bedW = w / 2 - t - bedX0;
  const bedX = bedX0 + bedW / 2;
  const topH = 0.4;
  const backH = 1.5;
  const led = cached('led-strip', () => new THREE.MeshStandardMaterial({ color: '#ffe0b0', emissive: '#ffbe7a', emissiveIntensity: 2.2 }));
  const rand = rng(Math.round(it.x * 17 + it.y * 3));
  const spines = ['#34483e', '#c8a97e', '#e9e3d6', '#8e9a6c', '#2f4f6f', '#b4704f', '#dcd3c4', '#3c3d3d'];
  const books: ReactNode[] = [];
  const row = (x0: number, x1: number, y: number, maxH: number, key: string, depth: number) => {
    let x = x0;
    let i = 0;
    while (x < x1 - 0.03) {
      const bw = 0.02 + rand() * 0.025;
      if (x + bw > x1) break;
      const bh = maxH * (0.7 + rand() * 0.28);
      books.push(<Box key={`${key}${i++}`} w={bw} h={bh} d={depth * (0.75 + rand() * 0.2)} x={x + bw / 2} y={y} z={-d / 2 + depth / 2 + 0.02} m={lacquer(spines[Math.floor(rand() * spines.length)], 0.8)} r={0.002} />);
      x += bw + 0.002;
      if (rand() < 0.05) x += 0.08;
    }
  };
  // The bookcase at the end: shelves from the floor up, as deep as the nook's back.
  const caseShelves = Math.round((h - 0.1) / 0.36);
  const csh = (h - 0.1) / caseShelves;
  for (let l = 0; l < caseShelves; l++) row(-w / 2 + t + 0.01, -w / 2 + t + caseW - 0.01, 0.1 + l * csh + 0.02, csh - 0.06, `c${l}`, 0.3);
  // The top shelf, over the opening.
  row(bedX0 + 0.04, w / 2 - t - 0.04, h - topH + 0.02, topH - 0.08, 't', 0.3);
  const cushions: [number, string, number][] = [
    [-0.62, '#dcd3c4', -0.15],
    [-0.12, '#e9e3d6', 0.05],
    [0.4, '#dcd3c4', -0.1],
    [0.12, '#34483e', 0.15],
  ];
  return (
    <group>
      {/* the two ends, the divider between the bookcase and the bed, and the top */}
      {[-w / 2 + t / 2, bedX0 - t / 2, w / 2 - t / 2].map((x, i) => (
        <Box key={i} w={t} h={h} d={d} x={x} m={oak} r={0.004} grain />
      ))}
      <Box w={w} h={t} d={d} y={h - t} m={oak} r={0.004} grain />
      <Box w={bedW} h={t} d={0.34} x={bedX} y={h - topH - t / 2} z={-d / 2 + 0.17} m={oak} r={0.004} grain />
      {Array.from({ length: caseShelves }, (_, l) => (
        <Box key={`cs${l}`} w={caseW} h={0.022} d={0.34} x={-w / 2 + t + caseW / 2} y={0.08 + l * csh} z={-d / 2 + 0.17} m={oak} r={0.002} grain />
      ))}
      <Box w={caseW} h={h} d={0.012} x={-w / 2 + t + caseW / 2} z={-d / 2 + 0.006} m={oak} r={0} grain />
      {/* the case is closed below the mattress towards the bed side */}
      <Box w={caseW} h={h - t} d={d - 0.36} x={-w / 2 + t + caseW / 2} z={-d / 2 + 0.36 + (d - 0.36) / 2} m={oak} r={0.003} grain />
      {/* a low sage back with a ledge; above it the wall and the window */}
      <Box w={bedW} h={backH} d={0.03} x={bedX} z={-d / 2 + 0.015} m={paint('#8f9a8c')} r={0} />
      <Box w={bedW} h={0.025} d={0.14} x={bedX} y={backH} z={-d / 2 + 0.07} m={oak} r={0.003} grain />
      {/* base and mattress */}
      <Box w={bedW} h={base} d={d - 0.03} x={bedX} z={-0.015} m={oak} r={0.004} grain />
      <Box w={bedW - 0.02} h={0.16} d={d - 0.08} x={bedX} y={base} z={-0.02} m={fabric('#dcd3c4', 'linen')} r={0.04} />
      {cushions.map(([x, c, r], i) => (
        <Box key={`c${i}`} w={0.55} h={0.5} d={0.16} x={bedX + x * (bedW / 2)} y={base + 0.12} z={-d / 2 + 0.16 + (i === 3 ? 0.12 : 0)} m={fabric(c, i === 3 ? 'wool' : 'linen')} r={0.08} rot={[-0.2, r, 0]} />
      ))}
      <Box w={0.8} h={0.03} d={0.6} x={bedX + bedW / 2 - 0.5} y={base + 0.16} z={0.25} m={fabric('#a7b494', 'knit')} r={0.012} rot={[0, 0.2, 0]} />
      {books}
      {/* LED strips under the top shelf and along the back ledge */}
      <Box w={bedW - 0.04} h={0.012} d={0.012} x={bedX} y={h - topH - t - 0.012} z={-d / 2 + 0.3} m={led} r={0} />
      <Box w={bedW - 0.04} h={0.01} d={0.01} x={bedX} y={backH - 0.01} z={-d / 2 + 0.14} m={led} r={0} />
      {lit && <pointLight position={[bedX, h - topH - 0.2, 0]} color={LAMP_COLOUR} intensity={1.2} distance={3} decay={2} userData={{ lamp: true }} />}
    </group>
  );
}

function Nook({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  if (it.variant === 'books') return <BookNook it={it} lit={lit} />;
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
  const birch = it.variant === 'birch';
  const oak = wood(birch ? 'birch' : 'oak');
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
        <Box key={`u${s}`} w={0.03} h={h} d={d} x={s * (w / 2 - 0.015)} m={birch ? lacquer('#f4f3ef', 0.5) : metal('#2b2b2a', 0.5)} r={0.004} />
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

/* ---------------------------------------------------------------- Dennis's own living room pieces */

/** Boxes laid end to end along a curve in the y–z plane: bentwood frames and moulded cushions. */
function AlongCurve({ pts, x = 0, width, thick, m, n = 16, r = 0.006 }: { pts: [number, number][]; x?: number; width: number; thick: number; m: Mat; n?: number; r?: number }) {
  const segs = useMemo(() => {
    const c = new THREE.CatmullRomCurve3(pts.map(([z, y]) => new THREE.Vector3(0, y, z)));
    const p = c.getSpacedPoints(n);
    return p.slice(1).map((b, i) => {
      const a = p[i];
      const len = a.distanceTo(b);
      return { y: (a.y + b.y) / 2, z: (a.z + b.z) / 2, len, rot: -Math.atan2(b.y - a.y, b.z - a.z) };
    });
  }, [pts, n]);
  return (
    <>
      {segs.map((sg, i) => (
        <M key={i} g={roundedBox(width, thick, sg.len + thick * 0.6, r)} m={m} p={[x, sg.y, sg.z]} r={[sg.rot, 0, 0]} />
      ))}
    </>
  );
}

/**
 * Dennis's corner sofa: grey-blue melange weave, a dark base on slim angled chrome legs,
 * padded flat arms, a chaise and tall separate back cushions that each carry a headrest.
 */
function ReclinerSofa({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const up = fabric(it.colour ?? '#8f9aa5', 'linen');
  const side = it.chaise === 'left' ? -1 : 1;
  const chrome = metal('#d4d6d8', 0.18);
  const legH = 0.13;
  const arm = 0.2;
  const backD = 0.24;
  const runD = SOFA_DEPTH;
  const back = -d / 2;
  const chX = side * (w / 2 - CHAISE_WIDTH / 2);
  const baseH = 0.2;
  const seatTop = legH + baseH;
  const seatH = 0.14;
  const runInner0 = side < 0 ? -w / 2 + CHAISE_WIDTH : -w / 2 + arm;
  const runInner1 = side < 0 ? w / 2 - arm : w / 2 - CHAISE_WIDTH;
  const seatW = (runInner1 - runInner0) / 2;
  const chSeatX = chX - (side * arm) / 2;
  const chSeatW = CHAISE_WIDTH - arm;
  const legs: [number, number, number][] = [
    [-w / 2 + 0.08, back + 0.08, -1],
    [w / 2 - 0.08, back + 0.08, 1],
    [-side * (w / 2 - 0.08), back + runD - 0.08, -side],
    [side * (w / 2 - CHAISE_WIDTH + 0.08), d / 2 - 0.08, -side],
    [side * (w / 2 - 0.08), d / 2 - 0.08, side],
  ];
  const backs = [...[0, 1].map((i) => ({ x: runInner0 + seatW * (i + 0.5), w: seatW })), { x: chSeatX, w: chSeatW }];
  return (
    <group>
      {legs.map(([x, z, s], i) => (
        <M key={i} g={cylinder(0.011, 0.009, legH + 0.02, 10)} m={chrome} p={[x, legH / 2, z]} r={[0, 0, s * 0.22]} />
      ))}
      {/* dark base under the upholstery */}
      <Box w={w - 0.04} h={0.04} d={runD - 0.04} y={legH} z={back + runD / 2} m={lacquer('#2c2d2f', 0.6)} r={0.01} />
      <Box w={CHAISE_WIDTH - 0.04} h={0.04} d={d - runD} x={chX} y={legH} z={back + runD + (d - runD) / 2 - 0.02} m={lacquer('#2c2d2f', 0.6)} r={0.01} />
      <Box w={w} h={baseH - 0.04} d={runD} y={legH + 0.04} z={back + runD / 2} m={up} r={0.03} />
      <Box w={CHAISE_WIDTH} h={baseH - 0.04} d={d - runD + 0.02} x={chX} y={legH + 0.04} z={back + runD + (d - runD) / 2 - 0.01} m={up} r={0.03} />
      {/* back frame and padded, flat-topped arms */}
      <Box w={w} h={0.62 - legH} d={backD} y={legH} z={back + backD / 2} m={up} r={0.04} />
      <Box w={arm} h={0.62 - legH} d={runD} x={-side * (w / 2 - arm / 2)} y={legH} z={back + runD / 2} m={up} r={0.06} />
      <Box w={arm} h={0.62 - legH} d={d} x={side * (w / 2 - arm / 2)} y={legH} m={up} r={0.06} />
      {/* seat cushions */}
      {[0, 1].map((i) => (
        <Box key={i} w={seatW - 0.012} h={seatH} d={runD - backD - 0.01} x={runInner0 + seatW * (i + 0.5)} y={seatTop} z={back + backD + (runD - backD) / 2} m={up} r={0.05} />
      ))}
      <Box w={chSeatW - 0.012} h={seatH} d={d - backD - 0.01} x={chSeatX} y={seatTop} z={back + backD + (d - backD) / 2} m={up} r={0.05} />
      {/* tall back cushions, each with its own headrest */}
      {backs.map((b, i) => (
        <group key={`b${i}`}>
          <Box w={b.w - 0.02} h={0.4} d={0.18} x={b.x} y={seatTop + seatH - 0.03} z={back + backD + 0.04} m={up} r={0.07} rot={[-0.1, 0, 0]} />
          <Box w={b.w - 0.04} h={h - seatTop - seatH - 0.38} d={0.16} x={b.x} y={seatTop + seatH + 0.37} z={back + backD - 0.02} m={up} r={0.07} rot={[-0.06, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

/** A bentwood armchair in birch with a thick cream cushion, after Dennis's photo. */
function BentwoodChair({ it }: { it: FurnitureItem }) {
  const { w } = it;
  const birch = wood('birch');
  const cushion = fabric(it.colour ?? '#efe9dc', 'linen');
  const side: [number, number][] = [
    [-0.3, 0.02],
    [0.05, 0.02],
    [0.3, 0.04],
    [0.37, 0.22],
    [0.33, 0.5],
    [0.12, 0.57],
    [-0.12, 0.53],
    [-0.24, 0.46],
  ];
  const seat: [number, number][] = [
    [0.36, 0.42],
    [0.24, 0.36],
    [0.02, 0.3],
    [-0.18, 0.32],
    [-0.28, 0.5],
    [-0.35, 0.76],
    [-0.39, 0.98],
  ];
  const shell = seat.map(([z, y]): [number, number] => [z + 0.02, y - 0.06]);
  return (
    <group>
      {[-1, 1].map((s) => (
        <AlongCurve key={s} pts={side} x={s * (w / 2 - 0.03)} width={0.03} thick={0.045} m={birch} n={22} />
      ))}
      {[-1, 1].map((s) => (
        <AlongCurve key={`s${s}`} pts={shell} x={s * (w / 2 - 0.1)} width={0.05} thick={0.025} m={birch} n={14} />
      ))}
      {/* cross rails: front and back on the floor, one under the seat */}
      <M g={cylinder(0.014, 0.014, w - 0.06, 10)} m={birch} p={[0, 0.04, -0.28]} r={[0, 0, Math.PI / 2]} />
      <M g={cylinder(0.014, 0.014, w - 0.06, 10)} m={birch} p={[0, 0.05, 0.3]} r={[0, 0, Math.PI / 2]} />
      <M g={cylinder(0.014, 0.014, w - 0.06, 10)} m={birch} p={[0, 0.22, -0.2]} r={[0, 0, Math.PI / 2]} />
      <AlongCurve pts={seat} width={w - 0.14} thick={0.1} m={cushion} n={18} r={0.04} />
    </group>
  );
}

/** A rounded triangular top in light oak on three splayed legs. */
function OrganicTable({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const top = 0.035;
  const oak = wood('oak');
  const g = useMemo(() => {
    const shape = new THREE.Shape();
    const n = 72;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 1 + 0.11 * Math.cos(3 * a);
      const p: [number, number] = [((Math.cos(a) * r) / 1.11) * (w / 2), ((Math.sin(a) * r) / 1.11) * (d / 2)];
      if (i === 0) shape.moveTo(...p);
      else shape.lineTo(...p);
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: top - 0.01, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.008, bevelSegments: 3, curveSegments: 4 });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [w, d]);
  return (
    <group>
      <M g={g} m={oak} p={[0, h - top + 0.005, 0]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        const lx = Math.cos(a) * (w / 2) * 0.62;
        const lz = -Math.sin(a) * (d / 2) * 0.62;
        return <M key={i} g={cylinder(0.022, 0.014, h - top + 0.02, 12)} m={oak} p={[lx, (h - top) / 2, lz]} r={[Math.sin(a) * -0.16, 0, Math.cos(a) * -0.16]} />;
      })}
    </group>
  );
}

/** A black arc floor lamp with an LED strip along the underside of its curve; it reaches forward (+z). */
function ArcLamp({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  const reach = 1.55;
  const top = it.h;
  const { arc, led, end } = useMemo(() => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.03, 0),
      new THREE.Vector3(0, top * 0.55, 0.02),
      new THREE.Vector3(0, top * 0.88, reach * 0.25),
      new THREE.Vector3(0, top, reach * 0.62),
      new THREE.Vector3(0, top * 0.95, reach * 0.9),
      new THREE.Vector3(0, top * 0.84, reach),
    ]);
    const pts = c.getPoints(60);
    const ledPts = pts.slice(28).map((p, i, a) => p.clone().add(new THREE.Vector3(0, -0.012, 0)).lerp(a[Math.min(i + 1, a.length - 1)], 0));
    return {
      arc: new THREE.TubeGeometry(c, 80, 0.012, 10, false),
      led: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ledPts), 50, 0.006, 6, false),
      end: pts[pts.length - 1],
    };
  }, [top]);
  const black = metal('#1b1b1b', 0.55);
  return (
    <group>
      <M g={cylinder(0.17, 0.18, 0.03, 40)} m={black} p={[0, 0.015, 0]} />
      <M g={arc} m={black} />
      <M g={led} m={bulb()} shadow={false} />
      <M g={cylinder(0.016, 0.016, 0.04, 12)} m={black} p={[end.x, end.y - 0.02, end.z]} />
      {lit && (
        <group position={[0, 0, reach * 0.75]}>
          <LampLight y={top - 0.1} intensity={2.4} />
        </group>
      )}
    </group>
  );
}

/** A tall dracaena: cane stems of different heights, each topped with tufts of long strap leaves, in a round pot. */
function Dracaena({ it }: { it: FurnitureItem }) {
  const r = it.w / 2;
  const potH = 0.4;
  const seed = Math.round(it.x * 131 + it.y * 17);
  const canes = [
    { x: 0.03, z: 0.02, h: it.h * 0.95 - potH, lean: [0.06, -0.04] },
    { x: -0.05, z: 0.03, h: it.h * 0.72 - potH, lean: [-0.12, 0.05] },
    { x: 0.02, z: -0.05, h: it.h * 0.5 - potH, lean: [0.08, 0.14] },
  ];
  const g = merged(`dracaena${it.h},${seed}`, () => {
    const rand = rng(seed);
    const parts: { g: THREE.BufferGeometry; m: THREE.Matrix4 }[] = [];
    for (const c of canes) {
      const tx = c.x + c.lean[0] * c.h;
      const tz = c.z + c.lean[1] * c.h;
      // Each cane carries a crown and a second, smaller tuft a little below it.
      for (const [y0, count, len] of [
        [potH + c.h, 26, 0.62],
        [potH + c.h - 0.35, 14, 0.5],
      ] as const) {
        for (let i = 0; i < count; i++) {
          const a = rand() * Math.PI * 2;
          const L = len * (0.65 + rand() * 0.45);
          const wid = 0.035 + rand() * 0.015;
          const lift = 0.35 + rand() * 0.9;
          const frame = mat4([tx, y0 + rand() * 0.18, tz], [0, a, 0]);
          // A leaf in two parts: rising from the stem, then arching over.
          const l1 = L * 0.5;
          parts.push({ g: sphere(1, 1), m: frame.clone().multiply(mat4([(Math.cos(lift) * l1) / 2, (Math.sin(lift) * l1) / 2, 0], [0, 0, lift], [l1 / 2, 0.004, wid])) });
          const e2 = lift - 0.9 - rand() * 0.4;
          const sx = Math.cos(lift) * l1;
          const sy = Math.sin(lift) * l1;
          parts.push({ g: sphere(1, 1), m: frame.clone().multiply(mat4([sx + (Math.cos(e2) * l1) / 2, sy + (Math.sin(e2) * l1) / 2, 0], [0, 0, e2], [l1 / 2, 0.004, wid * 0.9])) });
        }
      }
    }
    return parts;
  });
  const cane = lacquer('#8c7a5e', 0.9);
  return (
    <group>
      <M
        g={lathe([
          [r * 0.55, 0],
          [r * 0.85, potH * 0.25],
          [r, potH * 0.7],
          [r * 0.96, potH],
          [r * 0.9, potH],
        ])}
        m={ceramic(it.accent ?? '#e7b52f', 0.4)}
      />
      <M g={cylinder(r * 0.9, r * 0.9, 0.01, 24)} m={terracotta('#4a3b2e')} p={[0, potH - 0.03, 0]} shadow={false} />
      {canes.map((c, i) => (
        <M key={i} g={cylinder(0.026, 0.032, c.h, 10)} m={cane} p={[c.x + (c.lean[0] * c.h) / 2, potH - 0.03 + c.h / 2, c.z + (c.lean[1] * c.h) / 2]} r={[c.lean[1], 0, -c.lean[0]]} />
      ))}
      <M g={g} m={foliage('leaf')} />
    </group>
  );
}

/** Low garden shrubs planted in the lawn: a few overlapping rounded clumps. */
function Shrub({ it }: { it: FurnitureItem }) {
  const seed = Math.round(it.x * 131 + it.y * 17);
  return <LeafCloud count={Math.round(90 * it.w)} spread={it.w / 2} height={it.h * 0.75} base={it.h * 0.1} size={0.09} kind="leaf" seed={seed} flat={0.7} />;
}

/** Pampas grass: a fountain of thin blades with tall cream plumes. */
function Pampas({ it }: { it: FurnitureItem }) {
  const seed = Math.round(it.x * 131 + it.y * 17);
  const blades = merged(`pampas${it.w},${it.h},${seed}`, () => {
    const rand = rng(seed);
    return Array.from({ length: 70 }, () => {
      const a = rand() * Math.PI * 2;
      const L = it.h * (0.35 + rand() * 0.2);
      const lift = 1.0 + rand() * 0.45;
      return { g: sphere(1, 1), m: mat4([0, 0, 0], [0, a, 0]).multiply(mat4([(Math.cos(lift) * L) / 2, (Math.sin(lift) * L) / 2, 0], [0, 0, lift], [L / 2, 0.003, 0.008])) };
    });
  });
  const plumes = merged(`plumes${it.w},${it.h},${seed}`, () => {
    const rand = rng(seed + 3);
    return Array.from({ length: 11 }, () => {
      const a = rand() * Math.PI * 2;
      const rr = rand() * it.w * 0.28;
      const y = it.h * (0.72 + rand() * 0.2);
      return { g: sphere(1, 1), m: mat4([Math.cos(a) * rr, y, Math.sin(a) * rr], [Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15], [0.05, 0.17, 0.05]) };
    });
  });
  const stems = merged(`pstems${it.w},${it.h},${seed}`, () => {
    const rand = rng(seed + 3);
    return Array.from({ length: 11 }, () => {
      const a = rand() * Math.PI * 2;
      const rr = rand() * it.w * 0.28;
      const y = it.h * (0.72 + rand() * 0.2);
      return { g: cylinder(0.004, 0.004, y, 5), m: mat4([(Math.cos(a) * rr) / 2, y / 2, (Math.sin(a) * rr) / 2], [Math.sin(a) * (rr / y), 0, -Math.cos(a) * (rr / y)]) };
    });
  });
  return (
    <group>
      <M g={blades} m={foliage('grass')} />
      <M g={stems} m={lacquer('#b9a77f', 0.9)} />
      <M g={plumes} m={fabric('#efe6d2', 'boucle')} />
    </group>
  );
}

/**
 * A flush door in its frame. Double-click opens or closes it. The default is the warm grey
 * door to the basement stair, with a plastered panel above it up to the ceiling; 'front' is
 * the front door, set in the facade, which opens inwards.
 */
function Door({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const front = it.variant === 'front';
  const [open, setOpen] = useState(false);
  const t = useRef(0);
  const leafRef = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const dir = front ? 1 : -1;
  useFrame((_, dt) => {
    const target = open ? 1 : 0;
    if (t.current === target) return;
    const step = Math.min(dt, 0.2) / 1.2;
    t.current = target > t.current ? Math.min(target, t.current + step) : Math.max(target, t.current - step);
    if (leafRef.current) leafRef.current.rotation.y = dir * ease(t.current) * 1.5;
    invalidate();
  });
  const toggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setOpen((o) => !o);
    invalidate();
  };
  const jamb = 0.045;
  const doorH = front ? h - 0.04 : 2.1;
  const leafW = w - 2 * jamb - 0.006;
  const leafH = doorH - jamb - 0.01;
  const leafT = 0.042;
  const frameM = front ? lacquer(it.colour ?? '#55585a', 0.5) : lacquer('#f4f3ef', 0.45);
  const leafM = lacquer(it.colour ?? '#8c8378', 0.55);
  const handleM = metal(it.accent ?? '#2a2a2a', 0.45);
  // The leaf sits flush with the face it opens towards.
  const leafZ = front ? -d / 2 + leafT / 2 + 0.01 : d / 2 - leafT / 2 - 0.01;
  return (
    <group onDoubleClick={toggle}>
      {[-1, 1].map((s) => (
        <Box key={s} w={jamb} h={doorH} d={d} x={s * (w / 2 - jamb / 2)} m={frameM} r={0.003} />
      ))}
      <Box w={w} h={jamb} d={d} y={doorH - jamb} m={frameM} r={0.003} />
      {!front && h > doorH + 0.02 && <Box w={w} h={h - doorH} d={d} y={doorH} m={paint('#fafafa')} r={0} />}
      <group ref={leafRef} position={[-w / 2 + jamb + 0.003, 0.008, leafZ]}>
        <Box w={leafW} h={leafH} d={leafT} x={leafW / 2} m={leafM} r={0.004} />
        {[-1, 1].map((s) => (
          <group key={s} position={[leafW - 0.07, 1.05, s * (leafT / 2 + 0.006)]}>
            <M g={cylinder(0.025, 0.025, 0.01, 24)} m={handleM} r={[Math.PI / 2, 0, 0]} />
            <M g={cylinder(0.009, 0.009, 0.05, 10)} m={handleM} p={[0, 0, s * 0.025]} r={[Math.PI / 2, 0, 0]} />
            <Box w={0.13} h={0.018} d={0.018} x={-0.055} y={-0.009} z={s * 0.05} m={handleM} r={0.006} />
          </group>
        ))}
        {front && <Box w={0.03} h={0.9} d={0.02} x={leafW - 0.09} y={0.6} z={d / 2 + 0.01 - leafZ} m={handleM} r={0.008} />}
      </group>
    </group>
  );
}

/** A flat anthracite canopy over the front door, after Dennis's photo; its back is on the facade (-z). */
function Canopy({ it }: { it: FurnitureItem }) {
  const m = lacquer(it.colour ?? '#4a4b4c', 0.5);
  return (
    <group>
      <Box w={it.w} h={it.h} d={it.d} m={m} r={0.01} />
      {[-1, 1].map((s) => (
        <M key={s} g={cylinder(0.006, 0.006, Math.hypot(it.d, 0.5), 8)} m={metal('#3a3a3a', 0.4)} p={[s * (it.w / 2 - 0.08), it.h + 0.25, 0]} r={[Math.atan2(-it.d, 0.5), 0, 0]} />
      ))}
    </group>
  );
}

/** A grey letterbox on a single post, its slot facing +z. */
function Mailbox({ it }: { it: FurnitureItem }) {
  const grey = lacquer(it.colour ?? '#6c6e70', 0.45);
  const boxH = 0.36;
  return (
    <group>
      <Box w={0.08} h={it.h - boxH} d={0.08} m={grey} r={0.004} />
      <Box w={it.w} h={boxH} d={it.d} y={it.h - boxH} m={grey} r={0.008} />
      <Box w={it.w + 0.02} h={0.02} d={it.d + 0.03} y={it.h} z={0.01} m={grey} r={0.006} />
      <Box w={it.w * 0.6} h={0.012} d={0.01} y={it.h - 0.09} z={it.d / 2} m={metal('#2a2a2a', 0.5)} r={0.002} />
    </group>
  );
}

/** A stone kerb that edges a path. */
function Kerb({ it }: { it: FurnitureItem }) {
  return <Box w={it.w} h={it.h} d={it.d} m={lacquer(it.colour ?? '#bdbcb7', 0.85)} r={0.008} />;
}

/**
 * Shelving full of matching storage boxes: birch plywood for the store, or an oak closet
 * with a plinth and top for the reading room.
 */
function BoxShelf({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const oak = it.variant === 'oak';
  const ply = wood(oak ? 'oakBrushed' : 'birch');
  const t = 0.022;
  const plinth = oak ? 0.08 : 0.05;
  const levels = Math.max(3, Math.round((h - plinth) / 0.4));
  const lh = (h - plinth - t) / levels;
  const bays = Math.max(1, Math.round(w / 0.62));
  const bw = (w - t) / bays;
  const colours = oak ? ['#dcd3c4', '#c9bfae', '#dcd3c4'] : ['#e9e7e1', '#a7a49b', '#e9e7e1', '#d6bf8a'];
  const rand = rng(Math.round(it.x * 31 + it.y * 7));
  const boxes: ReactNode[] = [];
  for (let l = 0; l < levels; l++) {
    for (let b = 0; b < bays; b++) {
      const n = rand() < 0.5 ? 2 : 1;
      const cw = (bw - t - 0.03 * (n + 1)) / n;
      for (let k = 0; k < n; k++) {
        if (rand() < 0.08) continue;
        const x = -w / 2 + t + b * bw + 0.03 + k * (cw + 0.03) + cw / 2;
        const y = plinth + t + l * lh;
        const bh = lh - t - 0.06;
        const m = fabric(colours[Math.floor(rand() * colours.length)], 'linen');
        // Each box slides out when clicked, with a pull and a label on its front.
        boxes.push(
          <Opens key={`${l}-${b}-${k}`} slide={d * 0.6} at={[x, y, 0.01]}>
            <Box w={cw} h={bh} d={d - 0.06} m={m} r={0.012} />
            <Box w={Math.min(0.12, cw * 0.4)} h={0.025} d={0.008} y={bh * 0.72} z={d / 2 - 0.026} m={lacquer('#3b3532', 0.6)} r={0.004} />
            <Box w={0.08} h={0.04} d={0.004} y={bh * 0.42} z={d / 2 - 0.028} m={lacquer('#f7f5ef', 0.8)} r={0} />
          </Opens>,
        );
      }
    }
  }
  return (
    <group>
      <Box w={w} h={plinth} d={d - 0.04} z={-0.02} m={oak ? lacquer('#2c2a28', 0.7) : ply} r={0} />
      {Array.from({ length: levels + 1 }, (_, l) => (
        <Box key={`s${l}`} w={w} h={t} d={d} y={plinth + l * lh} m={ply} r={0.002} grain />
      ))}
      {Array.from({ length: bays + 1 }, (_, b) => (
        <Box key={`v${b}`} w={t} h={h - plinth} d={d} x={-w / 2 + t / 2 + b * bw} y={plinth} m={ply} r={0.002} grain />
      ))}
      <Box w={w} h={h - plinth} d={0.012} y={plinth} z={-d / 2 + 0.006} m={ply} r={0} grain />
      {boxes}
    </group>
  );
}

/** Dennis's espresso machine, a Profitec Go in light blue on a steel base, after his photo. */
function Espresso({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const blue = lacquer(it.colour ?? '#8db4d3', 0.4);
  const steel = metal('#d6d8da', 0.2);
  const black = lacquer('#1d1d1d', 0.35);
  const front = d / 2;
  const wand = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(w / 2 - 0.02, h * 0.7, front - 0.06),
          new THREE.Vector3(w / 2 + 0.04, h * 0.68, front),
          new THREE.Vector3(w / 2 + 0.07, h * 0.58, front + 0.04),
          new THREE.Vector3(w / 2 + 0.08, h * 0.3, front + 0.06),
        ]),
        24,
        0.005,
        8,
        false,
      ),
    [w, h, front],
  );
  return (
    <group>
      {/* steel base with the drip tray */}
      <Box w={w} h={0.065} d={d} m={steel} r={0.004} />
      <Box w={w - 0.03} h={0.004} d={0.16} y={0.065} z={front - 0.09} m={metal('#3a3a3a', 0.4)} r={0} />
      {/* the blue body: a tall back and an overhanging top with the group under it */}
      <Box w={w} h={h - 0.065} d={d * 0.55} y={0.065} z={-d / 2 + d * 0.275} m={blue} r={0.006} />
      <Box w={w} h={h * 0.34} d={d * 0.5} y={h * 0.66} z={front - d * 0.25} m={blue} r={0.006} />
      <Box w={w * 0.32} h={h * 0.5} d={d * 0.5} x={-w / 2 + w * 0.16} y={0.065} z={front - d * 0.25} m={blue} r={0.006} />
      {/* switches with their lamps, the steam knob, the badge */}
      {[0.93, 0.83, 0.73].map((k, i) => (
        <group key={i}>
          <M g={cylinder(0.011, 0.011, 0.01, 16)} m={steel} p={[-w / 2 + 0.05, h * k, front + 0.005]} r={[Math.PI / 2, 0, 0]} />
          <M g={sphere(0.004, 1)} m={lacquer(i === 2 ? '#2f8a3a' : '#c4472f', 0.3)} p={[-w / 2 + 0.075, h * k, front + 0.003]} shadow={false} />
        </group>
      ))}
      <M g={sphere(0.018, 2)} m={black} p={[w / 2 - 0.05, h * 0.82, front + 0.012]} />
      <Box w={0.05} h={0.014} d={0.004} x={w * 0.12} y={h * 0.7} z={front + 0.001} m={steel} r={0.001} />
      {/* group head and portafilter with its black handle */}
      <M g={cylinder(0.034, 0.034, 0.03, 24)} m={steel} p={[0.02, h * 0.62, front - 0.08]} />
      <M g={cylinder(0.031, 0.028, 0.03, 24)} m={steel} p={[0.02, h * 0.55, front - 0.08]} />
      <M g={cylinder(0.011, 0.013, 0.11, 12)} m={black} p={[0.02, h * 0.53, front + 0.02]} r={[Math.PI / 2 - 0.15, 0, 0]} />
      {/* pressure gauge */}
      <M g={cylinder(0.03, 0.03, 0.012, 32)} m={steel} p={[-w / 2 + w * 0.16, h * 0.33, front + 0.006]} r={[Math.PI / 2, 0, 0]} />
      <M g={cylinder(0.026, 0.026, 0.002, 32)} m={black} p={[-w / 2 + w * 0.16, h * 0.33, front + 0.013]} r={[Math.PI / 2, 0, 0]} />
      {/* shot timer display */}
      <Box w={0.06} h={0.03} d={0.006} x={w * 0.2} y={h * 0.36} z={front - 0.15} m={screen()} r={0.003} />
      <M g={wand} m={steel} />
      <M g={cylinder(0.009, 0.009, 0.05, 12)} m={black} p={[w / 2 + 0.065, h * 0.6, front + 0.035]} r={[0.6, 0, 0.3]} />
    </group>
  );
}

/** A Eureka Mignon Specialità grinder in matt black: a slim body, a clear hopper, a display and a cup fork. */
function Grinder({ it }: { it: FurnitureItem }) {
  const { w, d, h } = it;
  const black = lacquer('#1e1e1f', 0.6);
  const body = h * 0.62;
  const hopper = cached('hopper', () => new THREE.MeshPhysicalMaterial({ color: '#f2f4f5', roughness: 0.05, transparent: true, opacity: 0.35 }));
  return (
    <group>
      <Box w={w} h={0.02} d={d} m={black} r={0.004} />
      <Box w={w} h={body - 0.02} d={d * 0.8} y={0.02} z={-d * 0.1} m={black} r={0.01} />
      {/* the front: a silver display panel and the spout above the fork */}
      <Box w={w * 0.75} h={0.07} d={0.01} y={body - 0.1} z={d * 0.3 + 0.005} m={metal('#c9cbcc', 0.3)} r={0.003} />
      <Box w={w * 0.4} h={0.03} d={0.004} y={body - 0.075} z={d * 0.3 + 0.012} m={screen()} r={0.002} />
      <Box w={w * 0.3} h={0.035} d={0.05} y={body * 0.45} z={d * 0.3 + 0.02} m={black} r={0.008} />
      {[-1, 1].map((sx) => (
        <Box key={sx} w={0.008} h={0.008} d={0.06} x={sx * 0.02} y={body * 0.25} z={d * 0.3 + 0.03} m={metal('#c9cbcc', 0.3)} r={0.002} />
      ))}
      {/* collar and hopper */}
      <M g={cylinder(0.035, 0.04, 0.03, 24)} m={metal('#c9cbcc', 0.3)} p={[0, body + 0.015, -d * 0.05]} />
      <M
        g={lathe([
          [0.03, 0],
          [w * 0.62, h * 0.18],
          [w * 0.62, h - body - 0.03],
        ])}
        m={hopper}
        p={[0, body + 0.03, -d * 0.05]}
      />
      <M g={cylinder(w * 0.64, w * 0.64, 0.012, 32)} m={black} p={[0, h - 0.006, -d * 0.05]} />
    </group>
  );
}

/**
 * A garden dining set: a teak table for six on black aluminium legs and rope-weave chairs.
 * Double-click to put it away for the winter under a fitted grey cover; click the cover to
 * bring the set back.
 */
function GardenSet({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
  const [covered, setCovered] = useState(false);
  const t = useRef(0);
  const cover = useRef<THREE.Group>(null);
  const set = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame((_, dt) => {
    const target = covered ? 1 : 0;
    if (t.current === target) return;
    const step = Math.min(dt, 0.2) / 0.8;
    t.current = target > t.current ? Math.min(target, t.current + step) : Math.max(target, t.current - step);
    const k = ease(t.current);
    if (cover.current) {
      cover.current.visible = k > 0.001;
      cover.current.position.y = (1 - k) * 1.4;
      cover.current.scale.setScalar(0.85 + 0.15 * k);
    }
    if (set.current) set.current.visible = k < 0.999;
    invalidate();
  });
  const alu = metal('#2a2b2c', 0.55);
  const teak = wood('teak');
  const rope = fabric('#c9c2b4', 'knit');
  const cushion = fabric('#8a8f8a', 'linen');
  const tw = w - 0.1;
  const td = 0.9;
  const th = 0.75;
  const chairs = [-1, 0, 1].flatMap((i) =>
    [-1, 1].map((s) => ({ x: i * (tw / 3), z: s * (td / 2 + 0.2), rot: s > 0 ? Math.PI : 0 })),
  );
  return (
    <group
      onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        setCovered(true);
        invalidate();
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!covered) return;
        e.stopPropagation();
        setCovered(false);
        invalidate();
      }}
    >
      <group ref={set}>
        {/* table: teak slats on a black frame */}
        {Array.from({ length: 8 }, (_, i) => (
          <Box key={i} w={tw} h={0.03} d={td / 8 - 0.008} y={th - 0.03} z={-td / 2 + (td / 8) * (i + 0.5)} m={teak} r={0.004} grain />
        ))}
        <Box w={tw - 0.06} h={0.05} d={td - 0.06} y={th - 0.08} m={alu} r={0.004} />
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} w={0.05} h={th - 0.08} d={0.05} x={sx * (tw / 2 - 0.08)} z={sz * (td / 2 - 0.08)} m={alu} r={0.004} />))}
        {/* chairs facing the table */}
        {chairs.map((c, i) => (
          <group key={`c${i}`} position={[c.x, 0, c.z]} rotation={[0, c.rot, 0]}>
            {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <M key={`${sx}${sz}`} g={cylinder(0.012, 0.012, 0.44, 8)} m={alu} p={[sx * 0.22, 0.22, sz * 0.2 - 0.05]} />))}
            <Box w={0.5} h={0.03} d={0.46} y={0.43} z={-0.05} m={rope} r={0.01} />
            <Box w={0.46} h={0.05} d={0.42} y={0.46} z={-0.05} m={cushion} r={0.02} />
            <Box w={0.5} h={0.42} d={0.03} y={0.46} z={-0.3} m={rope} r={0.01} rot={[-0.15, 0, 0]} />
          </group>
        ))}
      </group>
      {/* the winter cover over the stacked set */}
      <group ref={cover} visible={false}>
        <Box w={w} h={0.9} d={d - 0.2} m={fabric('#5b6063', 'linen')} r={0.12} />
        <Box w={w + 0.04} h={0.04} d={d - 0.16} m={fabric('#4a4e51', 'linen')} r={0.02} />
      </group>
    </group>
  );
}

/** Draws one furniture item in its own frame. */
export function Piece({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  switch (it.kind) {
    case 'sofa':
      return it.variant === 'recliner' ? <ReclinerSofa it={it} /> : it.chaise ? <CornerSofa it={it} /> : <Sofa it={it} />;
    case 'loungeChair':
      return it.variant === 'bentwood' ? <BentwoodChair it={it} /> : <LoungeChair it={it} />;
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
      return it.variant === 'organic' ? <OrganicTable it={it} /> : <CoffeeTable it={it} />;
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
      return it.variant === 'arc' ? <ArcLamp it={it} lit={lit} /> : <FloorLamp it={it} lit={lit} />;
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
      return it.variant === 'dracaena' ? <Dracaena it={it} /> : it.variant === 'shrub' ? <Shrub it={it} /> : it.variant === 'pampas' ? <Pampas it={it} /> : <Plant it={it} />;
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
    case 'door':
      return <Door it={it} />;
    case 'boxShelf':
      return <BoxShelf it={it} />;
    case 'gardenSet':
      return <GardenSet it={it} />;
    case 'espresso':
      return <Espresso it={it} />;
    case 'grinder':
      return <Grinder it={it} />;
    case 'canopy':
      return <Canopy it={it} />;
    case 'mailbox':
      return <Mailbox it={it} />;
    case 'kerb':
      return <Kerb it={it} />;
  }
}
