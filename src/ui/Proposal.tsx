import { useState } from 'react';
import { proposalFor } from '../furniture/proposals';
import type { RoomProposal } from '../furniture/types';
import type { Floor } from '../house/types';

function Swatches({ palette }: { palette: RoomProposal['palette'] }) {
  return (
    <span className="swatches">
      {palette.map((p) => (
        <span key={p.name} className="swatch" style={{ background: p.hex }} title={`${p.name} ${p.hex}`} />
      ))}
    </span>
  );
}

/** The design proposal for one room: its landscape, palette and what is in it. */
export function ProposalCard({ proposal, compact = false }: { proposal: RoomProposal; compact?: boolean }) {
  return (
    <div className={`proposal${compact ? ' compact' : ''}`}>
      <div className="proposal-head">
        <span className="theme">{proposal.theme}</span>
        <Swatches palette={proposal.palette} />
      </div>
      {!compact && <p>{proposal.summary}</p>}
    </div>
  );
}

const HIDDEN_KEY = 'house-k.hidden-proposals';

function loadHidden(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

/** The proposals for every room on a floor, beside the 3D view. Each room's card can be closed. */
export function ProposalList({ floor }: { floor: Floor }) {
  const [hidden, setHidden] = useState<string[]>(loadHidden);
  const save = (next: string[]) => {
    setHidden(next);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(next));
    } catch {
      // Private windows may refuse storage; the cards still close for this visit.
    }
  };
  const rooms = [...floor.rooms, ...floor.outdoor].map((r) => ({ room: r, p: proposalFor(r.id) })).filter((x) => x.p);
  if (!rooms.length) return null;
  const shown = rooms.filter((x) => !hidden.includes(x.room.id));
  const closed = rooms.length - shown.length;
  const reopen = closed > 0 && (
    <button className="proposals-reopen" onClick={() => save(hidden.filter((id) => !rooms.some((x) => x.room.id === id)))}>
      Show {closed} closed {closed === 1 ? 'room' : 'rooms'}
    </button>
  );
  if (!shown.length) return <div className="proposals-closed">{reopen}</div>;
  return (
    <aside className="proposals" aria-label={`Design proposals, ${floor.name}`}>
      {shown.map(({ room, p }) => (
        <section key={room.id}>
          <h2>
            {room.name}
            <button className="proposal-close" aria-label={`Close the styling for ${room.name}`} title="Close" onClick={() => save([...hidden, room.id])}>
              ×
            </button>
          </h2>
          <ProposalCard proposal={p!} />
        </section>
      ))}
      {reopen}
    </aside>
  );
}
