import { useMemo } from 'react';
import * as THREE from 'three';
import type { Block } from '../house/geometry';
import { material, TEXTURE_METRES, type MaterialKey } from './materials';

/*
 * Plan to world: world X = plan x, world Z = plan y, world Y = height.
 */

/** Scales box UVs so textures keep their real-world size on every face. */
function boxGeometry(w: number, h: number, d: number) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.getAttribute('uv') as THREE.BufferAttribute;
  // Face order: +x, -x, +y, -y, +z, -z; four vertices each.
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ];
  faces.forEach(([fu, fv], face) => {
    for (let v = 0; v < 4; v++) {
      const i = face * 4 + v;
      uv.setXY(i, (uv.getX(i) * fu) / TEXTURE_METRES, (uv.getY(i) * fv) / TEXTURE_METRES);
    }
  });
  return geo;
}

export function BlockMesh({ block, level, mat, shadows = true }: { block: Block; level: number; mat: MaterialKey; shadows?: boolean }) {
  const w = block.x1 - block.x0;
  const d = block.y1 - block.y0;
  const h = block.z1 - block.z0;
  const geo = useMemo(() => boxGeometry(w, h, d), [w, h, d]);
  return (
    <mesh
      geometry={geo}
      material={material(mat)}
      position={[(block.x0 + block.x1) / 2, level + (block.z0 + block.z1) / 2, (block.y0 + block.y1) / 2]}
      castShadow={shadows}
      receiveShadow
    />
  );
}

/** A flat floor finish, lying a few millimetres above `height`. */
export function FloorPlane({ rect, height, mat }: { rect: { x0: number; y0: number; x1: number; y1: number }; height: number; mat: MaterialKey }) {
  const w = rect.x1 - rect.x0;
  const d = rect.y1 - rect.y0;
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    const uv = g.getAttribute('uv') as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      // Anchor textures to plan coordinates, so planks line up across rooms.
      const u = rect.x0 / TEXTURE_METRES + (uv.getX(i) * w) / TEXTURE_METRES;
      const v = -rect.y1 / TEXTURE_METRES + (uv.getY(i) * d) / TEXTURE_METRES;
      uv.setXY(i, u, v);
    }
    return g;
  }, [w, d, rect.x0, rect.y1]);
  return <mesh geometry={geo} material={material(mat)} position={[(rect.x0 + rect.x1) / 2, height, (rect.y0 + rect.y1) / 2]} receiveShadow />;
}

/** Extrudes a plan polygon (with optional holes) downwards from `top` by `thickness`. */
export function PlanSlab({
  outline,
  holes = [],
  top,
  thickness,
  mat,
}: {
  outline: [number, number][];
  holes?: [number, number][][];
  top: number;
  thickness: number;
  mat: MaterialKey;
}) {
  const geo = useMemo(() => {
    const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
    for (const hole of holes) shape.holes.push(new THREE.Path(hole.map(([x, y]) => new THREE.Vector2(x, y))));
    const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
    // Shape lies in plan x/y; rotate so plan y becomes world z and the extrusion points down.
    g.rotateX(Math.PI / 2);
    return g;
  }, [outline, holes, thickness]);
  return <mesh geometry={geo} material={material(mat)} position={[0, top, 0]} castShadow receiveShadow />;
}

export const rectOutline = (r: { x0: number; y0: number; x1: number; y1: number }): [number, number][] => [
  [r.x0, r.y0],
  [r.x1, r.y0],
  [r.x1, r.y1],
  [r.x0, r.y1],
];
