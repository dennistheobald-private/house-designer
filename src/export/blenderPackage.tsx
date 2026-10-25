import { createRoot, extend, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { strToU8, zipSync, type Zippable } from 'three/examples/jsm/libs/fflate.module.js';
import type { House } from '../house/types';
import { lampMaterials } from '../scene/furniture/look';
import { HouseModel, Neighbours, Roof } from '../scene/HouseModel';
import { SUN_DAY, SUN_EVENING, type TimeOfDay } from '../scene/Scene';
import { liveCamera } from './liveView';
import { floorGroup, roomShots, ROOF_GROUP, SURROUNDINGS_GROUP, tourVideo, walkVideo, type Shot, type Video, type WalkSample } from './shots';
import renderScript from '../../blender/render_house.py?raw';
import readme from '../../blender/README.txt?raw';
import windowsRunner from '../../blender/render-windows.bat?raw';
import macRunner from '../../blender/render-mac.command?raw';
import linuxRunner from '../../blender/render-linux.sh?raw';

/*
 * One click packs the house for a photo-realistic render in Blender (free, from blender.org):
 * the furnished model as glTF, the camera work, and a script that sets up the light, renders
 * a photo of every room and a video, and needs no editing. A browser cannot start Blender
 * itself, so the package carries a double-click starter for Windows, macOS and Linux.
 */

export type RenderQuality = 'preview' | 'final';

export interface ExportOptions {
  time: TimeOfDay;
  furnished: boolean;
  quality: RenderQuality;
  /** A photo of every room. */
  stills: boolean;
  /** Add the view on screen as a photo; `hide` names the parts it does not show. */
  currentView?: { hide: string[] } | null;
  video: 'tour' | 'walk' | 'none';
  walk?: WalkSample[];
}

/** Everything the Blender script needs besides the model. */
export interface RenderJob {
  format: 1;
  house: string;
  created: string;
  time: TimeOfDay;
  quality: RenderQuality;
  /** Where the sun stands, as a direction in the app's y-up space. */
  sun: [number, number, number];
  stills: Shot[];
  video: Video | null;
}

/** The furnished house grouped by floor, roof and surroundings, with every lamp lit in the evening. */
function ExportModel({ house, furnished, evening }: { house: House; furnished: boolean; evening: boolean }) {
  return (
    <>
      {house.floors.map((f, i) => (
        <group key={f.id} name={floorGroup(i)}>
          <HouseModel house={house} visibleFloors={[i]} showRoof={false} showSurroundings={false} furnished={furnished} litFloors={evening ? [i] : []} litRoom={null} />
        </group>
      ))}
      <group name={ROOF_GROUP}>
        <Roof house={house} />
      </group>
      <group name={SURROUNDINGS_GROUP}>
        <Neighbours house={house} />
      </group>
    </>
  );
}

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

/** Builds the model in an off-screen scene, apart from the view on screen, and exports it as binary glTF. */
export async function exportModel(house: House, { furnished, evening }: { furnished: boolean; evening: boolean }): Promise<ArrayBuffer> {
  // <Canvas> registers three's classes for JSX; a bare root does not, so register them here.
  extend(THREE as unknown as Parameters<typeof extend>[0]);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 4;
  const root = createRoot(canvas);
  await root.configure({ frameloop: 'never', size: { width: 4, height: 4, top: 0, left: 0 }, events: undefined });
  let found: (scene: THREE.Scene) => void = () => {};
  const ready = new Promise<THREE.Scene>((resolve) => (found = resolve));
  function Ready() {
    const scene = useThree((s) => s.scene);
    useEffect(() => found(scene), [scene]);
    return null;
  }
  root.render(
    <>
      <ExportModel house={house} furnished={furnished} evening={evening} />
      <Ready />
    </>,
  );
  const scene = await ready;
  await nextFrame();
  scene.updateMatrixWorld(true);

  // The lamp shades are shared with the view on screen: light them for the export, then put them back.
  const shades = lampMaterials().map((m) => [m, m.emissiveIntensity] as const);
  for (const [m] of shades) m.emissiveIntensity = evening ? (m.userData.bulb ? 6 : 0.55) : 0;
  try {
    return (await new GLTFExporter().parseAsync(scene, { binary: true, onlyVisible: true, maxTextureSize: 2048 })) as ArrayBuffer;
  } finally {
    for (const [m, v] of shades) m.emissiveIntensity = v;
    root.unmount();
  }
}

/** The view on screen as a photo. */
function currentShot(hide: string[]): Shot | null {
  const camera = liveCamera();
  if (!camera) return null;
  const p = camera.position;
  const q = camera.quaternion;
  return { id: 'current-view', name: 'Current view', fov: camera.fov, position: [p.x, p.y, p.z], quaternion: [q.x, q.y, q.z, q.w], hide };
}

export function renderJob(house: House, o: ExportOptions): RenderJob {
  const current = o.currentView ? currentShot(o.currentView.hide) : null;
  const video = o.video === 'tour' ? tourVideo(house, o.furnished) : o.video === 'walk' && o.walk?.length ? walkVideo(o.walk) : null;
  return {
    format: 1,
    house: house.name,
    created: new Date().toISOString(),
    time: o.time,
    quality: o.quality,
    sun: o.time === 'day' ? SUN_DAY : SUN_EVENING,
    stills: [...(current ? [current] : []), ...(o.stills ? roomShots(house, o.furnished) : [])],
    video,
  };
}

const stamp = (d: Date) => {
  const two = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${two(d.getMonth() + 1)}${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}`;
};

/** Files that must stay executable once unzipped on a Mac or Linux. */
const EXECUTABLE = { os: 3, attrs: 0o100755 << 16 };

/** The render package as a zip: model, camera work, the Blender script and the starters. */
export function packageZip(glb: ArrayBuffer, job: RenderJob, folder: string): Uint8Array {
  const files: Zippable = {
    [folder]: {
      'README.txt': strToU8(readme.replace(/\r?\n/g, '\r\n')),
      'Render on Windows.bat': strToU8(windowsRunner.replace(/\r?\n/g, '\r\n')),
      'Render on Mac.command': [strToU8(macRunner), EXECUTABLE],
      'render-linux.sh': [strToU8(linuxRunner), EXECUTABLE],
      'render_house.py': strToU8(renderScript),
      scene: {
        'house.glb': [new Uint8Array(glb), { level: 0 }],
        'job.json': strToU8(JSON.stringify(job)),
      },
    },
  };
  return zipSync(files, { level: 6 });
}

/** Builds the render package and hands it to the browser as a download. */
export async function downloadRenderPackage(house: House, o: ExportOptions) {
  const glb = await exportModel(house, { furnished: o.furnished, evening: o.time === 'evening' });
  const job = renderJob(house, o);
  const folder = `house-k-render-${stamp(new Date())}`;
  const zip = packageZip(glb, job, folder);
  const url = URL.createObjectURL(new Blob([zip as BlobPart], { type: 'application/zip' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folder}.zip`;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return { bytes: zip.byteLength, stills: job.stills.length, frames: job.video?.frames.length ?? 0 };
}
