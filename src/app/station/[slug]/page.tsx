// src/app/station/[slug]/page.tsx
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import AudioPlayer from "@/components/AudioPlayer";

type StreamRow = {
  id: string;
  url: string;
  // Suporte a ambos modelos de schema:
  // - schema antigo (priority)
  // - schema novo (is_primary, format, bitrate_kbps, dvr_url)
  priority?: number | null;
  is_primary?: boolean | null;
  format?: string | null;
  bitrate_kbps?: number | null;
  dvr_url?: string | null;
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

export const dynamic = "force-dynamic";

export default async function StationPage({ params }: { params: { slug: string } }) {
  const supabase = getSupabaseServer();
  const by = isUuid(params.slug) ? { id: params.slug } : { slug: params.slug };

  // Estação
  const { data: station, error: eStation } = await supabase
    .from("stations")
    .select("id,name,city,country,slug")
    .match(by as any)
    .maybeSingle<StationRow>();

  if (eStation) {
    return (
      <main className="container">
        <h1 className="title">Erro carregando estação</h1>
        <pre>{eStation.message}</pre>
        <p style={{ marginTop: 8 }}>
          <Link href="/" className="backlink">← Voltar</Link>
        </p>
      </main>
    );
  }

  if (!station) {
    return (
      <main className="container">
        <h1 className="title">Estação não encontrada</h1>
        <p className="subtitle">
          Verifique o endereço ou volte à <Link href="/" className="backlink">página inicial</Link>.
        </p>
      </main>
    );
  }

  // Streams — tentar schema novo; se falhar, cair para o antigo
  let streams: StreamRow[] | null = null;
  let eStreams: any = null;

  // Tentativa com colunas novas
  {
    const { data, error } = await supabase
      .from("station_streams")
      .select("id,url,is_primary,format,bitrate_kbps,dvr_url,priority")
      .eq("station_id", station.id);
    streams = data as StreamRow[] | null;
    eStreams = error;
  }

  if (eStreams) {
    // fallback minimalista (schema antigo)
    const { data } = await supabase
      .from("station_streams")
      .select("id,url,priority")
      .eq("station_id", station.id);
    streams = data as StreamRow[] | null;
  }

  // Ordenação: primeiro is_primary (desc), depois priority (asc)
  const sorted = (streams || []).slice().sort((a, b) => {
    const ap = (a.is_primary ? 1 : 0) - (b.is_primary ? 1 : 0);
    if (ap !== 0) return -ap; // is_primary true primeiro
    const apr = a.priority ?? Number.MAX_SAFE_INTEGER;
    const bpr = b.priority ?? Number.MAX_SAFE_INTEGER;
    return apr - bpr;
  });

  const main = sorted[0] || null;
  const urlToPlay = main?.url || null;

  return (
    <main className="container">
      <header className="header">
        <div>
          <h1 className="title">{station.name}</h1>
          <div className="subtitle">
            {station.city || ""} {station.country ? `• ${station.country}` : ""}
          </div>
        </div>
        <Link href="/" className="backlink">← Voltar</Link>
      </header>

      {!urlToPlay ? (
        <section className="card">
          <div style={{ marginBottom: 8 }}>Nenhum stream configurado para esta estação.</div>
          <div>
            <Link href="/admin" className="backlink">Ir ao Admin</Link> para adicionar um stream.
          </div>
        </section>
      ) : (
        <section className="card" style={{ display: "grid", gap: 14 }}>
          <div className="row">
            <span className="dot" />
            <span style={{ fontSize: 14 }}>
              Stream principal: <code className="code">{urlToPlay}</code>
            </span>
          </div>

          {/* Player com autoplay muted e fallback HLS */}
          <div className="audio">
            <AudioPlayer src={urlToPlay} />
          </div>

          {/* Metadados opcionais */}
          <div className="meta">
            {typeof main?.is_primary === "boolean" && (
              <span>Principal: {main.is_primary ? "Sim" : "Não"}</span>
            )}
            {typeof main?.priority === "number" && <span>Prioridade: {main.priority}</span>}
            {main?.format && <span>Formato: {main.format}</span>}
            {main?.bitrate_kbps && <span>Bitrate: {main.bitrate_kbps} kbps</span>}
            {main?.dvr_url && <span>DVR disponível</span>}
          </div>
        </section>
      )}
    </main>
  );
}
