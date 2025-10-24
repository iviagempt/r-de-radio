{current?.logo_url && (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      overflow: "hidden",
      display: "grid",
      placeItems: "center",
    }}
  >
    <img
      src={current.logo_url}
      alt={current.name}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
)}
