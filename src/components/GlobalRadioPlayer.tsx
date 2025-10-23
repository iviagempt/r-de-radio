"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __playStation?: (s: StationLite) => Promise<void>;
    Hls?: any;
  }
}

export type StationLite = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
};

type Stream = { url: string; dvr_url?: string | null };

export default function GlobalRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);
  const [current, setCurrent] = useState<StationLite | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  async function ensureHls() {
    if (typeof window === "undefined") return null;
    if (window.Hls) return window.Hls;
    const mod = await import("hls.js");
    window.Hls = mod.default;
    return window.Hls;
  }

  useEffect(() => {
    window.__playStation = async (station: StationLite) => {
      const audio = audioRef.current;
      if (!audio) return;

      setCurrent(station);
      setLoading(true);
      setErrorMsg(null);

      try {
        // Buscar stream principal
        const res = await fetch(`/api/stations/${station.slug || station.id}/primary-stream`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao obter stream");
        const data: Stream = await res.json();
        const url = data.url;

        // Limpar HLS anterior
        if (hlsRef.current) {
          try {
            hlsRef.current.destroy();
          } catch {}
          hlsRef.current = null;
        }
        audio.src = "";

        // Detectar HLS
        const isHls = url.includes(".m3u8");
        if (isHls && audio.canPlayType("application/vnd.apple.mpegURL") === "") {
          const Hls = await ensureHls();
          if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            await new Promise<void>((resolve) => {
              hls.attachMedia(audio);
              hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                hls.loadSource(url);
                resolve();
              });
            });
          } else {
            throw new Error("HLS não suportado");
          }
        } else {
          // MP3/AAC direto
          audio.src = url;
        }

        // Autoplay (dentro do clique original, pois a função é disparada via onClick)
        await audio.play();
        setPlaying(true);
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Erro ao tocar stream");
        setPlaying(false);
      } finally {
        setLoading(false);
      }
    };

    return () => {
      window.__playStation = undefined;
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="player" style={{ position: "sticky", top: 0, zIndex: 20 }}>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Logo da estação atual */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {current?.logo_url ? (
          <img
            src={current.logo_url}
            alt={current.name}
            width={36}
            height={36}
            style={{ borderRadius: 6, objectFit: "contain" }}
          />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f2f2f2" }} />
        )}

        {/* Título + controles */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="title"
            style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {current ? current.name : "Selecione uma rádio"}
          </div>
          <audio
            ref={audioRef}
            controls
            style={{ width: "100%" }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {loading && <div style={{ color: "#666", fontSize: 12 }}>Carregando…</div>}
          {errorMsg && <div style={{ color: "#c00", fontSize: 12 }}>{errorMsg}</div>}
        </div>

        {/* Botão Play/Pause */}
        <button
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            if (a.paused) {
              a.play().then(() => setPlaying(true)).catch(() => {});
            } else {
              a.pause();
              setPlaying(false);
            }
          }}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            background: "#ffc600",
            color: "#1a1a1a",
            border: 0,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {playing ? "Pausar" : "Tocar"}
        </button>
      </div>
    </div>
  );
}
