// src/app/station/[id]/page.tsx
import { createClient } from "@supabase/supabase-js";
import RadioPlayerDVR2 from "@/components/RadioPlayerDVR2";

type StreamRow = {
  id: string;
  url: string;
  format: string | null;
  bitrate_kbps: number | null;
  priority: number | null;
  dvr_url: string | null;
};
type StationRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default async function StationPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServer();

  const { data: station, error: e1 } = await supabase
    .from("stations")
    .select("*")
    .eq("id", params.id)
    .single<StationRow>();

  if (e1 || !station) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Estação não encontrada</h1>
        {e1?.message ? <p style={{ color: "#666" }}>{e1.message}</p> : null}
      </main>
    );
  }

  const { data: streams } = await supabase
    .from("station_streams")
    .select("*")
    .eq("station_id", station.id)
    .order("priority", { ascending: true })
    .returns<StreamRow[]>();

  const main = streams?.[0] || null;

  return (
    <main style={{ padding: 24, display: "grid", gap: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>{station.name}</h1>
        <div style={{ color: "#666" }}>
          {station.city || ""} {station.country ? `• ${station.country}` : ""}
        </div>
      </div>

      {main ? (
        <RadioPlayerDVR2
          dvrUrl={main.dvr_url || undefined}
          liveUrl={main.url}
          autoPlay={false}
        />
      ) : (
        <div>Nenhum stream configurado para esta estação.</div>
      )}
    </main>
  );
}
