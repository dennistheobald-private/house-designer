import type { FurnitureItem, RoomProposal } from './types';

/*
 * The furnished proposal for every room, following the Nature Design Concept doc:
 * one shared base (light oiled oak, warm white walls, linen and wool in oat and stone,
 * matt black metal, a plant in every room, warm 2700 K light) and one landscape per room.
 * Positions are plan metres (see houseK.ts); the kitchen units and bathroom fittings are
 * fixed fixtures and are not repeated here.
 */

export const C = {
  // base
  oat: '#dcd3c4',
  linen: '#e9e3d6',
  stone: '#bdb7ae',
  black: '#2b2b2a',
  white: '#f3f0e8',
  // mountains
  granite: '#8c8f91',
  snow: '#f4f3ef',
  glacier: '#a3b4bd',
  pine: '#34483e',
  // forest
  moss: '#5f6e40',
  spruce: '#2c4538',
  bark: '#6b5242',
  mushroom: '#cbbcaa',
  // lake
  lake: '#8a9fab',
  mist: '#eef0ee',
  reed: '#8e9a6c',
  // meadow
  straw: '#d6bf8a',
  butter: '#e8d596',
  sage: '#a7b494',
  poppy: '#bf5640',
  // birch and snow
  birch: '#ede9e1',
  pale: '#cfcfcb',
  charcoal: '#3c3d3d',
  // river, earth, rain
  river: '#3d6262',
  pebble: '#a7a49b',
  terracotta: '#b4704f',
  clay: '#c9a184',
} as const;

