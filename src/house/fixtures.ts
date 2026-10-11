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
  | 'forest';

export interface Fixture extends Block {
  name: string;
  material: FixtureMaterial;
}

const f = (name: string, material: FixtureMaterial, x0: number, y0: number, x1: number, y1: number, z0: number, z1: number): Fixture => ({
  name, material, x0, y0, x1, y1, z0, z1,
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

/** First-floor bathroom from Dennis's sketch (read at 360 px per metre). */
const bathroom: Fixture[] = [
  f('Shower floor', 'pebble', 6.8, 0, 8.02, 1.22, 0.004, 0.008),
  f('Shower wall tiles', 'slate', 6.8, 0, 8.02, 0.01, 0, 2.3),
  f('Shower wall tiles', 'slate', 6.8, 0, 6.81, 1.22, 0, 2.3),
  f('Linear drain', 'steel', 6.88, 0.22, 7.97, 0.28, 0.008, 0.012),
  f('Glass wall', 'glass', 8.01, 0, 8.03, 1.2, 0, 2.0),
  f('Shower head', 'steel', 7.45, 0.01, 7.61, 0.25, 2.05, 2.08),
  f('Bathtub', 'white', 8.45, 0, 10.15, 0.8, 0, 0.58),
  f('Bath filler', 'steel', 9.25, 0, 9.35, 0.1, 0.58, 0.65),
  f('Pre-wall with mirror cabinet', 'wall', 7.74, 2.63, 9.35, 2.79, 0, 2.5),
  f('WC pre-wall', 'wall', 9.35, 2.63, 10.03, 2.79, 0, 1.2),
  f('Shelf', 'oak', 9.35, 2.62, 10.03, 2.79, 1.2, 1.23),
  f('Downpipe casing', 'wall', 10.03, 2.63, 10.15, 2.79, 0, 2.5),
  f('Vanity', 'oak', 7.94, 2.12, 9.24, 2.63, 0.45, 0.85),
  f('Vanity top', 'white', 7.94, 2.12, 9.24, 2.63, 0.85, 0.87),
  f('Basin', 'white', 8.6, 2.18, 9.13, 2.58, 0.87, 0.98),
  f('Mirror cabinet', 'mirror', 7.94, 2.62, 9.24, 2.63, 1.1, 1.9),
  f('WC', 'white', 9.54, 2.09, 9.88, 2.63, 0.25, 0.65),
  f('Ceiling light', 'light', 8.45, 1.3, 8.59, 1.44, 2.48, 2.5),
  f('Ceiling light', 'light', 9.43, 1.28, 9.57, 1.42, 2.48, 2.5),
];

/** Top-floor en-suite from Dennis's sketch. */
const ensuite: Fixture[] = [
  f('Vanity', 'oak', 6.86, 0, 7.65, 0.5, 0.45, 0.85),
  f('Vanity top', 'white', 6.86, 0, 7.65, 0.5, 0.85, 0.87),
  f('Basin', 'white', 7.0, 0.08, 7.54, 0.44, 0.87, 0.98),
  f('Mirror cabinet', 'mirror', 6.91, 0, 7.63, 0.01, 1.1, 1.9),
  f('Shower floor', 'slate', 7.77, 0, 8.69, 1.23, 0.004, 0.008),
  f('Shower wall tiles', 'forest', 7.78, 0, 8.69, 0.01, 0, 2.3),
  f('Shower wall tiles', 'forest', 8.68, 0, 8.69, 1.23, 0, 2.3),
  f('Glass wall', 'glass', 7.76, 0, 7.78, 1.2, 0, 2.0),
  f('Linear drain', 'steel', 7.82, 0.14, 8.64, 0.2, 0.008, 0.012),
  f('Shower head', 'steel', 8.16, 0.01, 8.32, 0.25, 2.05, 2.08),
  f('WC pre-wall', 'wall', 7.77, 2.12, 8.69, 2.31, 0, 1.2),
  f('Shelf', 'oak', 7.77, 2.11, 8.69, 2.31, 1.2, 1.23),
  f('WC', 'white', 8.07, 1.62, 8.4, 2.12, 0.25, 0.65),
  f('Ceiling light', 'light', 7.22, 1.16, 7.36, 1.3, 2.48, 2.5),
  f('Ceiling light', 'light', 8.15, 1.16, 8.29, 1.3, 2.48, 2.5),
];

export const fixturesByFloor: Record<string, Fixture[]> = {
  basement: [],
  main: kitchen,
  first: bathroom,
  top: ensuite,
};
