// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import StationGridClient from "@/components/StationGridClient";

export const revalidate = 0;

export default async function Page() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: stations } = await sb
    .from("stations")
    .select("id, name, slug, logo_url, country, city, frequency_mhz, genres")
    .order("name", { ascending: true })
    .limit(24);

  return <StationGridClient stations={stations ?? []} />;
}
