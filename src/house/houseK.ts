import type { Floor, House, Rect } from './types';

/*
 * House K, Am Kapuzinerberg, Rheinfelden.
 *
 * Traced from the 1:50 sales plans (main floor.png, first floor.png, second floor.png,
 * basement.png), the kitchen plan "Küche Haus K Pläne 260304.pdf" and Dennis's bathroom
 * sketches. The main and first floors share an interior of 10.15 x 5.70 m.
 *
 * Known deviations from the sales plans, all taken from the House K kitchen plan:
 * the kitchen is open to the dining area, 3.58 m long, with the tall units in a niche
 * that reaches 0.35 m into the entrance hall.
 *
 * The plot comes from the site plan ("Situation", brochure page 9, 1:200): parcel 126.78 m²,
 * garden 32.54 m². It runs between the party-wall centre lines (5.95 m wide), from the back
 * boundary, which has a 0.4 m garden wall, to the shared front path. The garden's depth is set
 * so its area matches the plan; the front strip takes up the rest of the parcel's area.
 *
 * Assumptions to confirm: the basement sits under the garden side (its stair lines up
 * with the stair above), floor-to-floor height 2.83 m, clear height 2.50 m, and the
 * window sill and head heights, which the plans do not give.
 */

const r = (x0: number, y0: number, x1: number, y1: number): Rect => ({ x0, y0, x1, y1 });

const STOREY = 2.83;
const CLEAR = 2.5;

// Plot, from the site plan. Party lines run along the middle of the party walls.
const PARTY_N = -0.125;
const PARTY_S = 5.825;
const PLOT_WIDTH = PARTY_S - PARTY_N;
const TERRACE_EDGE = -2.95;
const GARDEN_EDGE = TERRACE_EDGE - 32.54 / PLOT_WIDTH;
const PLOT_AREA = 126.78;
const FRONT_EDGE = GARDEN_EDGE + PLOT_AREA / PLOT_WIDTH;
const HEDGE = 0.2; // half the hedge's thickness

const basement: Floor = {
  id: 'basement',
  name: 'Basement',
  level: -STOREY,
  clearHeight: CLEAR,
  slab: r(-3.63, -0.25, 7.0, 5.95),
  walls: [
    { id: 'b-west', rect: r(-3.63, -0.25, -3.33, 5.95), exterior: true },
    { id: 'b-east', rect: r(6.7, -0.25, 7.0, 5.95), exterior: true },
    { id: 'b-north', rect: r(-3.63, -0.25, 7.0, 0), exterior: true },
    { id: 'b-south', rect: r(-3.63, 5.7, 7.0, 5.95), exterior: true },
    { id: 'b-stair', rect: r(4.27, 0, 4.42, 3.0) },
    { id: 'b-mid', rect: r(-3.33, 3.0, 5.45, 3.15) },
    { id: 'b-b1', rect: r(2.02, 3.15, 2.19, 5.7) },
    { id: 'b-wash', rect: r(5.45, 3.0, 5.59, 5.7) },
  ],
  openings: [
    { wall: 'b-west', kind: 'window', from: 0.52, to: 1.46, sill: 1.6, head: 2.3 },
    { wall: 'b-west', kind: 'window', from: 3.87, to: 4.83, sill: 1.6, head: 2.3 },
    { wall: 'b-east', kind: 'door', from: 4.57, to: 5.52, sill: 0, head: 2.1 },
    { wall: 'b-stair', kind: 'door', from: 2.0, to: 2.82, sill: 0, head: 2.1 },
    // Moved west so the reading room opens off the gym, not the store.
    { wall: 'b-mid', kind: 'door', from: -0.45, to: 0.35, sill: 0, head: 2.1 },
    { wall: 'b-mid', kind: 'door', from: 4.51, to: 5.38, sill: 0, head: 2.1 },
  ],
  rooms: [
    // The plan's 22.8 m² Bastelraum 2 is now the gym and the store together, with a pantry cupboard between them.
    { id: 'bastelraum-2', name: 'Gym', rects: [r(-3.33, 0, 0.575, 3.0)], finish: 'screed', spawn: { x: -1.6, y: 0.45, facing: 0.3 } },
    { id: 'storage', name: 'Storage and bikes', rects: [r(0.575, 0, 4.27, 3.0)], finish: 'screed', spawn: { x: 2.4, y: 1.85, facing: -Math.PI / 2 } },
    { id: 'bastelraum-1', name: 'Chill room, storage and guest bed', planArea: 13.6, rects: [r(-3.33, 3.15, 2.02, 5.7)], finish: 'parquet', spawn: { x: -0.9, y: 3.6, facing: Math.PI / 2 } },
    { id: 'laundry', name: 'Laundry and technical', planArea: 8.3, rects: [r(2.19, 3.15, 5.45, 5.7)], finish: 'screed', spawn: { x: 4.8, y: 4.4, facing: Math.PI } },
    // The plan's 9.7 m² for the corridor includes the stairwell.
    { id: 'basement-corridor', name: 'Corridor', rects: [r(4.42, 1.77, 6.7, 3.0), r(5.59, 3.0, 6.7, 5.7), r(4.42, 3.0, 5.45, 3.15)], finish: 'screed', spawn: { x: 6.1, y: 2.4, facing: Math.PI } },
  ],
  outdoor: [
    // Two parking spaces side by side, through the door at the end of the corridor: part of a bigger shared garage,
    // left open on its sides rather than modelled.
    { id: 'parking', name: 'Parking', rects: [r(7.0, 0, 11.95, 5.7)], finish: 'screed', spawn: { x: 7.5, y: 4.6, facing: -0.55 } },
  ],
};

