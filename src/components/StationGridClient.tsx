"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Station = {
  id: string;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
};

declare global {
  interface Window {
    __playStation?: (s: Station) => Promise<void>;
  }
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function StationGridClient({ stations }: { stations: Station[] }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function toggleFavorite(stationId: string) {
    if (!user) {
      // Se não estiver logado, inicia login (Google)
      await sb.auth.signInWithOAuth({ provider: "google" });
      return;
    }
    // Tenta inserir; se já existir (unique), então remove
    const { error } = await sb
      .from("user_favorites")
      .insert({ user_id: user.id, station_id: stationId });
    if (error) {
      await sb
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("station_id", stationId);
    }
  }

  return (
    <div className="grid-logos">
      {stations.map((s) => (
        <div key={s.id} className="radio-card" title={s.name} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() =>
              window.__playStation?.({
                id: s.id,
                name: s.name,
                slug: null, // força uso do ID no fetch
                logo_url: s.logo_url ?? null,
              })
            }
            style={{ display: "grid", placeItems: "center", width: "100%", minHeight: 120 }}
          >
            {s.logo_url ? (
              <img src={s.logo_url} alt={s.name} />
            ) : (
              <span>{s.name}</span>
            )}
          </button>

          {user && (
            <button
              aria-label="Favoritar"
              onClick={() => toggleFavorite(s.id)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "rgba(0,0,0,0.45)",
                borderRadius: 8,
                padding: 6,
              }}
            >
              ❤️
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
