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
  slug: string;
  description?: string | null;
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

// SEO dinâmico por estação
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();
  const { data: station } = await supabase
    .from("stations")
    .select("name,city,country,slug")
    .eq("slug", params.slug)
    .maybeSingle<Pick<StationRow, "name" | "city" | "country" | "slug">>();

  const title = station ? `${station.name} – R de Rádio` : "R de Rádio – Estação";
  const description = station
    ? `Ouça ${station.name}${station.city ? ` de ${station.city}` : ""}${
        station.country ? `, ${station.country}` : ""
      } ao vivo.`
    : "Ouça rádios do mundo todo, simples e rápido.";

  const url = `https://r-de-radio.vercel.app/station/${params.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "R de Rádio – by T de Trips",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function StationBySlugPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();

  const { data: station } = await supabase
    .from("stations")
    .select("id,name,city,country,slug")
    .eq("slug", params.slug)
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
        <section
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 16,
            background: "#fff",
            display: "grid",
            gap: 12,
          }}
        >
          {/* Barra de status simples */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#111" }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#2ecc71",
                display: "inline-block",
              }}
              title="Ao vivo"
            />
            <span style={{ fontSize: 14 }}>
              Stream principal: <code style={{ fontSize: 12 }}>{main.url}</code>
            </span>
          </div>

          {/* Player DVR com botões próprios */}
          <RadioPlayerDVR2 dvrUrl={main.dvr_url || undefined} liveUrl={main.url} autoPlay={false} />

          {/* Rodapé de ações rápidas */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", color: "#666", fontSize: 13 }}>
            <span>Dica: use “Ativar Timeshift” para retroceder se a estação suportar DVR.</span>
          </div>
        </section>
      ) : (
        <section
          style={{
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 16,
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: 8 }}>Nenhum stream configurado para esta estação.</div>
          <div>
            <Link href="/admin" style={{ color: "#0c63e4" }}>Ir ao Admin</Link> para adicionar um stream.
          </div>
        </section>
      )}
    </main>
  );
}