export const proposals: RoomProposal[] = [
  {
    room: 'living',
    view: { x: 3.95, y: 4.7, facing: -2.25 },
    theme: 'Mountains',
    palette: [
      { name: 'Granite', hex: C.granite },
      { name: 'Snow', hex: C.snow },
      { name: 'Glacier', hex: C.glacier },
      { name: 'Pine', hex: C.pine },
    ],
    summary:
      'A stone-grey bouclé sofa under a large black and white alpine print, a round quartzite coffee table on a snowfield-cream rug, an oak and wool lounge chair, and an oak table for six under a cloud-like linen pendant.',
  },
  {
    room: 'kitchen',
    theme: 'Alpine meadow',
    palette: [
      { name: 'Taupe (as built)', hex: '#b39f92' },
      { name: 'Cream (as built)', hex: '#efe6d3' },
      { name: 'Sage', hex: C.sage },
      { name: 'Terracotta', hex: C.terracotta },
    ],
    summary: 'The Inform kitchen stays exactly as planned; herbs in terracotta pots by the sink, oak boards on the backsplash, a stoneware fruit bowl and a sage linen blind bring in the meadow.',
  },
  {
    room: 'entrance',
    theme: 'The Rhine',
    palette: [
      { name: 'River', hex: C.river },
      { name: 'Pebble', hex: C.pebble },
      { name: 'Oak', hex: '#c8a97e' },
    ],
    summary: 'A full-height matt white wardrobe, an oak bench with a pebble-grey cushion under a round mirror, pebble hooks, a long wool runner and a photo of the Rhine facing the front door.',
  },
  {
    room: 'wc',
    theme: 'The Rhine',
    palette: [
      { name: 'River', hex: C.river },
      { name: 'Pebble', hex: C.pebble },
    ],
    summary: 'Deep river green-blue walls, a small round basin, a framed Rhine photo and a fern on the sill.',
  },
  {
    room: 'zimmer-1',
    view: { x: 1.45, y: 3.6, facing: 0.35 },
    theme: 'Alpine lake',
    palette: [
      { name: 'Lake', hex: C.lake },
      { name: 'Mist', hex: C.mist },
      { name: 'Reed', hex: C.reed },
    ],
    summary: 'An oak bed with a blue-grey linen headboard, an oak desk under the garden window, low open shelves with baskets, a lake print and a round mirror like still water, a reading nook of floor cushions.',
  },
  {
    room: 'zimmer-2',
    view: { x: 3.7, y: 2.3, facing: 3.9 },
    theme: 'Wildflower meadow',
    palette: [
      { name: 'Straw', hex: C.straw },
      { name: 'Butter', hex: C.butter },
      { name: 'Sage', hex: C.sage },
      { name: 'Poppy', hex: C.poppy },
    ],
    summary: 'An oak bed with a straw quilt under three pressed-flower prints, an oak desk at the window with a rattan chair, a rattan pendant, an oat rug and open shelving.',
  },
  {
    room: 'zimmer-3',
    view: { x: 9.0, y: 3.3, facing: 2.8 },
    theme: 'Birch and snow',
    palette: [
      { name: 'Birch', hex: C.birch },
      { name: 'Pale grey', hex: C.pale },
      { name: 'Charcoal', hex: C.charcoal },
      { name: 'Wool', hex: C.oat },
    ],
    summary: 'An oat wool sofa bed against a wall of pale birch slats, a 160 cm oak desk under the street window with a sheepskin on the chair, the wardrobe on the end wall and a birch print.',
  },
  {
    room: 'bathroom',
    theme: 'Mountain stream',
    palette: [
      { name: 'Light beige tile', hex: '#e4d8c4' },
      { name: 'Rose gold', hex: '#d9a28c' },
      { name: 'Oak', hex: '#c8a97e' },
      { name: 'Moss', hex: C.moss },
    ],
    summary: 'Layout as sketched, in light beige tiles with rose gold taps and a rose gold rain shower with a thermostat tablet; waffle towels in stone and moss on an oak ladder, a moss bath mat, an oak stool by the tub and a fern by the window.',
  },
  {
    room: 'bedroom',
    view: { x: 8.0, y: 3.0, facing: 2.36 },
    theme: 'Forest',
    palette: [
      { name: 'Moss', hex: C.moss },
      { name: 'Spruce', hex: C.spruce },
      { name: 'Bark', hex: C.bark },
      { name: 'Mushroom', hex: C.mushroom },
    ],
    summary:
      'A misty spruce-forest mural on the wall behind a 180 cm oak bed with an oak headboard, bark linen and a moss wool throw, oak bedside tables with paper lamps, a 30 cm deep L-shaped oak wardrobe in the street-side corner, an oak chest of drawers between the stair and bathroom doors, heavy linen curtains and a large fern.',
  },
  {
    room: 'ensuite',
    theme: 'Forest spa',
    palette: [
      { name: 'Light beige tile', hex: '#e4d8c4' },
      { name: 'Rose gold', hex: '#d9a28c' },
      { name: 'Oak', hex: '#c8a97e' },
      { name: 'Moss', hex: C.moss },
    ],
    summary: 'Layout as sketched, in light beige tiles with rose gold taps and a rose gold rain shower with a thermostat tablet; a moss bath mat, an oak stool in the shower, moss towels and a fern.',
  },
  {
    room: 'roof-terrace',
    theme: 'Forest edge',
    palette: [
      { name: 'Pine', hex: C.pine },
      { name: 'Teak', hex: '#9a6b47' },
    ],
    summary: 'Planters of mountain pine and birch along the edge, two teak loungers and a small round table, and in the sheltered corner a two-person cabin sauna with a black frame, a glass front and a dark wood interior, with a teak ice bath beside it.',
  },
  {
    room: 'bastelraum-1',
    theme: 'Earth and clay',
    palette: [
      { name: 'Terracotta', hex: C.terracotta },
      { name: 'Clay', hex: C.clay },
      { name: 'Oat', hex: C.oat },
    ],
    summary: 'A terracotta wall, an oat linen sofa bed, an oak desk under the high window and a ceramic lamp.',
  },
  {
    room: 'bastelraum-2',
    theme: 'Quarry',
    palette: [
      { name: 'Concrete', hex: '#a8a6a0' },
      { name: 'Oak', hex: '#c8a97e' },
      { name: 'Black', hex: C.black },
    ],
    summary: 'Raw concrete kept as it is; a solid oak workbench under an oak pegboard, black industrial pendants and a large cliff photograph.',
  },
  {
    room: 'laundry',
    theme: 'Rain',
    palette: [
      { name: 'White', hex: '#f7f7f4' },
      { name: 'Light grey', hex: C.pale },
    ],
    summary: 'Washer and dryer side by side under an oak worktop, and a wooden drying rack.',
  },
];

