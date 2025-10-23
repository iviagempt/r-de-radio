import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Station = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function getSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function AdminStationPage({ params }: { params: { slug: string } }) {
  const key = params.slug;
  const by = isUuid(key) ? { id: key } : { slug: key };

  const sb = getSb();
  const { data: station, error } = await sb
    .from("stations")
    .select("id,name,slug,city,country")
    .match(by as any)
    .maybeSingle<Station>();

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin · Estação</h1>
        <p style={{ color: "#c00" }}>Erro: {error.message}</p>
        <p><Link href="/admin" style={{ color: "#0c63e4" }}>← Voltar</Link></p>
      </main>
    );
  }

  if (!station) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin · Estação</h1>
        <p>Estação não encontrada.</p>
        <p><Link href="/admin" style={{ color: "#0c63e4" }}>← Voltar</Link></p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px 0" }}>Admin · {station.name}</h1>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            ID: <code>{station.id}</code> · Slug: <code>{station.slug || "—"}</code>
          </div>
        </div>
        <Link href={`/station/${station.slug || station.id}`} style={{ color: "#0c63e4" }}>
          Ver página pública →
        </Link>
      </header>

      <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Gestão da estação</h2>
        <p style={{ color: "#666" }}>Aqui virá o CRUD de dados e streams.</p>
      </section>
    </main>
  );
}
