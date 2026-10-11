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
  | 'iceBath';

/** The nature prints, drawn procedurally in textures.ts. */
export type Artwork = 'mountain' | 'forest' | 'forestMist' | 'lake' | 'birch' | 'river' | 'botanical1' | 'botanical2' | 'botanical3';

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
}

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
