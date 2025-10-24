{/* Título: não mostrar nada se não houver estação atual */}
<div style={{ display: "grid" }}>
  {current?.name && (
    <strong
      style={{
        fontSize: 14,
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxWidth: 220,
      }}
    >
      {current.name}
    </strong>
  )}
  <span className="text-muted" style={{ fontSize: 12 }}>
    {status === "playing" ? "A reproduzir" : status === "loading" ? "A carregar..." : errorMsg || ""}
  </span>
</div>
