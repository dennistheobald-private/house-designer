import type { Block } from './geometry';

/** Built-in pieces that are part of the house, not furniture: kitchen units and bathrooms. */
export type FixtureMaterial =
  | 'taupe'
  | 'plinth'
  | 'cream'
  | 'black'
  | 'shadow'
  | 'steel'
  | 'copper'
  | 'white'
  | 'oak'
  | 'glass'
  | 'mirror'
  | 'light'
  | 'wall'
  | 'slate'
  | 'pebble'
  | 'forest'
  | 'beige'
  | 'walnut'
  | 'roseGold';

export interface Fixture extends Block {
  name: string;
  material: FixtureMaterial;
  /** Shown on the plan only; the 3D model draws it as a fitting (see `fittingsByFloor`). */
  planOnly?: boolean;
}

const f = (name: string, material: FixtureMaterial, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, planOnly = false): Fixture => ({
  name, material, x0, y0, x1, y1, z0, z1, ...(planOnly ? { planOnly } : {}),
});

/**
 * Kitchen as drawn by Inform Möbelsysteme for House K (model 1000 Topas+, 4 March 2026):
 * a 1.87 m tall unit wall with two ovens in the niche, a 3.58 m run along the south
 * party wall with the cooktop, and the sink run under the street window. Worktop at 93 cm,
 * wall cabinets from 1.55 m to 2.19 m.
 */
const kitchen: Fixture[] = [
  f('Tall units', 'taupe', 6.57, 2.91, 8.535, 3.51, 0.1, 2.5),
  f('Tall units plinth', 'plinth', 6.6, 2.91, 8.5, 3.46, 0, 0.1),
  f('Oven', 'black', 6.605, 3.505, 7.2, 3.52, 0.87, 1.47),
  f('Oven', 'black', 7.21, 3.505, 7.805, 3.52, 0.87, 1.47),
  f('Base run', 'taupe', 6.57, 5.08, 10.15, 5.7, 0.1, 0.91),
  f('Base run plinth', 'plinth', 6.57, 5.13, 10.15, 5.7, 0, 0.1),
  f('Sink run', 'taupe', 9.55, 3.27, 10.15, 5.08, 0.1, 0.91),
  f('Sink run plinth', 'plinth', 9.6, 3.27, 10.15, 5.08, 0, 0.1),
  f('Grip rail', 'shadow', 6.57, 5.07, 9.55, 5.08, 0.86, 0.88),
  f('Grip rail', 'shadow', 9.54, 3.27, 9.55, 5.07, 0.86, 0.88),
  f('Worktop', 'cream', 6.57, 5.07, 10.15, 5.7, 0.91, 0.93),
  f('Worktop', 'cream', 9.54, 3.27, 10.15, 5.07, 0.91, 0.93),
  f('Backsplash', 'cream', 6.57, 5.685, 10.15, 5.7, 0.93, 1.55),
  f('Backsplash', 'cream', 10.135, 3.27, 10.15, 5.685, 0.93, 1.25),
  f('Sink', 'steel', 9.68, 3.99, 10.03, 4.57, 0.905, 0.932),
  f('Tap', 'copper', 10.04, 4.265, 10.07, 4.295, 0.93, 1.25),
  f('Tap spout', 'copper', 9.9, 4.265, 10.07, 4.295, 1.22, 1.25),
  f('Cooktop', 'black', 8.25, 5.15, 9.05, 5.65, 0.93, 0.936),
  f('Wall cabinets', 'taupe', 6.6, 5.35, 10.1, 5.7, 1.55, 2.185),
  f('Extractor', 'black', 8.2, 5.36, 9.1, 5.62, 1.53, 1.55),
];

/**
 * First-floor bathroom from Dennis's sketch and his elevations of 12 October 2026: his
 * beige stone-look tile, a walk-in shower with a 120 x 30 cm niche, 10 cm deep at 1.2 m,
 * lit by a warm LED strip; a 2.4 m high tiled pre-wall with a built-in mirror cabinet
 * over a walnut vanity, and the WC pre-wall tiled to 1.2 m.
 */