const item = (room: string, id: string, name: string, kind: FurnitureItem['kind'], x: number, y: number, w: number, d: number, h: number, more: Partial<FurnitureItem> = {}): FurnitureItem => ({
  id: `${room}/${id}`,
  name,
  kind,
  room,
  x,
  y,
  w,
  d,
  h,
  ...more,
});

/* ---------------------------------------------------------------- main floor */

const living = (id: string, name: string, kind: FurnitureItem['kind'], x: number, y: number, w: number, d: number, h: number, more?: Partial<FurnitureItem>) =>
  item('living', id, name, kind, x, y, w, d, h, more);

const mainFloor: FurnitureItem[] = [
  // Lounge, by the garden doors
  living('sofa', 'Sofa, stone-grey bouclé, 220 cm', 'sofa', 2.2, 0.5, 2.2, 0.95, 0.78, { colour: C.stone, accent: C.glacier, variant: 'boucle' }),
  living('print', 'Alpine print, black and white, 150 x 100 cm', 'print', 2.2, 0.02, 1.5, 0.03, 1.0, { z: 1.12, art: 'mountain', accent: C.black }),
  living('rug', 'Wool rug, snow cream, 300 x 200 cm', 'rug', 2.2, 1.85, 3.0, 2.0, 0.015, { colour: '#ebe6dc' }),
  living('coffee', 'Round coffee table, honed quartzite, 90 cm', 'coffeeTable', 2.2, 1.65, 0.9, 0.9, 0.36, { variant: 'quartzite' }),
  living('bowl', 'Stoneware bowl', 'bowl', 2.05, 1.6, 0.26, 0.26, 0.08, { z: 0.36, colour: C.charcoal }),
  living('books', 'Mountain books', 'books', 2.42, 1.75, 0.3, 0.22, 0.08, { z: 0.36, rot: 20 }),
  living('lounge-chair', 'Lounge chair, oak and pine-green wool', 'loungeChair', 3.65, 1.75, 0.76, 0.82, 0.78, { rot: -105, colour: C.pine }),
  living('pouf', 'Knitted pouf, oat', 'pouf', 1.05, 2.45, 0.5, 0.5, 0.4, { colour: C.oat }),
  living('floor-lamp', 'Floor lamp, black with linen shade', 'floorLamp', 0.6, 0.35, 0.4, 0.4, 1.6, { colour: C.linen }),
  living('side-table', 'Side table, oak', 'sideTable', 3.62, 0.35, 0.42, 0.42, 0.5),
  living('table-lamp', 'Ceramic table lamp', 'tableLamp', 3.62, 0.35, 0.26, 0.26, 0.45, { z: 0.5, colour: C.linen, accent: C.stone }),
  living('olive', 'Olive tree in a clay pot', 'plant', 0.45, 5.15, 0.6, 0.6, 1.9, { variant: 'olive', accent: C.clay }),
  living('lowboard', 'Lowboard, oak, 200 cm', 'lowboard', 2.2, 5.48, 2.0, 0.42, 0.48, { rot: 180 }),
  living('tv', 'Television, 65 inch', 'tv', 2.2, 5.675, 1.45, 0.04, 0.84, { rot: 180, z: 0.82 }),
  living('vase', 'Vase with dried grasses', 'vase', 1.55, 5.5, 0.18, 0.18, 0.55, { z: 0.48, colour: C.stone }),
  living('pine-bonsai', 'Mountain pine bonsai', 'plant', 2.95, 5.5, 0.32, 0.32, 0.38, { z: 0.48, variant: 'bonsai', accent: C.charcoal }),
  // Dining, towards the kitchen
  living('table', 'Dining table, solid oak, 180 x 90 cm', 'diningTable', 5.35, 4.05, 0.9, 1.8, 0.75),
  ...[3.45, 4.05, 4.65].flatMap((y, i) => [
    living(`chair-w${i}`, 'Dining chair, oak', 'diningChair', 4.62, y, 0.46, 0.5, 0.8, { rot: 90, colour: C.oat }),
    living(`chair-e${i}`, 'Dining chair, oak', 'diningChair', 6.08, y, 0.46, 0.5, 0.8, { rot: -90, colour: C.oat }),
  ]),
  living('carver', 'Carver chair, grey wool', 'diningChair', 5.35, 5.27, 0.56, 0.52, 0.8, { rot: 180, colour: C.granite, variant: 'carver' }),
  living('pendant', 'Cloud pendant, linen', 'pendant', 5.35, 4.05, 1.0, 0.55, 0.32, { z: 1.62, variant: 'cloud', colour: C.linen }),
  living('table-vase', 'Stoneware jug with pine sprigs', 'vase', 5.35, 4.05, 0.14, 0.14, 0.4, { z: 0.75, colour: C.snow, variant: 'sprigs' }),
];

