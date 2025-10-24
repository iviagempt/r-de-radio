"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import StationCard from "@/components/StationCard";
import ElegantPlayer from "@/components/ElegantPlayer";

type Station = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
  city: string | null;
  country: string | null;
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
      const main = streams.find((s: any) => s.is_primary) || streams[0];
      setPlaying({ station, url: main.url });
      
      // Registrar no histórico
      await supabase.from("listening_history").insert({
        station_id: station.id,
        user_ip: null,
        user_agent: navigator.userAgent
      });
    } else {
      alert("Nenhum stream disponível para esta estação.");
    }
  };

  return (
    <main className="container">
      <h1 className="title">Ouça Rádios do Mundo</h1>
      <p className="subtitle" style={{ marginBottom: 24 }}>
        Simples, rápido e gratuito.
      </p>

      {/* Player elegante com logo em destaque */}
      {playing && (
        <section style={{ marginBottom: 32 }}>
          <ElegantPlayer 
            src={playing.url} 
            stationName={playing.station.name}
            stationLogo={playing.station.logo_url || undefined}
          />
          <button
            onClick={() => setPlaying(null)}
            className="backlink"
            style={{ 
              marginTop: 16, 
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
              width: "fit-content"
            }}
          >
            ✕ Fechar player
          </button>
        </section>
      )}

      {/* Grid de estações */}
      <div className="grid">
        {stations.length > 0 ? (
          stations.map((s) => (
            <StationCard 
              key={s.id}
              stationId={s.id}
              name={s.name} 
              logo={s.logo_url || undefined} 
              onClick={() => playStation(s)} 
            />
          ))
        ) : (
          <p className="subtitle">Carregando estações...</p>
        )}
      </div>
    </main>
  );
}
