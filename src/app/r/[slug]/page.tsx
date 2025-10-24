import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";

export default async function StationPage({ params }: { params: { slug: string } }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = createClient(url, key);

  // 1) Buscar estação por slug (ou por id como fallback)
  const { data: bySlug, error: e1 } = await sb
    .from("stations")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (e1) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h1>Erro carregando estação</h1>
        <pre>{e1.message}</pre>
      </div>
    );
  }

  let station = bySlug;
  if (!station) {
    const { data: byId, error: eId } = await sb
      .from("stations")
      .select("*")
      .eq("id", params.slug)
      .maybeSingle();

    if (eId) {
      return (
        <div style={{ padding: 20, color: "white" }}>
          <h1>Erro carregando estação</h1>
          <pre>{eId.message}</pre>
        </div>
      );
    }
    station = byId as any;
  }

  if (!station) {
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h1>Estação não encontrada</h1>
        <p>Slug: {params.slug}</p>
        <a href="/" style={{ color: "#9cf" }}>← Voltar</a>
      </div>
    );
  }

  // 2) Buscar streams (compatível com schema atual)
  // 2) Buscar streams priorizando a principal (usa as novas colunas que você criou)
const { data: streams, error: e2 } = await sb
  .from("station_streams")
  .select("url, is_primary, format, bitrate_kbps")
  .eq("station_id", station.id)
  .order("is_primary", { ascending: false });

if (e2) {
  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Erro carregando streams</h1>
      <pre>{e2.message}</pre>
    </div>
  );
}

const primary = streams?.[0] || null;
const urlToPlay = primary?.url || null;

  const urlToPlay = streams?.[0]?.url || null;

  return (
    <div style={{ padding: 20, color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        {station.logo_url && (
          <img src={station.logo_url} alt={station.name} style={{ width: 64, height: 64, objectFit: "contain" }} />
        )}
        <h1 style={{ margin: 0 }}>{station.name}</h1>
      </div>

      {!urlToPlay ? (
        <p>Sem streams cadastradas para esta estação.</p>
      ) : (
        <>
          <audio controls autoPlay src={urlToPlay} style={{ width: "100%", maxWidth: 640 }} />
          <div style={{ marginTop: 8, opacity: 0.7 }}>Fonte: {urlToPlay}</div>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <a href="/" style={{ color: "#9cf" }}>← Voltar</a>
      </div>
    </div>
  );
}
