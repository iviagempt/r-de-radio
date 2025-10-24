"use client";
import { useState, useEffect } from "react";

export default function FavoriteButton({ stationId }: { stationId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favs.includes(stationId));
  }, [stationId]);

  const toggle = () => {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavs = isFavorite
      ? favs.filter((id: string) => id !== stationId)
      : [...favs, stationId];
    localStorage.setItem("favorites", JSON.stringify(newFavs));
    setIsFavorite(!isFavorite);
  };

  return (
    <button
      onClick={toggle}
      className={`favorite-btn ${isFavorite ? "active" : ""}`}
      style={{ width: 48, height: 48 }}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
