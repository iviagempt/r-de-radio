"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { getUserSession } from "@/lib/session";
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

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<{ station: Station; url: string } | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const supabase = getSupabaseClient();
    const session = getUserSession();
    
    const { data, error } = await supabase
      .from("favorites")
      .select(`
        station:stations(id, name, slug, logo_url, city, country)
      `)
      .eq("user_session", session)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar favoritos:", error);
    } else if (data) {
      setFavorites(data.map((item: any) => item.station));
    }
    
    setLoading(false);
  };

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
      <h1 className="title">⭐ Favoritos</h1>
      <p className="subtitle" style={{ marginBottom: 24 }}>
        Suas rádios preferidas
      </p>

      {/* Player elegante */}
      {/* Player local removido — usamos o player persistente no layout */}
{playing && (
  <section style={{ marginBottom: 32 }}>
    <button onClick={() => setPlaying(null)} className="backlink">✕ Fechar</button>
  </section>
)}
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

      {loading ? (
        <p className="subtitle">Carregando favoritos...</p>
      ) : favorites.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p className="subtitle" style={{ marginBottom: 16 }}>
            Você ainda não tem favoritos.
          </p>
          <p style={{ fontSize: 14, color: "var(--text-dimmer)", marginBottom: 24 }}>
            Clique no ❤️ nas rádios para adicioná-las aqui!
          </p>
        </div>
      ) : (
        <div className="grid">
          {favorites.map((s) => (
            <StationCard 
              key={s.id}
              stationId={s.id}
              name={s.name} 
              logo={s.logo_url || undefined} 
              onClick={() => playStation(s)} 
            />
          ))}
        </div>
      )}
    </main>
  );
}
