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

/** The proposals for every room on a floor, beside the 3D view. */
export function ProposalList({ floor }: { floor: Floor }) {
  const rooms = [...floor.rooms, ...floor.outdoor].map((r) => ({ room: r, p: proposalFor(r.id) })).filter((x) => x.p);
  if (!rooms.length) return null;
  return (
    <aside className="proposals" aria-label={`Design proposals, ${floor.name}`}>
      {rooms.map(({ room, p }) => (
        <section key={room.id}>
          <h2>{room.name}</h2>
          <ProposalCard proposal={p!} />
        </section>
      ))}
    </aside>
  );
}
