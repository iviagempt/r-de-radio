// src/components/HomeClient.tsx
"use client";
import { useState } from "react";
import StationSearchBar from "@/components/StationSearchBar";
import StationGridClient from "@/components/StationGridClient";

export default function HomeClient({ initialStations }: { initialStations: any[] }) {
  const [items, setItems] = useState(initialStations);
  return (
    <>
      <StationSearchBar onResults={setItems} />
      <StationGridClient stations={items} />
    </>
  );
}
