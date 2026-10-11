import { OrbitControls, Sky } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type { House } from '../house/types';
import { HouseModel } from './HouseModel';
import { WalkControls, type WalkPosition, type WalkTarget } from './WalkControls';

/* The garden side (plan x < 0) faces south, so the sun comes from -x. */
const SUN: [number, number, number] = [-14, 16, 6];

/** A soft studio environment for reflections on metal, glass and the mirror, with no downloads. */
function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.35;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Lights() {
  return (
    <>
      <hemisphereLight args={['#eef3f8', '#e2d8c8', 1.6]} />
      <ambientLight intensity={0.6} color="#fff6ea" />
      <directionalLight
        position={[SUN[0] + 5, SUN[1], SUN[2] + 3]}
        target-position={[5, 0, 3]}
        intensity={2.6}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
    </>
  );
}

export function Scene({
  house,
  mode,
  floorIndex,
  walkTarget,
  onWalk,
}: {
  house: House;
  mode: 'dollhouse' | 'walk';
  floorIndex: number;
  walkTarget: WalkTarget;
  onWalk: (p: WalkPosition) => void;
}) {
  const walking = mode === 'walk';
  const visible = walking ? house.floors.map((_, i) => i) : house.floors.map((_, i) => i).filter((i) => i <= floorIndex);
  const focusLevel = house.floors[floorIndex].level;
  return (
    <Canvas
      shadows
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      camera={{ position: [-9, focusLevel + 13, 15], fov: walking ? 70 : 40, near: 0.05, far: 300 }}
    >
      <Sky sunPosition={SUN} turbidity={4} rayleigh={1.2} mieCoefficient={0.004} />
      <Lights />
      <Reflections />
      <HouseModel house={house} visibleFloors={visible} showRoof={walking} showSurroundings={walking} />
      {walking ? (
        <WalkControls house={house} target={walkTarget} onMove={onWalk} />
      ) : (
        <OrbitControls target={[5, focusLevel + 0.8, 2.85]} maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={45} makeDefault />
      )}
    </Canvas>
  );
}
