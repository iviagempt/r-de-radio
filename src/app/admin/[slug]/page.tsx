"use client";

import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

type Station = {
  id: string;
  name: string;
  slug: string | null;
  city: string | null;
  country: string | null;
  description?: string | null;
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

export default async function AdminStationPage({
  params,
}: {
  params: { slug: string };
}) {
  const key = params.slug;
  const by = isUuid(key) ? { id: key } : { slug: key };

  const sb = getSb();

  // Carrega a estação por id OU por slug (conforme detectado)
  const { data: station, error } = await sb
    .from("stations")
    .select("id,name,slug,city,country,description")
    .match(by as any)
    .maybeSingle<Station>();

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin · Estação</h1>
        <p style={{ color: "#c00" }}>Erro ao carregar estação: {error.message}</p>
        <p>
          <Link href="/admin" style={{ color: "#0c63e4" }}>
            ← Voltar ao Admin
          </Link>
        </p>
      </main>
    );
  }

  if (!station) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Admin · Estação</h1>
        <p>Estação não encontrada.</p>
        <p>
          <Link href="/admin" style={{ color: "#0c63e4" }}>
            ← Voltar ao Admin
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 16 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px 0" }}>Admin · {station.name}</h1>
          <div style={{ color: "#666" }}>
            {station.city || ""} {station.country ? `• ${station.country}` : ""}
          </div>
          <div style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            ID: <code>{station.id}</code> · Slug: <code>{station.slug || "—"}</code>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/station/${station.slug || station.id}`} style={{ color: "#0c63e4" }}>
            Ver página pública →
          </Link>
          <Link href="/admin" style={{ color: "#0c63e4" }}>
            ← Voltar
          </Link>
        </div>
      </header>

      {/* Aqui você pode colocar o CRUD de streams e dados da estação */}
      <section style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
        <h2 style={{ marginTop: 0 }}>Editar estação (em breve)</h2>
        <p style={{ color: "#666" }}>
          Nesta área você poderá editar nome, slug, cidade/país e gerenciar os streams (url, prioridade, dvr_url).
        </p>
      </section>
    </main>
  );
}