const mainFloor: Floor = {
  id: 'main',
  name: 'Main floor',
  level: 0,
  clearHeight: CLEAR,
  // Reaches over the part of the basement that lies under the garden terrace.
  slab: r(-3.63, -0.25, 10.5, 5.95),
  walls: [
    { id: 'm-garden', rect: r(-0.35, -0.25, 0, 5.95), exterior: true },
    { id: 'm-street', rect: r(10.15, -0.25, 10.5, 5.95), exterior: true },
    { id: 'm-north', rect: r(-0.35, -0.25, 10.5, 0), exterior: true },
    { id: 'm-south', rect: r(-0.35, 5.7, 10.5, 5.95), exterior: true },
    { id: 'm-stair-l', rect: r(4.27, 0, 4.42, 1.77) },
    { id: 'm-stair-r', rect: r(6.67, 0, 6.82, 1.77) },
    { id: 'm-wc-side', rect: r(8.8, 0, 8.95, 1.62) },
    { id: 'm-wc-front', rect: r(8.8, 1.62, 10.15, 1.77) },
    { id: 'm-niche-back', rect: r(6.45, 2.79, 8.54, 2.91) },
    { id: 'm-niche-side', rect: r(6.45, 2.91, 6.57, 3.51) },
    { id: 'm-niche-end', rect: r(8.48, 2.79, 8.6, 3.26) },
    { id: 'm-kitchen-hall', rect: r(8.48, 3.11, 10.15, 3.26) },
    // Garden boundaries: hedges to the neighbours, a low wall at the back.
    { id: 'm-hedge-n', rect: r(GARDEN_EDGE, PARTY_N - HEDGE, -0.35, PARTY_N + HEDGE), height: 1.2, hedge: true },
    { id: 'm-hedge-s', rect: r(GARDEN_EDGE, PARTY_S - HEDGE, -0.35, PARTY_S + HEDGE), height: 1.2, hedge: true },
    // The same hedge closes the garden at the back, in front of the low boundary wall.
    { id: 'm-hedge-w', rect: r(GARDEN_EDGE, PARTY_N + HEDGE, GARDEN_EDGE + 2 * HEDGE, PARTY_S - HEDGE), height: 1.2, hedge: true },
    { id: 'm-garden-wall', rect: r(GARDEN_EDGE - 0.2, PARTY_N - HEDGE, GARDEN_EDGE, PARTY_S + HEDGE), height: 0.4, exterior: true },
  ],
  openings: [
    { wall: 'm-garden', kind: 'glassDoor', from: 0.7, to: 5.0, sill: 0, head: 2.3 },
    { wall: 'm-street', kind: 'door', from: 1.97, to: 2.91, sill: 0, head: 2.2 },
    { wall: 'm-street', kind: 'window', from: 0.81, to: 1.33, sill: 1.2, head: 2.1 },
    { wall: 'm-street', kind: 'window', from: 3.53, to: 5.03, sill: 1.25, head: 2.45 },
    { wall: 'm-wc-side', kind: 'door', from: 0.66, to: 1.37, sill: 0, head: 2.1 },
    { wall: 'm-kitchen-hall', kind: 'door', from: 8.6, to: 9.44, sill: 0, head: 2.1 },
  ],
  rooms: [
    { id: 'living', name: 'Living and dining', planArea: 33.5, rects: [r(0, 0, 4.27, 5.7), r(4.27, 1.77, 6.45, 5.7), r(6.45, 3.51, 6.57, 5.7)], finish: 'woodTile', spawn: { x: 6.1, y: 4.6, facing: Math.PI } },
    { id: 'kitchen', name: 'Kitchen', planArea: 8.2, rects: [r(6.57, 2.91, 8.48, 5.7), r(8.48, 3.26, 10.15, 5.7)], finish: 'woodTile', spawn: { x: 6.9, y: 4.3, facing: 0 } },
    { id: 'entrance', name: 'Entrance', planArea: 8.2, rects: [r(6.82, 0, 8.8, 1.77), r(6.45, 1.77, 10.15, 2.79), r(8.6, 2.79, 10.15, 3.11)], finish: 'woodTile', spawn: { x: 9.7, y: 2.4, facing: Math.PI } },
    { id: 'wc', name: 'WC', planArea: 1.8, rects: [r(8.95, 0, 10.15, 1.62)], finish: 'bathTile', spawn: { x: 9.3, y: 0.9, facing: 0 } },
  ],
  outdoor: [
    { id: 'garden-terrace', name: 'Garden terrace', planArea: 14.8, rects: [r(TERRACE_EDGE, 0, -0.35, 5.7)], finish: 'terrace', spawn: { x: -1.5, y: 3.9, facing: -Math.PI / 2 } },
    { id: 'garden', name: 'Garden', planArea: 32.54, rects: [r(GARDEN_EDGE, PARTY_N, TERRACE_EDGE, PARTY_S)], finish: 'lawn', spawn: { x: -6.5, y: 2.8, facing: 0 } },
    // In front of the WC: a planted bed; the rest of the front strip is the path to the door.
    { id: 'front-garden', name: 'Front garden', rects: [r(10.5, PARTY_N, FRONT_EDGE, 1.9)], finish: 'lawn' },
    { id: 'front-path', name: 'Entrance path', rects: [r(10.5, 1.9, FRONT_EDGE, PARTY_S)], finish: 'terrace', spawn: { x: 11.4, y: 2.4, facing: Math.PI } },
  ],
  // The basement reaches under the terrace to x = -3.63; beyond it, and in front, is earth.
  ground: [r(GARDEN_EDGE - 0.2, PARTY_N - HEDGE, -3.63, PARTY_S + HEDGE), r(10.5, PARTY_N, FRONT_EDGE, PARTY_S)],
};

