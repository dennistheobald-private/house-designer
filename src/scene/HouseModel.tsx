import { useMemo, useState } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import type { FurnitureItem } from '../furniture/types';
import { furnitureByFloor } from '../furniture/proposals';
import { fittingsByFloor, fixturesByFloor, showersByFloor } from '../house/fixtures';
import { Fittings } from './BathFittings';
import { type Block, runsAlongX, stairTreads, STAIR_TURN_X, wallBlocks } from '../house/geometry';
import type { Floor, House, Opening, Rect, Wall } from '../house/types';
import { material, type MaterialKey } from './materials';
import { Furnishings, type PickHandler } from './furniture/Furnishings';
import { BlockMesh, FloorPlane, PlanSlab, rectOutline } from './meshes';
import { Shower } from './Shower';
import { Shuttered } from './Shutters';
import { Stream } from './Water';
import { KitchenCabinets } from './KitchenCabinets';

const SLAB = 0.33;

/** A built-in piece as a card for the info tooltip: its name and outer sizes. */
const builtIn = (floor: Floor, name: string, b: Block): FurnitureItem => {
  const cx = (b.x0 + b.x1) / 2;
  const cy = (b.y0 + b.y1) / 2;
  const room = floor.rooms.find((r) => r.rects.some((q) => cx >= q.x0 && cx <= q.x1 && cy >= q.y0 && cy <= q.y1));
  return { id: `built-in:${name}:${b.x0},${b.y0},${b.z0}`, room: room?.id ?? '', name, kind: 'shelf', x: cx, y: cy, w: b.x1 - b.x0, d: b.y1 - b.y0, h: b.z1 - b.z0, z: b.z0 } as FurnitureItem;
};

