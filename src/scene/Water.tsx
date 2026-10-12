import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { cylinder } from './furniture/look';
import { rng } from './textures';

/*
 * Running water: a tap's stream and a rain shower's drops, switched on and off by double-clicking
 * the shower or the tap and basin. Both animate only while running, so the demand-driven fast
 * mode keeps redrawing just then.
 */

const water = () =>
  waterMaterial ??
  (waterMaterial = new THREE.MeshPhysicalMaterial({ color: '#d9eef6', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.55, clearcoat: 1, depthWrite: false }));
let waterMaterial: THREE.MeshPhysicalMaterial | undefined;

/** Toggles on double-click; the handler stops the event so a double-click opens nothing behind it. */
export function useRunning(): [boolean, (e: ThreeEvent<MouseEvent>) => void] {
  const [on, setOn] = useState(false);
  const invalidate = useThree((s) => s.invalidate);
  return [
    on,
    (e) => {
      e.stopPropagation();
      setOn((o) => !o);
      invalidate();
    },
  ];
}

/** A tap's stream: a thin column of water from the spout (the origin) down `drop` metres, with a ripple where it lands. */
export function Stream({ drop, r = 0.006 }: { drop: number; r?: number }) {
  const g = useRef<THREE.Group>(null);
  const ripple = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // A slight flicker in the column's width and a pulsing ring where it lands.
    if (g.current) g.current.scale.set(1 + 0.12 * Math.sin(t * 37), 1, 1 + 0.12 * Math.cos(t * 41));
    if (ripple.current) {
      const k = (t * 2.5) % 1;
      ripple.current.scale.setScalar(0.5 + k * 1.5);
      (ripple.current.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - k);
    }
    invalidate();
  });
  const ring = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false }), []);
  return (
    <group>
      <group ref={g}>
        <mesh geometry={cylinder(r * 0.8, r, drop, 12)} material={water()} position={[0, -drop / 2, 0]} />
      </group>
      <mesh ref={ripple} geometry={ringGeometry} material={ring} position={[0, -drop + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} />
    </group>
  );
}
const ringGeometry = new THREE.RingGeometry(0.02, 0.03, 32);

/** A rain shower's drops, falling from a w x d head at the origin down `drop` metres. */
export function Rain({ w, d, drop, count = 260 }: { w: number; d: number; drop: number; count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const drops = useMemo(() => {
    const rand = rng(7);
    return Array.from({ length: count }, () => ({ x: (rand() - 0.5) * w, z: (rand() - 0.5) * d, phase: rand(), speed: 0.9 + rand() * 0.25 }));
  }, [w, d, count]);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.0018, 0.0018, 0.07, 4), []);
  const m = useMemo(() => new THREE.Matrix4(), []);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    drops.forEach((p, i) => {
      // Each drop falls the full height in about half a second, then starts again at the head.
      const k = (t * 2 * p.speed + p.phase) % 1;
      // Spread out a little as they fall.
      const spread = 1 + k * 0.25;
      m.makeTranslation(p.x * spread, -k * drop - 0.035, p.z * spread);
      mesh.current!.setMatrixAt(i, m);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    invalidate();
  });
  return <instancedMesh ref={mesh} args={[geo, water(), count]} frustumCulled={false} />;
}
