import { createClient } from "@supabase/supabase-js";
import StationCard from "@/components/StationCard";

export const dynamic = "force-dynamic";

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default async function Home() {
  const supabase = getSupabaseServer();

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, slug, logo_url")
    .order("name");

  return (
    <main className="container">
      <h1 className="title">R de Rádio</h1>
      <p className="subtitle" style={{ marginBottom: 24 }}>
        Ouça rádios do mundo todo, simples e rápido.
      </p>

      <div className="grid">
        {stations && stations.length > 0 ? (
          stations.map((s) => (
            <StationCard
              key={s.id}
              href={`/station/${s.slug || s.id}`}
              name={s.name}
              logo={s.logo_url || undefined}
            />
          ))
        ) : (
          <p className="subtitle">Nenhuma estação cadastrada ainda.</p>
        )}
      </div>
    </main>
  );
}
