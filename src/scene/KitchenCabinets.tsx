import * as THREE from 'three';
import { cylinder, lacquer, roundedBox, wood } from './furniture/look';
import { Opens } from './furniture/pieces';
import { material } from './materials';

/*
 * The Inform kitchen's cabinets with fronts that open: double-click a door to swing it open,
 * or a drawer to pull it out, and again to close it. Each run is drawn in its own frame with
 * the front face at z = 0, the carcass behind it (towards -z) and x along the run.
 */

type Module = { from: number; to: number; z0: number; z1: number; kind: 'door' | 'doorLeft' | 'drawers' | 'pair'; n?: number };

interface Run {
  /** Where the front face's left end sits on the plan (as seen facing the run), and the floor height of the carcass. */
  at: [number, number];
  /** Which way the front faces on the plan. */
  face: '+y' | '-y' | '-x';
  length: number;
  depth: number;
  z0: number;
  z1: number;
  modules: Module[];
  /** What stands on the shelves: plates and glasses up top, pans and tins below. */
  contents: 'crockery' | 'pantry' | 'pans';
}

const ROT = { '+y': 0, '-y': Math.PI, '-x': -Math.PI / 2 } as const;

const seq = (start: number, widths: number[], z0: number, z1: number, kinds: Module['kind'][], n = 3): Module[] => {
  let x = start;
  return widths.map((w, i) => {
    const m = { from: x, to: x + w, z0, z1, kind: kinds[i % kinds.length], n };
    x += w;
    return m;
  });
};

const RUNS: Run[] = [
  // Tall units against the stair wall: drawers under the two ovens, doors above them, and a full-height pantry.
  {
    at: [6.57, 3.51],
    face: '+y',
    length: 1.965,
    depth: 0.6,
    z0: 0.1,
    z1: 2.5,
    contents: 'pantry',
    modules: [
      ...seq(0.035, [0.6, 0.6], 0.1, 0.86, ['drawers'], 2),
      ...seq(0.035, [0.6, 0.6], 1.48, 2.5, ['door', 'doorLeft']),
      { from: 1.235, to: 1.965, z0: 0.1, z1: 1.3, kind: 'door' },
      { from: 1.235, to: 1.965, z0: 1.3, z1: 2.5, kind: 'door' },
    ],
  },
  // The run along the south party wall, with drawers under the worktop and the cooktop.
  { at: [9.55, 5.08], face: '-y', length: 2.98, depth: 0.62, z0: 0.1, z1: 0.91, contents: 'pans', modules: seq(0, [0.6, 0.6, 0.6, 0.59, 0.59], 0.1, 0.85, ['drawers']) },
  // The sink run under the street window: drawers either side of a door pair under the sink.
  { at: [9.55, 3.27], face: '-x', length: 1.81, depth: 0.6, z0: 0.1, z1: 0.91, contents: 'pans', modules: seq(0, [0.6, 0.61, 0.6], 0.1, 0.85, ['drawers', 'pair', 'drawers']) },
  // Wall cabinets over the south run.
  {
    at: [10.1, 5.35],
    face: '-y',
    length: 3.5,
    depth: 0.35,
    z0: 1.55,
    z1: 2.185,
    contents: 'crockery',
    modules: seq(0, [0.5, 0.5, 0.9, 0.53, 0.53, 0.54], 1.55, 2.185, ['doorLeft', 'door', 'pair', 'doorLeft', 'door', 'doorLeft']),
  },
];

const GAP = 0.003;
const FRONT = 0.019;

function Panel({ w, h, d, x, y, z, m }: { w: number; h: number; d: number; x: number; y: number; z: number; m: THREE.Material }) {
  return <mesh geometry={roundedBox(w, h, d, 0.002)} material={m} position={[x, y, z]} castShadow receiveShadow />;
}

/** A door hinged at one side, swinging out towards +z. */
function Door({ x0, x1, z0, z1, hingeLeft, front }: { x0: number; x1: number; z0: number; z1: number; hingeLeft: boolean; front: THREE.Material }) {
  const w = x1 - x0 - 2 * GAP;
  const h = z1 - z0 - 2 * GAP;
  const hinge = hingeLeft ? x0 + GAP : x1 - GAP;
  const dir = hingeLeft ? 1 : -1;
  return (
    <Opens swing={-dir * 1.7} at={[hinge, 0, 0]}>
      <Panel w={w} h={h} d={FRONT} x={(dir * w) / 2} y={(z0 + z1) / 2} z={FRONT / 2} m={front} />
    </Opens>
  );
}

/** A drawer that slides out towards +z: its front and an open birch box behind it. */
function Drawer({ x0, x1, z0, z1, depth, front, seed }: { x0: number; x1: number; z0: number; z1: number; depth: number; front: THREE.Material; seed: number }) {
  const w = x1 - x0 - 2 * GAP;
  const h = z1 - z0 - 2 * GAP;
  const cx = (x0 + x1) / 2;
  const box = wood('birch');
  const bd = depth - 0.08;
  const bh = Math.max(0.08, h - 0.06);
  const yb = z0 + 0.03;
  return (
    <Opens slide={bd * 0.75}>
      <Panel w={w} h={h} d={FRONT} x={cx} y={(z0 + z1) / 2} z={FRONT / 2} m={front} />
      {[-1, 1].map((s) => (
        <Panel key={s} w={0.012} h={bh} d={bd} x={cx + s * (w / 2 - 0.03)} y={yb + bh / 2} z={-bd / 2} m={box} />
      ))}
      <Panel w={w - 0.06} h={bh} d={0.012} x={cx} y={yb + bh / 2} z={-bd} m={box} />
      <Panel w={w - 0.06} h={0.01} d={bd} x={cx} y={yb + 0.005} z={-bd / 2} m={box} />
      {/* Something in each drawer: pans in the deep ones, a cutlery tray in the shallow ones. */}
      {bh > 0.2 ? (
        <mesh geometry={cylinder(0.11, 0.1, Math.min(0.14, bh - 0.04), 24)} material={lacquer(seed % 2 ? '#2f2f30' : '#b9b3aa', 0.4)} position={[cx - w / 6, yb + 0.01 + Math.min(0.14, bh - 0.04) / 2, -bd / 2]} castShadow />
      ) : (
        <Panel w={w - 0.1} h={0.04} d={bd - 0.06} x={cx} y={yb + 0.03} z={-bd / 2} m={wood('oakBrushed')} />
      )}
    </Opens>
  );
}

