"use client";
type StationLite = { id: string; name: string; slug?: string | null; logo_url?: string | null };

declare global {
  interface Window { __playStation?: (s: StationLite) => Promise<void>; }
}

export default function StationGridClient({ stations }: { stations: StationLite[] }) {
  return (
    <div className="grid-logos">
      {stations.map((s) => (
        <button
          key={s.id}
          className="radio-card"
          onClick={() => window.__playStation?.({ id: s.id, name: s.name, slug: null, logo_url: s.logo_url ?? null })}
          type="button"
          title={s.name}
        >
          {s.logo_url ? <img src={s.logo_url} alt={s.name} /> : <span>{s.name}</span>}
        </button>
      ))}
    </div>
  );
}
