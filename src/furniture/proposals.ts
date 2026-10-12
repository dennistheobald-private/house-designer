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
  turquoise: '#a9d6cf',
  denim: '#8f9aa5',
  fox: '#c8743f',
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
    view: { x: 6.1, y: 5.2, facing: -2.26 },
    theme: 'Mountains',
    palette: [
      { name: 'Grey-blue', hex: C.denim },
      { name: 'Granite', hex: C.granite },
      { name: 'Snow', hex: C.snow },
      { name: 'Pine', hex: C.pine },
    ],
    summary:
      "Dennis's grey-blue corner sofa with its chaise on the right, a light oak organic coffee table on a greige shaggy rug, a birch bentwood armchair, a black arc lamp, a tall dracaena in a yellow pot, and an oak table for six under a cloud-like linen pendant.",
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
    summary: 'A full-height matt white wardrobe, an oak bench with a pebble-grey cushion, an oak chest of drawers under a round mirror on the kitchen wall, pebble hooks, a long wool runner and a photo of the Rhine facing the front door.',
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
    theme: 'Woodland animals',
    palette: [
      { name: 'Fox', hex: C.fox },
      { name: 'Moss', hex: C.moss },
      { name: 'Oat', hex: C.oat },
      { name: 'Birch', hex: C.birch },
    ],
    summary: 'A woodland mural of a deer, foxes, hares and an owl behind an oak bed with a teddy, fox, owl and deer prints over low shelves with baskets, an oak desk under the garden window, a moss play rug and a cotton play tipi with a plush fox.',
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
    summary: 'A modular oak wall bed for guests, 140 x 200 cm, with a shelf module beside it (double-click it to fold it down), and at the street window a white standing desk with two 27 inch screens, a Logitech MX Keys keyboard and MX Master mouse, and a blue HÅG Capisco saddle chair.',
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
    summary: "Dennis's beige stone-look tile on the floor and walls, a walk-in shower with an LED-lit niche, a rose gold rain shower and bath mixer, a walnut vanity with a Villeroy & Boch Loop & Friends basin under a built-in mirror cabinet, and a Laufen Pro WC; oak towel ladder, moss bath mat and a fern.",
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
      'A misty spruce-forest mural on the wall behind a 160 cm oak bed set towards the window with an oak headboard, bark linen and a moss wool throw, oak bedside tables with paper lamps, an L-shaped oak wardrobe in the street-side corner, 30 cm deep on the side wall and 60 cm deep on the bed wall, an oak chest of drawers between the stair and bathroom doors, and heavy linen curtains.',
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
    summary: "In the style of the first-floor bathroom: Dennis's beige tile on the floor, the whole vanity and shower wall and the WC pre-wall up to 1.2 m, a walnut vanity with a Loop & Friends basin and a tall rose gold mixer under a hanging mirror, a Laufen Pro WC; a moss mat and a fern.",
  },
  {
    room: 'roof-terrace',
    theme: 'Forest edge',
    palette: [
      { name: 'Pine', hex: C.pine },
      { name: 'Teak', hex: '#9a6b47' },
    ],
    view: { x: 3.7, y: 1.3, facing: 2.3 },
    summary: 'A barrel sauna in thermowood with black end rings in the corner, with the pine planter behind it, and the teak ice bath beside it; planters of mountain pine and birch along the edge, and a lounge of an outdoor sofa, two lounge chairs and a teak coffee table.',
  },
  {
    room: 'street-terrace',
    theme: 'Forest edge',
    palette: [
      { name: 'Pine', hex: C.pine },
      { name: 'Clay', hex: C.clay },
    ],
    summary: 'A planter of mountain pine and one of grasses along the parapet, and an olive tree in a clay pot beside the glass door.',
  },
  {
    room: 'bastelraum-1',
    theme: 'Forest calm',
    palette: [
      { name: 'Oak', hex: '#c8a97e' },
      { name: 'Oat bouclé', hex: '#d9d2c4' },
      { name: 'Moss', hex: '#8e9a6c' },
      { name: 'Pine', hex: C.pine },
    ],
    summary: 'A calm forest room: a misty forest mural on the end wall, oak panelling, the oak lounging nook along the window wall with built-in books (also the guest bed), a moss rug, warm low light, speakers in the corners and one closed oak closet of storage boxes.',
  },
  {
    room: 'bastelraum-2',
    theme: 'Energy',
    palette: [
      { name: 'Burnt orange', hex: '#c85a2a' },
      { name: 'Charcoal', hex: '#34373b' },
      { name: 'Rubber black', hex: '#2e3032' },
      { name: 'Oak', hex: '#c8a97e' },
    ],
    summary: 'Energy: charcoal walls with a burnt-orange wall, a rubber floor and bright ceiling spots. A road bike on a smart trainer facing a 43-inch screen on the back of the pantry shelves, a deadlift platform with a loaded bar, a black jump box, farmer handles, wall balls with a target at 2 m, and a pull-up bar.',
  },
  {
    room: 'storage',
    theme: 'Mountain hut store',
    palette: [
      { name: 'White', hex: '#f4f3ef' },
      { name: 'Birch ply', hex: '#e2cfa8' },
      { name: 'Light grey', hex: C.pale },
    ],
    summary: 'Open to the gym, with open white pantry shelves for dry food as the divider. Four bikes hang on Steadyrack wall mounts, each free to take down; open shelving with storage boxes and the ski rack.',
  },
  {
    room: 'laundry',
    theme: 'Rain',
    palette: [
      { name: 'White', hex: '#f7f7f4' },
      { name: 'Light grey', hex: C.pale },
    ],
    summary: 'A washing machine with the dryer stacked on top, a utility sink by the door, and washing lines across the room overhead.',
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

/** The stairwell: vertical oak slats on its back wall and a gallery of mountain photos on its side wall, on every floor. */
const stairWall = (room: string, floor: string, side: number, gallery = true, slatHeight = 2.83): FurnitureItem[] => [
  // Floor to floor, so the slats run on past each slab without a break; on the top floor they stop at the ceiling.
  item(room, `${floor}-stair-slats`, 'Vertical oak slats on the stair wall', 'slats', 5.545, 0.015, 2.25, 0.03, slatHeight, { variant: 'oak' }),
  ...(gallery
    ? ([
        [1.35, 1.0, 0.5, 0.65, 'mountain'],
        [1.4, 1.8, 0.4, 0.5, 'lake'],
        [0.8, 1.6, 0.55, 0.7, 'river'],
        [0.3, 1.75, 0.45, 0.6, 'forestMist'],
      ] as const).map(([y, z, w, h, art], i) =>
        item(room, `${floor}-stair-photo-${i}`, 'Mountain photo, oak frame', 'print', side - 0.015, y, w, 0.03, h, { rot: -90, z, art, accent: '#c8a97e' }),
      )
    : []),
];

const mainFloor: FurnitureItem[] = [
  ...stairWall('living', 'main', 6.67),
  // Lounge, by the garden doors
  // Dennis's own sofa: grey-blue melange, tall back cushions, the chaise on the right as you face it.
  living('sofa', 'Corner sofa, grey-blue melange weave, 270 x 165 cm, chaise on the right', 'sofa', 2.15, 0.85, 2.7, 1.65, 1.0, { colour: C.denim, variant: 'recliner', chaise: 'right' }),
  living('rug', 'Shaggy rug, greige, 300 x 200 cm', 'rug', 2.2, 1.95, 3.0, 2.0, 0.035, { colour: '#d8cdbc', variant: 'shaggy' }),
  living('coffee', 'Organic coffee table, light oak on three legs, 85 x 75 cm', 'coffeeTable', 1.55, 1.75, 0.85, 0.75, 0.42, { variant: 'organic' }),
  living('bowl', 'Stoneware bowl', 'bowl', 1.45, 1.7, 0.26, 0.26, 0.08, { z: 0.42, colour: C.charcoal }),
  living('books', 'Mountain books', 'books', 1.75, 1.85, 0.3, 0.22, 0.08, { z: 0.42, rot: 20 }),
  living('lounge-chair', 'Bentwood armchair, birch with a cream cushion', 'loungeChair', 0.75, 2.75, 0.68, 0.82, 1.0, { rot: 135, colour: C.snow, variant: 'bentwood' }),
  living('arc-lamp', 'Arc floor lamp, black with an LED strip', 'floorLamp', 0.42, 0.42, 0.36, 0.36, 2.05, { rot: 45, variant: 'arc' }),
  living('dracaena', 'Dracaena, 2 m, in a yellow pot', 'plant', 3.85, 0.42, 0.56, 0.56, 2.0, { variant: 'dracaena', accent: '#e7b52f' }),
  // The door at the top of the basement flight, beside the stair wall.
  living('basement-door', 'Door to the basement stair, warm grey, 93 x 208 cm', 'door', 4.935, 1.82, 1.03, 0.1, 2.48, { colour: '#8c8378', accent: '#2a2a2a' }),
  living('olive', 'Olive tree in a clay pot', 'plant', 0.45, 5.15, 0.6, 0.6, 1.9, { variant: 'olive', accent: C.clay }),
  living('lowboard', 'Lowboard, oak, 200 cm', 'lowboard', 2.2, 5.48, 2.0, 0.42, 0.48, { rot: 180 }),
  living('tv', 'Television, 65 inch', 'tv', 2.2, 5.675, 1.45, 0.04, 0.84, { rot: 180, z: 0.82 }),
  living('vase', 'Vase with dried grasses', 'vase', 1.55, 5.5, 0.18, 0.18, 0.55, { z: 0.48, colour: C.stone }),
  living('pine-bonsai', 'Mountain pine bonsai', 'plant', 2.95, 5.5, 0.32, 0.32, 0.38, { z: 0.48, variant: 'bonsai', accent: C.charcoal }),
  // Dining, between the TV unit and the kitchen with a clear way past it to the kitchen: an oak table on a steel
  // pedestal and six black cantilever chairs, as Dennis's photos show.
  living('table', 'Dining table, oak on a steel pedestal, 100 x 200 cm', 'diningTable', 4.6, 4.15, 1.0, 2.0, 0.75, { variant: 'steel' }),
  ...[3.5, 4.15, 4.8].flatMap((y, i) => [
    living(`chair-w${i}`, 'Chair, black with steel frame', 'diningChair', 3.8, y, 0.56, 0.58, 0.82, { rot: 90, variant: 'cantilever' }),
    living(`chair-e${i}`, 'Chair, black with steel frame', 'diningChair', 5.4, y, 0.56, 0.58, 0.82, { rot: -90, variant: 'cantilever' }),
  ]),
  living('pendant', 'Cloud pendant, linen', 'pendant', 4.6, 4.15, 1.0, 0.55, 0.32, { z: 1.62, variant: 'cloud', colour: C.linen }),
  living('table-vase', 'Stoneware jug with pine sprigs', 'vase', 4.6, 4.15, 0.14, 0.14, 0.4, { z: 0.75, colour: C.snow, variant: 'sprigs' }),
];

const kitchenItems: FurnitureItem[] = [
  item('kitchen', 'herbs', 'Herbs in terracotta pots', 'herbs', 9.98, 3.7, 0.5, 0.15, 0.28, { rot: -90, z: 0.93 }),
  item('kitchen', 'boards', 'Oak chopping boards', 'boards', 7.3, 5.6, 0.6, 0.06, 0.45, { rot: 180, z: 0.93 }),
  item('kitchen', 'bowl', 'Stoneware fruit bowl', 'bowl', 7.4, 5.3, 0.3, 0.3, 0.1, { z: 0.93, colour: C.sage, variant: 'fruit' }),
  // Dennis's coffee corner: a light blue Profitec Go and a black Eureka Mignon Specialità.
  item('kitchen', 'espresso', 'Espresso machine, Profitec Go, light blue', 'espresso', 9.4, 5.43, 0.25, 0.4, 0.36, { rot: 180, z: 0.93 }),
  item('kitchen', 'grinder', 'Coffee grinder, Eureka Mignon Specialità, matt black', 'grinder', 9.85, 5.47, 0.13, 0.2, 0.35, { rot: 180, z: 0.93 }),
  item('kitchen', 'blind', 'Roller blind, sage linen', 'blind', 10.14, 4.28, 1.55, 0.04, 0.35, { rot: -90, z: 2.07, colour: C.sage }),
];

const entrance: FurnitureItem[] = [
  item('entrance', 'wardrobe', 'Built-in wardrobe, matt white, full height', 'wardrobe', 7.81, 0.31, 1.98, 0.6, 2.48, { colour: '#f1efea', variant: 'flush' }),
  item('entrance', 'bench', 'Bench, oak, with a pebble-grey cushion', 'bench', 7.03, 1.2, 1.0, 0.38, 0.46, { rot: 90, accent: C.pebble }),
  item('entrance', 'dresser', 'Chest of drawers, oak, 100 cm', 'dresser', 7.95, 2.59, 1.0, 0.4, 0.85, { rot: 180 }),
  item('entrance', 'mirror', 'Round mirror, oak rim, 70 cm', 'mirror', 7.95, 2.775, 0.7, 0.03, 0.7, { rot: 180, z: 1.15 }),
  item('entrance', 'dresser-vase', 'Stoneware vase with dried grasses', 'vase', 7.62, 2.6, 0.16, 0.16, 0.5, { z: 0.85, colour: C.stone }),
  item('entrance', 'dresser-bowl', 'Stoneware key bowl', 'bowl', 8.28, 2.6, 0.22, 0.22, 0.06, { z: 0.85, colour: C.pebble }),
  item('entrance', 'hooks', 'Pebble wall hooks', 'hooks', 7.0, 2.775, 0.9, 0.05, 0.1, { rot: 180, z: 1.65, colour: C.pebble }),
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
  // A black aluminium pergola with a louvred roof over the whole terrace, after Dennis's photo, resting on the facade.
  item('garden-terrace', 'pergola', 'Pergola, black aluminium, louvred roof, 570 x 260 cm, 260 cm high', 'pergola', -1.65, 2.85, 5.7, 2.6, 2.6, { rot: -90 }),
  item('garden-terrace', 'dining', 'Garden dining set: teak table 180 x 90 cm, six rope chairs; double-click to cover it for winter', 'gardenSet', -1.85, 1.3, 1.9, 1.9, 0.9, { rot: 90 }),
  item('garden-terrace', 'planter-2', 'Planter with grasses', 'planter', -2.6, 4.95, 0.9, 0.4, 0.5, { rot: 90, variant: 'grass' }),
];

/* ---------------------------------------------------------------- first floor */

const zimmer1: FurnitureItem[] = [
  item('zimmer-1', 'mural', 'Woodland mural: a deer, foxes, hares and an owl', 'mural', 2.66, 5.695, 5.3, 0.01, 2.5, { rot: 180, art: 'animals' }),
  item('zimmer-1', 'bed', 'Bed, oak, 90 x 200 cm', 'bed', 4.26, 5.2, 0.98, 2.12, 0.95, { rot: -90, colour: C.linen, accent: C.fox, variant: 'oak' }),
  item('zimmer-1', 'teddy', 'Teddy bear', 'plush', 4.95, 5.45, 0.3, 0.25, 0.32, { rot: -90, z: 0.52 }),
  item('zimmer-1', 'desk', 'Desk, oak, 120 cm', 'desk', 0.3, 4.12, 1.2, 0.6, 0.74, { rot: 90 }),
  item('zimmer-1', 'chair', 'Desk chair, oak', 'deskChair', 0.88, 4.12, 0.44, 0.48, 0.8, { rot: -90, colour: C.moss }),
  item('zimmer-1', 'desk-lamp', 'Desk lamp', 'tableLamp', 0.2, 3.7, 0.18, 0.18, 0.4, { z: 0.74, colour: C.mist, accent: C.fox }),
  item('zimmer-1', 'shelf', 'Low open shelves with toy baskets', 'shelf', 2.0, 3.13, 1.8, 0.35, 0.78, { variant: 'baskets', colour: C.fox }),
  item('zimmer-1', 'shelf-bear', 'Small plush bear', 'plush', 1.35, 3.13, 0.2, 0.18, 0.22, { z: 0.78, variant: 'bear' }),
  ...(['fox', 'owl', 'deer'] as const).map((art, i) =>
    item('zimmer-1', `print-${art}`, `${art[0].toUpperCase()}${art.slice(1)} print`, 'print', 1.5 + i * 0.5, 2.965, 0.36, 0.03, 0.48, { z: 1.2, art, accent: '#c8a97e' }),
  ),
  item('zimmer-1', 'wardrobe', 'Wardrobe, white with oak handles', 'wardrobe', 3.6, 3.25, 1.2, 0.6, 2.2, { colour: '#f1efea' }),
  item('zimmer-1', 'rug', 'Round play rug, moss green', 'rug', 2.4, 4.45, 1.6, 1.6, 0.015, { colour: '#8e9a6c', variant: 'round' }),
  item('zimmer-1', 'tipi', 'Play tipi, natural cotton on birch poles', 'tipi', 1.2, 5.1, 1.1, 1.1, 1.6, { rot: 90 }),
  item('zimmer-1', 'plush-fox', 'Plush fox', 'plush', 2.05, 5.35, 0.3, 0.3, 0.3, { rot: -60, variant: 'fox' }),
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
  // A modular wall bed on the wall to Zimmer 1, clear of the door; folded down it reaches 2.05 m into the room.
  item('zimmer-3', 'wall-bed', 'Wall bed, oak, 140 x 200 cm, with a shelf module (double-click to open)', 'wallBed', 5.705, 4.76, 1.86, 0.45, 2.35, { rot: 90 }),
  item('zimmer-3', 'desk', 'Standing desk, white, 160 x 70 cm, 65 to 130 cm high', 'desk', 9.79, 4.14, 1.6, 0.7, 0.75, { rot: -90, variant: 'standing' }),
  item('zimmer-3', 'screen-1', 'Monitor, 27 inch', 'monitor', 10.0, 3.83, 0.615, 0.2, 0.52, { rot: -75, z: 0.75 }),
  item('zimmer-3', 'screen-2', 'Monitor, 27 inch', 'monitor', 10.0, 4.45, 0.615, 0.2, 0.52, { rot: -105, z: 0.75 }),
  item('zimmer-3', 'keyboard', 'Logitech MX Keys keyboard', 'keyboard', 9.66, 4.1, 0.43, 0.13, 0.02, { rot: -90, z: 0.754 }),
  item('zimmer-3', 'mouse', 'Logitech MX Master mouse', 'mouse', 9.66, 4.5, 0.085, 0.125, 0.05, { rot: -90, z: 0.754 }),
  item('zimmer-3', 'chair', 'HÅG Capisco saddle chair, blue', 'deskChair', 9.05, 4.14, 0.66, 0.66, 1.05, { rot: 90, colour: '#1f4e79', variant: 'capisco' }),
  item('zimmer-3', 'desk-plant', 'Small plant', 'plant', 10.0, 3.42, 0.18, 0.18, 0.3, { z: 0.75, variant: 'trailing', accent: C.white }),
  item('zimmer-3', 'rug', 'Thick wool rug, cream', 'rug', 7.4, 4.3, 2.2, 1.6, 0.02, { colour: '#efe9de' }),
  item('zimmer-3', 'print', 'Birch forest print', 'print', 8.35, 2.965, 0.6, 0.03, 0.8, { z: 1.15, art: 'birch', accent: C.white }),
  item('zimmer-3', 'pendant', 'Paper pendant', 'pendant', 7.6, 4.15, 0.55, 0.55, 0.4, { z: 1.95, variant: 'paper', colour: '#f6f2ea' }),
];

const bathroom: FurnitureItem[] = [
  item('bathroom', 'ladder', 'Oak towel ladder, stone and moss towels', 'towels', 6.86, 1.56, 0.45, 0.1, 1.6, { rot: 90, colour: C.stone, accent: C.moss }),
  item('bathroom', 'mat', 'Bath mat, moss', 'rug', 8.6, 1.85, 0.8, 0.5, 0.012, { colour: C.moss }),
  item('bathroom', 'fern', 'Fern', 'plant', 9.95, 1.2, 0.32, 0.32, 0.7, { variant: 'fern', accent: C.white }),
  item('bathroom', 'mirror-cabinet', 'Mirror cabinet, three doors, white inside', 'mirrorCabinet', 8.55, 2.702, 1.4, 0.14, 0.78, { rot: 180, z: 1.31 }),
];

/* ---------------------------------------------------------------- top floor */

const bedroom: FurnitureItem[] = [
  item('bedroom', 'mural', 'Forest-in-fog mural', 'mural', 5.81, 5.695, 2.78, 0.01, 2.5, { rot: 180, art: 'forestMist' }),
  item('bedroom', 'bed', 'Bed, brushed oak, 160 x 200 cm, oak headboard', 'bed', 5.88, 4.625, 1.7, 2.15, 1.05, { rot: 180, colour: C.bark, accent: C.moss, variant: 'oak' }),
  ...[4.8, 6.96].flatMap((x, i) => [
    item('bedroom', `bedside-${i}`, 'Bedside table, oak', 'bedsideTable', x, 5.48, 0.45, 0.4, 0.5, { rot: 180 }),
    item('bedroom', `lamp-${i}`, 'Paper table lamp', 'tableLamp', x, 5.5, 0.3, 0.3, 0.45, { z: 0.5, colour: '#f6f1e6', accent: C.bark, variant: 'paper' }),
  ]),
  // L-shaped wardrobe: 30 cm deep along the street wall from the glass door, then a full
  // 60 cm deep run along the bed wall from the corner to the bedside table.
  item('bedroom', 'wardrobe', 'Wardrobe, oak, 30 cm deep', 'wardrobe', 8.54, 4.6, 1.0, 0.3, 2.3, { rot: -90, variant: 'oak' }),
  item('bedroom', 'wardrobe-corner', 'Wardrobe, oak, 60 cm deep', 'wardrobe', 7.945, 5.4, 1.49, 0.6, 2.3, { rot: 180, variant: 'oak' }),
  item('bedroom', 'dresser', 'Chest of drawers, oak, 120 cm', 'dresser', 6.14, 2.64, 1.2, 0.45, 0.8),
  item('bedroom', 'dresser-vase', 'Stoneware vase with fern fronds', 'vase', 5.75, 2.62, 0.14, 0.14, 0.35, { z: 0.8, colour: C.mushroom, variant: 'sprigs' }),
  item('bedroom', 'rug', 'Wool rug, mushroom', 'rug', 5.95, 4.05, 2.6, 1.9, 0.015, { colour: C.mushroom }),
  item('bedroom', 'curtain', 'Heavy linen curtain, moss', 'curtain', 4.5, 5.4, 0.55, 0.12, 2.45, { rot: 90, colour: C.moss }),
  item('bedroom', 'curtain-2', 'Heavy linen curtain, moss', 'curtain', 8.6, 2.6, 0.38, 0.12, 2.45, { rot: -90, colour: C.moss }),
  item('bedroom', 'print', 'Forest print', 'print', 6.14, 2.425, 0.7, 0.03, 0.9, { z: 1.15, art: 'forest', accent: '#c8a97e' }),
  item('bedroom', 'pendant', 'Wood veneer pendant', 'pendant', 5.88, 3.6, 0.45, 0.45, 0.35, { z: 2.0, variant: 'veneer', colour: '#d9b98c' }),
];

const ensuite: FurnitureItem[] = [
  item('ensuite', 'mat', 'Bath mat, moss', 'rug', 7.3, 0.85, 0.6, 0.4, 0.012, { colour: C.moss }),
  item('ensuite', 'fern', 'Small fern', 'plant', 8.55, 2.21, 0.18, 0.18, 0.25, { z: 1.23, variant: 'fern', accent: C.white }),
];

const roofTerrace: FurnitureItem[] = [
  // Grey-oak slat fences along both party lines, screening the terrace from the neighbours' terraces.
  item('roof-terrace', 'fence-north', 'Privacy fence, grey oak slats, 180 cm', 'fence', 1.935, 0.03, 4.27, 0.06, 1.8),
  item('roof-terrace', 'fence-south', 'Privacy fence, grey oak slats, 180 cm', 'fence', 1.935, 5.67, 4.27, 0.06, 1.8, { rot: 180 }),
  ...[0.9, 2.85, 4.8].map((y, i) =>
    item('roof-terrace', `planter-${i}`, i === 1 ? 'Planter with birch and ferns' : 'Planter with mountain pine', 'planter', 0.05, y, 1.6, 0.45, 0.55, { rot: 90, variant: i === 1 ? 'birch' : 'pine' }),
  ),
  // The barrel sauna in the corner, its back to the pine planter and its door towards the house.
  item('roof-terrace', 'sauna', 'Barrel sauna, thermowood with black end rings, 190 cm across, 200 cm long', 'sauna', 1.35, 4.7, 1.9, 2.0, 2.0, { rot: 90, variant: 'barrel' }),
  item('roof-terrace', 'ice-bath', 'Ice bath, teak tub, 100 cm', 'iceBath', 2.95, 5.15, 1.0, 1.0, 0.9),
  // Lounge at the north end
  item('roof-terrace', 'lounge-sofa', 'Outdoor sofa, teak with oat cushions, 200 cm', 'sofa', 1.6, 0.48, 2.0, 0.85, 0.75, { colour: '#d8d0c0', accent: C.pine, variant: 'linen' }),
  item('roof-terrace', 'lounge-chair-1', 'Outdoor lounge chair, teak with oat cushions', 'loungeChair', 0.95, 2.4, 0.76, 0.82, 0.78, { rot: 160, colour: '#d8d0c0' }),
  item('roof-terrace', 'lounge-chair-2', 'Outdoor lounge chair, teak with oat cushions', 'loungeChair', 2.3, 2.4, 0.76, 0.82, 0.78, { rot: -160, colour: '#d8d0c0' }),
  item('roof-terrace', 'lounge-table', 'Coffee table, teak, 90 x 60 cm', 'diningTable', 1.6, 1.5, 0.9, 0.6, 0.4, { variant: 'teak' }),
];

const streetTerrace: FurnitureItem[] = [
  item('street-terrace', 'planter-pine', 'Planter with mountain pine', 'planter', 10.0, 0.95, 1.4, 0.4, 0.55, { rot: 90, variant: 'pine' }),
  item('street-terrace', 'planter-grass', 'Planter with grasses', 'planter', 10.0, 4.9, 1.4, 0.4, 0.55, { rot: 90, variant: 'grass' }),
  item('street-terrace', 'olive', 'Olive tree in a clay pot', 'plant', 9.45, 2.35, 0.5, 0.5, 1.5, { variant: 'olive', accent: C.clay }),
];

const frontGarden: FurnitureItem[] = [
  item('front-garden', 'tree', 'Small garden tree', 'plant', 11.7, 0.95, 0.5, 0.5, 3.6, { variant: 'tree' }),
  // After Dennis's photo: shrubs under the tree, pampas grass by the street, a canopy over the door.
  item('front-garden', 'shrub-1', 'Shrubs', 'plant', 11.0, 0.45, 0.8, 0.8, 0.9, { variant: 'shrub' }),
  item('front-garden', 'shrub-2', 'Shrubs', 'plant', 11.05, 1.4, 0.65, 0.65, 0.75, { variant: 'shrub' }),
  item('front-garden', 'pampas-1', 'Pampas grass', 'plant', 12.4, 0.4, 0.7, 0.7, 1.7, { variant: 'pampas' }),
  item('front-garden', 'pampas-2', 'Pampas grass', 'plant', 12.45, 1.3, 0.6, 0.6, 1.5, { variant: 'pampas' }),
  item('entrance', 'front-door', 'Front door, anthracite, 94 x 220 cm', 'door', 10.4, 2.44, 0.94, 0.1, 2.2, { rot: 90, variant: 'front', colour: '#55585a' }),
  item('front-path', 'canopy', 'Door canopy, anthracite, 140 x 90 cm', 'canopy', 10.95, 2.44, 1.4, 0.9, 0.1, { rot: 90, z: 2.32 }),
  item('front-path', 'doormat', 'Doormat, dark grey', 'rug', 10.85, 2.44, 0.9, 0.6, 0.015, { rot: 90, colour: '#333331' }),
  item('front-path', 'kerb', 'Stone kerb along the lawn', 'kerb', 11.69, 1.94, 2.38, 0.08, 0.06),
  item('front-path', 'mailbox', 'Letterbox on a post, grey', 'mailbox', 12.6, 2.2, 0.36, 0.28, 1.15, { rot: 90 }),
  // Three squared steel hoops at right angles to the facade, under the big window beside the door, as on the renderings.
  ...[3.75, 4.2, 4.65].map((y, i) => item('front-path', `bike-rack-${i + 1}`, 'Bike stand, anthracite steel, 75 x 80 cm', 'bikeRack', 11.0, y, 0.75, 0.05, 0.8, { variant: 'square' })),
];

/* ---------------------------------------------------------------- basement */

const basement: FurnitureItem[] = [
  // Reading room: a built-in oak nook between built-in bookcases along the south wall.
  // Reading room: the lounging nook along the window wall, its bookcase built into one end and a shelf over the top.
  item('bastelraum-1', 'nook', 'Built-in lounging nook, oak, with built-in bookshelves, mattress 140 x 200 cm (guest bed)', 'nook', -2.58, 4.425, 2.5, 1.5, 2.45, { rot: 90, variant: 'books' }),
  // Chill room: the nook, a nature mural, oak panelling and a moss rug, with a closed closet of boxes.
  item('bastelraum-1', 'mural', 'Mural: misty forest', 'mural', 2.015, 4.195, 2.05, 0.01, 2.5, { rot: -90, art: 'forest' }),
  item('bastelraum-1', 'panel-w', 'Oak wall panelling', 'panel', -1.14, 3.16, 1.38, 0.02, 2.5),
  item('bastelraum-1', 'panel-e', 'Oak wall panelling', 'panel', 1.185, 3.16, 1.67, 0.02, 2.5),
  item('bastelraum-1', 'floor-lamp', 'Floor lamp, black with linen shade', 'floorLamp', -1.55, 3.45, 0.4, 0.4, 1.6, { colour: C.linen }),
  item('bastelraum-1', 'closet', 'Built-in closet, oak doors, storage boxes inside', 'boxShelf', 0.375, 5.47, 3.25, 0.45, 2.4, { rot: 180, variant: 'oak' }),
  item('bastelraum-1', 'rug', 'Wool rug, moss', 'rug', -0.55, 4.45, 2.0, 1.6, 0.015, { colour: '#8e9a6c' }),
  ...([
    [1.94, 3.23, -45, 2.2],
    [-1.0, 3.23, 20, 2.2],
  ] as const).map(([x, y, rot, z], i) => item('bastelraum-1', `speaker-${i}`, 'Speaker, black, wall-mounted', 'speaker', x, y, 0.15, 0.14, 0.24, { rot, z })),
  item('bastelraum-1', 'plant', 'Snake plant in clay', 'plant', -1.5, 5.42, 0.35, 0.35, 0.8, { variant: 'snake', accent: C.terracotta }),
  // Gym: charcoal walls, a burnt-orange wall behind the platform, and spots.
  item('bastelraum-2', 'floor', 'Rubber sports floor', 'rug', -1.378, 1.5, 3.9, 2.98, 0.015, { variant: 'rubber', colour: '#2e3032' }),
  item('bastelraum-2', 'paint-n', 'Wall paint, charcoal', 'paint', -1.378, 0.004, 3.9, 0.01, 2.5, { colour: '#34373b' }),
  item('bastelraum-2', 'paint-s', 'Wall paint, burnt orange', 'paint', -1.89, 2.996, 2.88, 0.01, 2.5, { rot: 180, colour: '#c85a2a' }),
  item('bastelraum-2', 'pull-up', 'Wall-mounted pull-up bar', 'pullUpBar', -2.0, 0.3, 1.2, 0.6, 0.35, { z: 2.1 }),
  // A road bike on a smart trainer, facing a 43-inch screen on the back of the pantry shelves.
  item('bastelraum-2', 'tv', 'Television, 43 inch, on the back of the pantry shelves', 'tv', 0.585, 1.0, 0.97, 0.03, 0.56, { rot: -90, z: 1.05, art: 'mountain' }),
  item('bastelraum-2', 'trainer-bike', 'Road bike on a smart trainer', 'bike', -0.45, 1.0, 0.55, 1.75, 1.1, { rot: 90, colour: '#2f4f6f', variant: 'trainer' }),
  item('bastelraum-2', 'deadlift', 'Deadlift platform with a loaded barbell', 'deadlift', -1.65, 2.3, 2.0, 1.1, 0.45),
  item('bastelraum-2', 'farmer', "Farmer's walk handles", 'farmer', -2.25, 1.35, 1.0, 0.45, 0.25),
  item('bastelraum-2', 'plyo-box', 'Jump box, black', 'plyoBox', 0.25, 1.6, 0.6, 0.5, 0.6, { variant: 'black' }),
  ...([
    [0.3, 0.25, '#2b2b2a'],
    [0.3, 0.65, '#c85a2a'],
  ] as const).map(([x, y, colour], i) => item('bastelraum-2', `wall-ball-${i}`, 'Wall ball, 6 kg', 'wallBall', x, y, 0.35, 0.35, 0.35, { colour })),
  item('bastelraum-2', 'target', 'Wall ball target at 2 m', 'wallTarget', -1.65, 2.98, 0.45, 0.02, 0.45, { rot: 180, z: 1.78 }),
  ...[-2.6, -1.4, -0.2].flatMap((x) => [0.8, 2.2].map((y) => item('bastelraum-2', `spot-${x}-${y}`, 'Ceiling spot', 'spot', x, y, 0.09, 0.09, 0.03, { z: 2.47 }))),
  // Store: open pantry shelves as the divider, bikes on Steadyracks, open box shelving and the ski rack.
  item('storage', 'pantry', 'Open pantry shelves, white, dry food within reach; its closed back divides the gym from the store', 'pantry', 0.9, 1.0, 2.0, 0.6, 2.4, { rot: 90, variant: 'birch' }),
  ...['#34483e', '#2f4f6f', '#bf5640', '#e9e3d6'].map((colour, i) =>
    item('storage', `bike-${i}`, 'Bike on a Steadyrack wall mount', 'bike', 1.6 + i * 0.6, 0.55, 0.55, 1.1, 2.0, { colour, variant: 'steadyrack' }),
  ),
  item('storage', 'ski-rack', 'Ski rack: skis and poles upright, boots and helmets below', 'skiRack', 4.06, 0.7, 0.95, 0.42, 2.0, { rot: -90 }),
  item('storage', 'boxes', 'Open shelving with storage boxes, birch', 'boxShelf', 2.45, 2.775, 2.4, 0.45, 2.2, { rot: 180, variant: 'open' }),
  item('storage', 'light', 'Linen pendant', 'pendant', 2.45, 1.5, 0.4, 0.4, 0.2, { z: 2.2, colour: C.linen }),
  // Laundry
  item('laundry', 'washer', 'Washing machine with the dryer stacked on top', 'washer', 2.55, 5.38, 0.6, 0.62, 1.7, { rot: 180, variant: 'stack' }),
  item('laundry', 'sink', 'Utility sink on a white cabinet', 'utilitySink', 4.05, 3.4, 0.6, 0.5, 0.9),
  item('laundry', 'lines', 'Washing lines across the room', 'clothesLine', 3.82, 4.55, 3.2, 1.2, 0.4, { z: 1.85 }),
];

export const furnitureByFloor: Record<string, FurnitureItem[]> = {
  basement: [
    ...basement,
    ...stairWall('basement-corridor', 'basement', 6.7),
    // Dennis's grey Model Y, reversed into the north space; the south space stays free.
    item('parking', 'model-y', 'Tesla Model Y, stealth grey, 475 x 192 x 162 cm', 'car', 9.45, 1.4, 1.92, 4.75, 1.62, { rot: -90, colour: '#5d6166' }),
    ...[8.2, 10.7].flatMap((x) => [1.4, 4.3].map((y, i) => item('parking', `light-${x}-${i}`, 'Ceiling light', 'spot', x, y, 0.16, 0.16, 0.05, { z: 2.45 }))),
  ],
  main: [...mainFloor, ...kitchenItems, ...entrance, ...wc, ...gardenTerrace, ...frontGarden],
  first: [...stairWall('first-landing', 'first', 6.67), ...zimmer1, ...zimmer2, ...zimmer3, ...bathroom],
  top: [...stairWall('top-landing', 'top', 6.66, true, 2.5), ...bedroom, ...ensuite, ...roofTerrace, ...streetTerrace],
};

export const proposalFor = (roomId: string) => proposals.find((p) => p.room === roomId);
