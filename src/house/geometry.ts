import type { Floor, House, Opening, Rect, Stair, Wall } from './types';

/** An axis-aligned block, in plan coordinates, with heights above the floor level. */
export interface Block extends Rect {
  z0: number;
  z1: number;
}

export const width = (r: Rect) => r.x1 - r.x0;
export const depth = (r: Rect) => r.y1 - r.y0;
export const area = (r: Rect) => width(r) * depth(r);
export const roomArea = (rects: Rect[]) => rects.reduce((sum, r) => sum + area(r), 0);
export const contains = (r: Rect, x: number, y: number) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1;

/** Walls run along their longer side. */
export const runsAlongX = (wall: Wall) => width(wall.rect) >= depth(wall.rect);

/**
 * Splits a wall into solid blocks: full-height pieces between openings, and the sill
 * and lintel above and below each opening.
 */
export function wallBlocks(wall: Wall, openings: Opening[], clearHeight: number): Block[] {
  const h = wall.height ?? clearHeight;
  const { x0, y0, x1, y1 } = wall.rect;
  const alongX = runsAlongX(wall);
  const start = alongX ? x0 : y0;
  const end = alongX ? x1 : y1;
  const piece = (a: number, b: number, z0: number, z1: number): Block =>
    alongX ? { x0: a, x1: b, y0, y1, z0, z1 } : { x0, x1, y0: a, y1: b, z0, z1 };

  const gaps = openings
    .filter((o) => o.wall === wall.id)
    .map((o) => ({ ...o, from: Math.max(o.from, start), to: Math.min(o.to, end) }))
    .filter((o) => o.to > o.from)
    .sort((a, b) => a.from - b.from);

  const blocks: Block[] = [];
  let cursor = start;
  for (const gap of gaps) {
    if (gap.from > cursor) blocks.push(piece(cursor, gap.from, 0, h));
    if (gap.sill > 0) blocks.push(piece(gap.from, gap.to, 0, gap.sill));
    if (gap.head < h) blocks.push(piece(gap.from, gap.to, gap.head, h));
    cursor = Math.max(cursor, gap.to);
  }
  if (cursor < end) blocks.push(piece(cursor, end, 0, h));
  return blocks;
}

/**
 * Blocks that stop a person walking: anything that reaches knee height. On the top floor the
 * start of the stair is a hole, and on the bottom floor the end of the stair is overhead, so
 * both are blocked; pass neither flag for the rects used while on a flight.
 */
export function collisionRects(floor: Floor, stair: Stair, ends: { top?: boolean; bottom?: boolean } = {}): Rect[] {
  const rects: Rect[] = floor.walls
    .flatMap((w) => wallBlocks(w, floor.openings, floor.clearHeight))
    .filter((b) => b.z0 < 0.5);
  rects.push(stair.core);
  const turn = { x0: stair.shaft.x0, y0: stair.shaft.y0, x1: stair.shaft.x1, y1: STAIR_TURN_Y };
  if (ends.top) rects.push(turn, { x0: STAIR_TURN_X, y0: stair.shaft.y0, x1: stair.shaft.x1, y1: stair.shaft.y1 });
  if (ends.bottom) rects.push(turn, { x0: stair.shaft.x0, y0: stair.shaft.y0, x1: STAIR_TURN_X, y1: stair.shaft.y1 });
  return rects;
}

/*
 * The winding stair: up the right leg (towards y = 0), around the core, down the left leg.
 * s is the distance walked along the stair's centre line, from 0 at the first step.
 */
export const STAIR_TURN_X = 5.55;
export const STAIR_TURN_Y = 1.0;
const RIGHT_LEG_X = (5.65 + 6.67) / 2;
const LEFT_LEG_X = (4.42 + 5.45) / 2;
const TURN_RADIUS = (RIGHT_LEG_X - LEFT_LEG_X) / 2;

export function stairLengths(stair: Stair) {
  const leg = stair.shaft.y1 - STAIR_TURN_Y;
  const turn = Math.PI * TURN_RADIUS;
  return { leg, turn, total: 2 * leg + turn };
}

export function stairProgress(stair: Stair, x: number, y: number): number {
  const { leg, turn } = stairLengths(stair);
  if (y >= STAIR_TURN_Y) {
    if (x >= STAIR_TURN_X) return Math.min(leg, Math.max(0, stair.shaft.y1 - y));
    return leg + turn + Math.min(leg, Math.max(0, y - STAIR_TURN_Y));
  }
  const angle = Math.atan2(STAIR_TURN_Y - y, x - STAIR_TURN_X); // 0 at the right leg, PI at the left
  return leg + (Math.min(Math.PI, Math.max(0, angle)) / Math.PI) * turn;
}

/**
 * Where the stair's centre line runs near a point: the closest point on it and the unit direction
 * in which the stair goes up there. Walking on a flight follows this line, so you go round the turn
 * instead of walking into the wall at its head.
 */
