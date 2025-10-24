// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return (
        <div style={{ padding: 20, color: "white" }}>
          <h1>Erro de configuração</h1>
          <p>Variáveis de ambiente não configuradas.</p>
        </div>
      );
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    const { data: stations, error } = await sb
      .from("stations")
      .select("id, name, slug, logo_url, city")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Supabase error:", error);
      return (
        <div style={{ padding: 20, color: "white" }}>
          <h1>Erro ao carregar rádios</h1>
          <p>{error.message}</p>
        </div>
      );
    }

    return (
      <div style={{ padding: 20 }}>
        <h1 style={{ fontSize: 28, marginBottom: 20 }}>
          Rádios Disponíveis
        </h1>

        {!stations || stations.length === 0 ? (
          <p>Nenhuma rádio encontrada.</p>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 20
          }}>
            {stations.map((station) => (
              <a
                key={station.id}
                href={`/r/${station.slug || station.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: 15,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 12,
                  textDecoration: "none"
                }}
              >
                {station.logo_url ? (
                  <img
                    src={station.logo_url}
                    alt={station.name}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "contain",
                      marginBottom: 10
                    }}
                  />
                ) : (
                  <div style={{
                    width: 80,
                    height: 80,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10
                  }}>
                    <span style={{ fontSize: 32 }}>📻</span>
                  </div>
                )}
                <span style={{
                  color: "white",
                  fontSize: 14,
                  textAlign: "center",
                  fontWeight: 500
                }}>
                  {station.name}
                </span>
                {station.city && (
                  <span style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                    marginTop: 4
                  }}>
                    {station.city}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error("Page error:", err);
    return (
      <div style={{ padding: 20, color: "white" }}>
        <h1>Erro</h1>
        <p>Ocorreu um erro ao carregar a página.</p>
      </div>
    );
  }
}
