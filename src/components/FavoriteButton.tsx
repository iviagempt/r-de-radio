"use client";
import { useState, useEffect } from "react";

interface FavoriteButtonProps {
  stationId: string;
  size?: "small" | "medium" | "large"; // opcional, com valores possíveis
}

export default function FavoriteButton({ stationId, size = "medium" }: FavoriteButtonProps) {
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

  // Define tamanho baseado na prop size
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };
  const btnSize = sizeMap[size] || sizeMap.medium;

  return (
    <button
      onClick={toggle}
      className={`favorite-btn ${isFavorite ? "active" : ""}`}
      style={{ width: btnSize, height: btnSize }}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <svg
        width={btnSize / 2}
        height={btnSize / 2}
        viewBox="0 0 24 24"
        fill={isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
