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
    <a className="card-link" href={href}>
      {logo ? (
        <img className="logo" src={logo} alt={name} />
      ) : (
        <span style={{ fontSize: 28 }}>📻</span>
      )}
      <span style={{ fontWeight: 600 }}>{name}</span>
    </a>
  );
}
