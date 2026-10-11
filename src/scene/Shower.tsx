import { useMemo } from 'react';
import * as THREE from 'three';
import type { ShowerSystem } from '../house/fixtures';
import { cylinder, fabric, metal, roundedBox } from './furniture/look';
import { material } from './materials';

/*
 * A shower system after the photo Dennis chose (a square-profile showerpipe with a
 * thermostat tablet): drawn in its own frame with the wall at z = 0 and the shower in front,
 * along +z. Plan y maps to world z, so the frame needs no turn for a shower on a wall at the
 * north side of its room.
 */

const RAIL = 0.025;
const RAIL_Z = 0.045;

const blackFace = () => metal('#1d1d1d', 0.55);
const hoseMaterial = () => fabric('#c8b39b', 'knit');

function Part({ g, m, p }: { g: THREE.BufferGeometry; m: THREE.Material; p: [number, number, number] }) {
  return <mesh geometry={g} material={m} position={p} castShadow receiveShadow />;
}

export function Shower({ shower, level }: { shower: ShowerSystem; level: number }) {
  const gold = material('roseGold');
  const hose = useMemo(() => {
    // From the rail's foot, a loose loop down and up to the hand shower's grip.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.86, RAIL_Z),
      new THREE.Vector3(0.02, 0.55, RAIL_Z + 0.06),
      new THREE.Vector3(0.12, 0.42, RAIL_Z + 0.1),
      new THREE.Vector3(0.24, 0.7, RAIL_Z + 0.09),
      new THREE.Vector3(0.24, 1.2, RAIL_Z + 0.07),
      new THREE.Vector3(0.18, 1.52, RAIL_Z + 0.08),
    ]);
    return new THREE.TubeGeometry(curve, 64, 0.007, 8, false);
  }, []);
  const top = 2.2;
  const arm = 0.42;
  return (
    <group position={[shower.x, level, shower.y]}>
      {/* Wall rail and the arm to the rain head */}
      <Part g={roundedBox(RAIL, top - 0.86, RAIL, 0.003)} m={gold} p={[0, (top + 0.86) / 2, RAIL_Z]} />
      <Part g={roundedBox(RAIL, RAIL, arm, 0.003)} m={gold} p={[0, top, RAIL_Z + arm / 2]} />
      {/* Rectangular rain head: a thin rose gold frame around a black spray face */}
      <Part g={roundedBox(0.36, 0.018, 0.26, 0.004)} m={gold} p={[0, top - 0.012, RAIL_Z + arm - 0.04]} />
      <Part g={roundedBox(0.345, 0.003, 0.245, 0.002)} m={blackFace()} p={[0, top - 0.022, RAIL_Z + arm - 0.04]} />
      {/* Thermostat tablet with three push buttons on the left and the temperature knob */}
      <Part g={roundedBox(0.5, 0.16, 0.05, 0.004)} m={gold} p={[0, 1.05, 0.03]} />
      {[0, 1, 2].map((i) => (
        <Part key={i} g={roundedBox(0.075, 0.047, 0.01, 0.003)} m={gold} p={[-0.2, 1.1 - i * 0.052, 0.058]} />
      ))}
      <mesh geometry={cylinder(0.024, 0.024, 0.04, 32)} material={gold} position={[0.17, 1.05, 0.07]} rotation={[Math.PI / 2, 0, 0]} castShadow />
      {/* Hand shower on its holder */}
      <Part g={roundedBox(0.045, 0.04, 0.05, 0.006)} m={gold} p={[0, 1.5, RAIL_Z + 0.03]} />
      <group position={[0.02, 1.62, RAIL_Z + 0.07]} rotation={[0.25, 0, -0.12]}>
        <mesh geometry={cylinder(0.014, 0.012, 0.2, 20)} material={gold} position={[0, -0.04, 0]} castShadow />
        <mesh geometry={cylinder(0.065, 0.065, 0.025, 40)} material={gold} position={[0, 0.11, 0.012]} rotation={[Math.PI / 2 - 0.3, 0, 0]} castShadow />
        <mesh geometry={cylinder(0.058, 0.058, 0.004, 40)} material={blackFace()} position={[0, 0.112, 0.026]} rotation={[Math.PI / 2 - 0.3, 0, 0]} />
      </group>
      <mesh geometry={hose} material={hoseMaterial()} castShadow />
    </group>
  );
}
