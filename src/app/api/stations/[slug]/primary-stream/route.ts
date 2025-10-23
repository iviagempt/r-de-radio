// src/app/api/stations/[slug]/primary-stream/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const sb = createClient(url, anon);

    // Aceita slug OU id (uuid)
    const slugOrId = decodeURIComponent(params.slug);

    // 1) Busca estação por slug ou id
    const { data: station, error: errStation } = await sb
      .from("stations")
      .select("id, slug")
      .or(`slug.eq.${slugOrId},id.eq.${slugOrId}`)
      .maybeSingle();

    if (errStation || !station) {
      return NextResponse.json({ ok: true });
}

    // 2) Busca um stream disponível (sem depender de is_primary)
    // Opcional: se você tiver coluna created_at, pode adicionar .order("created_at", { ascending: false })
    const { data: streams, error: errStream } = await sb
      .from("station_streams")
      .select("url")
      .eq("station_id", station.id)
      .limit(1);

    if (errStream || !streams || streams.length === 0) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    return NextResponse.json(
      { url: streams[0].url },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
