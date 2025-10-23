import { NextResponse } from "next/server";

const BASE = "https://de1.api.radio-browser.info/json";

function pickHttps(url?: string | null) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? url : null;
  } catch { return null; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const country = searchParams.get("country") || "";
  const tag = searchParams.get("tag") || "";

  let endpoint = "";
  if (name) {
    endpoint = `${BASE}/stations/search?name=${encodeURIComponent(name)}&hidebroken=true`;
  } else if (country) {
    endpoint = `${BASE}/stations/bycountry/${encodeURIComponent(country)}?hidebroken=true`;
  } else if (tag) {
    endpoint = `${BASE}/stations/bytag/${encodeURIComponent(tag)}?hidebroken=true`;
  } else {
    return NextResponse.json({ error: "Informe name, country ou tag" }, { status: 400 });
  }

  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "Falha na API Radio Browser" }, { status: 502 });
  const data = await res.json();

  const filtered = (data as any[])
    .map((r) => {
      const url = r.url_resolved || r.url;
      const https = pickHttps(url);
      return {
        stationuuid: r.stationuuid,
        name: r.name,
        country: r.country,
        state: r.state,
        language: r.language,
        tags: r.tags,
        favicon: r.favicon,
        codec: r.codec,
        bitrate: r.bitrate,
        url: https, // só https; navegadores bloqueiam http
      };
    })
    .filter((r) => r.url && ["mp3", "aac", "mpeg", "aacp"].includes(String(r.codec).toLowerCase()))
    .slice(0, 100); // limita para UI

  return NextResponse.json(filtered);
}
