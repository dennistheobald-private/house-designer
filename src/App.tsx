import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FurnitureItem } from './furniture/types';
import { proposalFor } from './furniture/proposals';
import { contains, roomArea } from './house/geometry';
import { houseK } from './house/houseK';
import { Scene, type Quality, type TimeOfDay } from './scene/Scene';
import type { WalkPosition, WalkTarget } from './scene/WalkControls';
import { PlanView } from './ui/PlanView';
import { ItemInfo } from './ui/ItemInfo';
import { ProposalCard, ProposalList } from './ui/Proposal';

type Mode = 'dollhouse' | 'plan' | 'walk';

const house = houseK;

function initialState() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get('mode') as Mode) || 'dollhouse';
  const floor = Number(params.get('floor') ?? 1);
  const roomId = params.get('room') ?? 'entrance';
  const time: TimeOfDay = params.get('time') === 'evening' ? 'evening' : 'day';
  const furnished = params.get('furnished') !== '0';
  const photo = params.get('photo') === '1';
  // Fast is the default, so the app runs smoothly on an ordinary PC; ?quality=high turns the full effects on.
  const quality: Quality = ['high', 'quality'].includes(params.get('quality') ?? '') ? 'quality' : 'fast';
  // `at=x,y,facing` stands you at a plan point in the room's floor, facing in degrees.
  const at = params.get('at')?.split(',').map(Number);
  return { mode, floor, roomId, time, furnished, photo, quality, at: at?.length === 3 && at.every(Number.isFinite) ? at : undefined };
}

function targetForRoom(roomId: string, nonce: number, furnished = true): WalkTarget {
  for (const [floor, f] of house.floors.entries()) {
    const room = [...f.rooms, ...f.outdoor].find((r) => r.id === roomId);
    const view = room && furnished ? proposalFor(roomId)?.view : undefined;
    if (view) return { floor, ...view, nonce };
    if (room?.spawn) return { floor, ...room.spawn, nonce };
  }
  return { floor: 1, x: 9.7, y: 2.4, facing: Math.PI, nonce };
}

/** Where Walk starts on a floor when no room is chosen: its largest room. */
function mainRoom(floorIndex: number) {
  const rooms = house.floors[floorIndex].rooms.filter((r) => r.spawn);
  return rooms.reduce((a, b) => (roomArea(b.rects) > roomArea(a.rects) ? b : a)).id;
}

const floorOfRoom = (roomId: string) => house.floors.findIndex((f) => [...f.rooms, ...f.outdoor].some((r) => r.id === roomId));

function roomAt(p: WalkPosition) {
  const f = house.floors[p.floor];
  return [...f.rooms, ...f.outdoor].find((r) => r.rects.some((rect) => contains(rect, p.x, p.y)));
}

