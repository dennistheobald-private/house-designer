import type { ReactNode } from 'react';
import * as THREE from 'three';
import type { FurnitureItem } from '../../furniture/types';
import { rng } from '../textures';
import {
  art,
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

function DiningChair({ it }: { it: FurnitureItem }) {
  const { w, d } = it;
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
  return (
    <group>
      <Box w={w} h={top} d={d} y={h - top} m={wood()} r={0.006} />
      <Legs w={w} d={d} h={h - top} inset={desk ? 0.04 : 0.09} r={desk ? 0.017 : 0.028} />
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
  const m = fabric(it.colour ?? '#e9e3d6', 'wool');
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
  return (
    <group>
      <Box w={it.w} h={0.36} d={it.d - 0.06} y={0.22} z={0.03} m={ceramic('#f7f7f4', 0.12)} r={0.12} />
      <Box w={it.w + 0.02} h={0.02} d={it.d - 0.08} y={0.58} z={0.04} m={ceramic('#f7f7f4', 0.15)} r={0.01} />
      <Box w={0.45} h={1.1} d={0.08} z={-it.d / 2 + 0.04} m={paint('#3d6262')} r={0.003} />
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

function Washer({ it }: { it: FurnitureItem }) {
  return (
    <group>
      <Box w={it.w} h={it.h} d={it.d} m={lacquer('#f4f4f2', 0.3)} r={0.015} />
      <M g={torus(0.17, 0.025)} m={lacquer('#c9c9c9', 0.3)} p={[0, it.h * 0.45, it.d / 2 + 0.005]} />
      <M g={cylinder(0.16, 0.16, 0.01, 40)} m={screen()} p={[0, it.h * 0.45, it.d / 2]} r={[Math.PI / 2, 0, 0]} />
      <Box w={it.w - 0.04} h={0.1} d={0.01} y={it.h - 0.12} z={it.d / 2} m={lacquer('#e2e2df', 0.4)} r={0} />
      {it.variant !== 'dryer' && <Box w={1.3} h={0.03} d={it.d + 0.03} x={0.33} y={it.h + 0.005} m={wood()} r={0.004} />}
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

/** Draws one furniture item in its own frame. */
export function Piece({ it, lit }: { it: FurnitureItem; lit: boolean }) {
  switch (it.kind) {
    case 'sofa':
      return <Sofa it={it} />;
    case 'loungeChair':
      return <LoungeChair it={it} />;
    case 'diningChair':
      return <DiningChair it={it} />;
    case 'deskChair':
      return <DeskChair it={it} />;
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
      return <Table it={it} desk />;
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
  }
}
