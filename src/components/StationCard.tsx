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
    <button 
      className="card-link" 
      onClick={onClick}
      style={{ 
        flexDirection: "column", 
        textAlign: "center"
      }}
    >
      {logo ? (
        <img 
          className="logo" 
          src={logo} 
          alt={name}
        />
      ) : (
        <span style={{ fontSize: 64 }}>📻</span>
      )}
      <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.3, marginTop: 8 }}>
        {name}
      </span>
    </button>
  );
}