/** Click handler showing a built-in piece's tooltip; ignores the end of a drag, like furniture does. */
const pickBuiltIn = (onPick: PickHandler | undefined, item: () => FurnitureItem) =>
  onPick &&
  ((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.delta > 5) return;
    onPick(item(), { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  });

/** Nominal sizes of the bathroom fittings, for their tooltips; basins and WCs take theirs from the plan. */
const FITTING: Record<string, { name: string; w: number; d: number; h: number }> = {
  tallMixer: { name: 'Tall basin mixer, rose gold', w: 0.05, d: 0.2, h: 0.3 },
  bathMixer: { name: 'Bath mixer, rose gold', w: 0.2, d: 0.15, h: 0.1 },
  toilet: { name: 'WC', w: 0.36, d: 0.53, h: 0.29 },
  basin: { name: 'Basin', w: 0.56, d: 0.38, h: 0.12 },
};

function Window({ wall, opening, level }: { wall: Wall; opening: Opening; level: number }) {
  const alongX = runsAlongX(wall);
  const { x0, y0, x1, y1 } = wall.rect;
  const mid = alongX ? (y0 + y1) / 2 : (x0 + x1) / 2;
  const block = (a: number, b: number, z0: number, z1: number, t: number) =>
    alongX ? { x0: a, x1: b, y0: mid - t, y1: mid + t, z0, z1 } : { x0: mid - t, x1: mid + t, y0: a, y1: b, z0, z1 };
  const f = 0.06;
  const { from, to, sill, head } = opening;
  return (
    <>
      <BlockMesh block={block(from + f, to - f, sill + f, head - f, 0.006)} level={level} mat="glass" shadows={false} />
      <BlockMesh block={block(from, to, sill, sill + f, 0.04)} level={level} mat="frame" />
      <BlockMesh block={block(from, to, head - f, head, 0.04)} level={level} mat="frame" />
      <BlockMesh block={block(from, from + f, sill, head, 0.04)} level={level} mat="frame" />
      <BlockMesh block={block(to - f, to, sill, head, 0.04)} level={level} mat="frame" />
      {to - from > 1.2 && <BlockMesh block={block((from + to) / 2 - f / 2, (from + to) / 2 + f / 2, sill, head, 0.04)} level={level} mat="frame" />}
    </>
  );
}

/**
 * An outer wall is facade render outside and painted plaster inside: only the face away from
 * the house and the ends at the building's corners are facade; the inner face and the window
 * and door reveals are plaster. Garden walls standing off the slab are facade all round.
 */
function exteriorFaces(wall: Wall, b: Block, slab: Rect): MaterialKey[] {
  const { x0, y0, x1, y1 } = wall.rect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  if (cx <= slab.x0 || cx >= slab.x1 || cy <= slab.y0 || cy >= slab.y1) return Array(6).fill('facade');
  const faces: MaterialKey[] = Array(6).fill('wall');
  const end = (face: number, atCorner: boolean) => atCorner && (faces[face] = 'facade');
  if (runsAlongX(wall)) {
    faces[cy < (slab.y0 + slab.y1) / 2 ? 5 : 4] = 'facade';
    end(0, b.x1 === x1);
    end(1, b.x0 === x0);
  } else {
    faces[cx < (slab.x0 + slab.x1) / 2 ? 1 : 0] = 'facade';
    end(4, b.y1 === y1);
    end(5, b.y0 === y0);
  }
  return faces;
}

function FloorStructure({ house, floor, index, onPick }: { house: House; floor: Floor; index: number; onPick?: PickHandler }) {
  const blocks = useMemo(
    () =>
      floor.walls.flatMap((w) =>
        wallBlocks(w, floor.openings, floor.clearHeight).map((b) => ({ b, mat: w.hedge ? ('hedge' as const) : w.exterior ? exteriorFaces(w, b, floor.slab) : ('wall' as const) })),
      ),
    [floor],
  );
  const { shaft, core } = house.stair;
  const isTop = index === house.floors.length - 1;
  // The kitchen tap: double-click the tap or the sink to run it.
  const [tapRunning, setTapRunning] = useState(false);
  const toggleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setTapRunning((r) => !r);
  };
  const hasStairBelow = index > 0;
  const slabOutline = useMemo(() => rectOutline(floor.slab), [floor.slab]);
  const slabHoles = useMemo(() => (hasStairBelow ? [rectOutline(shaft).reverse()] : []), [hasStairBelow, shaft]);

  return (
    <group>
      <PlanSlab outline={slabOutline} holes={slabHoles} top={floor.level} thickness={SLAB} mat="slab" />
      {[...floor.rooms, ...floor.outdoor].flatMap((room) =>
        room.rects.map((rect, i) => <FloorPlane key={`${room.id}-${i}`} rect={rect} height={floor.level + 0.004} mat={room.finish} />),
      )}
      {floor.ground?.map((g, i) => (
        <PlanSlab key={`ground-${i}`} outline={rectOutline(g)} top={floor.level} thickness={SLAB} mat="soil" />
      ))}
      {blocks.map(({ b, mat }, i) => (
        <BlockMesh key={i} block={b} level={floor.level} mat={mat} />
      ))}
      {floor.openings
        .filter((o) => o.kind !== 'door' && o.kind !== 'niche')
        .map((o, i) => {
          const wall = floor.walls.find((w) => w.id === o.wall)!;
          const window = <Window key={i} wall={wall} opening={o} level={floor.level} />;
          // Roller shutters on every outside window above ground.
          return wall.exterior && floor.level >= 0 ? (
            <Shuttered key={i} wall={wall} opening={o} level={floor.level}>
              {window}
            </Shuttered>
          ) : (
            window
          );
        })}
      <BlockMesh block={{ ...core, z0: 0, z1: isTop ? 1.0 : floor.clearHeight }} level={floor.level} mat="wall" />
      {isTop && (
        <>
          <BlockMesh block={{ x0: STAIR_TURN_X, y0: shaft.y1 - 0.01, x1: shaft.x1, y1: shaft.y1 + 0.01, z0: 0.1, z1: 1.0 }} level={floor.level} mat="glass" shadows={false} />
          <BlockMesh block={{ x0: STAIR_TURN_X, y0: shaft.y1 - 0.02, x1: shaft.x1, y1: shaft.y1 + 0.02, z0: 1.0, z1: 1.04 }} level={floor.level} mat="steel" />
        </>
      )}
      {fixturesByFloor[floor.id]?.filter((fx) => !fx.planOnly).map((fx, i) => (
        <group key={`fx-${i}`} onClick={pickBuiltIn(onPick, () => builtIn(floor, fx.name, fx))} onDoubleClick={TAP_PARTS.includes(fx.name) ? toggleTap : undefined}>
          <BlockMesh block={fx} level={floor.level} mat={fx.material} shadows={fx.material !== 'glass' && fx.material !== 'light'} />
        </group>
      ))}
      {tapRunning &&
        fixturesByFloor[floor.id]
          ?.filter((fx) => fx.name === 'Tap spout')
          .map((fx, i) => (
            // From the spout's open end, over the sink, down to the sink's floor.
            <group key={`tap-${i}`} position={[fx.x0 + 0.015, floor.level + fx.z0, (fx.y0 + fx.y1) / 2]}>
              <Stream drop={fx.z0 - 0.935} r={0.007} />
            </group>
          ))}
      {showersByFloor[floor.id]?.map((s, i) => (
        <group key={`shower-${i}`} onClick={pickBuiltIn(onPick, () => builtIn(floor, 'Rain shower system, rose gold, 30 cm head', { x0: s.x - 0.15, x1: s.x + 0.15, y0: s.y, y1: s.y + 0.42, z0: 0, z1: 2.25 }))}>
          <Shower shower={s} level={floor.level} />
        </group>
      ))}
      {floor.id === 'main' && <KitchenCabinets level={floor.level} />}
      <Fittings
        items={fittingsByFloor[floor.id] ?? []}
        level={floor.level}
        onClick={
          onPick &&
          ((f, e) =>
            pickBuiltIn(onPick, () => {
              const plan = fixturesByFloor[floor.id]?.find((fx) => fx.planOnly && f.x >= fx.x0 && f.x <= fx.x1 && f.y >= fx.y0 - 0.01 && f.y <= fx.y1 + 0.01 && fx.name.toLowerCase().includes(f.kind === 'toilet' ? 'wc' : 'basin'));
              if (plan && (f.kind === 'toilet' || f.kind === 'basin')) return builtIn(floor, plan.name === 'WC' ? 'WC, Laufen Pro' : 'Basin, Villeroy & Boch Loop & Friends', plan);
              const n = FITTING[f.kind];
              return builtIn(floor, n.name, { x0: f.x - n.w / 2, x1: f.x + n.w / 2, y0: f.y - n.d / 2, y1: f.y + n.d / 2, z0: f.z, z1: f.z + n.h });
            })?.(e))
        }
      />
    </group>
  );
}