const kitchenItems: FurnitureItem[] = [
  item('kitchen', 'herbs', 'Herbs in terracotta pots', 'herbs', 9.98, 3.7, 0.5, 0.15, 0.28, { rot: -90, z: 0.93 }),
  item('kitchen', 'boards', 'Oak chopping boards', 'boards', 7.3, 5.6, 0.6, 0.06, 0.45, { rot: 180, z: 0.93 }),
  item('kitchen', 'bowl', 'Stoneware fruit bowl', 'bowl', 9.8, 5.35, 0.3, 0.3, 0.1, { z: 0.93, colour: C.sage, variant: 'fruit' }),
  item('kitchen', 'blind', 'Roller blind, sage linen', 'blind', 10.14, 4.28, 1.55, 0.04, 0.35, { rot: -90, z: 2.07, colour: C.sage }),
];

const entrance: FurnitureItem[] = [
  item('entrance', 'wardrobe', 'Built-in wardrobe, matt white, full height', 'wardrobe', 7.81, 0.31, 1.98, 0.6, 2.48, { colour: '#f1efea', variant: 'flush' }),
  item('entrance', 'bench', 'Bench, oak, with a pebble-grey cushion', 'bench', 7.03, 1.2, 1.0, 0.38, 0.46, { rot: 90, accent: C.pebble }),
  item('entrance', 'mirror', 'Round mirror, oak rim', 'mirror', 6.835, 1.2, 0.65, 0.03, 0.65, { rot: 90, z: 1.05 }),
  item('entrance', 'hooks', 'Pebble wall hooks', 'hooks', 7.6, 2.775, 0.9, 0.05, 0.1, { rot: 180, z: 1.65, colour: C.pebble }),
  item('entrance', 'runner', 'Wool runner, river stone', 'rug', 8.3, 2.28, 2.9, 0.75, 0.012, { colour: '#8f918a' }),
  item('entrance', 'print', 'Photo of the Rhine at Rheinfelden', 'print', 9.45, 1.785, 0.7, 0.03, 0.5, { z: 1.3, art: 'river', accent: C.black }),
];

const wc: FurnitureItem[] = [
  item('wc', 'paint-n', 'Wall paint, river green-blue', 'paint', 9.55, 0.004, 1.2, 0.008, 2.5, { colour: C.river }),
  item('wc', 'paint-s', 'Wall paint, river green-blue', 'paint', 9.55, 1.616, 1.2, 0.008, 2.5, { rot: 180, colour: C.river }),
  item('wc', 'toilet', 'Wall-hung WC', 'toilet', 9.55, 0.28, 0.36, 0.54, 0.42),
  item('wc', 'basin', 'Round basin on an oak shelf', 'basin', 9.55, 1.45, 0.5, 0.3, 0.16, { rot: 180, z: 0.82 }),
  item('wc', 'print', 'Small Rhine photo', 'print', 9.55, 0.025, 0.3, 0.02, 0.4, { z: 1.35, art: 'river', accent: C.black }),
  item('wc', 'fern', 'Fern on the window sill', 'plant', 10.24, 1.07, 0.28, 0.28, 0.35, { z: 1.2, variant: 'fern', accent: C.white }),
];

const gardenTerrace: FurnitureItem[] = [
  item('garden-terrace', 'planter-1', 'Planter with grasses', 'planter', -2.7, 0.6, 0.9, 0.4, 0.5, { rot: 90, variant: 'grass' }),
  item('garden-terrace', 'planter-2', 'Planter with grasses', 'planter', -2.7, 5.1, 0.9, 0.4, 0.5, { rot: 90, variant: 'grass' }),
];