const NICHE = { y0: 0.01, y1: 1.21, z0: 1.2, z1: 1.5 };
const bathroom: Fixture[] = [
  f('Shower floor', 'beige', 6.8, 0, 8.02, 1.22, 0.004, 0.008),
  f('Shower wall tiles', 'beige', 6.8, 0, 8.02, 0.01, 0, 2.5),
  // The wall by the door, tiled full height up to the door, around the niche.
  f('Wall tiles', 'beige', 6.8, 0.01, 6.81, 1.82, 0, NICHE.z0),
  f('Wall tiles', 'beige', 6.8, 0.01, 6.81, 1.82, NICHE.z1, 2.5),
  f('Wall tiles', 'beige', 6.8, NICHE.y1, 6.81, 1.82, NICHE.z0, NICHE.z1),
  // The niche: tiled back, sill, top and sides, and an LED strip along its top front edge.
  f('Niche back', 'wall', 6.67, NICHE.y0, 6.69, NICHE.y1, NICHE.z0, NICHE.z1),
  f('Niche back tiles', 'beige', 6.69, NICHE.y0, 6.7, NICHE.y1, NICHE.z0, NICHE.z1),
  f('Niche sill', 'beige', 6.7, NICHE.y0, 6.81, NICHE.y1, NICHE.z0, NICHE.z0 + 0.01),
  f('Niche top', 'beige', 6.7, NICHE.y0, 6.81, NICHE.y1, NICHE.z1 - 0.01, NICHE.z1),
  f('Niche side', 'beige', 6.7, NICHE.y0, 6.81, NICHE.y0 + 0.01, NICHE.z0, NICHE.z1),
  f('Niche side', 'beige', 6.7, NICHE.y1 - 0.01, 6.81, NICHE.y1, NICHE.z0, NICHE.z1),
  f('Niche LED strip', 'light', 6.75, NICHE.y0 + 0.03, 6.79, NICHE.y1 - 0.03, NICHE.z1 - 0.018, NICHE.z1 - 0.01),
  f('Linear drain', 'roseGold', 6.88, 0.22, 7.97, 0.28, 0.008, 0.012),
  f('Glass wall', 'glass', 8.01, 0, 8.03, 1.2, 0, 2.0),
  f('Bath wall tiles', 'beige', 8.02, 0, 10.15, 0.01, 0, 1.2),
  f('Bathtub', 'white', 8.45, 0, 10.15, 0.8, 0, 0.58),
  // The pre-wall around the recess the mirror cabinet (a furniture piece, so its doors open) sits in.
  f('Pre-wall', 'beige', 7.74, 2.63, 9.35, 2.79, 0, 1.31),
  f('Pre-wall', 'beige', 7.74, 2.63, 9.35, 2.79, 2.09, 2.4),
  f('Pre-wall', 'beige', 7.74, 2.63, 7.85, 2.79, 1.31, 2.09),
  f('Pre-wall', 'beige', 9.25, 2.63, 9.35, 2.79, 1.31, 2.09),
  f('WC pre-wall', 'beige', 9.35, 2.63, 10.03, 2.79, 0, 1.2),
  f('Shelf', 'oak', 9.35, 2.62, 10.03, 2.79, 1.2, 1.23),
  f('Flush plate', 'roseGold', 9.6, 2.617, 9.82, 2.63, 0.95, 1.1),
  f('Downpipe casing', 'wall', 10.03, 2.63, 10.15, 2.79, 0, 2.5),
  f('Vanity', 'walnut', 7.85, 2.13, 9.25, 2.63, 0.34, 0.9),
  f('Basin', 'white', 8.44, 2.19, 9.0, 2.57, 0.9, 1.02, true),
  f('WC', 'white', 9.53, 2.1, 9.89, 2.63, 0.14, 0.43, true),
  f('Ceiling light', 'light', 8.45, 1.3, 8.59, 1.44, 2.48, 2.5),
  f('Ceiling light', 'light', 9.43, 1.28, 9.57, 1.42, 2.48, 2.5),
];

