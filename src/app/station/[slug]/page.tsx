// src/app/station/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import RadioPlayerDVR2 from "@/components/RadioPlayerDVR2";
import Link from "next/link";

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
  slug: string | null;
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

// SEO dinâmico
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();
  const by = isUuid(params.slug) ? { id: params.slug } : { slug: params.slug };

  const { data: station } = await supabase
    .from("stations")
    .select("name,city,country,slug")
    .match(by as any)
    .maybeSingle<Pick<StationRow, "name" | "city" | "country" | "slug">>();

  const title = station ? `${station.name} – R de Rádio` : "R de Rádio – Estação";
  const description = station
    ? `Ouça ${station.name}${station.city ? ` de ${station.city}` : ""}${
        station.country ? `, ${station.country}` : ""
      } ao vivo.`
    : "Ouça rádios do mundo todo, simples e rápido.";

  const canonical = `https://r-de-radio.vercel.app/station/${station?.slug || params.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: "R de Rádio – by T de Trips", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function StationPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();

  const by = isUuid(params.slug) ? { id: params.slug } : { slug: params.slug };

  const { data: station } = await supabase
    .from("stations")
    .select("id,name,city,country,slug")
    .match(by as any)
    .maybeSingle<StationRow>();

  if (!station) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Estação não encontrada</h1>
        <p style={{ color: "#666" }}>
          Verifique o endereço ou volte à <Link href="/">página inicial</Link>.
        </p>
      </main>
    );
  }

  const { data: streams } = await supabase
    .from("station_streams")
    .select("id,url,priority,dvr_url")
    .eq("station_id", station.id)
    .order("priority", { ascending: true })
    .returns<StreamRow[]>();

  const main = streams?.[0] || null;

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px 0" }}>{station.name}</h1>
          <div style={{ color: "#666" }}>
            {station.city || ""} {station.country ? `• ${station.country}` : ""}
          </div>
        </div>
        <Link href="/" style={{ color: "#0c63e4" }}>← Voltar</Link>
      </header>

      {main ? (
        <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff", display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#111" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2ecc71", display: "inline-block" }} />
            <span style={{ fontSize: 14 }}>
              Stream principal: <code style={{ fontSize: 12 }}>{main.url}</code>
            </span>
          </div>
          <RadioPlayerDVR2 dvrUrl={main.dvr_url || undefined} liveUrl={main.url} autoPlay={false} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", color: "#666", fontSize: 13 }}>
            <span>Dica: ative Timeshift se a estação suportar DVR.</span>
          </div>
        </section>
      ) : (
        <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
          <div style={{ marginBottom: 8 }}>Nenhum stream configurado para esta estação.</div>
          <div>
            <Link href="/admin" style={{ color: "#0c63e4" }}>Ir ao Admin</Link> para adicionar um stream.
          </div>
        </section>
      )}
    </main>
  );
}
