// src/app/admin/import/page.tsx
"use client";

import { useState } from "react";

type RBItem = {
  stationuuid: string;
  name: string;
  country?: string;
  state?: string;
  language?: string;
  tags?: string;
  favicon?: string;
  codec?: string;
  bitrate?: number;
  url: string;
  homepage?: string | null;
};

export default function ImportRadiosPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"name"|"country"|"tag">("name");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RBItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const search = async () => {
    setLoading(true); setMsg(null);
    const params = new URLSearchParams();
    params.set(mode, query);
    const res = await fetch(`/api/radiobrowser/search?${params.toString()}`, { cache: "no-store" });
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const addOne = async (item: RBItem) => {
    setMsg(null);
    const res = await fetch("/api/radiobrowser/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    const data = await res.json();
    if (data?.ok) setMsg(`Adicionada: ${item.name}`);
    else setMsg(`Erro: ${data?.error || "desconhecido"}`);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Importar rádios (Radio Browser)</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="name">Por nome</option>
          <option value="country">Por país</option>
          <option value="tag">Por tag/estilo</option>
        </select>
        <input
          placeholder={mode === "name" ? "Ex.: FM O Dia" : mode === "country" ? "Ex.: Brazil" : "Ex.: pop"}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 220 }}
        />
        <button onClick={search} disabled={loading || !query.trim()}>
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {msg && <div style={{ marginBottom: 12, color: msg.startsWith("Erro") ? "crimson" : "green" }}>{msg}</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {results.map((r) => (
          <div key={r.stationuuid} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <strong>{r.name}</strong>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {r.country || "—"} • {r.codec?.toUpperCase() || "?"} • {r.bitrate || "?"} kbps
                </div>
                <div style={{ fontSize: 11, color: "#888", wordBreak: "break-all" }}>{r.url}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {r.homepage && <a href={r.homepage} target="_blank" rel="noreferrer">Site</a>}
                <a href={r.url} target="_blank" rel="noreferrer">Testar</a>
                <button onClick={() => addOne(r)}>Adicionar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
