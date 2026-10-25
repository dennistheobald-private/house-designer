import type * as THREE from 'three';
import type { WalkSample } from './shots';

/*
 * Records the walkthrough camera while you walk, so a Blender render can follow the same
 * route. Walk controls feed it every frame; the app's Record button starts and stops it.
 */

/** Recordings stop by themselves after this long, to keep the video's render time sensible. */
export const MAX_SECONDS = 180;

let samples: WalkSample[] = [];
let recording = false;
let started = 0;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function startRecording() {
  samples = [];
  recording = true;
  started = performance.now();
  notify();
}

export function stopRecording() {
  recording = false;
  notify();
}

export const isRecording = () => recording;

/** The last finished (or current) recording. */
export const recordedWalk = () => samples;

export const recordedSeconds = () => (samples.length > 1 ? samples[samples.length - 1].t - samples[0].t : 0);

export function onRecordingChange(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

/** Called by the walk controls on every frame drawn. */
export function recordCamera(camera: THREE.Camera) {
  if (!recording) return;
  const t = (performance.now() - started) / 1000;
  const p = camera.position;
  const q = camera.quaternion;
  samples.push({ t, position: [p.x, p.y, p.z], quaternion: [q.x, q.y, q.z, q.w] });
  if (t > MAX_SECONDS) stopRecording();
}
