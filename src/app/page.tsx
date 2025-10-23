// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Station = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
};

function getSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function Home() {
  const sb = getSb();
  const { data: stations, error } = await sb
    .from("stations")
    .select("id,name,slug,city,country")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main style={{ padding: "24px 16px" }}>
        <h1>R de Rádio</h1>
        <p style={{ color: "#c00" }}>Erro ao carregar estações: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "24px 16px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>R de Rádio</h1>

      {/* Busca server-friendly (sem onChange) */}
      <form action="/search" method="GET" style={{ maxWidth: 420, marginBottom: 16 }}>
        <input
          type="search"
          name="q"
          placeholder="Pesquisar estações…"
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
        />
      </form>

      {/* Lista de estações */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {stations?.map((s) => (
          <Link
            key={s.id}
            href={`/station/${s.slug || s.id}`}
            style={{ border: "1px solid #eee", borderRadius: 10, padding: 12, background: "#fff", textDecoration: "none", color: "inherit" }}
          >
            <strong>{s.name}</strong>
            <div style={{ color: "#666", fontSize: 13 }}>
              {s.city || ""} {s.country ? `• ${s.country}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
