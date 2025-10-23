"use client";
import { useEffect, useState } from "react";

type Station = { id: string; name: string; slug?: string | null; logo_url?: string | null; country?: string|null; city?: string|null; frequency_mhz?: number|null; genres?: string[]|null; };

export default function StationSearchBar({ onResults }: { onResults: (items: Station[]) => void }) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [genre, setGenre] = useState("");
  const [freq, setFreq] = useState("");

  async function runSearch() {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (country) params.set("country", country);
    if (city) params.set("city", city);
    if (genre) params.set("genre", genre);
    if (freq) params.set("freq", freq);

    const res = await fetch(`/api/stations/search?${params.toString()}`, { cache: "no-store" });
    const json = await res.json();
    onResults(json.items || []);
  }

  useEffect(() => {
    const t = setTimeout(runSearch, 300); // debounce
    return () => clearTimeout(t);
  }, [q, country, city, genre, freq]);

  return (
    <div style={{ display: "grid", gap: 8, padding: "8px 12px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px 160px 120px", gap: 8 }}>
        <input placeholder="Pesquisar por nome..." value={q} onChange={e => setQ(e.target.value)} />
        <input placeholder="País (ex.: PT)" value={country} onChange={e => setCountry(e.target.value.toUpperCase())} />
        <input placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} />
        <input placeholder="Gênero (ex.: news, pop)" value={genre} onChange={e => setGenre(e.target.value)} />
        <input placeholder="Frequência (MHz)" value={freq} onChange={e => setFreq(e.target.value)} />
      </div>
      <button onClick={runSearch} style={{ justifySelf: "start" }}>Filtrar</button>
    </div>
  );
}
