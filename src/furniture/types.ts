import type { Rect } from '../house/types';

export type FurnitureKind =
  // seating and tables
  | 'sofa'
  | 'loungeChair'
  | 'diningChair'
  | 'deskChair'
  | 'pouf'
  | 'bench'
  | 'floorCushions'
  | 'coffeeTable'
  | 'sideTable'
  | 'diningTable'
  | 'desk'
  // sleeping and storage
  | 'bed'
  | 'bedsideTable'
  | 'wardrobe'
  | 'shelf'
  | 'lowboard'
  | 'dresser'
  // soft furnishings
  | 'rug'
  | 'curtain'
  | 'blind'
  // light
  | 'pendant'
  | 'floorLamp'
  | 'tableLamp'
  // walls
  | 'print'
  | 'mural'
  | 'paint'
  | 'slats'
  | 'mirror'
  | 'hooks'
  | 'tv'
  // living things and small things
  | 'plant'
  | 'herbs'
  | 'boards'
  | 'bowl'
  | 'vase'
  | 'books'
  | 'towels'
  | 'stool'
  // fittings the plans leave out
  | 'toilet'
  | 'basin'
  // outdoor and basement
  | 'lounger'
  | 'planter'
  | 'workbench'
  | 'pegboard'
  | 'washer'
  | 'dryingRack'
  | 'sauna'
  | 'iceBath'
  | 'bikeRack'
  | 'pergola'
  | 'clothesLine'
  | 'utilitySink'
  // work
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'speaker'
  // built in
  | 'wallBed'
  | 'nook'
  | 'bookcase'
  // children
  | 'tipi'
  | 'plush'
  // gym, bikes and storage
  | 'bike'
  | 'pantry'
  | 'skiRack'
  | 'dumbbells'
  | 'wallBall'
  | 'plyoBox'
  // doors and the front
  | 'door'
  | 'canopy'
  | 'mailbox'
  | 'kerb'
  | 'boxShelf'
  // kitchen
  | 'espresso'
  | 'grinder'
  // garden
  | 'gardenSet'
  // gym and chill room, 12 October
  | 'indoorBike'
  | 'beamer'
  | 'projection'
  | 'deadlift'
  | 'farmer'
  | 'wallTarget'
  | 'spot'
  | 'pullUpBar'
  | 'trx'
  | 'panel'
  | 'daybed';

/** The nature prints, drawn procedurally in textures.ts. */
export type Artwork = 'mountain' | 'forest' | 'forestMist' | 'lake' | 'birch' | 'river' | 'botanical1' | 'botanical2' | 'botanical3' | 'animals' | 'fox' | 'owl' | 'deer' | 'sunrise';

export interface FurnitureItem {
  /** Unique within the house. */
  id: string;
  /** What it is, in a few words, for the plan and the proposal panel. */
  name: string;
  kind: FurnitureKind;
  /** Room id from houseK.ts. */
  room: string;
  /** Centre of the footprint, plan metres. */
  x: number;
  y: number;
  /**
   * Turn in degrees around the vertical. At 0 the front faces +y (towards the south party
   * wall); 90 faces +x (the street), 180 faces -y, -90 faces -x (the garden).
   * Wall pieces face into the room they hang in.
   */
  rot?: number;
  /** Width across the front, depth front to back, height; metres. */
  w: number;
  d: number;
  h: number;
  /** Height of the underside above the floor: wall art, wall cabinets, pendants. */
  z?: number;
  /** Main colour: upholstery, paint, bedding. */
  colour?: string;
  /** Second colour: cushions, throw, pot, frame. */
  accent?: string;
  variant?: string;
  art?: Artwork;
  /**
   * A sofa with a chaise: `w` and `d` are the whole L, the back runs along the full width and
   * the chaise comes forward on this side, as seen when facing the sofa.
   */
  chaise?: 'left' | 'right';
}

/** Depth of a sofa's back run, when it has a chaise. */
export const SOFA_DEPTH = 0.95;
/** Width of a chaise. */
export const CHAISE_WIDTH = 0.95;

export interface RoomProposal {
  room: string;
  theme: string;
  palette: { name: string; hex: string }[];
  summary: string;
  /** Where the walkthrough puts you when furnished: a spot that shows the room well. */
  view?: { x: number; y: number; facing: number };
}

/** Floor-standing pieces that a person walks around (rugs and wall pieces excluded). */
export const BLOCKING: ReadonlySet<FurnitureKind> = new Set<FurnitureKind>([
  'sofa',
  'loungeChair',
  'diningChair',
  'deskChair',
  'pouf',
  'bench',
  'coffeeTable',
  'sideTable',
  'diningTable',
  'desk',
  'bed',
  'bedsideTable',
  'wardrobe',
  'shelf',
  'lowboard',
  'dresser',
  'floorLamp',
  'plant',
  'toilet',
  'lounger',
  'planter',
  'workbench',
  'washer',
  'dryingRack',
  'stool',
  'sauna',
  'iceBath',
  'bikeRack',
  'utilitySink',
  'wallBed',
  'nook',
  'bookcase',
  'tipi',
  'bike',
  'pantry',
  'skiRack',
  'dumbbells',
  'plyoBox',
  'mailbox',
  'boxShelf',
  'gardenSet',
  'indoorBike',
  'deadlift',
  'farmer',
  'daybed',
]);

/** The plan rectangle an item covers, after its turn (turns are multiples of 90° or bounded). */
export function footprint(item: FurnitureItem): Rect {
  const a = ((item.rot ?? 0) * Math.PI) / 180;
  const c = Math.abs(Math.cos(a));
  const s = Math.abs(Math.sin(a));
  const hx = (item.w * c + item.d * s) / 2;
  const hy = (item.w * s + item.d * c) / 2;
  return { x0: item.x - hx, y0: item.y - hy, x1: item.x + hx, y1: item.y + hy };
}

/**
 * The parts of an item's shape in its own frame (x across the width, z towards the front),
 * as rectangles { x0, y0: z0, x1, y1: z1 }: one for most pieces, two for an L-shaped sofa.
 */
export function localParts(item: FurnitureItem): Rect[] {
  const { w, d } = item;
  if (!item.chaise) return [{ x0: -w / 2, y0: -d / 2, x1: w / 2, y1: d / 2 }];
  // Seen from the front (facing the sofa), its left is -x in its own frame.
  const side = item.chaise === 'left' ? -1 : 1;
  const cx0 = side < 0 ? -w / 2 : w / 2 - CHAISE_WIDTH;
  return [
    { x0: -w / 2, y0: -d / 2, x1: w / 2, y1: -d / 2 + SOFA_DEPTH },
    { x0: cx0, y0: -d / 2 + SOFA_DEPTH, x1: cx0 + CHAISE_WIDTH, y1: d / 2 },
  ];
}

/** The plan rectangles an item covers: its footprint, or each part of an L-shape (turns of 90° only). */
export function footprints(item: FurnitureItem): Rect[] {
  if (!item.chaise) return [footprint(item)];
  const a = ((item.rot ?? 0) * Math.PI) / 180;
  const c = Math.round(Math.cos(a));
  const s = Math.round(Math.sin(a));
  // Same turn as the 3D group: x' = x cos + z sin, z' = -x sin + z cos.
  return localParts(item).map((r) => {
    const xs = [r.x0, r.x1].flatMap((x) => [r.y0, r.y1].map((z) => item.x + x * c + z * s));
    const ys = [r.x0, r.x1].flatMap((x) => [r.y0, r.y1].map((z) => item.y - x * s + z * c));
    return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
  });
}
