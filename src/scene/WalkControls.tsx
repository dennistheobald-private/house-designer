import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { collisionRects, contains, moveWithCollisions, stairGuide, stairHeight, stairLengths, stairProgress } from '../house/geometry';
import { furnitureByFloor } from '../furniture/proposals';
import { BLOCKING, footprints } from '../furniture/types';
import type { House } from '../house/types';

export const EYE_HEIGHT = 1.65;
const WALK_SPEED = 1.4;
const RUN_SPEED = 3.0;
/** Turning with A and D, and looking up and down with W and S, in radians per second. */
const TURN_SPEED = 1.7;
const TILT_SPEED = 1.1;
const MAX_TILT = 1.2;

export interface WalkTarget {
  floor: number;
  x: number;
  y: number;
  facing: number;
  /** Changes on every request, so the same room can be jumped to twice. */
  nonce: number;
}

export interface WalkPosition {
  floor: number;
  x: number;
  y: number;
}

/** Camera yaw that looks along plan direction `facing` (radians, 0 = towards the street). */
export const yawFor = (facing: number) => Math.atan2(-Math.cos(facing), -Math.sin(facing));

export function WalkControls({
  house,
  target,
  onMove,
  furnished = false,
  frozen = false,
}: {
  house: House;
  target: WalkTarget;
  onMove: (p: WalkPosition) => void;
  /** Furniture blocks the way too. */
  furnished?: boolean;
  /** Hold still (while a photo renders). */
  frozen?: boolean;
}) {
  const { camera, invalidate } = useThree();
  const keys = useRef(new Set<string>());
  const state = useRef({ x: target.x, y: target.y, floor: target.floor, flight: null as number | null, eye: 0 });
  const view = useRef({ yaw: 0, pitch: 0 });
  const lastReport = useRef(0);

  const rects = useMemo(() => {
    const last = house.floors.length - 1;
    const furniture = (floorId: string) =>
      furnished ? (furnitureByFloor[floorId] ?? []).filter((it) => BLOCKING.has(it.kind) && !it.z).flatMap(footprints) : [];
    return {
      onFloor: house.floors.map((f, i) => [...collisionRects(f, house.stair, { top: i === last, bottom: i === 0 }), ...furniture(f.id)]),
      onFlight: house.floors.map((f) => collisionRects(f, house.stair)),
    };
  }, [house, furnished]);

  useEffect(() => {
    const s = state.current;
    s.x = target.x;
    s.y = target.y;
    s.floor = target.floor;
    s.flight = null;
    s.eye = house.floors[target.floor].level + EYE_HEIGHT;
    camera.position.set(s.x, s.eye, s.y);
    view.current = { yaw: yawFor(target.facing), pitch: 0 };
    camera.rotation.set(0, view.current.yaw, 0, 'YXZ');
    invalidate();
  }, [target, camera, house, invalidate]);

  useEffect(() => {
    // The keyboard drives the view, so the mouse stays free for the buttons and menus.
    const typing = (e: KeyboardEvent) => e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement;
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      keys.current.add(e.code);
      invalidate();
      // Arrows would otherwise scroll the page or move focus.
      if (e.code.startsWith('Arrow')) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const clear = () => keys.current.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
    };
  }, [invalidate]);

  const forward = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const k = keys.current;
    // Arrow keys walk and step sideways; W A S D look around.
    const fwd = (k.has('ArrowUp') ? 1 : 0) - (k.has('ArrowDown') ? 1 : 0);
    const side = (k.has('ArrowRight') ? 1 : 0) - (k.has('ArrowLeft') ? 1 : 0);
    const turn = (k.has('KeyA') ? 1 : 0) - (k.has('KeyD') ? 1 : 0);
    const tilt = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0);
    if ((turn || tilt) && !frozen) {
      const v = view.current;
      v.yaw += turn * TURN_SPEED * dt;
      v.pitch = THREE.MathUtils.clamp(v.pitch + tilt * TILT_SPEED * dt, -MAX_TILT, MAX_TILT);
      camera.rotation.set(v.pitch, v.yaw, 0, 'YXZ');
    }

    if ((fwd || side) && !frozen) {
      camera.getWorldDirection(forward);
      const len = Math.hypot(forward.x, forward.z) || 1;
      const fx = forward.x / len;
      const fz = forward.z / len;
      const speed = (k.has('ShiftLeft') || k.has('ShiftRight') ? RUN_SPEED : WALK_SPEED) * dt;
      const norm = Math.hypot(fwd, side);
      let dx = ((fwd * fx - side * fz) / norm) * speed;
      let dy = ((fwd * fz + side * fx) / norm) * speed;
      if (s.flight !== null && fwd) {
        // On a flight, walking forward or back follows the stair up or down and round its turn, drifting
        // towards the middle of the treads, and the view turns with it.
        const g = stairGuide(s.x, s.y);
        const along = Math.sign(fx * g.tx + fz * g.ty || 1) * fwd;
        const pull = Math.min(1, dt * 3);
        dx = along * g.tx * speed + (g.cx - s.x) * pull * (g.ty !== 0 && g.tx === 0 ? 1 : 0.5);
        dy = along * g.ty * speed + (g.cy - s.y) * pull * (g.tx !== 0 && g.ty === 0 ? 1 : 0.5);
        if (!turn && !frozen) {
          const want = Math.atan2(-along * g.tx * fwd, -along * g.ty * fwd);
          const v = view.current;
          const diff = Math.atan2(Math.sin(want - v.yaw), Math.cos(want - v.yaw));
          v.yaw += diff * Math.min(1, dt * 4);
          camera.rotation.set(v.pitch, v.yaw, 0, 'YXZ');
        }
      }
      const walls = s.flight !== null ? rects.onFlight[s.flight] : rects.onFloor[s.floor];
      const next = moveWithCollisions(s.x, s.y, dx, dy, walls);
      s.x = next.x;
      s.y = next.y;
    }

    // Stairs: work out which flight you are on from where you stepped into the stairwell.
    const { shaft } = house.stair;
    const half = stairLengths(house.stair).total / 2;
    let ground = house.floors[s.floor].level;
    if (contains(shaft, s.x, s.y)) {
      if (s.flight === null) {
        const goingUp = stairProgress(house.stair, s.x, s.y) < half;
        s.flight = goingUp ? s.floor : s.floor - 1;
      }
      if (s.flight >= 0 && s.flight < house.floors.length - 1) ground = stairHeight(house, s.flight, s.x, s.y);
    } else if (s.flight !== null) {
      s.floor = stairProgress(house.stair, s.x, s.y) > half ? s.flight + 1 : s.flight;
      s.flight = null;
      ground = house.floors[s.floor].level;
    }

    const eyeTarget = ground + EYE_HEIGHT;
    s.eye += (eyeTarget - s.eye) * Math.min(1, dt * 12);
    camera.position.set(s.x, s.eye, s.y);

    // On-demand rendering: keep drawing while a key is held or the eye is still settling.
    if (k.size > 0 || Math.abs(eyeTarget - s.eye) > 0.001) invalidate();

    lastReport.current += dt;
    if (lastReport.current > 0.2) {
      lastReport.current = 0;
      onMove({ floor: s.flight !== null ? (ground - house.floors[s.flight].level > house.storeyHeight / 2 ? s.flight + 1 : s.flight) : s.floor, x: s.x, y: s.y });
    }
  });

  return null;
}