/* ---------------------------------------------------------------- first floor */

const zimmer1: FurnitureItem[] = [
  item('zimmer-1', 'bed', 'Bed, oak, 90 x 200 cm, blue-grey linen headboard', 'bed', 4.26, 5.2, 0.98, 2.12, 0.95, { rot: -90, colour: C.mist, accent: C.reed, variant: 'upholstered' }),
  item('zimmer-1', 'desk', 'Desk, oak, 120 cm', 'desk', 0.3, 4.12, 1.2, 0.6, 0.74, { rot: 90 }),
  item('zimmer-1', 'chair', 'Desk chair, oak', 'deskChair', 0.88, 4.12, 0.44, 0.48, 0.8, { rot: -90, colour: C.lake }),
  item('zimmer-1', 'desk-lamp', 'Desk lamp', 'tableLamp', 0.2, 3.7, 0.18, 0.18, 0.4, { z: 0.74, colour: C.mist, accent: C.lake }),
  item('zimmer-1', 'shelf', 'Low open shelves with toy baskets', 'shelf', 2.0, 3.13, 1.8, 0.35, 0.78, { variant: 'baskets', colour: C.lake }),
  item('zimmer-1', 'shelf-plant', 'Trailing plant', 'plant', 1.35, 3.13, 0.22, 0.22, 0.3, { z: 0.78, variant: 'trailing', accent: C.mist }),
  item('zimmer-1', 'wardrobe', 'Wardrobe, white with oak handles', 'wardrobe', 3.6, 3.25, 1.2, 0.6, 2.2, { colour: '#f1efea' }),
  item('zimmer-1', 'rug', 'Round play rug, lake blue-grey', 'rug', 2.3, 4.45, 1.6, 1.6, 0.015, { colour: C.lake, variant: 'round' }),
  item('zimmer-1', 'nook', 'Reading nook, floor cushions', 'floorCushions', 0.5, 5.32, 0.9, 0.62, 0.35, { colour: C.mist, accent: C.reed }),
  item('zimmer-1', 'print', 'Alpine lake print', 'print', 2.0, 2.965, 0.9, 0.03, 0.66, { z: 1.25, art: 'lake', accent: '#c8a97e' }),
  item('zimmer-1', 'mirror', 'Round mirror, like a still lake', 'mirror', 2.5, 5.685, 0.7, 0.03, 0.7, { rot: 180, z: 0.95 }),
  item('zimmer-1', 'pendant', 'Linen drum pendant', 'pendant', 2.4, 4.3, 0.5, 0.5, 0.25, { z: 2.05, variant: 'drum', colour: C.mist }),
];

const zimmer2: FurnitureItem[] = [
  item('zimmer-2', 'bed', 'Bed, oak, 90 x 200 cm, straw quilt', 'bed', 3.2, 0.51, 0.98, 2.12, 0.8, { rot: -90, colour: C.butter, accent: C.sage, variant: 'oak' }),
  ...[2.72, 3.22, 3.72].map((x, i) =>
    item('zimmer-2', `print-${i}`, 'Pressed-flower print', 'print', x, 0.015, 0.36, 0.02, 0.48, { z: 1.05, art: (['botanical1', 'botanical2', 'botanical3'] as const)[i], accent: '#c8a97e' }),
  ),
  item('zimmer-2', 'desk', 'Desk, oak, 120 cm', 'desk', 0.3, 1.56, 1.2, 0.6, 0.74, { rot: 90 }),
  item('zimmer-2', 'chair', 'Desk chair, oak with rattan seat', 'deskChair', 0.88, 1.56, 0.44, 0.48, 0.8, { rot: -90, colour: '#c9a76e', variant: 'rattan' }),
  item('zimmer-2', 'desk-lamp', 'Desk lamp', 'tableLamp', 0.2, 1.1, 0.18, 0.18, 0.4, { z: 0.74, colour: C.butter, accent: C.sage }),
  item('zimmer-2', 'wardrobe', 'Wardrobe, white with oak handles', 'wardrobe', 1.4, 2.49, 1.2, 0.6, 2.2, { rot: 180, colour: '#f1efea' }),
  item('zimmer-2', 'shelf', 'Open shelving, oak', 'shelf', 2.62, 2.6, 1.0, 0.35, 1.1, { rot: 180, variant: 'books', colour: C.poppy }),
  item('zimmer-2', 'rug', 'Wool rug, oat, 200 x 140 cm', 'rug', 2.0, 1.5, 2.0, 1.4, 0.015, { colour: C.oat }),
  item('zimmer-2', 'pendant', 'Rattan pendant', 'pendant', 2.0, 1.4, 0.5, 0.5, 0.32, { z: 2.0, variant: 'rattan', colour: '#c9a76e' }),
  item('zimmer-2', 'plant', 'Olive tree, small', 'plant', 0.3, 2.45, 0.36, 0.36, 1.0, { variant: 'olive', accent: C.straw }),
];

