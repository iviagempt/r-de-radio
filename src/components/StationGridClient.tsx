"use client";
import type { StationLite } from "./GlobalRadioPlayer";

declare global {
  interface Window { __playStation?: (s: StationLite) => Promise<void>; }
}

export default function StationGridClient({ stations }: { stations: any[] }) {
  return (
    <div className="grid-logos">
      {stations.map((s) => (
        <button
          key={s.id}
          className="radio-card"
          onClick={() =>
            window.__playStation?.({
              id: s.id,
              name: s.name,
              slug: null,                  // força uso do ID
              logo_url: s.logo_url ?? null
            })
          }
          type="button"
          title={s.name}
        >
          {s.logo_url ? <img src={s.logo_url} alt={s.name} /> : <span>{s.name}</span>}
        </button>
      ))}
    </div>
  );
}
