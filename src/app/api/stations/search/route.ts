import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const country = (searchParams.get("country") || "").trim();
  const city = (searchParams.get("city") || "").trim().toLowerCase();
  const genre = (searchParams.get("genre") || "").trim().toLowerCase();
  const freq = searchParams.get("freq"); // pode ser "100.5"

  const sb = createClient(url, anon);
  let query = sb.from("stations")
    .select("id, name, slug, logo_url, country, city, frequency_mhz, genres")
    .limit(50);

  if (q) {
    // busca no nome (case-insensitive)
    query = query.ilike("name", `%${q}%`);
  }
  if (country) query = query.eq("country", country);
  if (city) query = query.ilike("city", `%${city}%`);
  if (genre) {
    // gêneros como array de texto: busca por membro
    query = query.contains("genres", [genre]);
  }
  if (freq) {
    const f = Number(freq.replace(",", "."));
    if (!Number.isNaN(f)) {
      query = query.eq("frequency_mhz", f);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ items: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
