import { useCallback, useMemo, useState } from 'react';
import { contains } from './house/geometry';
import { houseK } from './house/houseK';
import { Scene } from './scene/Scene';
import type { WalkPosition, WalkTarget } from './scene/WalkControls';
import { PlanView } from './ui/PlanView';

type Mode = 'dollhouse' | 'plan' | 'walk';

const house = houseK;

function initialState() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get('mode') as Mode) || 'dollhouse';
  const floor = Number(params.get('floor') ?? 1);
  const roomId = params.get('room') ?? 'entrance';
  return { mode, floor, roomId };
}

function targetForRoom(roomId: string, nonce: number): WalkTarget {
  for (const [floor, f] of house.floors.entries()) {
    const room = [...f.rooms, ...f.outdoor].find((r) => r.id === roomId);
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
  const [target, setTarget] = useState<WalkTarget>(() => targetForRoom(init.roomId, 0));
  const [position, setPosition] = useState<WalkPosition>({ floor: target.floor, x: target.x, y: target.y });

  const jump = useCallback((roomId: string) => {
    const t = targetForRoom(roomId, Date.now());
    setTarget(t);
    setPosition({ floor: t.floor, x: t.x, y: t.y });
    setMode('walk');
  }, []);

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
            <select value="" onChange={(e) => e.target.value && jump(e.target.value)}>
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
      </header>

      <main className="stage">
        {mode === 'plan' ? (
          <div className="plan-wrap">
            <PlanView house={house} floorIndex={floorIndex} />
          </div>
        ) : (
          <Scene
            key={mode}
            house={house}
            mode={mode}
            floorIndex={floorIndex}
            walkTarget={target}
            onWalk={setPosition}
          />
        )}

        {mode === 'walk' && (
          <>
            <div className="hud">
              <strong>{here?.name ?? 'Stairs'}</strong>
              <span>{house.floors[shownFloor].name}</span>
            </div>
            <div className="minimap">
              <PlanView house={house} floorIndex={shownFloor} marker={position} />
            </div>
            <p className="help">Click to look around · W A S D to walk · Shift to run · Esc to stop</p>
          </>
        )}
        {mode === 'dollhouse' && <p className="help">Drag to orbit · scroll to zoom · right-drag to pan</p>}
      </main>
    </div>
  );
}
