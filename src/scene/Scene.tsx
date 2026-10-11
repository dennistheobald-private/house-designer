import { Environment, Lightformer, OrbitControls, Sky } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DenoiseMaterial, WebGLPathTracer } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import type { House } from '../house/types';
import { lampMaterials } from './furniture/look';
import type { PickHandler } from './furniture/Furnishings';
import { HouseModel } from './HouseModel';
import { WalkControls, type WalkPosition, type WalkTarget } from './WalkControls';

export type TimeOfDay = 'day' | 'evening';

/* The garden side (plan x < 0) faces south, so the sun comes from -x. */
const SUN_DAY: [number, number, number] = [-14, 16, 6];
/* Blue hour: the sun just below the western horizon. */
const SUN_EVENING: [number, number, number] = [-6, -0.4, 14];

const NO_TRACE = { noTrace: true };

/**
 * Daylight from a physical sky: the same sky lights the scene through an environment map
 * (soft skylight in every room, true reflections in glass and metal) and the sun casts the
 * hard shadows.
 */
function Lighting({ time }: { time: TimeOfDay }) {
  const day = time === 'day';
  const sun = day ? SUN_DAY : SUN_EVENING;
  const { scene } = useThree();
  useEffect(() => {
    scene.environmentIntensity = day ? 0.55 : 0.1;
    scene.backgroundIntensity = 1;
  }, [scene, day]);
  return (
    <>
      <group userData={NO_TRACE}>
        <Sky sunPosition={sun} turbidity={day ? 3 : 8} rayleigh={day ? 1 : 3} mieCoefficient={0.004} mieDirectionalG={0.85} />
      </group>
      {/*
        Image-based light, white-balanced for interiors: a soft, near-neutral sky dome, the
        sun's glow, and the warm bounce from the ground and the neighbours' facades. The
        visible blue sky above is for the view out of the windows only.
      */}
      <Environment resolution={256} frames={1} key={time}>
        <color attach="background" args={[day ? '#d8d6d0' : '#1b1f2a']} />
        <Lightformer form="ring" intensity={day ? 4 : 0.6} color={day ? '#fff2df' : '#9aa8c8'} scale={8} position={[sun[0], Math.max(sun[1], 3), sun[2]]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={day ? 1.4 : 0.2} color={day ? '#f4f6f8' : '#5c6a8a'} scale={[40, 40, 1]} position={[0, 20, 0]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={day ? 0.6 : 0.05} color={day ? '#c9bba5' : '#2a2622'} scale={[60, 60, 1]} position={[0, -6, 0]} target={[0, 0, 0]} />
      </Environment>
      <group userData={NO_TRACE}>
        <hemisphereLight args={[day ? '#f1f4f8' : '#55607a', day ? '#d8cbb6' : '#2a2622', day ? 0.35 : 0.08]} />
      </group>
      <directionalLight
        position={[sun[0] + 5, Math.max(sun[1], 2), sun[2] + 3]}
        target-position={[5, 0, 3]}
        intensity={day ? 3.2 : 0.25}
        color={day ? '#fff1dc' : '#8ea0c8'}
        castShadow={day}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-bias={-0.0003}
        shadow-normalBias={0.025}
        shadow-radius={3}
      />
    </>
  );
}

/** Lamp shades glow in the evening and are plain fabric by day. */
function LampShades({ on }: { on: boolean }) {
  useEffect(() => {
    for (const m of lampMaterials()) m.emissiveIntensity = on ? (m.userData.bulb ? 6 : 0.55) : 0;
  });
  return null;
}

/** Exposure: interiors need more than the bright garden; evenings more still. */
function Exposure({ value }: { value: number }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.toneMappingExposure = value;
  }, [gl, value]);
  return null;
}

/**
 * Photo mode: a progressive path tracer renders the current view with real global
 * illumination, soft shadows and reflections. It refines with every frame; moving the camera
 * starts it over.
 */
