// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import StationGridClient from "@/components/StationGridClient";

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Page() {
  console.log("=== PAGE LOADING ===");
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("ANON_KEY exists:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: stations, error } = await sb
    .from("stations")
    .select("id, name, slug, logo_url, country, city, frequency_mhz, genres")
    .order("name", { ascending: true });

  console.log("Stations fetched:", stations?.length || 0);
  console.log("Error:", error);
  console.log("Stations data:", stations);

  return (
    <div style={{ padding: "16px", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16, color: "white" }}>Rádios Disponíveis</h1>
      
      {/* Debug info */}
      <div style={{ background: "rgba(255,255,255,0.1)", padding: 12, marginBottom: 16, borderRadius: 8 }}>
        <p style={{ color: "white", fontSize: 14 }}>
          Debug: {stations?.length || 0} estações encontradas
        </p>
        {error && (
          <p style={{ color: "red", fontSize: 14 }}>
            Erro: {JSON.stringify(error)}
          </p>
        )}
      </div>

      {stations && stations.length > 0 ? (
        <StationGridClient stations={stations} />
      ) : (
        <p style={{ color: "white" }}>Nenhuma rádio disponível no momento.</p>
      )}
    </div>
  );
}
