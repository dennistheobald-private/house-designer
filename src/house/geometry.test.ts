import { describe, expect, it } from 'vitest';
import { houseK } from './houseK';
import {
  collisionRects,
  moveWithCollisions,
  roomArea,
  stairHeight,
  stairLengths,
  stairProgress,
  stairTreads,
  wallBlocks,
} from './geometry';

describe('House K tracing', () => {
  const rooms = houseK.floors.flatMap((f) => [...f.rooms, ...f.outdoor]).filter((r) => r.planArea);

  it.each(rooms.map((r) => [r.name, r] as const))('%s matches the area on the plans', (_name, room) => {
    // House K's kitchen is larger than the sales plan, because the kitchen plan moved its walls.
    const tolerance = room.id === 'kitchen' ? 0.25 : 0.1;
    expect(roomArea(room.rects)).toBeGreaterThan(room.planArea! * (1 - tolerance));
    expect(roomArea(room.rects)).toBeLessThan(room.planArea! * (1 + tolerance));
  });

  it('every opening sits inside its wall', () => {
    for (const floor of houseK.floors) {
      for (const o of floor.openings) {
        const wall = floor.walls.find((w) => w.id === o.wall);
        expect(wall, `${floor.id}: ${o.wall}`).toBeDefined();
        const { x0, y0, x1, y1 } = wall!.rect;
        const [start, end] = x1 - x0 >= y1 - y0 ? [x0, x1] : [y0, y1];
        expect(o.from).toBeGreaterThanOrEqual(start - 1e-9);
        expect(o.to).toBeLessThanOrEqual(end + 1e-9);
      }
    }
  });
});

describe('wallBlocks', () => {
  it('leaves a sill and lintel around a window and nothing in a doorway', () => {
    const wall = { id: 'w', rect: { x0: 0, y0: 0, x1: 4, y1: 0.2 } };
    const blocks = wallBlocks(
      wall,
      [
        { wall: 'w', kind: 'window', from: 1, to: 2, sill: 0.9, head: 2.2 },
        { wall: 'w', kind: 'door', from: 3, to: 3.9, sill: 0, head: 2.1 },
      ],
      2.5,
    );
    const at = (x: number, z: number) => blocks.some((b) => x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1);
    expect(at(0.5, 1.5)).toBe(true);
    expect(at(1.5, 0.5)).toBe(true);
    expect(at(1.5, 1.5)).toBe(false);
    expect(at(1.5, 2.4)).toBe(true);
    expect(at(3.5, 1.0)).toBe(false);
    expect(at(3.5, 2.3)).toBe(true);
  });
});

describe('stair', () => {
  const { stair } = houseK;
  const { total } = stairLengths(stair);

  it('runs from the first step to the arrival without jumping', () => {
    expect(stairProgress(stair, 6.16, 1.77)).toBeCloseTo(0);
    expect(stairProgress(stair, 4.93, 1.77)).toBeCloseTo(total);
    let last = 0;
    const path: [number, number][] = [];
    for (let y = 1.77; y >= 1.0; y -= 0.05) path.push([6.16, y]);
    for (let a = 0; a <= Math.PI; a += 0.05) path.push([5.55 + 0.6 * Math.cos(a), 1.0 - 0.6 * Math.sin(a)]);
    for (let y = 1.0; y <= 1.77; y += 0.05) path.push([4.93, y]);
    for (const [x, y] of path) {
      const s = stairProgress(stair, x, y);
      expect(s).toBeGreaterThanOrEqual(last - 1e-9);
      expect(s - last).toBeLessThan(0.2);
      last = s;
    }
  });

  it('climbs exactly one storey per flight', () => {
    expect(stairHeight(houseK, 1, 6.16, 1.77)).toBeCloseTo(0);
    expect(stairHeight(houseK, 1, 4.93, 1.77)).toBeCloseTo(houseK.storeyHeight);
  });

  it('draws one or more tread pieces for every step', () => {
    const steps = new Set(stairTreads(stair).map((t) => t.step));
    expect(steps.size).toBe(stair.steps);
  });
});

describe('moveWithCollisions', () => {
  const main = houseK.floors[1];
  const rects = collisionRects(main, houseK.stair);

  it('stops at a window but walks through the front door', () => {
    const upstairs = collisionRects(houseK.floors[2], houseK.stair);
    expect(moveWithCollisions(0.5, 1.5, -0.4, 0, upstairs).x).toBeCloseTo(0.5);
    let p = { x: 9.6, y: 2.44 };
    for (let i = 0; i < 20; i++) p = moveWithCollisions(p.x, p.y, 0.1, 0, rects);
    expect(p.x).toBeGreaterThan(10.5);
  });

  it('slides along a wall instead of sticking', () => {
    const p = moveWithCollisions(1, 0.3, 0.1, -0.2, rects);
    expect(p.x).toBeCloseTo(1.1);
  });
});
