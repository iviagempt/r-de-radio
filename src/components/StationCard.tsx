"use client";
import { usePlayer } from "@/context/PlayerContext";

function StationCard({ station, ... }) {
  const { setStation } = usePlayer();
  return (
    <div className="card-link" onClick={() => setStation(station.streamUrl, station.name, station.logo_url, true)}>
      <img className="logo" src={station.logo_url} alt={station.name} />
      <div>{station.name}</div>
    </div>
  );
}
