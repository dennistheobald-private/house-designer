import { memo } from 'react';
import type { FurnitureItem } from '../../furniture/types';
import { Piece } from './pieces';

/** Places each item: plan (x, y) to world (x, z), turned about the vertical, lifted by `z`. */
function Placed({ it, level, lit }: { it: FurnitureItem; level: number; lit: boolean }) {
  return (
    <group position={[it.x, level + (it.z ?? 0), it.y]} rotation={[0, ((it.rot ?? 0) * Math.PI) / 180, 0]} userData={{ furniture: it.id }}>
      <Piece it={it} lit={lit} />
    </group>
  );
}

/** All the furniture of one floor. `lit` turns the lamps on (evening). */
export const Furnishings = memo(function Furnishings({ items, level, lit }: { items: FurnitureItem[]; level: number; lit: boolean }) {
  return (
    <group>
      {items.map((it) => (
        <Placed key={it.id} it={it} level={level} lit={lit} />
      ))}
    </group>
  );
});
