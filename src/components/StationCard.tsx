"use client";

export default function StationCard({
  name,
  logo,
  onClick,
}: {
  name: string;
  logo?: string;
  onClick: () => void;
}) {
  return (
    <button className="card-link" onClick={onClick} style={{ flexDirection: "column", textAlign: "center", padding: 20 }}>
      {logo ? (
        <img className="logo" src={logo} alt={name} style={{ width: 72, height: 72, marginBottom: 10 }} />
      ) : (
        <span style={{ fontSize: 56, marginBottom: 10 }}>📻</span>
      )}
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3 }}>{name}</span>
    </button>
  );
}
