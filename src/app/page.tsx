// src/app/page.tsx
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
        <h1 style={{ fontSize: 18, margin: 0 }}>R de Rádio – by T de Trips</h1>
        <p style={{ color: "#c00" }}>Erro ao carregar estações: {error.message}</p>
      </main>
    );
  }

  const list: StationLite[] = (stations || []).map(s => ({ id: s.id, name: s.name, slug: s.slug, logo_url: s.logo_url }));

  return (
    <>
      <GlobalRadioPlayer />
      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <StationGridClient stations={list} />
      </main>
    </>
  );
}
import AdSlot from "@/components/AdSlot";

export default async function Home() {
  // ... seu fetch
  return (
    <>
      {/* Player global */}
      {/* ... */}

      <main style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        {/* Banner no topo da Home */}
        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_TOP_SLOT!}
          style={{ display: "block", textAlign: "center", minHeight: 90, margin: "10px 0 16px" }}
        />

        {/* Grade de rádios */}
        {/* ... */}

        {/* Banner no final da Home */}
        <AdSlot
          slot={process.env.NEXT_PUBLIC_ADSENSE_HOME_BOTTOM_SLOT!}
          style={{ display: "block", textAlign: "center", minHeight: 90, margin: "16px 0 10px" }}
        />
      </main>
    </>
  );
}