/**
 * Top-floor en-suite in the same style, from Dennis's elevations: the wall behind the vanity
 * and shower tiled full height, the WC pre-wall tiled to 1.2 m and the other walls painted;
 * a walnut vanity with a countertop basin under a free-hanging mirror.
 */
const ensuite: Fixture[] = [
  f('Wall tiles', 'beige', 6.76, 0, 8.69, 0.01, 0, 2.5),
  f('Vanity', 'walnut', 6.86, 0.01, 7.65, 0.5, 0.47, 0.9),
  f('Basin', 'white', 6.975, 0.07, 7.535, 0.45, 0.9, 1.02, true),
  f('Mirror', 'mirror', 6.87, 0.01, 7.64, 0.035, 1.37, 2.1),
  f('Shower floor', 'beige', 7.77, 0.01, 8.69, 1.23, 0.004, 0.008),
  f('Shower wall tiles', 'beige', 8.68, 0.01, 8.69, 1.23, 0, 2.5),
  f('Glass wall', 'glass', 7.76, 0.01, 7.78, 1.2, 0, 2.0),
  f('Linear drain', 'roseGold', 7.82, 0.14, 8.64, 0.2, 0.008, 0.012),
  f('WC pre-wall', 'beige', 7.77, 2.12, 8.69, 2.31, 0, 1.2),
  f('Shelf', 'oak', 7.77, 2.11, 8.69, 2.31, 1.2, 1.23),
  f('Flush plate', 'roseGold', 8.13, 2.107, 8.35, 2.12, 0.95, 1.1),
  f('WC', 'white', 8.06, 1.59, 8.42, 2.12, 0.14, 0.43, true),
  f('Ceiling light', 'light', 7.22, 1.16, 7.36, 1.3, 2.48, 2.5),
  f('Ceiling light', 'light', 8.15, 1.16, 8.29, 1.3, 2.48, 2.5),
];

/**
 * Fittings drawn as shaped models rather than blocks (see BathFittings.tsx), each on its wall
 * at (x, y), `z` above the floor, turned like furniture: facing 0 looks along +y.
 */
export interface Fitting {
  kind: 'toilet' | 'basin' | 'tallMixer' | 'bathMixer';
  x: number;
  y: number;
  z: number;
  facing: number;
  /** How far a tall mixer's spout reaches out, metres. */
  reach?: number;
}

export const fittingsByFloor: Record<string, Fitting[]> = {
  first: [
    { kind: 'toilet', x: 9.71, y: 2.63, z: 0, facing: 180 },
    { kind: 'basin', x: 8.72, y: 2.38, z: 0.9, facing: 0 },
    { kind: 'tallMixer', x: 8.72, y: 2.6, z: 0.9, facing: 180, reach: 0.19 },
    { kind: 'bathMixer', x: 9.3, y: 0.01, z: 0.78, facing: 0 },
  ],
  top: [
    { kind: 'toilet', x: 8.24, y: 2.12, z: 0, facing: 180 },
    { kind: 'basin', x: 7.255, y: 0.26, z: 0.9, facing: 0 },
    { kind: 'tallMixer', x: 7.255, y: 0.04, z: 0.9, facing: 0, reach: 0.19 },
  ],
};

/**
 * Shower systems after the photo Dennis chose: a square rail with a rectangular rain head,
 * a thermostat tablet with three buttons and a round hand shower, in rose gold. Each stands
 * on a wall at (x, y) and faces into the shower along +y.
 */
export interface ShowerSystem {
  x: number;
  y: number;
}

export const showersByFloor: Record<string, ShowerSystem[]> = {
  first: [{ x: 7.45, y: 0.01 }],
  top: [{ x: 8.22, y: 0.01 }],
};

export const fixturesByFloor: Record<string, Fixture[]> = {
  basement: [
    f('Parking ceiling', 'wall', 7.0, 0, 11.95, 5.7, 2.49, 2.5),
    f('Parking bay line', 'white', 7.4, 2.81, 11.8, 2.89, 0, 0.004),
    f('Parking bay line', 'white', 11.7, 0.1, 11.78, 5.6, 0, 0.004),
  ],
  main: kitchen,
  first: bathroom,
  top: ensuite,
};