function Contents({ run, m, inner }: { run: Run; m: Module; inner: THREE.Material }) {
  const cx = (m.from + m.to) / 2;
  const w = m.to - m.from;
  const z = -run.depth / 2;
  const shelf = m.z0 + (m.z1 - m.z0) * 0.5;
  const plate = lacquer('#f6f4ef', 0.25);
  const glass = new THREE.MeshPhysicalMaterial({ color: '#e8f1f2', roughness: 0.05, transparent: true, opacity: 0.45 });
  const jar = lacquer('#c8a97e', 0.5);
  return (
    <group>
      <Panel w={w - 0.04} h={0.016} d={run.depth - 0.05} x={cx} y={shelf} z={z} m={inner} />
      {run.contents === 'crockery' && (
        <>
          <mesh geometry={cylinder(0.13, 0.11, 0.1, 32)} material={plate} position={[cx - w / 5, m.z0 + 0.07, z]} castShadow />
          {[-1, 0, 1].map((i) => (
            <mesh key={i} geometry={cylinder(0.035, 0.03, 0.12, 16)} material={glass} position={[cx + i * 0.08, shelf + 0.07, z]} />
          ))}
        </>
      )}
      {run.contents === 'pantry' &&
        [-1, 0, 1].map((i) => <mesh key={i} geometry={cylinder(0.045, 0.045, 0.18, 16)} material={i ? jar : plate} position={[cx + i * 0.11, shelf + 0.1, z]} castShadow />)}
    </group>
  );
}

function CabinetRun({ run, level }: { run: Run; level: number }) {
  const front = material('taupe');
  const inner = lacquer('#f4f3ef', 0.5);
  const { length: L, depth: D, z0, z1 } = run;
  const t = 0.018;
  return (
    <group position={[run.at[0], level, run.at[1]]} rotation={[0, ROT[run.face], 0]}>
      {/* Hollow carcass: white inside, closed at the ends, back, top and bottom */}
      <Panel w={L} h={t} d={D} x={L / 2} y={z0 + t / 2} z={-D / 2} m={inner} />
      <Panel w={L} h={t} d={D} x={L / 2} y={z1 - t / 2} z={-D / 2} m={inner} />
      <Panel w={L} h={z1 - z0} d={t} x={L / 2} y={(z0 + z1) / 2} z={-D + t / 2} m={inner} />
      {[t / 2, L - t / 2].map((x) => (
        <Panel key={x} w={t} h={z1 - z0} d={D} x={x} y={(z0 + z1) / 2} z={-D / 2} m={front} />
      ))}
      {run.modules.map((m, i) => (
        <group key={i}>
          {/* Divider at the module's right end, shelves and contents behind doors */}
          {m.to < L - 0.01 && <Panel w={t} h={m.z1 - m.z0} d={D - t} x={m.to} y={(m.z0 + m.z1) / 2} z={-D / 2} m={inner} />}
          {m.kind !== 'drawers' && <Contents run={run} m={m} inner={inner} />}
          {m.kind === 'door' && <Door x0={m.from} x1={m.to} z0={m.z0} z1={m.z1} hingeLeft={false} front={front} />}
          {m.kind === 'doorLeft' && <Door x0={m.from} x1={m.to} z0={m.z0} z1={m.z1} hingeLeft front={front} />}
          {m.kind === 'pair' && (
            <>
              <Door x0={m.from} x1={(m.from + m.to) / 2} z0={m.z0} z1={m.z1} hingeLeft front={front} />
              <Door x0={(m.from + m.to) / 2} x1={m.to} z0={m.z0} z1={m.z1} hingeLeft={false} front={front} />
            </>
          )}
          {m.kind === 'drawers' &&
            Array.from({ length: m.n ?? 3 }, (_, j) => {
              const n = m.n ?? 3;
              // A shallow top drawer and deeper ones below.
              const hs = n === 3 ? [0.4, 0.33, 0.27] : Array(n).fill(1 / n);
              const below = hs.slice(j + 1).reduce((a: number, b: number) => a + b, 0);
              const zb = m.z0 + (m.z1 - m.z0) * below;
              return <Drawer key={j} x0={m.from} x1={m.to} z0={zb} z1={zb + (m.z1 - m.z0) * hs[j]} depth={D} front={front} seed={i * 3 + j} />;
            })}
        </group>
      ))}
    </group>
  );
}

export function KitchenCabinets({ level }: { level: number }) {
  return (
    <group>
      {RUNS.map((r, i) => (
        <CabinetRun key={i} run={r} level={level} />
      ))}
    </group>
  );
}
