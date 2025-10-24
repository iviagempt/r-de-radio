"use client";

export default function StationCard({
  href,
  name,
  logo,
}: {
  href: string;
  name: string;
  logo?: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: 12,
        background: "rgba(255,255,255,0.06)",
        borderRadius: 12,
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.15s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {logo ? (
        <img src={logo} alt={name} style={{ width: 36, height: 36, objectFit: "contain" }} />
      ) : (
        <span style={{ fontSize: 24 }}>📻</span>
      )}
      <span style={{ fontWeight: 600 }}>{name}</span>
    </a>
  );
}