export function App() {
  const init = useMemo(initialState, []);
  const [mode, setMode] = useState<Mode>(init.mode);
  const [floorIndex, setFloorIndex] = useState(init.floor);
  // The top floor seen with its roof on: the green roof and the solar panels.
  const [roof, setRoof] = useState(false);
  const [target, setTarget] = useState<WalkTarget>(() => {
    const t = targetForRoom(init.roomId, 0, init.furnished);
    return init.at ? { ...t, x: init.at[0], y: init.at[1], facing: (init.at[2] * Math.PI) / 180 } : t;
  });
  const [position, setPosition] = useState<WalkPosition>({ floor: target.floor, x: target.x, y: target.y });
  const [time, setTime] = useState<TimeOfDay>(init.time);
  const [furnished, setFurnished] = useState(init.furnished);
  const [photo, setPhoto] = useState(init.photo && init.mode !== 'plan');
  const [samples, setSamples] = useState(0);
  const [quality, setQuality] = useState<Quality>(init.quality);
  const [picked, setPicked] = useState<{ item: FurnitureItem; at: { x: number; y: number } } | null>(null);
  // The room you are looking at in 3D or the plan, so Walk can start there.
  const [focusRoom, setFocusRoom] = useState<string | null>(null);
  const pick = useCallback((item: FurnitureItem, at: { x: number; y: number }) => {
    setPicked({ item, at });
    setFocusRoom(item.room);
  }, []);
  const unpick = useCallback(() => setPicked(null), []);

  // A new view or floor closes the card; so does Esc.
  useEffect(unpick, [mode, floorIndex, furnished, unpick]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.code === 'Escape' && unpick();
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [unpick]);

  const togglePhoto = useCallback(() => {
    setSamples(0);
    setPhoto((p) => !p);
  }, []);

  // P takes a photo from wherever you are, also while walking with the mouse captured.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'KeyP' && mode !== 'plan' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)) togglePhoto();
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [mode, togglePhoto]);

  const savePhoto = useCallback(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('.stage canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `house-k-${roomAt(position)?.id ?? 'view'}-${time}.png`;
    a.click();
  }, [time, position]);

  const jump = useCallback((roomId: string) => {
    const t = targetForRoom(roomId, Date.now(), furnished);
    setTarget(t);
    setPosition({ floor: t.floor, x: t.x, y: t.y });
    setPhoto(false);
    setMode('walk');
  }, [furnished]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    if (next === 'walk') {
      // Start walking in the room you were looking at, or carry on where you left off.
      const roomId = focusRoom ?? mainRoom(floorIndex);
      if (position.floor === floorOfRoom(roomId) && roomAt(position)?.id === roomId) {
        setTarget((t) => ({ ...t, ...position, nonce: Date.now() }));
        setMode('walk');
      } else jump(roomId);
      return;
    }
    if (mode === 'walk') {
      // Leaving Walk shows the floor and room you were in.
      setFloorIndex(position.floor);
      setFocusRoom(roomAt(position)?.id ?? null);
    }
    setMode(next);
  };

  const here = roomAt(position);
  const shownFloor = mode === 'walk' ? position.floor : floorIndex;

  return (
    <div className="app">
      <header className="bar">
        <h1>{house.name}</h1>
        <nav className="tabs" aria-label="View">
          {(['dollhouse', 'plan', 'walk'] as const).map((m) => (
            <button key={m} className={m === mode ? 'active' : ''} onClick={() => switchMode(m)}>
              {m === 'dollhouse' ? '3D' : m === 'plan' ? 'Plan' : 'Walk'}
            </button>
          ))}
        </nav>
        {mode !== 'walk' && (
          <nav className="tabs" aria-label="Floor">
            {mode === 'dollhouse' && (
              <button className={roof ? 'active' : ''} onClick={() => (setFloorIndex(house.floors.length - 1), setRoof(true), setFocusRoom(null))}>
                Roof
              </button>
            )}
            {house.floors
              .map((f, i) => ({ f, i }))
              .reverse()
              .map(({ f, i }) => (
                <button key={f.id} className={i === floorIndex && !(roof && mode === 'dollhouse') ? 'active' : ''} onClick={() => (setFloorIndex(i), setRoof(false), setFocusRoom(null))}>
                  {f.name}
                </button>
              ))}
          </nav>
        )}
        {mode === 'walk' && (
          <label className="jump">
            Go to
            <select
              value=""
              onChange={(e) => {
                // Hand the keys back to walking once a room is chosen.
                e.target.blur();
                if (e.target.value) jump(e.target.value);
              }}
            >
              <option value="">Choose a room…</option>
              {house.floors.map((f) => (
                <optgroup key={f.id} label={f.name}>
                  {[...f.rooms, ...f.outdoor]
                    .filter((r) => r.spawn)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        )}
        <div className="bar-end">
          <nav className="tabs" aria-label="Furniture">
            <button className={furnished ? 'active' : ''} onClick={() => setFurnished(true)}>
              Furnished
            </button>
            <button className={!furnished ? 'active' : ''} onClick={() => setFurnished(false)}>
              Empty
            </button>
          </nav>
          {mode !== 'plan' && (
            <>
              <nav className="tabs" aria-label="Light">
                <button className={time === 'day' ? 'active' : ''} onClick={() => setTime('day')}>
                  Day
                </button>
                <button className={time === 'evening' ? 'active' : ''} onClick={() => setTime('evening')}>
                  Evening
                </button>
              </nav>
              <nav className="tabs" aria-label="Performance" title="Fast draws only when something moves, with simpler shading. Quality adds ambient occlusion, bloom and sharper shadows, and needs a good graphics card.">
                <button className={quality === 'fast' ? 'active' : ''} onClick={() => setQuality('fast')}>
                  Fast
                </button>
                <button className={quality === 'quality' ? 'active' : ''} onClick={() => setQuality('quality')}>
                  Quality
                </button>
              </nav>
              <button className={`photo-button${photo ? ' active' : ''}`} onClick={togglePhoto} title="Render a photo-realistic image of this view (P)">
                {photo ? 'Back to live view' : 'Photo'}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="stage">
        {mode === 'plan' ? (
          <div className="plan-wrap" onClick={unpick}>
            <PlanView house={house} floorIndex={floorIndex} furnished={furnished} onPick={pick} />
          </div>
        ) : (
          <Scene
            key={mode}
            house={house}
            mode={mode}
            floorIndex={floorIndex}
            roof={roof && mode === 'dollhouse'}
            walkTarget={target}
            onWalk={setPosition}
            walkFloor={position.floor}
            time={time}
            furnished={furnished}
            photo={photo}
            onPhotoProgress={setSamples}
            onPick={pick}
            onPickNothing={unpick}
            quality={quality}
            litRoom={mode === 'walk' ? here?.id : null}
          />
        )}

        {photo && mode !== 'plan' && (
          <div className="photo-status" role="status">
            <span>{samples < 1 ? 'Preparing the photo render…' : `Refining the photo: ${samples} ${samples === 1 ? 'pass' : 'passes'}${samples >= 200 ? ' (done)' : ''}`}</span>
            <button onClick={savePhoto} disabled={samples < 1}>
              Save image
            </button>
          </div>
        )}
        {mode === 'dollhouse' && furnished && !photo && !roof && <ProposalList floor={house.floors[floorIndex]} />}

        {mode === 'walk' && (
          <>
            <div className="hud">
              <strong>{here?.name ?? 'Stairs'}</strong>
              <span>{house.floors[shownFloor].name}</span>
              {furnished && here && proposalFor(here.id) && <ProposalCard proposal={proposalFor(here.id)!} compact />}
            </div>
            <div className="minimap">
              <PlanView house={house} floorIndex={shownFloor} marker={position} furnished={furnished} />
            </div>
            <p className="help">Arrow keys to walk · W A S D to look around · Shift to run · click a piece for its size · P for a photo</p>
          </>
        )}
        {mode === 'dollhouse' && !photo && <p className="help">Drag to orbit · scroll to zoom · right-drag to pan · click a piece for its size · P for a photo</p>}
        {picked && <ItemInfo item={picked.item} at={picked.at} onClose={unpick} />}
      </main>
    </div>
  );
}
