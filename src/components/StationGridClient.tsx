<button
  type="button"
  className="radio-card"
  style={{ width: "100%", minHeight: 120 }}
  onClick={() =>
    window.__playStation?.({
      id: s.id,
      name: s.name,
      slug: null,              // força uso do ID na rota /api/stations/{id}/primary-stream
      logo_url: s.logo_url ?? null,
    })
  }
>
  {s.logo_url ? (
    <img src={s.logo_url} alt={s.name} />
  ) : (
    <span>{s.name}</span>
  )}
</button>
