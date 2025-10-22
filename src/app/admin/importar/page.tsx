"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ImportarRadiosPage() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [tag, setTag] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const buscar = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (country) params.set("country", country);
      if (tag) params.set("tag", tag);
      params.set("limit", "30");
      const res = await fetch(`/api/radio-browser/search?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      setItems(data.stations || []);
      if (!data.stations?.length) setMsg("Nenhum resultado.");
    } catch (e: any) {
      setMsg(e.message ?? "Erro ao buscar.");
    } finally {
      setLoading(false);
    }
  };

  const importar = async (s: any) => {
    setMsg(null);
    // 1) cria station
    const { data: st, error: e1 } = await supabase
      .from("stations")
      .insert({
        name: s.name,
        city: s.city,
        country: s.country,
        website_url: s.website_url,
        is_active: true,
      })
      .select()
      .single();
    if (e1) {
      setMsg("Erro ao criar estação: " + e1.message);
      return;
    }
    // 2) cria stream principal
    const { error: e2 } = await supabase.from("station_streams").insert({
      station_id: st.id,
      url: s.stream_url,
      format: s.codec?.toUpperCase() ?? null,
      bitrate_kbps: s.bitrate_kbps,
      priority: 1,
      is_active: true,
    });
    if (e2) {
      setMsg("Estação criada, mas falhou ao inserir stream: " + e2.message);
      return;
    }
    setMsg(`Importado: ${s.name}`);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>Importar Rádios (Radio Browser)</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input placeholder="Nome (q)" value={q} onChange={(e) => setQ(e.target.value)} />
        <input placeholder="País (country code, ex: BR, PT)" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input placeholder="Tag (ex: pop, news)" value={tag} onChange={(e) => setTag(e.target.value)} />
        <button onClick={buscar} disabled={loading}>{loading ? "Buscando..." : "Buscar"}</button>
      </div>

      {msg && <p>{msg}</p>}

      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {items.map((s) => (
          <li key={s.external_id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {s.favicon ? <img src={s.favicon} alt="" width={24} height={24} /> : <div style={{ width: 24 }} />}
              <div style={{ flex: 1 }}>
                <strong>{s.name}</strong>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {s.country}{s.city ? ` • ${s.city}` : ""} {s.tags?.length ? ` • ${s.tags.slice(0, 4).join(", ")}` : ""}
                </div>
                <div style={{ color: "#999", fontSize: 12 }}>{s.website_url || ""}</div>
                <div style={{ color: "#999", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis" }}>{s.stream_url}</div>
              </div>
              <button onClick={() => importar(s)}>Importar</button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
