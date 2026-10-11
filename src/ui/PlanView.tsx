import { useMemo } from 'react';
import { furnitureByFloor } from '../furniture/proposals';
import type { FurnitureItem } from '../furniture/types';
import { fixturesByFloor } from '../house/fixtures';
import { roomArea, stairTreads, wallBlocks } from '../house/geometry';
import type { FloorFinish, House, Rect } from '../house/types';

const FINISH_FILL: Record<FloorFinish, string> = {
  parquet: '#e8d6bb',
  tile: '#e4e2dd',
  stoneTile: '#ddd6ca',
  screed: '#d7d5d0',
  carpet: '#e1dacd',
  stair: '#cdc3b7',
  terrace: '#e9e9e5',
  pebble: '#bdbab4',
  lawn: '#cfe0c0',
};

const SCALE = 60; // pixels per metre

/** Wall pieces and things on tables stay off the plan. */
const onPlan = (it: FurnitureItem) =>
  (it.z ?? 0) < 0.5 && !['print', 'mural', 'paint', 'slats', 'mirror', 'hooks', 'tv', 'pendant', 'blind', 'curtain'].includes(it.kind);

function FurnitureShape({ it }: { it: FurnitureItem }) {
  const rug = it.kind === 'rug';
  const props = {
    fill: rug ? (it.colour ?? '#ddd') : '#fffdf9',
    fillOpacity: rug ? 0.45 : 0.85,
    stroke: rug ? 'none' : '#7b7068',
    strokeWidth: 0.012,
  };
  const round = it.variant === 'round' || ['coffeeTable', 'sideTable', 'pouf', 'stool', 'plant', 'floorLamp'].includes(it.kind);
  return (
    <g transform={`translate(${it.x} ${it.y}) rotate(${-(it.rot ?? 0)})`}>
      <title>{it.name}</title>
      {round ? (
        <ellipse rx={it.w / 2} ry={it.d / 2} {...props} />
      ) : (
        <rect x={-it.w / 2} y={-it.d / 2} width={it.w} height={it.d} rx={['sofa', 'bed', 'loungeChair'].includes(it.kind) ? 0.06 : 0.01} {...props} />
      )}
    </g>
  );
}

export function PlanView({
  house,
  floorIndex,
  marker,
  furnished = false,
}: {
  house: House;
  floorIndex: number;
  marker?: { x: number; y: number };
  furnished?: boolean;
}) {
  const floor = house.floors[floorIndex];
  const walls = useMemo(
    () => floor.walls.flatMap((w) => wallBlocks(w, floor.openings, floor.clearHeight).map((b) => ({ b, h: w.height ?? floor.clearHeight, hedge: !!w.hedge }))),
    [floor],
  );
  const treads = useMemo(() => stairTreads(house.stair), [house.stair]);
  const bounds = useMemo(() => {
    const all: Rect[] = [floor.slab, ...floor.outdoor.flatMap((r) => r.rects)];
    return {
      x0: Math.min(...all.map((r) => r.x0)) - 0.6,
      y0: Math.min(...all.map((r) => r.y0)) - 0.6,
      x1: Math.max(...all.map((r) => r.x1)) + 0.6,
      y1: Math.max(...all.map((r) => r.y1)) + 0.6,
    };
  }, [floor]);
  const rect = (r: Rect, props: React.SVGProps<SVGRectElement>, key?: string | number) => (
    <rect key={key} x={r.x0} y={r.y0} width={r.x1 - r.x0} height={r.y1 - r.y0} {...props} />
  );

  return (
    <svg
      className="plan"
      viewBox={`${bounds.x0} ${bounds.y0} ${bounds.x1 - bounds.x0} ${bounds.y1 - bounds.y0}`}
      width={(bounds.x1 - bounds.x0) * SCALE}
      height={(bounds.y1 - bounds.y0) * SCALE}
      role="img"
      aria-label={`${floor.name} plan`}
    >
      {[...floor.outdoor, ...floor.rooms].flatMap((room) => room.rects.map((r, i) => rect(r, { fill: FINISH_FILL[room.finish] }, `${room.id}-${i}`)))}
      {rect(house.stair.shaft, { fill: FINISH_FILL.stair })}
      {treads.map((t, i) => (
        <polygon key={i} points={t.outline.map((p) => p.join(',')).join(' ')} fill="none" stroke="#8b8177" strokeWidth={0.015} />
      ))}
      {fixturesByFloor[floor.id]
        ?.filter((f) => f.material !== 'light' && f.z1 - f.z0 > 0.03)
        .map((f, i) => rect(f, { fill: f.material === 'glass' ? '#9cc3d6' : 'rgba(120,110,100,0.18)', stroke: '#7b7068', strokeWidth: 0.012 }, `fx-${i}`))}
      {walls.map(({ b, h, hedge }, i) => {
        if (hedge) return rect(b, { fill: '#6f9460' }, i);
        if (h < 1) return rect(b, { fill: '#8a857e' }, i); // garden wall
        const fullHeight = b.z0 === 0 && b.z1 >= Math.min(h, 2.0);
        if (fullHeight) return rect(b, { fill: '#2f2c29' }, i);
        if (b.z0 === 0) return rect(b, { fill: '#9cc3d6', stroke: '#5a8aa3', strokeWidth: 0.01 }, i); // window sill
        return null;
      })}
      {floor.openings
        .filter((o) => o.kind !== 'door' && o.sill === 0)
        .map((o, i) => {
          const wall = floor.walls.find((w) => w.id === o.wall)!;
          const alongX = wall.rect.x1 - wall.rect.x0 >= wall.rect.y1 - wall.rect.y0;
          const r = alongX ? { ...wall.rect, x0: o.from, x1: o.to } : { ...wall.rect, y0: o.from, y1: o.to };
          return rect(r, { fill: '#9cc3d6', stroke: '#5a8aa3', strokeWidth: 0.01 }, `g-${i}`);
        })}
      {furnished && (
        <g className="plan-furniture">
          {(furnitureByFloor[floor.id] ?? [])
            .filter(onPlan)
            .sort((a, b) => Number(b.kind === 'rug') - Number(a.kind === 'rug'))
            .map((it) => (
              <FurnitureShape key={it.id} it={it} />
            ))}
        </g>
      )}
      {[...floor.rooms, ...floor.outdoor].map((room) => {
        const main = room.rects.reduce((a, b) => ((b.x1 - b.x0) * (b.y1 - b.y0) > (a.x1 - a.x0) * (a.y1 - a.y0) ? b : a));
        const cx = (main.x0 + main.x1) / 2;
        const cy = (main.y0 + main.y1) / 2;
        return (
          <g key={room.id} className="plan-label">
            <text x={cx} y={cy - 0.05} textAnchor="middle" fontSize={0.2} fontWeight={600} fill="#2f2c29">
              {room.name}
            </text>
            <text x={cx} y={cy + 0.22} textAnchor="middle" fontSize={0.17} fill="#5c5650">
              {roomArea(room.rects).toFixed(1)} m²
            </text>
          </g>
        );
      })}
      {marker && <circle cx={marker.x} cy={marker.y} r={0.18} fill="#d4572a" stroke="#fff" strokeWidth={0.05} />}
    </svg>
  );
}
