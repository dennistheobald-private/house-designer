# House Designer

A browser tool for designing the interior of House K (Am Kapuzinerberg, Rheinfelden):
a 2D plan, a 3D dollhouse view and a first-person walkthrough of all four floors.

This is phase 1 of the plan: the house itself, built to the plans, with the fixed
kitchen and bathrooms. Furniture, chat placement and realistic lighting come next.

## Run it

```sh
npm install
npm run dev     # open the printed URL in a desktop browser
npm test        # checks the traced rooms against the plan areas, the stair and collisions
```

## Using it

- **3D**: pick a floor, drag to orbit, scroll to zoom. Upper floors are hidden so you can look in.
- **Plan**: the floor plan with room names and areas.
- **Walk**: click into the view, then W A S D to walk, mouse to look, Shift to run, Esc to stop.
  The stairs are walkable between all floors, and "Go to" jumps to any room.

Links can open a view directly: `?mode=walk&room=kitchen`, `?mode=plan&floor=2`,
`?mode=dollhouse&floor=3`. Floors are numbered 0 (basement) to 3 (top floor).

## Where things are

| Path | What it holds |
| --- | --- |
| `src/house/houseK.ts` | Walls, openings and rooms for each floor, in metres |
| `src/house/fixtures.ts` | Kitchen units and bathroom fittings |
| `src/house/geometry.ts` | Wall splitting, collisions and the winding stair |
| `src/scene/` | The 3D scene, materials and walk controls |
| `src/ui/PlanView.tsx` | The 2D plan |

Plan coordinates: x runs from the garden facade (0) to the street facade (10.15 m),
y from the north party wall (0) to the south party wall (5.70 m).

## Sources

- Sales plans at 1:50 (basement, main, first and top floor) and the construction description.
- Kitchen: Inform Möbelsysteme plan for House K, model 1000 Topas+, 4 March 2026.
- Bathrooms: Dennis's layout sketches for the first-floor bathroom and the top-floor en-suite.
- Plot: the site plan ("Situation", brochure page 9, 1:200): House K's parcel is 126.78 m²,
  its garden 32.54 m², with hedges to the neighbours and a 0.4 m wall at the back boundary.

## Assumptions to confirm

- The basement lies under the garden side, so that its stair lines up with the stair above.
- Floor-to-floor height 2.83 m and clear room height 2.50 m.
- Window sill and head heights, which the plans do not give.
- The garden's depth (5.47 m behind the terrace) is set so its area matches the site plan;
  measured off the 1:200 drawing it looks about 0.3 m shorter. The front strip (2.39 m deep)
  takes the rest of the parcel's area, with a planted bed in front of the WC.
