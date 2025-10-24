"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type HistoryItem = {
  id: string;
  listened_at: string;
  station: {
    id: string;
    name: string;
    logo_url: string | null;
    city: string | null;
    country: string | null;
  };
};

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default function HistoricoPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    
    supabase
      .from("listening_history")
      .select(`
        id,
        listened_at,
        station:stations(id, name, logo_url, city, country)
      `)
      .order("listened_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (error) {
          console.error("Erro ao carregar histórico:", error);
        } else if (data) {
          setHistory(data as any);
        }
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora mesmo";
    if (minutes < 60) return `Há ${minutes} min`;
    if (hours < 24) return `Há ${hours}h`;
    if (days < 7) return `Há ${days} dias`;
    
    return date.toLocaleDateString("pt-PT", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };

  return (
    <main className="container">
      <h1 className="title">📜 Histórico</h1>
      <p className="subtitle" style={{ marginBottom: 32 }}>
        Rádios que você ouviu recentemente
      </p>

      {loading ? (
        <p className="subtitle">Carregando histórico...</p>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <p className="subtitle">Nenhuma rádio ouvida ainda.</p>
          <Link href="/" className="backlink" style={{ marginTop: 16, display: "inline-block" }}>
            ← Voltar para Home
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {history.map((item) => (
            <div key={item.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {item.station.logo_url ? (
                <img 
                  src={item.station.logo_url} 
                  alt={item.station.name}
                  style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8 }}
                />
              ) : (
                <div style={{ 
                  width: 64, 
                  height: 64, 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: 32,
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 8
                }}>
                  📻
                </div>
              )}
              
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {item.station.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {item.station.city && `${item.station.city} • `}
                  {item.station.country}
                </div>
              </div>
              
              <div style={{ fontSize: 13, color: "var(--text-dimmer)", textAlign: "right" }}>
                {formatDate(item.listened_at)}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
