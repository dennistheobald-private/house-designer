import { useMemo } from 'react';
import { furnitureByFloor } from '../furniture/proposals';
import { fixturesByFloor, showersByFloor } from '../house/fixtures';
import { runsAlongX, stairTreads, STAIR_TURN_X, wallBlocks } from '../house/geometry';
import type { Floor, House, Opening, Wall } from '../house/types';
import { Furnishings, type PickHandler } from './furniture/Furnishings';
import { BlockMesh, FloorPlane, PlanSlab, rectOutline } from './meshes';
import { Shower } from './Shower';

const SLAB = 0.33;
const TREAD = 0.06;

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

function FloorStructure({ house, floor, index }: { house: House; floor: Floor; index: number }) {
  const blocks = useMemo(
    () => floor.walls.flatMap((w) => wallBlocks(w, floor.openings, floor.clearHeight).map((b) => ({ b, mat: w.hedge ? ('hedge' as const) : w.exterior ? ('facade' as const) : ('wall' as const) }))),
    [floor],
  );
  const { shaft, core } = house.stair;
  const isTop = index === house.floors.length - 1;
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
        .filter((o) => o.kind !== 'door')
        .map((o, i) => (
          <Window key={i} wall={floor.walls.find((w) => w.id === o.wall)!} opening={o} level={floor.level} />
        ))}
      <BlockMesh block={{ ...core, z0: 0, z1: isTop ? 1.0 : floor.clearHeight }} level={floor.level} mat="wall" />
      {isTop && (
        <>
          <BlockMesh block={{ x0: STAIR_TURN_X, y0: shaft.y1 - 0.01, x1: shaft.x1, y1: shaft.y1 + 0.01, z0: 0.1, z1: 1.0 }} level={floor.level} mat="glass" shadows={false} />
          <BlockMesh block={{ x0: STAIR_TURN_X, y0: shaft.y1 - 0.02, x1: shaft.x1, y1: shaft.y1 + 0.02, z0: 1.0, z1: 1.04 }} level={floor.level} mat="steel" />
        </>
      )}
      {fixturesByFloor[floor.id]?.map((fx, i) => (
        <BlockMesh key={`fx-${i}`} block={fx} level={floor.level} mat={fx.material} shadows={fx.material !== 'glass' && fx.material !== 'light'} />
      ))}
      {showersByFloor[floor.id]?.map((s, i) => (
        <Shower key={`shower-${i}`} shower={s} level={floor.level} />
      ))}
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
        <PlanSlab key={i} outline={t.outline} top={base + rise * (t.step + 1)} thickness={TREAD + rise * 0.6} mat="stair" />
      ))}
    </group>
  );
}

/** Flat roof over the top floor. */
function Roof({ house }: { house: House }) {
  const top = house.floors[house.floors.length - 1];
  const outline = useMemo(() => rectOutline({ x0: 4.07, y0: -0.25, x1: 9.04, y1: 5.95 }), []);
  return <PlanSlab outline={outline} top={top.level + top.clearHeight + SLAB} thickness={SLAB} mat="facade" />;
}

/**
 * The neighbouring row houses J and L as plain volumes, their gardens, and the ground around
 * the plots, for daylight and views. The ground leaves out the plot and the house, so it never
 * covers the stairwell or the basement.
 */
function Neighbours({ house }: { house: House }) {
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
  /** Called when a piece of furniture is clicked. */
  onPick?: PickHandler;
}) {
  const highest = Math.max(...visibleFloors);
  return (
    <group>
      {visibleFloors.map((i) => (
        <FloorStructure key={house.floors[i].id} house={house} floor={house.floors[i]} index={i} />
      ))}
      {furnished &&
        visibleFloors.map((i) => (
          <Furnishings key={`furniture-${i}`} items={furnitureByFloor[house.floors[i].id] ?? []} level={house.floors[i].level} lit={litFloors.includes(i)} onPick={onPick} />
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
