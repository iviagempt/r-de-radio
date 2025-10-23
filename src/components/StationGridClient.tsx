"use client";
import { StationLite } from "./GlobalRadioPlayer";

export default function StationGridClient({ stations }: { stations: StationLite[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 12 }}>
      {stations.map((s) => (
        <button
          key={s.id}
          onClick={() => {
            // @ts-expect-error
            window.__setStationToPlay?.(s);
          }}
          style={{
            aspectRatio: "1 / 1",
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
            padding: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={s.name}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {s.logo_url ? (
            <img src={s.logo_url} alt={s.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ color: "#666", fontSize: 12, textAlign: "center" }}>{s.name}</span>
          )}
        </button>
      ))}
    </div>
  );
}