const zimmer3: FurnitureItem[] = [
  item('zimmer-3', 'slats', 'Birch slat wall', 'slats', 5.495, 4.33, 2.6, 0.03, 2.5, { rot: 90, colour: '#e6d9c3' }),
  item('zimmer-3', 'sofa-bed', 'Sofa bed, oat wool, opens to 140 cm', 'sofa', 5.96, 4.6, 1.9, 0.95, 0.8, { rot: 90, colour: C.oat, accent: C.charcoal, variant: 'wool' }),
  item('zimmer-3', 'desk', 'Desk, oak, 160 cm', 'desk', 9.85, 4.14, 1.6, 0.6, 0.74, { rot: -90 }),
  item('zimmer-3', 'chair', 'Office chair with a sheepskin', 'deskChair', 9.2, 4.14, 0.6, 0.6, 1.0, { rot: 90, colour: C.charcoal, variant: 'office' }),
  item('zimmer-3', 'desk-lamp', 'Desk lamp, black', 'tableLamp', 9.95, 4.75, 0.18, 0.18, 0.45, { z: 0.74, colour: C.white, accent: C.black }),
  item('zimmer-3', 'desk-plant', 'Small plant', 'plant', 9.95, 3.55, 0.18, 0.18, 0.3, { z: 0.74, variant: 'trailing', accent: C.white }),
  item('zimmer-3', 'wardrobe', 'Wardrobe, white, one section for guests', 'wardrobe', 7.6, 5.4, 2.0, 0.6, 2.3, { rot: 180, colour: '#f1efea' }),
  item('zimmer-3', 'rug', 'Thick wool rug, cream', 'rug', 7.6, 4.15, 2.0, 1.4, 0.02, { colour: '#efe9de' }),
  item('zimmer-3', 'floor-lamp', 'Floor lamp, black', 'floorLamp', 6.75, 4.86, 0.35, 0.35, 1.55, { colour: C.white }),
  item('zimmer-3', 'print', 'Birch forest print', 'print', 8.35, 2.965, 0.6, 0.03, 0.8, { z: 1.15, art: 'birch', accent: C.white }),
  item('zimmer-3', 'pendant', 'Paper pendant', 'pendant', 7.6, 4.15, 0.55, 0.55, 0.4, { z: 1.95, variant: 'paper', colour: '#f6f2ea' }),
];

const bathroom: FurnitureItem[] = [
  item('bathroom', 'ladder', 'Oak towel ladder, stone and moss towels', 'towels', 6.86, 1.56, 0.45, 0.1, 1.6, { rot: 90, colour: C.stone, accent: C.moss }),
  item('bathroom', 'mat', 'Bath mat, moss', 'rug', 8.6, 1.85, 0.8, 0.5, 0.012, { colour: C.moss }),
  item('bathroom', 'stool', 'Oak stool', 'stool', 8.24, 0.4, 0.32, 0.32, 0.45),
  item('bathroom', 'fern', 'Fern', 'plant', 9.95, 1.2, 0.32, 0.32, 0.7, { variant: 'fern', accent: C.white }),
];

/* ---------------------------------------------------------------- top floor */

