// src/components/GlobalRadioPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Station = {
  id: string;
  name: string;
  slug?: string | null;
  logo_url?: string | null;
};

declare global {
  interface Window {
    __playStation?: (s: Station) => Promise<void>;
  }
}

export default function GlobalRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Station | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.9);

  // Instancia um único <audio> e expõe a função global para tocar estações
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    el.volume = volume;
    audioRef.current = el;

    const onCanPlay = () => setStatus("playing");
    const onError = () => {
      setStatus("error");
      setErrorMsg("Falha ao carregar stream");
    };

    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("error", onError);

    // Função global chamada pelos cards de estação
    window.__playStation = async (s: Station) => {
      try {
        setStatus("loading");
        setErrorMsg(null);
        setCurrent(s);

        const slugOrId = s.slug || s.id;
        const res = await fetch(`/api/stations/${slugOrId}/primary-stream`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao obter stream");
        const { url } = await res.json();
        if (!url) throw new Error("Stream inválido");

        const a = audioRef.current!;
        a.src = url;
        await a.play();
        setStatus("playing");
      } catch (e: any) {
        console.error(e);
        setStatus("error");
        setErrorMsg(e?.message || "Não foi possível reproduzir");
      }
    };

    return () => {
      el.pause();
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  // Atualiza volume quando o estado muda
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {
        setStatus("error");
        setErrorMsg("Não foi possível reproduzir");
      });
    } else {
      a.pause();
      setStatus("idle");
    }
  }

  // ESCONDE COMPLETAMENTE O PLAYER ATÉ UMA RÁDIO SER ESCOLHIDA
  if (!current) return null;

  return (
    <div
      className="player-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Esquerda: apenas info (sem avatar, sem placeholders) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{ display: "grid" }}>
          {current?.name && (
            <strong
              style={{
                fontSize: 14,
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                overflow: "hidden",
                maxWidth: 220,
              }}
            >
              {current.name}
            </strong>
          )}
          <span className="text-muted" style={{ fontSize: 12 }}>
            {status === "playing" ? "A reproduzir" : status === "loading" ? "A carregar..." : errorMsg || ""}
          </span>
