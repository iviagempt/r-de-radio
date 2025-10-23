import { createClient } from "@supabase/supabase-js";
import GlobalRadioPlayer, { StationLite } from "@/components/GlobalRadioPlayer";
import StationGridClient from "@/components/StationGridClient";

function getSb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export default async function Home() {
  const sb = getSb();
  const { data: stations, error } = await sb
    .from("stations")
    .select("id,name,slug,logo_url")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>R de Rádio – by T de Trips</h1>
        <p style={{ color: "#c00" }}>Erro ao carregar estações: {error.message}</p>
      </main>
    );
  }

  const list: StationLite[] = (stations || []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo_url: s.logo_url,
  }));

  return (
    <>
      <GlobalRadioPlayer />
      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ margin: "8px 0 16px" }}>
          <form action="/search" method="GET" style={{ maxWidth: 420 }}>
            <input type="search" name="q" placeholder="Pesquisar estações…" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }} />
          </form>
        </div>
        <StationGridClient stations={list} />
      </main>
    </>
  );
}