function Flight({ house, flight }: { house: House; flight: number }) {
  const treads = useMemo(() => stairTreads(house.stair), [house.stair]);
  const base = house.floors[flight].level;
  const rise = house.storeyHeight / house.stair.steps;
  return (
    <group>
      {treads.map((t, i) => (
        // Closed steps in the oak of the main floor: each block reaches a little below the step under it, so nothing
        // shows through between them, yet leaves headroom where the winding flight passes over itself.
        <PlanSlab key={i} outline={t.outline} top={base + rise * (t.step + 1)} thickness={Math.min(rise * (t.step + 1), rise + 0.08) - 0.004} mat="parquet" />
      ))}
    </group>
  );
}

/** Flat roof over the top floor. */
const ROOF = { x0: 4.07, y0: -0.25, x1: 9.04, y1: 5.95 };
const PARAPET = 0.2;

/** The kitchen fixtures a double-click runs the tap from. */
const TAP_PARTS = ['Tap', 'Tap spout', 'Sink'];

/** A painted ceiling, facing down. */
function Ceiling({ rect, height }: { rect: Rect; height: number }) {
  const geo = useMemo(() => new THREE.PlaneGeometry(rect.x1 - rect.x0, rect.y1 - rect.y0).rotateX(Math.PI / 2), [rect]);
  return <mesh geometry={geo} material={material('slab')} position={[(rect.x0 + rect.x1) / 2, height, (rect.y0 + rect.y1) / 2]} receiveShadow />;
}

/** The flat roof: a green sedum roof inside a low parapet, with two long rows of solar panels running from party wall to party wall. */
export function Roof({ house }: { house: House }) {
  const top = house.floors[house.floors.length - 1];
  const z = top.level + top.clearHeight + SLAB;
  const outline = useMemo(() => rectOutline(ROOF), []);
  const { x0, y0, x1, y1 } = ROOF;
  const p = PARAPET;
  // Each row: panels 1.13 m deep tilted 12 degrees towards the garden on low aluminium frames, five panels along the row.
  const rows = [5.35, 7.75];
  const tilt = (12 * Math.PI) / 180;
  const panelD = 1.13;
  const panelW = 1.0;
  const along = Array.from({ length: 5 }, (_, i) => y0 + p + 0.35 + i * (panelW + 0.04) + panelW / 2);
  return (
    <group>
      <PlanSlab outline={outline} top={z} thickness={SLAB} mat="facade" />
      {/* The top floor's ceiling: painted plaster under the roof slab. */}
      <Ceiling rect={ROOF} height={z - SLAB - 0.002} />
      <BlockMesh block={{ x0: x0 + p, y0: y0 + p, x1: x1 - p, y1: y1 - p, z0: 0, z1: 0.08 }} level={z} mat="sedum" />
      {[
        { x0, x1, y0, y1: y0 + p },
        { x0, x1, y0: y1 - p, y1 },
        { x0, x1: x0 + p, y0: y0 + p, y1: y1 - p },
        { x0: x1 - p, x1, y0: y0 + p, y1: y1 - p },
      ].map((b, i) => (
        <BlockMesh key={i} block={{ ...b, z0: 0, z1: 0.3 }} level={z} mat="facade" />
      ))}
      {rows.flatMap((cx) =>
        along.map((cy) => (
          <group key={`${cx},${cy}`} position={[cx, z + 0.08, cy]}>
            {/* Front and back feet of the frame */}
            <BlockMesh block={{ x0: -panelD / 2 + 0.05, x1: -panelD / 2 + 0.09, y0: -panelW / 2 + 0.05, y1: panelW / 2 - 0.05, z0: 0, z1: 0.12 }} level={0} mat="steel" />
            <BlockMesh block={{ x0: panelD / 2 - 0.09, x1: panelD / 2 - 0.05, y0: -panelW / 2 + 0.05, y1: panelW / 2 - 0.05, z0: 0, z1: 0.12 + Math.sin(tilt) * panelD }} level={0} mat="steel" />
            <group position={[0, 0.14 + (Math.sin(tilt) * panelD) / 2, 0]} rotation={[0, 0, tilt]}>
              <BlockMesh block={{ x0: -panelD / 2, x1: panelD / 2, y0: -panelW / 2, y1: panelW / 2, z0: -0.02, z1: 0 }} level={0} mat="steel" />
              <BlockMesh block={{ x0: -panelD / 2 + 0.015, x1: panelD / 2 - 0.015, y0: -panelW / 2 + 0.015, y1: panelW / 2 - 0.015, z0: 0, z1: 0.004 }} level={0} mat="solar" shadows={false} />
            </group>
          </group>
        )),
      )}
    </group>
  );
}

