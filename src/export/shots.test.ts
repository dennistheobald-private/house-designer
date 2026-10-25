import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { houseK } from '../house/houseK';
import { contains } from '../house/geometry';
import { CAMERA_HEIGHT, poseAt, roomShots, roomViews, tourVideo, walkVideo, type WalkSample } from './shots';

const forward = (q: number[]) => new THREE.Vector3(0, 0, -1).applyQuaternion(new THREE.Quaternion().fromArray(q));

describe('render camera work', () => {
  it('looks along the plan direction it is given', () => {
    const towardsStreet = forward(poseAt(0, 1, 1, 0).quaternion);
    expect(towardsStreet.x).toBeCloseTo(1);
    expect(towardsStreet.z).toBeCloseTo(0);
    const south = forward(poseAt(0, 1, 1, Math.PI / 2).quaternion);
    expect(south.z).toBeCloseTo(1);
    expect(south.y).toBeCloseTo(0);
  });

  it('photographs every room Walk can go to, standing inside it at camera height', () => {
    const shots = roomShots(houseK, true);
    const views = roomViews(houseK, true);
    expect(shots.length).toBe(views.length);
    expect(shots.length).toBeGreaterThan(10);
    for (const v of views) {
      const floor = houseK.floors[v.floor];
      const room = [...floor.rooms, ...floor.outdoor].find((r) => r.id === v.id)!;
      expect(room.rects.some((r) => contains(r, v.x, v.y)), v.id).toBe(true);
    }
    const kitchen = shots.find((s) => s.id === 'kitchen');
    expect(kitchen?.position[1]).toBeCloseTo(houseK.floors[1].level + CAMERA_HEIGHT);
  });

  it('gives the tour the same number of frames in every room', () => {
    const video = tourVideo(houseK, true, { fps: 10, secondsPerRoom: 2 });
    expect(video.frames.length).toBe(roomViews(houseK, true).length * 20);
  });

  it('resamples a recorded walk to whole frames and holds still between samples', () => {
    const q = poseAt(0, 0, 0, 0).quaternion;
    const walk: WalkSample[] = [
      { t: 10, position: [0, 1.65, 0], quaternion: q },
      { t: 11, position: [1, 1.65, 0], quaternion: q },
      // Standing still for two seconds draws no frames in the app.
      { t: 13, position: [1, 1.65, 0], quaternion: q },
      { t: 13.5, position: [1, 1.65, 1], quaternion: q },
    ];
    const video = walkVideo(walk, { fps: 4 });
    expect(video.frames.length).toBe(15);
    expect(video.frames[2].position[0]).toBeCloseTo(0.5);
    expect(video.frames[8].position).toEqual([1, 1.65, 0]);
    expect(video.frames[14].position[2]).toBeCloseTo(1);
  });
});
