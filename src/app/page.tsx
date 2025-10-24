"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import StationCard from "@/components/StationCard";
import { usePlayer } from "@/context/PlayerContext";

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
  const { setStation } = usePlayer();

  useEffect(() => {
    const supabase = getSupabaseClient();
    supabase
      .from("stations")
      .select("id, name, slug, logo_url, city, country")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro carregando estações:", error);
          return;
        }
        if (data) setStations(data as Station[]);
      });
  }, []);

  const playStation = async (station: Station) => {
    const supabase = getSupabaseClient();

    try {
      const { data: streams, error } = await supabase
        .from("station_streams")
        .select("url, is_primary, priority")
        .eq("station_id", station.id)
        .order("priority", { ascending: true });

      if (error) {
        console.error("Erro ao buscar streams:", error);
        alert("Erro ao buscar streams da estação.");
        return;
      }

      if (streams && streams.length > 0) {
        const main = (streams as any).find((s: any) => s.is_primary) || (streams as any)[0];
        const streamUrl = main.url;

        // Diz ao player global para tocar esta estação
        setStation(streamUrl, station.name, station.logo_url || undefined, true);

        // Regista histórico (não bloqueante)
        supabase.from("listening_history").insert({
          station_id: station.id,
          user_ip: null,
          user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        }).then(({ error: insertError }) => {
          if (insertError) console.warn("Não foi possível registar histórico:", insertError);
        });
      } else {
        alert("Nenhum stream disponível para esta estação.");
      }
    } catch (err) {
      console.error("Erro ao tentar tocar estação:", err);
      alert("Ocorreu um erro ao tentar tocar a estação.");
    }
  };

  return (
    <main className="container">
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