/**
 * The neighbouring row houses J and L as plain volumes, their gardens, and the ground around
 * the plots, for daylight and views. The ground leaves out the plot and the house, so it never
 * covers the stairwell or the basement.
 */
export function Neighbours({ house }: { house: House }) {
  const { plot } = house;
  const width = plot.rect.y1 - plot.rect.y0;
  const blocks = [-1, 1].flatMap((side) => {
    const y0 = side < 0 ? -6.2 : 5.95;
    const y1 = side < 0 ? -0.25 : 11.9;
    return [
      { x0: -0.35, x1: 10.5, y0, y1, z0: 0, z1: 5.66 },
      { x0: 4.07, x1: 9.04, y0, y1, z0: 5.66, z1: 8.49 },
    ];
  });
  const gardens = [-1, 1].map((side) => ({ x0: plot.rect.x0, x1: -0.35, y0: plot.rect.y0 + side * width, y1: plot.rect.y1 + side * width }));
  const ground = useMemo(
    () => ({ outline: rectOutline({ x0: -40, y0: -40, x1: 50, y1: 46 }), holes: [rectOutline({ ...plot.rect, x0: plot.rect.x0 - 0.2 }).reverse()] }),
    [plot],
  );
  return (
    <>
      {blocks.map((b, i) => (
        <BlockMesh key={i} block={b} level={0} mat="neighbour" />
      ))}
      {gardens.map((g, i) => (
        <FloorPlane key={`garden-${i}`} rect={g} height={-0.01} mat="lawn" />
      ))}
      <PlanSlab outline={ground.outline} holes={ground.holes} top={-0.02} thickness={0.1} mat="ground" />
    </>
  );
}

export function HouseModel({
  house,
  visibleFloors,
  showRoof,
  showSurroundings,
  furnished = true,
  litFloors = [],
  litRoom = null,
  onPick,
}: {
  house: House;
  visibleFloors: number[];
  showRoof: boolean;
  showSurroundings: boolean;
  /** Show the furnished proposal. */
  furnished?: boolean;
  /** Floors whose lamps are switched on. */
  litFloors?: number[];
  /** When set, only the lamps of this room are lit ('' lights none); null lights all on the floor. */
  litRoom?: string | null;
  /** Called when a piece of furniture is clicked. */
  onPick?: PickHandler;
}) {
  const highest = Math.max(...visibleFloors);
  return (
    <group>
      {visibleFloors.map((i) => (
        <FloorStructure key={house.floors[i].id} house={house} floor={house.floors[i]} index={i} onPick={onPick} />
      ))}
      {furnished &&
        visibleFloors.map((i) => (
          <Furnishings key={`furniture-${i}`} items={furnitureByFloor[house.floors[i].id] ?? []} level={house.floors[i].level} lit={litFloors.includes(i)} litRoom={litRoom} onPick={onPick} />
        ))}
      {visibleFloors
        .filter((i) => i < house.floors.length - 1)
        .map((i) => (
          <Flight key={`flight-${i}`} house={house} flight={i} />
        ))}
      {showRoof && highest === house.floors.length - 1 && <Roof house={house} />}
      {showSurroundings && <Neighbours house={house} />}
    </group>
  );
}
