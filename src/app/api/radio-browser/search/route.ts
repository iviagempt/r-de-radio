import { NextResponse } from "next/server";

const API_BASES = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

async function rbFetch(path: string) {
  let lastError: any;
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: {
          "User-Agent": "R-de-Radio/1.0 (https://r-de-radio.vercel.app)",
        },
        next: { revalidate: 0 },
      });
      if (res.ok) return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("All Radio Browser mirrors failed");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const country = searchParams.get("country")?.trim();
  const tag = searchParams.get("tag")?.trim();
  const limit = Number(searchParams.get("limit") ?? "30");

  let path = `/json/stations/search?limit=${limit}&hidebroken=true`;
  if (q) path += `&name=${encodeURIComponent(q)}`;
  if (country) path += `&countrycode=${encodeURIComponent(country)}`;
  if (tag) path += `&tag=${encodeURIComponent(tag)}`;

  const res = await rbFetch(path);
  const data = await res.json();

  // Normalize o retorno para o formato do seu app
  const stations = (data as any[]).map((s) => ({
    external_id: s.stationuuid,
    name: s.name,
    country: s.countrycode || s.country,
    city: s.state || null,
    favicon: s.favicon || null,
    website_url: s.homepage || null,
    stream_url: s.url_resolved || s.url,
    tags: s.tags ? s.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    bitrate_kbps: s.bitrate || null,
    codec: s.codec || null,
  }));

  return NextResponse.json({ stations });
}
