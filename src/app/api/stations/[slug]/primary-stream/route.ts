import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const sb = createClient(url, anon);

  // Buscar a estação pelo slug OU id
  const slugOrId = decodeURIComponent(params.slug);
  const { data: station, error: errStation } = await sb
    .from("stations")
    .select("id, slug")
    .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
    .maybeSingle();

  if (errStation || !station) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  // Buscar stream principal (priorize 'primary' se existir uma flag; caso não, pegue a primeira)
  const { data: streams, error: errStream } = await sb
    .from("station_streams")
    .select("url, is_primary")
    .eq("station_id", station.id)
    .order("is_primary", { ascending: false })
    .limit(1);

  if (errStream || !streams || streams.length === 0) {
    return NextResponse.json({ error: "Stream not found" }, { status: 404 });
  }

  const stream = streams[0];
  return NextResponse.json({ url: stream.url });
}
