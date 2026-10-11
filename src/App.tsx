import { useCallback, useEffect, useMemo, useState } from 'react';
import { proposalFor } from './furniture/proposals';
import { contains } from './house/geometry';
import { houseK } from './house/houseK';
import { Scene, type TimeOfDay } from './scene/Scene';
import type { WalkPosition, WalkTarget } from './scene/WalkControls';
import { PlanView } from './ui/PlanView';
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
  // `at=x,y,facing` stands you at a plan point in the room's floor, facing in degrees.
  const at = params.get('at')?.split(',').map(Number);
  return { mode, floor, roomId, time, furnished, photo, at: at?.length === 3 && at.every(Number.isFinite) ? at : undefined };
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

function roomAt(p: WalkPosition) {
  const f = house.floors[p.floor];
  return [...f.rooms, ...f.outdoor].find((r) => r.rects.some((rect) => contains(rect, p.x, p.y)));
}

export function App() {
  const init = useMemo(initialState, []);
  const [mode, setMode] = useState<Mode>(init.mode);
  const [floorIndex, setFloorIndex] = useState(init.floor);
  const [target, setTarget] = useState<WalkTarget>(() => {
    const t = targetForRoom(init.roomId, 0, init.furnished);
    return init.at ? { ...t, x: init.at[0], y: init.at[1], facing: (init.at[2] * Math.PI) / 180 } : t;
  });
  const [position, setPosition] = useState<WalkPosition>({ floor: target.floor, x: target.x, y: target.y });
  const [time, setTime] = useState<TimeOfDay>(init.time);
  const [furnished, setFurnished] = useState(init.furnished);
  const [photo, setPhoto] = useState(init.photo && init.mode !== 'plan');
  const [samples, setSamples] = useState(0);

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

  const here = roomAt(position);
  const shownFloor = mode === 'walk' ? position.floor : floorIndex;

  return (
    <div className="app">
      <header className="bar">
        <h1>{house.name}</h1>
        <nav className="tabs" aria-label="View">
          {(['dollhouse', 'plan', 'walk'] as const).map((m) => (
            <button key={m} className={m === mode ? 'active' : ''} onClick={() => setMode(m)}>
              {m === 'dollhouse' ? '3D' : m === 'plan' ? 'Plan' : 'Walk'}
            </button>
          ))}
        </nav>
        {mode !== 'walk' && (
          <nav className="tabs" aria-label="Floor">
            {house.floors
              .map((f, i) => ({ f, i }))
              .reverse()
              .map(({ f, i }) => (
                <button key={f.id} className={i === floorIndex ? 'active' : ''} onClick={() => setFloorIndex(i)}>
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
              <button className={`photo-button${photo ? ' active' : ''}`} onClick={togglePhoto} title="Render a photo-realistic image of this view (P)">
                {photo ? 'Back to live view' : 'Photo'}
              </button>
            </>
          )}
        </div>
      </header>

      <main className="stage">
        {mode === 'plan' ? (
          <div className="plan-wrap">
            <PlanView house={house} floorIndex={floorIndex} furnished={furnished} />
          </div>
        ) : (
          <Scene
            key={mode}
            house={house}
            mode={mode}
            floorIndex={floorIndex}
            walkTarget={target}
            onWalk={setPosition}
            walkFloor={position.floor}
            time={time}
            furnished={furnished}
            photo={photo}
            onPhotoProgress={setSamples}
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
        {mode === 'dollhouse' && furnished && !photo && <ProposalList floor={house.floors[floorIndex]} />}

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
            <p className="help">Arrow keys to walk · W A S D to look around · Shift to run · P for a photo</p>
          </>
        )}
        {mode === 'dollhouse' && !photo && <p className="help">Drag to orbit · scroll to zoom · right-drag to pan · P for a photo</p>}
      </main>
    </div>
  );
}
