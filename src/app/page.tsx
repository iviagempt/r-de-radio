import { createClient } from "@supabase/supabase-js";
import StationCard from "@/components/StationCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const sb = createClient(url, key);

  const { data: stations } = await sb
    .from("stations")
    .select("id, name, slug, logo_url")
    .order("name");

  return (
    <div style={{ padding: 20, color: "#fff" }}>
      <h1>Home</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {stations?.map((s) => (
          <StationCard
  key={s.id}
  href={`/station/${s.slug || s.id}`}
  name={s.name}
  logo={s.logo_url || undefined}
/>
        )) || <p>Nenhuma estação.</p>}
      </div>
    </div>
  );
}
