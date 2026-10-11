import type { FurnitureItem } from '../furniture/types';

const cm = (m: number) => `${Math.round(m * 100)} cm`;

/** A small card next to the pointer with a clicked piece's name and size. */
export function ItemInfo({ item, at, onClose }: { item: FurnitureItem; at: { x: number; y: number }; onClose: () => void }) {
  // Keep the card on screen near the right and bottom edges.
  const left = Math.min(at.x + 14, window.innerWidth - 260);
  const top = Math.min(at.y + 14, window.innerHeight - 140);
  return (
    <div className="item-info" style={{ left, top }} role="dialog" aria-label={item.name}>
      <button className="item-info-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <strong>{item.name}</strong>
      <dl>
        <dt>Width</dt>
        <dd>{cm(item.w)}</dd>
        <dt>Depth</dt>
        <dd>{cm(item.d)}</dd>
        <dt>Height</dt>
        <dd>{cm(item.h)}</dd>
        {!!item.z && (
          <>
            <dt>From the floor</dt>
            <dd>{cm(item.z)}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
