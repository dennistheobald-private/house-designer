/** Plan coordinates in metres. x runs from the garden facade (0) to the street facade (10.15),
 *  y runs from the north party wall (0) to the south party wall (5.70). Heights are metres
 *  above the floor's own level unless noted. */
export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export type FloorFinish = 'parquet' | 'tile' | 'bathTile' | 'stoneTile' | 'screed' | 'carpet' | 'stair' | 'terrace' | 'pebble' | 'lawn';

export interface Wall {
  id: string;
  rect: Rect;
  /** Height above the floor level. Defaults to the floor's clear height. */
  height?: number;
  exterior?: boolean;
  /** A planted hedge rather than masonry. */
  hedge?: boolean;
}

/** A niche is a recess cut into a wall between `sill` and `head`, closed at the back by fixtures. */
export type OpeningKind = 'door' | 'window' | 'glassDoor' | 'niche';

/** A gap in a wall. `from`/`to` are absolute coordinates along the wall's long axis. */
export interface Opening {
  wall: string;
  kind: OpeningKind;
  from: number;
  to: number;
  sill: number;
  head: number;
}

export interface Room {
  id: string;
  name: string;
  /** Area printed on the plans, for checking the tracing. */
  planArea?: number;
  rects: Rect[];
  finish: FloorFinish;
  /** Where the walkthrough places you when you jump to this room. */
  spawn?: { x: number; y: number; facing: number };
}

export interface Floor {
  id: string;
  name: string;
  /** Floor level relative to the main floor, metres. */
  level: number;
  clearHeight: number;
  /** Outline of the slab this floor stands on. */
  slab: Rect;
  walls: Wall[];
  openings: Opening[];
  rooms: Room[];
  /** Areas outside the envelope that you can stand on (terraces, garden). */
  outdoor: Room[];
  /** Ground under outdoor areas that no building slab covers, drawn as a block of earth. */
  ground?: Rect[];
}

export interface Stair {
  /** The stairwell, identical on every floor. */
  shaft: Rect;
  /** Central spine wall the winding stair turns around. */
  core: Rect;
  steps: number;
}

/** The land that belongs to the house, from the site plan. */
export interface Plot {
  /** The whole parcel, from party line to party line and from the front path to the back boundary. */
  rect: Rect;
  /** Area printed on the site plan (PF). */
  planArea: number;
}

export interface House {
  name: string;
  plot: Plot;
  floors: Floor[];
  stair: Stair;
  storeyHeight: number;
}