const bedroom: FurnitureItem[] = [
  item('bedroom', 'mural', 'Forest-in-fog mural', 'mural', 6.255, 5.695, 3.67, 0.01, 2.5, { rot: 180, art: 'forestMist' }),
  item('bedroom', 'bed', 'Bed, brushed oak, 180 x 200 cm, oak headboard', 'bed', 6.69, 4.625, 1.9, 2.15, 1.05, { rot: 180, colour: C.bark, accent: C.moss, variant: 'oak' }),
  ...[5.51, 7.865].flatMap((x, i) => [
    item('bedroom', `bedside-${i}`, 'Bedside table, oak', 'bedsideTable', x, 5.48, 0.45, 0.4, 0.5, { rot: 180 }),
    item('bedroom', `lamp-${i}`, 'Paper table lamp', 'tableLamp', x, 5.5, 0.3, 0.3, 0.45, { z: 0.5, colour: '#f6f1e6', accent: C.bark, variant: 'paper' }),
  ]),
  // L-shaped wardrobe, 30 cm deep: along the street wall from the glass door to the corner,
  // then along the bed wall until the bedside table, 60 cm from the street wall.
  item('bedroom', 'wardrobe', 'Wardrobe, oak, 30 cm deep', 'wardrobe', 8.54, 4.75, 1.3, 0.3, 2.3, { rot: -90, variant: 'oak' }),
  item('bedroom', 'wardrobe-corner', 'Wardrobe, oak, 30 cm deep, corner leg', 'wardrobe', 8.39, 5.55, 0.6, 0.3, 2.3, { rot: 180, variant: 'oak' }),
  item('bedroom', 'dresser', 'Chest of drawers, oak, 120 cm', 'dresser', 6.14, 2.64, 1.2, 0.45, 0.8),
  item('bedroom', 'dresser-vase', 'Stoneware vase with fern fronds', 'vase', 5.75, 2.62, 0.14, 0.14, 0.35, { z: 0.8, colour: C.mushroom, variant: 'sprigs' }),
  item('bedroom', 'rug', 'Wool rug, mushroom', 'rug', 6.69, 4.05, 2.6, 1.9, 0.015, { colour: C.mushroom }),
  item('bedroom', 'curtain', 'Heavy linen curtain, moss', 'curtain', 4.5, 5.4, 0.55, 0.12, 2.45, { rot: 90, colour: C.moss }),
  item('bedroom', 'curtain-2', 'Heavy linen curtain, moss', 'curtain', 8.6, 2.6, 0.38, 0.12, 2.45, { rot: -90, colour: C.moss }),
  item('bedroom', 'fern', 'Large fern', 'plant', 4.75, 4.55, 0.55, 0.55, 1.3, { variant: 'fern', accent: C.bark }),
  item('bedroom', 'print', 'Forest print', 'print', 6.14, 2.425, 0.7, 0.03, 0.9, { z: 1.15, art: 'forest', accent: '#c8a97e' }),
  item('bedroom', 'pendant', 'Wood veneer pendant', 'pendant', 6.69, 3.6, 0.45, 0.45, 0.35, { z: 2.0, variant: 'veneer', colour: '#d9b98c' }),
];

const ensuite: FurnitureItem[] = [
  item('ensuite', 'mat', 'Bath mat, moss', 'rug', 7.3, 0.85, 0.6, 0.4, 0.012, { colour: C.moss }),
  item('ensuite', 'stool', 'Oak stool in the shower', 'stool', 8.45, 0.35, 0.3, 0.3, 0.45),
  item('ensuite', 'towels', 'Towel rail, moss towels', 'towels', 7.0, 2.27, 0.5, 0.08, 1.2, { rot: 180, z: 0.5, colour: C.moss, accent: C.mushroom, variant: 'rail' }),
  item('ensuite', 'fern', 'Small fern', 'plant', 7.45, 0.25, 0.18, 0.18, 0.25, { z: 0.87, variant: 'fern', accent: C.white }),
];

