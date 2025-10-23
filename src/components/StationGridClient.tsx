// dentro do component onde você já tem `user`
async function toggleFavorite(stationId: string) {
  if (!user) {
    await sb.auth.signInWithOAuth({ provider: "google" });
    return;
  }
  const { error } = await sb.from("user_favorites").insert({ user_id: user.id, station_id: stationId });
  if (error) {
    // se já existe, apaga (unique constraint)
    await sb.from("user_favorites").delete().eq("user_id", user.id).eq("station_id", stationId);
  }
}
...
{user && (
  <button
    aria-label="Favoritar"
    onClick={() => toggleFavorite(s.id)}
    className="fav-btn"
  >
    ❤️
  </button>
)}
