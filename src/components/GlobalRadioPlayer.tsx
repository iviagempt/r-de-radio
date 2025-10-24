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

  // Instancia um único <audio>
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

    // Função global para tocar estação pelo Grid
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
        setErrorMsg(e?.message || "Falha ao obter stream");
      }
    };

    return () => {
      el.pause();
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []); // não depende de volume aqui para não recriar o áudio

  // Atualiza volume em tempo real
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

  // Se quiser que o player só apareça após escolher uma rádio, descomente:
  // if (!current) return null;

  return (
    <div
      className="player-bar"
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      {/* Esquerda: Logo + info (sem placeholder “RDR”) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        {/* Avatar só aparece se a estação tiver logo */}
        {current?.logo_url &&
