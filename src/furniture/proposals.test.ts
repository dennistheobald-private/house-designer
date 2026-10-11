import { describe, expect, it } from 'vitest';
import { fixturesByFloor } from '../house/fixtures';
import { collisionRects, contains, moveWithCollisions } from '../house/geometry';
import { houseK } from '../house/houseK';
import type { Rect } from '../house/types';
import { furnitureByFloor, proposals } from './proposals';
import { BLOCKING, footprint, type FurnitureItem } from './types';

const overlap = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const shrink = (r: Rect, by: number): Rect => ({ x0: r.x0 + by, y0: r.y0 + by, x1: r.x1 - by, y1: r.y1 - by });

const floors = houseK.floors.map((floor) => ({ floor, items: furnitureByFloor[floor.id] ?? [] }));
const onFloor = (it: FurnitureItem) => !it.z && BLOCKING.has(it.kind);

describe('furnished proposals', () => {
  it('gives every room a proposal, except landings and the open garden', () => {
    const skip = new Set(['first-landing', 'top-landing', 'basement-corridor', 'garden', 'front-garden', 'front-path', 'garden-terrace', 'street-terrace']);
    const rooms = houseK.floors.flatMap((f) => [...f.rooms, ...f.outdoor]).filter((r) => !skip.has(r.id));
    for (const room of rooms) expect(proposals.map((p) => p.room), room.id).toContain(room.id);
  });

  it('puts every item in a room on its own floor, with unique ids', () => {
    const ids = new Set<string>();
    for (const { floor, items } of floors) {
      const rooms = new Set([...floor.rooms, ...floor.outdoor].map((r) => r.id));
      for (const it of items) {
        expect(rooms.has(it.room), `${it.id} on ${floor.id}`).toBe(true);
        expect(ids.has(it.id), it.id).toBe(false);
        ids.add(it.id);
      }
    }
  });

  it('keeps floor-standing furniture inside its room', () => {
    for (const { floor, items } of floors) {
      for (const it of items.filter(onFloor)) {
        const room = [...floor.rooms, ...floor.outdoor].find((r) => r.id === it.room)!;
        const fp = shrink(footprint(it), 0.01);
        for (let i = 0; i <= 4; i++) {
          for (let j = 0; j <= 4; j++) {
            const x = fp.x0 + ((fp.x1 - fp.x0) * i) / 4;
            const y = fp.y0 + ((fp.y1 - fp.y0) * j) / 4;
            expect(
              room.rects.some((r) => contains(r, x, y)),
              `${it.id} at ${x.toFixed(2)}, ${y.toFixed(2)}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('keeps furniture clear of walls, the stair, fixtures and other furniture', () => {
    for (const { floor, items } of floors) {
      const solid = items.filter(onFloor);
      const walls = collisionRects(floor, houseK.stair);
      const fixtures = (fixturesByFloor[floor.id] ?? []).filter((f) => f.z0 < 0.5 && f.z1 - f.z0 > 0.05);
      for (const [i, a] of solid.entries()) {
        const fa = shrink(footprint(a), 0.005);
        for (const w of walls) expect(overlap(fa, w), `${a.id} into a wall`).toBe(0);
        for (const f of fixtures) expect(overlap(fa, f), `${a.id} into ${f.name}`).toBe(0);
        for (const b of solid.slice(i + 1)) expect(overlap(fa, footprint(b)), `${a.id} and ${b.id}`).toBe(0);
      }
    }
  });

  it('leaves every arrival point free, so a jump never lands inside furniture', () => {
    for (const [index, { floor, items }] of floors.entries()) {
      const rects = [...collisionRects(floor, houseK.stair, { top: index === floors.length - 1, bottom: index === 0 }), ...items.filter(onFloor).map(footprint)];
      const points = [
        // Rooms with a view of their own use the plain spawn only when the house is empty.
        ...[...floor.rooms, ...floor.outdoor].flatMap((r) => (r.spawn && !proposals.find((p) => p.room === r.id)?.view ? [{ id: r.id, ...r.spawn }] : [])),
        ...proposals.flatMap((p) => (p.view && [...floor.rooms, ...floor.outdoor].some((r) => r.id === p.room) ? [{ id: `${p.room} view`, ...p.view }] : [])),
      ];
      for (const p of points) {
        // A free point can take a small step in some direction.
        const moved = [
          [0.05, 0],
          [-0.05, 0],
          [0, 0.05],
          [0, -0.05],
        ].some(([dx, dy]) => {
          const n = moveWithCollisions(p.x, p.y, dx, dy, rects);
          return n.x !== p.x || n.y !== p.y;
        });
        const inside = rects.some((r) => p.x + 0.22 > r.x0 && p.x - 0.22 < r.x1 && p.y + 0.22 > r.y0 && p.y - 0.22 < r.y1);
        expect(inside && !moved, p.id).toBe(false);
        expect(inside, p.id).toBe(false);
      }
    }
  });

  it('hangs pendants and wall pieces below the ceiling', () => {
    for (const { floor, items } of floors) {
      // Outdoors there is no ceiling; a garden tree may stand taller than a room.
      const indoors = new Set(floor.rooms.map((r) => r.id));
      for (const it of items.filter((i) => indoors.has(i.room))) expect((it.z ?? 0) + it.h, it.id).toBeLessThanOrEqual(floor.clearHeight + 0.001);
    }
  });
});
