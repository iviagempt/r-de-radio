"use client";
import type { StationLite } from "./GlobalRadioPlayer";

export default function StationGridClient({ stations }: { stations: StationLite[] }) {
  return (
    <div className="grid-logos">
      {stations.map((s) => (
        <button
          key={s.id}
          className="radio-card"
          onClick={() => {
            // @ts-expect-error global
            window.__playStation?.(s);
          }}
          title={s.name}
        >
          {s.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={s.logo_url}
              alt={s.name}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ color: "#ddd", fontSize: 12, textAlign: "center" }}>{s.name}</span>
          )}
        </button>
      ))}
    </div>
  );
}