function PhotoRender({ onProgress }: { onProgress: (samples: number) => void }) {
  const { gl, scene, camera, size } = useThree();
  const tracer = useRef<WebGLPathTracer | null>(null);
  const last = useRef(new THREE.Matrix4());
  const reported = useRef(-1);

  useEffect(() => {
    const hidden: THREE.Object3D[] = [];
    scene.traverse((o) => {
      if (o.userData.noTrace) o.traverse((c) => c.visible && (hidden.push(c), (c.visible = false)));
    });
    const background = scene.background;
    scene.background = scene.environment;
    const pt = new WebGLPathTracer(gl);
    pt.bounces = 6;
    pt.transmissiveBounces = 4;
    pt.filterGlossyFactor = 0.5;
    pt.minSamples = 1;
    pt.renderDelay = 0;
    pt.fadeDuration = 300;
    pt.tiles.set(2, 2);
    pt.renderScale = Math.min(1, 1600 / Math.max(size.width, 1));
    // An edge-aware denoise over the result: strong for the first, grainy passes, then
    // easing off as the image converges so fine detail comes back.
    const denoise = new FullScreenQuad(new DenoiseMaterial({ premultipliedAlpha: gl.getContextAttributes()?.premultipliedAlpha }));
    const dm = denoise.material as DenoiseMaterial & { map: THREE.Texture; sigma: number; threshold: number; kSigma: number; opacity: number };
    pt.renderToCanvasCallback = (target, renderer, quad) => {
      dm.map = target.texture;
      dm.sigma = Math.max(1.2, 4.5 - pt.samples / 60);
      dm.threshold = Math.max(0.02, 0.09 - pt.samples / 2000);
      dm.kSigma = 1.5;
      dm.opacity = (quad.material as THREE.ShaderMaterial & { opacity: number }).opacity;
      dm.blending = (quad.material as THREE.Material).blending;
      const autoClear = renderer.autoClear;
      renderer.autoClear = false;
      denoise.render(renderer);
      renderer.autoClear = autoClear;
    };
    // Building the scene's BVH takes a moment; let the "preparing" note paint first.
    const start = window.setTimeout(() => {
      pt.setScene(scene, camera);
      tracer.current = pt;
      last.current.copy(camera.matrixWorld);
    }, 50);
    return () => {
      window.clearTimeout(start);
      tracer.current = null;
      pt.dispose();
      denoise.dispose();
      denoise.material.dispose();
      hidden.forEach((o) => (o.visible = true));
      scene.background = background;
    };
  }, [gl, scene, camera, size.width]);

  useFrame(() => {
    const pt = tracer.current;
    if (!pt) {
      gl.render(scene, camera);
      return;
    }
    if (!last.current.equals(camera.matrixWorld)) {
      last.current.copy(camera.matrixWorld);
      pt.updateCamera();
    }
    pt.renderSample();
    const n = Math.floor(pt.samples);
    if (n !== reported.current) {
      reported.current = n;
      onProgress(n);
    }
  }, 1);
  return null;
}

function PostEffects({ evening }: { evening: boolean }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <N8AO aoRadius={0.6} distanceFalloff={0.6} intensity={2.2} quality="medium" color="#1a1510" />
      <Bloom luminanceThreshold={evening ? 0.75 : 0.95} luminanceSmoothing={0.2} intensity={evening ? 0.6 : 0.25} mipmapBlur />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <Vignette offset={0.35} darkness={0.35} />
      <SMAA />
    </EffectComposer>
  );
}

export function Scene({
  house,
  mode,
  floorIndex,
  walkTarget,
  onWalk,
  walkFloor,
  time,
  furnished,
  photo,
  onPhotoProgress,
  onPick,
  onPickNothing,
}: {
  house: House;
  mode: 'dollhouse' | 'walk';
  floorIndex: number;
  walkTarget: WalkTarget;
  onWalk: (p: WalkPosition) => void;
  /** The floor you are standing on in the walkthrough. */
  walkFloor: number;
  time: TimeOfDay;
  furnished: boolean;
  photo: boolean;
  onPhotoProgress: (samples: number) => void;
  onPick?: PickHandler;
  /** A click that hit no furniture. */
  onPickNothing?: () => void;
}) {
  const walking = mode === 'walk';
  const evening = time === 'evening';
  const visible = walking ? house.floors.map((_, i) => i) : house.floors.map((_, i) => i).filter((i) => i <= floorIndex);
  const focusLevel = house.floors[floorIndex].level;
  // Only the floor you are looking at has its lamps on: fewer lights keeps it fast.
  const lit = evening ? [walking ? walkFloor : floorIndex] : [];
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: false, toneMapping: THREE.NeutralToneMapping, powerPreference: 'high-performance' }}
      camera={{ position: [-9, focusLevel + 13, 15], fov: walking ? 70 : 40, near: 0.05, far: 300 }}
      onPointerMissed={onPickNothing}
    >
      <Lighting time={time} />
      <LampShades on={evening} />
      {/* The path tracer lights rooms only through their windows, as a camera sees them, so it needs the exposure a photographer would use indoors. */}
      <Exposure value={photo ? (evening ? 1.8 : 2.6) : walking ? (evening ? 1.3 : 1.0) : evening ? 1.2 : 0.85} />
      <HouseModel house={house} visibleFloors={visible} showRoof={walking} showSurroundings={walking} furnished={furnished} litFloors={lit} onPick={onPick} />
      {walking ? (
        <WalkControls house={house} target={walkTarget} onMove={onWalk} furnished={furnished} frozen={photo} />
      ) : (
        <OrbitControls target={[5, focusLevel + 0.8, 2.85]} maxPolarAngle={Math.PI / 2.05} minDistance={4} maxDistance={45} makeDefault />
      )}
      {photo ? <PhotoRender onProgress={onPhotoProgress} /> : <PostEffects evening={evening} />}
    </Canvas>
  );
}
