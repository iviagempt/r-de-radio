// src/components/StationCard.tsx
"use client";

export default function StationCard({ href, name, logo }: { href: string; name: string; logo?: string; }) {
  return (
    <a
      href={href}
      className="station-card"
      onMouseOver={(e) => { /* ok aqui, é client */ }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 12,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        textDecoration: "none"
      }}
    >
      {logo ? <img src={logo} alt={name} style={{ width: 80, height: 80, objectFit: "contain" }} /> : "📻"}
      <span style={{ marginTop: 8 }}>{name}</span>
    </a>
  );
}
