import * as THREE from 'three';
import { proposalFor } from '../furniture/proposals';
import { contains } from '../house/geometry';
import type { House } from '../house/types';
import { yawFor } from '../scene/WalkControls';

/*
 * The camera work for a render in Blender: a photo of every room and the frames of a video,
 * either a tour that pans slowly round each room or a walk recorded in the app. Positions and
 * rotations are in the app's 3D space (y up, x and z the plan's x and y); the Blender script
 * turns them into its own z-up space.
 */

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface CameraPose {
  position: Vec3;
  quaternion: Quat;
  /** Outside the house: Blender exposes it for the bright daylight instead of a room. */
  outdoor?: boolean;
}

export interface Shot extends CameraPose {
  id: string;
  name: string;
  /** Vertical field of view in degrees. */
  fov: number;
  /** Parts of the model to leave out of this shot, such as the floors above in a dollhouse view. */
  hide?: string[];
}

export interface Video {
  name: string;
  fps: number;
  fov: number;
  /** One camera pose per frame. */
  frames: CameraPose[];
}

/** The parts the exported model is grouped into, so a shot can leave some out. */
export const floorGroup = (i: number) => `floor-${i}`;
export const ROOF_GROUP = 'roof';
export const SURROUNDINGS_GROUP = 'surroundings';

/** Cameras stand a little lower than the eye, as an interior photographer would. */
export const CAMERA_HEIGHT = 1.45;
/** A natural lens for rooms: about 24 mm on a full-frame camera in a 16:9 frame. */
export const ROOM_FOV = 58;

const round = (v: number) => Math.round(v * 1e5) / 1e5;
const tuple = <T extends number[]>(v: T) => v.map(round) as T;

/** A level camera at a plan point, looking along plan direction `facing` (0 = towards the street). */
export function poseAt(level: number, x: number, y: number, facing: number, height = CAMERA_HEIGHT, pitch = 0): CameraPose {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yawFor(facing), 0, 'YXZ'));
  return { position: tuple([x, level + height, y]), quaternion: tuple([q.x, q.y, q.z, q.w]) };
}

/** Whether a camera stands outside in daylight: on a terrace, in the garden, or beyond the plot. */
export function outdoorAt(house: House, [x, y, z]: Vec3) {
  // The floor whose level the camera stands on (it is between 1 and 2 m above it).
  const floor = [...house.floors].reverse().find((f) => y - f.level > 0.5) ?? house.floors[0];
  // Below ground the parking is under the shared garage's roof: lit like a room.
  if (floor.level < 0) return false;
  if (floor.outdoor.some((r) => r.rects.some((rect) => contains(rect, x, z)))) return true;
  return !floor.rooms.some((r) => r.rects.some((rect) => contains(rect, x, z))) && !contains(house.stair.shaft, x, z);
}

/** Marks the poses that stand outside, for their exposure. */
export function markOutdoor<T extends CameraPose>(house: House, poses: T[]): T[] {
  return poses.map((p) => (outdoorAt(house, p.position) ? { ...p, outdoor: true } : p));
}

/** The rooms Walk can go to, each with the viewpoint that shows it best. */
export function roomViews(house: House, furnished: boolean) {
  return house.floors.flatMap((f, floor) =>
    [...f.rooms, ...f.outdoor]
      .filter((r) => r.spawn)
      .map((r) => ({ id: r.id, name: r.name, floor, level: f.level, ...((furnished && proposalFor(r.id)?.view) || r.spawn!) })),
  );
}

/** A photo of every room from its viewpoint. */
export function roomShots(house: House, furnished: boolean): Shot[] {
  return markOutdoor(
    house,
    roomViews(house, furnished).map((v) => ({ id: v.id, name: v.name, fov: ROOM_FOV, ...poseAt(v.level, v.x, v.y, v.facing) })),
  );
}

const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * A room tour: in each room the camera pans slowly across the view and eases a few
 * centimetres forward, then cuts to the next room.
 */
export function tourVideo(house: House, furnished: boolean, { fps = 25, secondsPerRoom = 3.5, pan = 0.5, dolly = 0.15 } = {}): Video {
  const n = Math.round(fps * secondsPerRoom);
  const frames = roomViews(house, furnished).flatMap((v) =>
    Array.from({ length: n }, (_, i) => {
      const t = smooth(i / (n - 1));
      const facing = v.facing + pan * (0.5 - t);
      const step = dolly * t;
      // Plan direction `facing`: 0 looks towards the street (+x), positive turns towards +y.
      return poseAt(v.level, v.x + Math.cos(v.facing) * step, v.y + Math.sin(v.facing) * step, facing);
    }),
  );
  return { name: 'room-tour', fps, fov: ROOM_FOV, frames: markOutdoor(house, frames) };
}

/** A camera sample from a recorded walk, at `t` seconds. */
export interface WalkSample extends CameraPose {
  t: number;
}

/**
 * A recorded walk resampled to whole frames. The app only draws while something moves, so
 * samples can be far apart while standing still; the camera holds its pose between them.
 */
export function walkVideo(samples: WalkSample[], { fps = 25, fov = 70 } = {}): Video {
  if (samples.length === 0) return { name: 'my-walk', fps, fov, frames: [] };
  const t0 = samples[0].t;
  const end = samples[samples.length - 1].t - t0;
  const count = Math.max(1, Math.floor(end * fps) + 1);
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const frames: CameraPose[] = [];
  let j = 0;
  for (let f = 0; f < count; f++) {
    const t = t0 + f / fps;
    while (j < samples.length - 2 && samples[j + 1].t < t) j++;
    const a = samples[j];
    const b = samples[Math.min(j + 1, samples.length - 1)];
    const k = b.t > a.t ? THREE.MathUtils.clamp((t - a.t) / (b.t - a.t), 0, 1) : 0;
    qa.fromArray(a.quaternion).slerp(qb.fromArray(b.quaternion), k);
    frames.push({
      position: tuple(a.position.map((p, i) => p + (b.position[i] - p) * k) as Vec3),
      quaternion: tuple([qa.x, qa.y, qa.z, qa.w]),
    });
  }
  return { name: 'my-walk', fps, fov, frames };
}
