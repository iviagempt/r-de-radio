// src/app/page.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

type Station = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  slug?: string | null;
};

function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

export default async function Home() {
  const supabase = getSupabaseServer();

  const { data: stations } = await supabase
    .from("stations")
    .select("id,name,city,country, slug")
    .order("name", { ascending: true })
    .returns<Station[]>();

  const countries = Array.from(
    new Set((stations || []).map(s => (s.country || "").trim()).filter(Boolean))
  ).sort();

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ marginBottom: 8 }}>R de Rádio – by T de Trips</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Descubra estações e toque instantaneamente.
      </p>

      <Filters />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
          marginTop: 16,
        }}
      >
        {(stations || []).map((s) => (
          <StationCard key={s.id} station={s} />
        ))}
      </div>

      <style>{`
        @media (max-width: 640px) {
          .filters { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </main>
  );
}

function Filters() {
  return (
    <div className="filters" style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <input
        type="search"
        placeholder="Pesquisar estações..."
        onChange={(e) => {
          const q = e.currentTarget.value.toLowerCase();
          for (const card of document.querySelectorAll<HTMLElement>("[data-card]")) {
            const text = card.dataset.search || "";
            card.style.display = text.includes(q) ? "" : "none";
          }
        }}
        style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd", flex: 1 }}
      />
      <select
        defaultValue=""
        onChange={(e) => {
          const v = e.currentTarget.value;
          for (const card of document.querySelectorAll<HTMLElement>("[data-card]")) {
            const c = card.dataset.country || "";
            card.style.display = !v || c === v ? "" : "none";
          }
        }}
        style={{ padding: "10px 12px", borderRadius: 6, border: "1px solid #ddd" }}
      >
        <option value="">Todos os países</option>
        {/* dica: você pode gerar as opções dinamicamente do servidor se preferir */}
        <option value="Brasil">Brasil</option>
        <option value="Portugal">Portugal</option>
      </select>
    </div>
  );
}

function StationCard({
  station,
}: {
  station: {
    id: string;
    name: string;
    city: string | null;
    country: string | null;
    slug?: string | null;
  };
}) {
  const subtitle = [station.city, station.country].filter(Boolean).join(" • ");
  const searchKey = (station.name + " " + subtitle).toLowerCase();

  // Se existir slug usa /station/slug; senão faz fallback para /station/id
  const href = `/station/${station.slug || station.id}`;

  return (
    <div
      data-card
      data-country={station.country || ""}
      data-search={searchKey}
      style={{
        border: "1px solid #eee",
        borderRadius: 10,
        padding: 12,
        background: "#fff",
        display: "grid",
        gap: 8,
      }}
    >
      <div style={{ fontWeight: 700 }}>{station.name}</div>
      {subtitle ? <div style={{ color: "#666", fontSize: 14 }}>{subtitle}</div> : null}

      {/* Pode usar <Link> do next ou <a>. Aqui vai <a> simples para zero dependências */}
      <a href={href} style={{ marginTop: 4, color: "#0c63e4" }}>
        Ouvir ▸
      </a>
    </div>
  );
}
