"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import StationCard from "@/components/StationCard";
import AudioPlayer from "@/components/AudioPlayer";

type Station = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  city: string | null;
  country: string | null;
};

type Stream = {
  url: string;
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default function Home() {
  const [stations, setStations] = useState<Station[]>([]);
  const [playing, setPlaying] = useState<{ station: Station; url: string } | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase
      .from("stations")
      .select("id, name, slug, logo_url, city, country")
      .order("name")
      .then(({ data }) => {
        if (data) setStations(data);
      });
  }, []);

  const playStation = async (station: Station) => {
    const supabase = getSupabaseClient();
    const { data: streams } = await supabase
      .from("station_streams")
      .select("url, is_primary, priority")
      .eq("station_id", station.id)
      .order("priority", { ascending: true });

    if (streams && streams.length > 0) {
      // Priorizar is_primary ou pegar a primeira
      const main = streams.find((s: any) => s.is_primary) || streams[0];
      setPlaying({ station, url: main.url });
    } else {
      alert("Nenhum stream disponível para esta estação.");
    }
  };

  return (
    <main className="container">
      <h1 className="title">R de Rádio</h1>
      <p className="subtitle" style={{ marginBottom: 24 }}>
        Ouça rádios do mundo todo, simples e rápido.
      </p>

      {/* Player fixo no topo */}
      {playing && (
        <section className="card" style={{ marginBottom: 24, display: "grid", gap: 12 }}>
          <div className="row">
            <span className="dot" />
            <div>
              <div style={{ fontWeight: 600, marginBottom: 2 }}>{playing.station.name}</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>
                {playing.station.city || ""} {playing.station.country ? `• ${playing.station.country}` : ""}
              </div>
            </div>
          </div>
          <AudioPlayer src={playing.url} />
          <button
            onClick={() => setPlaying(null)}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,.08)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              cursor: "pointer",
            }}
          >
            Parar
          </button>
        </section>
      )}

      {/* Grid de estações */}
      <div className="grid">
        {stations.length > 0 ? (
          stations.map((s) => (
            <StationCard key={s.id} name={s.name} logo={s.logo_url || undefined} onClick={() => playStation(s)} />
          ))
        ) : (
          <p className="subtitle">Carregando estações...</p>
        )}
      </div>
    </main>
  );
}
