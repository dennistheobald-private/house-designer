import type { ThreeEvent } from '@react-three/fiber';
import { memo } from 'react';
import type { FurnitureItem } from '../../furniture/types';
import { Piece } from './pieces';

/** Places each item: plan (x, y) to world (x, z), turned about the vertical, lifted by `z`. */
export type PickHandler = (item: FurnitureItem, screen: { x: number; y: number }) => void;

function Placed({ it, level, lit, onPick }: { it: FurnitureItem; level: number; lit: boolean; onPick?: PickHandler }) {
  const click = (e: ThreeEvent<MouseEvent>) => {
    // Only the nearest piece, and not at the end of a drag to orbit the view.
    e.stopPropagation();
    if (e.delta > 5) return;
    onPick?.(it, { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY });
  };
  return (
    <group position={[it.x, level + (it.z ?? 0), it.y]} rotation={[0, ((it.rot ?? 0) * Math.PI) / 180, 0]} userData={{ furniture: it.id }} onClick={onPick && click}>
      <Piece it={it} lit={lit} />
    </group>
  );
}

/** All the furniture of one floor. `lit` turns the lamps on (evening). */
export const Furnishings = memo(function Furnishings({ items, level, lit, litRoom = null, onPick }: { items: FurnitureItem[]; level: number; lit: boolean; litRoom?: string | null; onPick?: PickHandler }) {
  return (
    <group>
      {items.map((it) => (
        <Placed key={it.id} it={it} level={level} lit={lit && (litRoom === null || it.room === litRoom)} onPick={onPick} />
      ))}
    </group>
  );
});
