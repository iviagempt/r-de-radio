"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function StationGridClient({ stations }: { stations: any[] }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function toggleFavorite(stationId: string) {
    if (!user) {
      await supabase.auth.signInWithOAuth({ provider: "google" }); // ou magic link
      return;
    }
    // tenta inserir; se já existir, apaga
    const { error: insErr } = await supabase.from("user_favorites").insert({ user_id: user.id, station_id: stationId });
    if (insErr) {
      // se unique violation, remove
      await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("station_id", stationId);
    }
  }

  return (
    <div className="grid-logos">
      {stations.map((s) => (
        <div key={s.id} className="radio-card" title={s.name} style={{ position: "relative" }}>
          <button
            onClick={() => window.__playStation?.({ id: s.id, name: s.name, slug: null, logo_url: s.logo_url ?? null })}
            type="button"
            style={{ display: "grid", placeItems: "center", width: "100%" }}
          >
            {s.logo_url ? <img src={s.logo_url} alt={s.name} /> : <span>{s.name}</span>}
          </button>

          {user && (
            <button
              aria-label="Favoritar"
              onClick={() => toggleFavorite(s.id)}
              style={{
                position: "absolute", top: 8, right: 8,
                background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: 6
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