const firstFloor: Floor = {
  id: 'first',
  name: 'First floor',
  level: STOREY,
  clearHeight: CLEAR,
  slab: r(-0.35, -0.25, 10.5, 5.95),
  walls: [
    { id: 'f-garden', rect: r(-0.35, -0.25, 0, 5.95), exterior: true },
    { id: 'f-street', rect: r(10.15, -0.25, 10.5, 5.95), exterior: true },
    { id: 'f-north', rect: r(-0.35, -0.25, 10.5, 0), exterior: true },
    { id: 'f-south', rect: r(-0.35, 5.7, 10.5, 5.95), exterior: true },
    { id: 'f-z2', rect: r(4.26, 0, 4.4, 2.79) },
    { id: 'f-bath', rect: r(6.67, 0, 6.8, 2.79) },
    { id: 'f-mid', rect: r(0, 2.79, 10.15, 2.95) },
    { id: 'f-z1-z3', rect: r(5.32, 2.95, 5.48, 5.7) },
  ],
  openings: [
    { wall: 'f-garden', kind: 'window', from: 0.68, to: 2.44, sill: 0.9, head: 2.2 },
    { wall: 'f-garden', kind: 'window', from: 3.25, to: 5.0, sill: 0.9, head: 2.2 },
    { wall: 'f-street', kind: 'window', from: 0.81, to: 2.52, sill: 1.1, head: 2.2 },
    { wall: 'f-street', kind: 'window', from: 3.28, to: 5.0, sill: 0.9, head: 2.2 },
    { wall: 'f-z2', kind: 'door', from: 1.9, to: 2.72, sill: 0, head: 2.1 },
    { wall: 'f-bath', kind: 'door', from: 1.9, to: 2.72, sill: 0, head: 2.1 },
    { wall: 'f-bath', kind: 'niche', from: 0.01, to: 1.21, sill: 1.2, head: 1.5 },
    { wall: 'f-mid', kind: 'door', from: 4.46, to: 5.29, sill: 0, head: 2.1 },
    { wall: 'f-mid', kind: 'door', from: 5.71, to: 6.57, sill: 0, head: 2.1 },
  ],
  rooms: [
    { id: 'zimmer-1', name: 'Zimmer 1 (child)', planArea: 14.7, rects: [r(0, 2.95, 5.32, 5.7)], finish: 'parquet', spawn: { x: 4.6, y: 3.5, facing: Math.PI } },
    { id: 'zimmer-2', name: 'Zimmer 2 (child)', planArea: 12.0, rects: [r(0, 0, 4.26, 2.79)], finish: 'parquet', spawn: { x: 3.7, y: 2.3, facing: Math.PI } },
    { id: 'zimmer-3', name: 'Zimmer 3 (office and guest)', planArea: 12.7, rects: [r(5.48, 2.95, 10.15, 5.7)], finish: 'parquet', spawn: { x: 6.2, y: 3.5, facing: 0 } },
    { id: 'bathroom', name: 'Bathroom', planArea: 9.3, rects: [r(6.8, 0, 10.15, 2.79)], finish: 'bathTile', spawn: { x: 7.3, y: 2.3, facing: -0.4 } },
    { id: 'first-landing', name: 'Landing', planArea: 2.4, rects: [r(4.4, 1.77, 6.67, 2.79)], finish: 'parquet', spawn: { x: 5.5, y: 2.4, facing: Math.PI / 2 } },
  ],
  outdoor: [],
};

