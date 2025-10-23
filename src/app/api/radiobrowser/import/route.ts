import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(url, anon);

export async function POST(req: Request) {
  const body = await req.json();
  const { name, country, state, favicon, url: streamUrl, codec, bitrate } = body || {};

  if (!name || !streamUrl) {
    return NextResponse.json({ error: "name e url são obrigatórios" }, { status: 400 });
  }

  // 1) cria/acha estação
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const { data: station } = await supabase
    .from("stations")
    .upsert({ name, country, city: state || null, slug, favicon: favicon || null }, { onConflict: "slug" })
    .select("*")
    .single();

  if (!station) {
    return NextResponse.json({ error: "Falha ao criar estação" }, { status: 500 });
  }

  // 2) cria stream principal
  const { error: e2 } = await supabase.from("station_streams").insert({
    station_id: station.id,
    url: streamUrl,
    format: codec || null,
    bitrate_kbps: bitrate || null,
    priority: 1,
    dvr_url: null,
  });

  if (e2) {
    return NextResponse.json({ error: e2.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, station_id: station.id, slug, name });
}