const roofTerrace: FurnitureItem[] = [
  ...[0.9, 2.85, 4.8].map((y, i) =>
    item('roof-terrace', `planter-${i}`, i === 1 ? 'Planter with birch and ferns' : 'Planter with mountain pine', 'planter', 0.05, y, 1.6, 0.45, 0.55, { rot: 90, variant: i === 1 ? 'birch' : 'pine' }),
  ),
  item('roof-terrace', 'lounger-1', 'Teak lounger', 'lounger', 2.2, 1.0, 0.65, 1.9, 0.4, { rot: -90, colour: C.oat }),
  item('roof-terrace', 'lounger-2', 'Teak lounger', 'lounger', 2.2, 2.0, 0.65, 1.9, 0.4, { rot: -90, colour: C.oat }),
  item('roof-terrace', 'table', 'Small round teak table', 'sideTable', 3.4, 1.5, 0.45, 0.45, 0.45, { variant: 'teak' }),
  item('roof-terrace', 'sauna', 'Two-person cabin sauna, black frame, glass front, dark wood inside', 'sauna', 1.2, 4.8, 1.25, 1.05, 1.95, { rot: 90 }),
  item('roof-terrace', 'ice-bath', 'Ice bath, teak tub, 100 cm', 'iceBath', 2.75, 5.05, 1.0, 1.0, 0.9),
];

/* ---------------------------------------------------------------- basement */

const basement: FurnitureItem[] = [
  item('bastelraum-1', 'paint', 'Wall paint, terracotta', 'paint', 2.016, 4.425, 2.55, 0.008, 2.5, { rot: -90, colour: C.terracotta }),
  item('bastelraum-1', 'sofa-bed', 'Sofa bed, oat linen', 'sofa', -1.0, 5.22, 2.0, 0.95, 0.8, { rot: 180, colour: C.oat, accent: C.terracotta, variant: 'linen' }),
  item('bastelraum-1', 'desk', 'Desk, oak, 140 cm', 'desk', -3.03, 4.35, 1.4, 0.6, 0.74, { rot: 90 }),
  item('bastelraum-1', 'chair', 'Desk chair, oak', 'deskChair', -2.45, 4.35, 0.44, 0.48, 0.8, { rot: -90, colour: C.clay }),
  item('bastelraum-1', 'lamp', 'Ceramic lamp', 'tableLamp', -3.15, 4.85, 0.24, 0.24, 0.42, { z: 0.74, colour: C.linen, accent: C.terracotta }),
  item('bastelraum-1', 'rug', 'Jute rug', 'rug', -0.6, 4.3, 2.4, 1.6, 0.015, { colour: '#b9a17c' }),
  item('bastelraum-1', 'plant', 'Snake plant in clay', 'plant', 1.7, 5.4, 0.35, 0.35, 0.8, { variant: 'snake', accent: C.terracotta }),
  item('bastelraum-2', 'workbench', 'Workbench, solid oak, 200 cm', 'workbench', 0.0, 0.38, 2.0, 0.7, 0.9),
  item('bastelraum-2', 'pegboard', 'Oak pegboard with tools', 'pegboard', 0.0, 0.012, 2.0, 0.02, 1.0, { z: 1.1 }),
  item('bastelraum-2', 'print', 'Cliff photograph', 'print', -2.2, 0.02, 1.4, 0.03, 0.95, { z: 1.1, art: 'mountain', accent: C.black }),
  ...[-0.6, 0.6].map((x, i) => item('bastelraum-2', `pendant-${i}`, 'Black industrial pendant', 'pendant', x, 0.6, 0.35, 0.35, 0.25, { z: 1.85, variant: 'metal', colour: C.black })),
  item('laundry', 'washer', 'Washing machine', 'washer', 2.6, 5.38, 0.6, 0.62, 0.85, { rot: 180 }),
  item('laundry', 'dryer', 'Tumble dryer', 'washer', 3.25, 5.38, 0.6, 0.62, 0.85, { rot: 180, variant: 'dryer' }),
  item('laundry', 'rack', 'Wooden drying rack', 'dryingRack', 3.0, 4.0, 1.0, 0.55, 1.0),
];

export const furnitureByFloor: Record<string, FurnitureItem[]> = {
  basement,
  main: [...mainFloor, ...kitchenItems, ...entrance, ...wc, ...gardenTerrace],
  first: [...zimmer1, ...zimmer2, ...zimmer3, ...bathroom],
  top: [...bedroom, ...ensuite, ...roofTerrace],
};

export const proposalFor = (roomId: string) => proposals.find((p) => p.room === roomId);
