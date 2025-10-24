// src/components/StationGridClient.tsx
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
      await sb.auth.signInWithOAuth({ provider: "google" });
      return;
    }
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
        <div key={s.id} title={s.name} style={{ position: "relative" }}>
          <button
            type="button"
            className="radio-card"
            style={{ width: "100%", minHeight: 120 }}
            onClick={() =>
              window.__playStation?.({
                id: s.id,
                name: s.name,
                slug: null, // força uso do ID
                logo_url: s.logo_url ?? null,
              })
            }
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
              title="Favoritar"
            >
              ❤️
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
