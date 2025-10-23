// src/app/page.tsx
import { createClient } from "@supabase/supabase-js";
import GlobalRadioPlayer, { StationLite } from "@/components/GlobalRadioPlayer";
import StationGridClient from "@/components/StationGridClient";
import AdSlot from "@/components/AdSlot";

function getSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Opcional (escolha um se quiser):
// export const revalidate = 0;
// export const dynamic = "force-dynamic";

export default async function Home() {
  const sb = getSb();
  const { data: stations, error } = await sb
