// src/app/station/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import RadioPlayerDVR2 from "@/components/RadioPlayerDVR2";

type StreamRow = {
  id: string;
  url: string;
  priority: number | null;
  dvr_url: string | null;
};
type StationRow = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  slug: string;
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default async function StationBySlugPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();

  const { data: station } = await supabase
    .from("stations")
    .select("id,name,city,country,slug")
    .eq("slug", params.slug)
    .maybeSingle<StationRow>();

  if (!station) {
    return <main style={{ padding: 24 }}><h1>Estação não encontrada</h1></main>;
  }

  const { data: streams } = await supabase
    .from("station_streams")
    .select("id,url,priority,dvr_url")
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