const topFloor: Floor = {
  id: 'top',
  name: 'Top floor',
  level: 2 * STOREY,
  clearHeight: CLEAR,
  slab: r(-0.35, -0.25, 10.5, 5.95),
  walls: [
    { id: 't-garden', rect: r(4.07, -0.25, 4.42, 5.95), exterior: true },
    { id: 't-street', rect: r(8.69, -0.25, 9.04, 5.95), exterior: true },
    { id: 't-north', rect: r(4.07, -0.25, 9.04, 0), exterior: true },
    { id: 't-south', rect: r(4.07, 5.7, 9.04, 5.95), exterior: true },
    { id: 't-bath', rect: r(6.66, 0, 6.76, 2.31) },
    { id: 't-mid', rect: r(4.42, 2.31, 8.69, 2.41) },
    { id: 't-parapet-garden', rect: r(-0.35, -0.25, -0.2, 5.95), height: 1.0, exterior: true },
    { id: 't-parapet-street', rect: r(10.2, -0.25, 10.35, 5.95), height: 1.0, exterior: true },
  ],
  openings: [
    { wall: 't-garden', kind: 'glassDoor', from: 2.58, to: 5.15, sill: 0, head: 2.3 },
    { wall: 't-street', kind: 'window', from: 1.26, to: 1.84, sill: 1.2, head: 2.0 },
    { wall: 't-street', kind: 'glassDoor', from: 2.72, to: 4.07, sill: 0, head: 2.2 },
    { wall: 't-mid', kind: 'door', from: 4.42, to: 5.35, sill: 0, head: 2.1 },
    { wall: 't-mid', kind: 'door', from: 6.93, to: 7.71, sill: 0, head: 2.1 },
  ],
  rooms: [
    { id: 'bedroom', name: 'Bedroom', planArea: 14.0, rects: [r(4.42, 2.41, 8.69, 5.7)], finish: 'parquet', spawn: { x: 8.0, y: 3.0, facing: 2.6 } },
    { id: 'ensuite', name: 'En-suite bathroom', planArea: 4.2, rects: [r(6.76, 0, 8.69, 2.31)], finish: 'bathTile', spawn: { x: 7.3, y: 2.0, facing: -1.2 } },
    { id: 'top-landing', name: 'Landing', rects: [r(4.42, 1.77, 6.66, 2.31)], finish: 'parquet' },
  ],
  outdoor: [
    { id: 'roof-terrace', name: 'Roof terrace', planArea: 23.6, rects: [r(-0.2, 0, 4.07, 5.7)], finish: 'terrace', spawn: { x: 2.0, y: 2.8, facing: Math.PI } },
    { id: 'street-terrace', name: 'Street terrace', planArea: 6.5, rects: [r(9.04, 0, 10.2, 5.7)], finish: 'terrace', spawn: { x: 9.7, y: 3.4, facing: 0 } },
  ],
};

export const houseK: House = {
  name: 'House K',
  plot: { rect: r(GARDEN_EDGE, PARTY_N, FRONT_EDGE, PARTY_S), planArea: PLOT_AREA },
  storeyHeight: STOREY,
  floors: [basement, mainFloor, firstFloor, topFloor],
  stair: {
    shaft: r(4.42, 0, 6.67, 1.77),
    core: r(5.45, 1.0, 5.65, 1.77),
    steps: 16,
  },
};
