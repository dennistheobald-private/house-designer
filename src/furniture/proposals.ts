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
      { name: 'Light turquoise', hex: C.turquoise },
      { name: 'Granite', hex: C.granite },
      { name: 'Snow', hex: C.snow },
      { name: 'Pine', hex: C.pine },
    ],
    summary:
      'A light turquoise bouclé corner sofa with a chaise on the left under a large black and white alpine print, a round quartzite coffee table on a snowfield-cream rug, an oak and wool lounge chair, and an oak table for six under a cloud-like linen pendant.',
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
    summary: "In the style of the first-floor bathroom: Dennis's beige tile on the floor, the whole vanity and shower wall and the WC pre-wall up to 1.2 m, a walnut vanity with a Loop & Friends basin and a tall rose gold mixer under a hanging mirror, a Laufen Pro WC; moss mat and towels and a fern.",
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
    theme: 'Forest retreat',
    palette: [
      { name: 'Oak', hex: '#c8a97e' },
      { name: 'Sage plaster', hex: '#8f9a8c' },
      { name: 'Oat', hex: C.oat },
      { name: 'Pine', hex: C.pine },
    ],
    summary: 'A built-in oak lounging nook with a 140 x 200 cm mattress that doubles as a guest bed, big cushions, a reading light and LED strips, between built-in oak bookcases to the ceiling; speakers in the upper corners, and a small white standing desk under the window with two 24 inch screens and the Logitech MX keyboard and mouse.',
  },
  {
    room: 'bastelraum-2',
    theme: 'Mountain sunrise',
    palette: [
      { name: 'Sunrise', hex: '#f0b979' },
      { name: 'Granite', hex: C.granite },
      { name: 'Rubber black', hex: '#2e3032' },
      { name: 'Oak', hex: '#c8a97e' },
    ],
    summary: 'Energy and focus: a large mural of alpine ridges at sunrise, a rubber sports floor over the whole training area with dumbbells, kettlebells, wall balls and a plyo box and room for burpees; four bikes side by side on their own stands by the door, each free to take out, and storage along the wall for dry food and for skis, poles, boots and helmets.',
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

const mainFloor: FurnitureItem[] = [
  // Lounge, by the garden doors
  // A corner sofa with the chaise on the left as you face it (the garden side), so the way to the dining table stays open.
  living('sofa', 'Corner sofa, light turquoise bouclé, 260 x 165 cm, chaise on the left', 'sofa', 2.1, 0.85, 2.6, 1.65, 0.78, { colour: C.turquoise, accent: C.snow, variant: 'boucle', chaise: 'left' }),
  living('print', 'Alpine print, black and white, 150 x 100 cm', 'print', 2.1, 0.02, 1.5, 0.03, 1.0, { z: 1.12, art: 'mountain', accent: C.black }),
  living('rug', 'Wool rug, snow cream, 300 x 200 cm', 'rug', 2.4, 1.95, 3.0, 2.0, 0.015, { colour: '#ebe6dc' }),
  living('coffee', 'Round coffee table, honed quartzite, 90 cm', 'coffeeTable', 2.55, 1.65, 0.9, 0.9, 0.36, { variant: 'quartzite' }),
  living('bowl', 'Stoneware bowl', 'bowl', 2.4, 1.6, 0.26, 0.26, 0.08, { z: 0.36, colour: C.charcoal }),
  living('books', 'Mountain books', 'books', 2.77, 1.75, 0.3, 0.22, 0.08, { z: 0.36, rot: 20 }),
  living('lounge-chair', 'Lounge chair, oak and pine-green wool', 'loungeChair', 3.65, 1.75, 0.76, 0.82, 0.78, { rot: -105, colour: C.pine }),
  living('pouf', 'Knitted pouf, oat', 'pouf', 1.05, 2.45, 0.5, 0.5, 0.4, { colour: C.oat }),
  living('floor-lamp', 'Floor lamp, black with linen shade', 'floorLamp', 0.5, 0.35, 0.4, 0.4, 1.6, { colour: C.linen }),
  living('side-table', 'Side table, oak', 'sideTable', 3.62, 0.35, 0.42, 0.42, 0.5),
  living('table-lamp', 'Ceramic table lamp', 'tableLamp', 3.62, 0.35, 0.26, 0.26, 0.45, { z: 0.5, colour: C.linen, accent: C.stone }),
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
  item('kitchen', 'bowl', 'Stoneware fruit bowl', 'bowl', 9.8, 5.35, 0.3, 0.3, 0.1, { z: 0.93, colour: C.sage, variant: 'fruit' }),
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
  item('garden-terrace', 'planter-1', 'Planter with grasses', 'planter', -2.6, 0.75, 0.9, 0.4, 0.5, { rot: 90, variant: 'grass' }),
  item('garden-terrace', 'planter-2', 'Planter with grasses', 'planter', -2.6, 4.95, 0.9, 0.4, 0.5, { rot: 90, variant: 'grass' }),
];

/* ---------------------------------------------------------------- first floor */

const zimmer1: FurnitureItem[] = [
  item('zimmer-1', 'mural', 'Woodland mural: a deer, foxes, hares and an owl', 'mural', 5.315, 4.325, 2.75, 0.01, 2.5, { rot: -90, art: 'animals' }),
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
  item('bathroom', 'stool', 'Oak stool', 'stool', 8.24, 0.4, 0.32, 0.32, 0.45),
  item('bathroom', 'fern', 'Fern', 'plant', 9.95, 1.2, 0.32, 0.32, 0.7, { variant: 'fern', accent: C.white }),
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
  item('ensuite', 'stool', 'Oak stool in the shower', 'stool', 8.45, 0.35, 0.3, 0.3, 0.45),
  item('ensuite', 'towels', 'Towel rail, moss towels', 'towels', 7.0, 2.27, 0.5, 0.08, 1.2, { rot: 180, z: 0.5, colour: C.moss, accent: C.mushroom, variant: 'rail' }),
  item('ensuite', 'fern', 'Small fern', 'plant', 8.55, 2.21, 0.18, 0.18, 0.25, { z: 1.23, variant: 'fern', accent: C.white }),
];

const roofTerrace: FurnitureItem[] = [
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
  // Two separate upright hoops along the hedge, one bike leaning against each.
  item('front-path', 'bike-rack-1', 'Bike stand, black steel hoop, 70 x 85 cm', 'bikeRack', 11.2, 5.5, 0.7, 0.05, 0.85, { variant: 'hoop' }),
  item('front-path', 'bike-rack-2', 'Bike stand, black steel hoop, 70 x 85 cm', 'bikeRack', 12.3, 5.5, 0.7, 0.05, 0.85, { variant: 'hoop' }),
];

/* ---------------------------------------------------------------- basement */

const basement: FurnitureItem[] = [
  // Reading room: a built-in oak nook between built-in bookcases along the south wall.
  item('bastelraum-1', 'nook', 'Built-in lounging nook, oak, mattress 140 x 200 cm (guest bed)', 'nook', -0.95, 4.95, 2.2, 1.5, 2.1, { rot: 180 }),
  item('bastelraum-1', 'bookcase-w', 'Built-in bookcase, oak, to the ceiling', 'bookcase', -2.69, 5.525, 1.28, 0.35, 2.5, { rot: 180 }),
  item('bastelraum-1', 'bookcase-e', 'Built-in bookcase, oak, to the ceiling', 'bookcase', 1.085, 5.525, 1.87, 0.35, 2.5, { rot: 180 }),
  item('bastelraum-1', 'rug', 'Wool rug, oat', 'rug', -0.95, 3.85, 2.2, 1.2, 0.015, { colour: C.oat }),
  item('bastelraum-1', 'desk', 'Standing desk, white, 120 x 60 cm, 65 to 130 cm high', 'desk', -3.03, 4.1, 1.2, 0.6, 0.75, { rot: 90, variant: 'standing' }),
  item('bastelraum-1', 'screen-1', 'Monitor, 24 inch', 'monitor', -3.2, 4.37, 0.54, 0.2, 0.48, { rot: 105, z: 0.75 }),
  item('bastelraum-1', 'screen-2', 'Monitor, 24 inch', 'monitor', -3.2, 3.83, 0.54, 0.2, 0.48, { rot: 75, z: 0.75 }),
  item('bastelraum-1', 'keyboard', 'Logitech MX Keys keyboard', 'keyboard', -2.92, 4.12, 0.43, 0.13, 0.02, { rot: 90, z: 0.754 }),
  item('bastelraum-1', 'mouse', 'Logitech MX Master mouse', 'mouse', -2.92, 3.75, 0.085, 0.125, 0.05, { rot: 90, z: 0.754 }),
  ...([
    [-3.25, 3.23, 45, 2.2],
    [1.94, 3.23, -45, 2.2],
    [-3.1, 5.45, 180, 2.12],
    [1.85, 5.45, 180, 2.12],
  ] as const).map(([x, y, rot, z], i) => item('bastelraum-1', `speaker-${i}`, 'Speaker, black, wall-mounted', 'speaker', x, y, 0.15, 0.14, 0.24, { rot, z })),
  item('bastelraum-1', 'plant', 'Snake plant in clay', 'plant', -2.2, 3.42, 0.35, 0.35, 0.8, { variant: 'snake', accent: C.terracotta }),
  // Gym, bikes and storage: bikes by the door to the stair, storage along the north wall, a sports floor over the rest.
  ...['#34483e', '#2f4f6f', '#bf5640', '#e9e3d6'].map((colour, i) =>
    item('bastelraum-2', `bike-${i}`, 'Bike on its own floor stand', 'bike', 2.25 + i * 0.5, 0.92, 0.5, 1.8, 1.05, { rot: 180, colour }),
  ),
  item('bastelraum-2', 'pantry', 'Pantry shelving for dry food, oak on black uprights', 'pantry', -2.33, 0.23, 2.0, 0.45, 2.2),
  item('bastelraum-2', 'ski-rack', 'Ski rack: skis and poles upright, boots and helmets below', 'skiRack', -0.55, 0.21, 1.5, 0.42, 2.0),
  item('bastelraum-2', 'cabinet', 'Storage cabinet, oak, for ski clothes and gear', 'wardrobe', 1.07, 0.3, 1.5, 0.6, 2.2, { variant: 'oak' }),
  item('bastelraum-2', 'floor', 'Rubber sports floor', 'rug', -0.665, 1.76, 5.33, 2.48, 0.015, { variant: 'rubber', colour: '#2e3032' }),
  item('bastelraum-2', 'mural', 'Mural: alpine ridges at sunrise', 'mural', -1.365, 2.995, 3.9, 0.01, 2.5, { rot: 180, art: 'sunrise' }),
  item('bastelraum-2', 'dumbbells', 'Dumbbell rack with kettlebells', 'dumbbells', -2.4, 2.78, 1.2, 0.4, 0.75, { rot: 180 }),
  ...([
    [-1.35, 2.78, '#2b2b2a'],
    [-0.95, 2.8, '#34483e'],
    [-1.15, 2.42, '#2f4f6f'],
  ] as const).map(([x, y, colour], i) => item('bastelraum-2', `wall-ball-${i}`, 'Wall ball, 6 kg', 'wallBall', x, y, 0.35, 0.35, 0.35, { colour })),
  item('bastelraum-2', 'plyo-box', 'Plyo box, birch plywood', 'plyoBox', 0.1, 2.65, 0.6, 0.5, 0.6, { rot: 180 }),
  ...[-1.8, 0.6].map((x, i) => item('bastelraum-2', `pendant-${i}`, 'Black industrial pendant', 'pendant', x, 1.7, 0.35, 0.35, 0.15, { z: 2.3, variant: 'metal', colour: C.black })),
  // Laundry
  item('laundry', 'washer', 'Washing machine with the dryer stacked on top', 'washer', 2.55, 5.38, 0.6, 0.62, 1.7, { rot: 180, variant: 'stack' }),
  item('laundry', 'sink', 'Utility sink on a white cabinet', 'utilitySink', 4.05, 3.4, 0.6, 0.5, 0.9),
  item('laundry', 'lines', 'Washing lines across the room', 'clothesLine', 3.82, 4.55, 3.2, 1.2, 0.4, { z: 1.85 }),
];

export const furnitureByFloor: Record<string, FurnitureItem[]> = {
  basement,
  main: [...mainFloor, ...kitchenItems, ...entrance, ...wc, ...gardenTerrace, ...frontGarden],
  first: [...zimmer1, ...zimmer2, ...zimmer3, ...bathroom],
  top: [...bedroom, ...ensuite, ...roofTerrace, ...streetTerrace],
};

export const proposalFor = (roomId: string) => proposals.find((p) => p.room === roomId);
