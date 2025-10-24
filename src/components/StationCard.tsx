"use client";
import FavoriteButton from "./FavoriteButton";

export default function StationCard({
  stationId,
  name,
  logo,
  onClick,
}: {
  stationId: string;
  name: string;
  logo?: string;
  onClick: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      <button
        className="card-link"
        onClick={onClick}
        style={{ flexDirection: "column", textAlign: "center" }}
      >
        {logo ? (
          <img className="logo" src={logo} alt={name} />
        ) : (
          <span style={{ fontSize: 64 }}>📻</span>
        )}
        <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, marginTop: 8 }}>
          {name}
        </span>
      </button>
      <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}>
        <FavoriteButton stationId={stationId} size="small" />
      </div>
    </div>
  );
}
