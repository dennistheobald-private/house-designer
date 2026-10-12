import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { runsAlongX } from '../house/geometry';
import type { Opening, Wall } from '../house/types';
import { lacquer, merged, mat4, roundedBox } from './furniture/look';

/** Middle of the house on plan, to tell which face of an outside wall is the outside. */
const CENTRE = { x: 5.08, y: 2.85 };
const SLAT = 0.04;
const COLOUR = '#55575a';

/**
 * An outside window or glass door with an anthracite roller shutter, as on the renderings of
 * the Kapuzinerberg houses: a box above the head and aluminium slats that roll down over the
 * glass. Double-click the window, or the shutter, to let it down; double-click again to raise it.
 */
export function Shuttered({ wall, opening, level, children }: { wall: Wall; opening: Opening; level: number; children: ReactNode }) {
  const [down, setDown] = useState(false);
  const t = useRef(0);
  const curtain = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);
  const alongX = runsAlongX(wall);
  const { x0, y0, x1, y1 } = wall.rect;
  // The outer face of the wall and which way is out.
  const out = alongX ? Math.sign((y0 + y1) / 2 - CENTRE.y) : Math.sign((x0 + x1) / 2 - CENTRE.x);
  const face = alongX ? (out > 0 ? y1 : y0) : out > 0 ? x1 : x0;
  const width = opening.to - opening.from + 0.06;
  const height = opening.head - opening.sill;
  const mid = (opening.from + opening.to) / 2;
  const slats = useMemo(
    () =>
      merged(`shutter${width.toFixed(3)},${height.toFixed(3)}`, () =>
        Array.from({ length: Math.ceil(height / SLAT) }, (_, i) => ({ g: roundedBox(width, SLAT - 0.004, 0.012, 0.003), m: mat4([0, -SLAT / 2 - i * SLAT, 0]) })),
      ),
    [width, height],
  );
  useFrame((_, dt) => {
    const target = down ? 1 : 0;
    if (t.current === target) return;
    const step = Math.min(dt, 0.2) / 2.2;
    t.current = target > t.current ? Math.min(target, t.current + step) : Math.max(target, t.current - step);
    if (curtain.current) {
      curtain.current.scale.y = Math.max(0.001, t.current);
      curtain.current.visible = t.current > 0.002;
    }
    invalidate();
  });
  const toggle = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setDown((d) => !d);
    invalidate();
  };
  // In the shutter's own frame: x along the wall, y up, z out of the wall.
  const position: [number, number, number] = alongX ? [mid, level + opening.head, face] : [face, level + opening.head, mid];
  const rotation: [number, number, number] = [0, alongX ? (out > 0 ? 0 : Math.PI) : out > 0 ? Math.PI / 2 : -Math.PI / 2, 0];
  const m = lacquer(COLOUR, 0.5);
  return (
    <group onDoubleClick={toggle}>
      {children}
      <group position={position} rotation={rotation}>
        {/* the shutter box and its guide rails */}
        <mesh geometry={roundedBox(width + 0.04, 0.2, 0.16, 0.01)} material={m} position={[0, 0.1, 0.08]} castShadow receiveShadow />
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={roundedBox(0.03, height, 0.04, 0.004)} material={m} position={[s * (width / 2 + 0.005), -height / 2, 0.03]} castShadow />
        ))}
        <group ref={curtain} position={[0, 0, 0.03]} scale={[1, 0.001, 1]} visible={false}>
          <mesh geometry={slats} material={m} castShadow receiveShadow />
        </group>
      </group>
    </group>
  );
}