export function stairGuide(x: number, y: number): { cx: number; cy: number; tx: number; ty: number } {
  if (y >= STAIR_TURN_Y) return x >= STAIR_TURN_X ? { cx: RIGHT_LEG_X, cy: y, tx: 0, ty: -1 } : { cx: LEFT_LEG_X, cy: y, tx: 0, ty: 1 };
  const a = Math.min(Math.PI, Math.max(0, Math.atan2(STAIR_TURN_Y - y, x - STAIR_TURN_X)));
  return { cx: STAIR_TURN_X + TURN_RADIUS * Math.cos(a), cy: STAIR_TURN_Y - TURN_RADIUS * Math.sin(a), tx: -Math.sin(a), ty: -Math.cos(a) };
}

/** Height of the stair surface at a point, for the flight that starts on floor `flight`. */
export function stairHeight(house: House, flight: number, x: number, y: number): number {
  const s = stairProgress(house.stair, x, y);
  const { total } = stairLengths(house.stair);
  const steps = house.stair.steps;
  // Snap to the tread you are standing on, so the camera climbs in steps.
  const tread = Math.min(steps, Math.floor((s / total) * steps + 0.5));
  return house.floors[flight].level + (house.storeyHeight * tread) / steps;
}

export interface Tread {
  /** 0-based step number; step i's top sits at (i + 1) / steps of a storey. */
  step: number;
  outline: [number, number][];
}

/** The tread outlines, as plan polygons, for drawing the stair. */
export function stairTreads(stair: Stair): Tread[] {
  const { leg, turn, total } = stairLengths(stair);
  const { shaft } = stair;
  const n = stair.steps;
  const treads: Tread[] = [];

  const rayToShaft = (angle: number): [number, number] => {
    const dx = Math.cos(angle);
    const dy = -Math.sin(angle);
    const ts: number[] = [];
    if (dx > 1e-9) ts.push((shaft.x1 - STAIR_TURN_X) / dx);
    if (dx < -1e-9) ts.push((shaft.x0 - STAIR_TURN_X) / dx);
    if (dy < -1e-9) ts.push((shaft.y0 - STAIR_TURN_Y) / dy);
    const t = Math.min(...ts);
    return [STAIR_TURN_X + dx * t, STAIR_TURN_Y + dy * t];
  };
  const corners: [number, number, number][] = [
    [shaft.x1, shaft.y0, Math.atan2(STAIR_TURN_Y - shaft.y0, shaft.x1 - STAIR_TURN_X)],
    [shaft.x0, shaft.y0, Math.atan2(STAIR_TURN_Y - shaft.y0, shaft.x0 - STAIR_TURN_X)],
  ];

  for (let i = 0; i < n; i++) {
    const a = (i * total) / n;
    const b = ((i + 1) * total) / n;
    const pieces: [number, number][][] = [];
    // Right leg.
    const ra = Math.max(a, 0);
    const rb = Math.min(b, leg);
    if (rb > ra) {
      pieces.push([
        [5.65, shaft.y1 - rb],
        [shaft.x1, shaft.y1 - rb],
        [shaft.x1, shaft.y1 - ra],
        [5.65, shaft.y1 - ra],
      ]);
    }
    // Turn.
    const ta = Math.max(a, leg);
    const tb = Math.min(b, leg + turn);
    if (tb > ta) {
      const angA = ((ta - leg) / turn) * Math.PI;
      const angB = ((tb - leg) / turn) * Math.PI;
      const poly: [number, number][] = [[STAIR_TURN_X, STAIR_TURN_Y], rayToShaft(angA)];
      for (const [cx, cy, ang] of corners) if (ang > angA && ang < angB) poly.push([cx, cy]);
      poly.push(rayToShaft(angB));
      pieces.push(poly);
    }
    // Left leg.
    const la = Math.max(a, leg + turn);
    const lb = Math.min(b, total);
    if (lb > la) {
      const ya = STAIR_TURN_Y + (la - leg - turn);
      const yb = STAIR_TURN_Y + (lb - leg - turn);
      pieces.push([
        [shaft.x0, ya],
        [5.45, ya],
        [5.45, yb],
        [shaft.x0, yb],
      ]);
    }
    for (const outline of pieces) treads.push({ step: i, outline });
  }
  return treads;
}

/** Moves a circle through the plan, sliding along walls instead of stopping dead. */
export function moveWithCollisions(
  x: number,
  y: number,
  dx: number,
  dy: number,
  rects: Rect[],
  radius = 0.22,
): { x: number; y: number } {
  const hits = (px: number, py: number) =>
    rects.some((r) => px + radius > r.x0 && px - radius < r.x1 && py + radius > r.y0 && py - radius < r.y1);
  let nx = x;
  let ny = y;
  if (!hits(x + dx, y)) nx = x + dx;
  if (!hits(nx, y + dy)) ny = y + dy;
  return { x: nx, y: ny };
}
