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
        const res = await fetch(`/api/stations/${station.slug || station.id}/primary-stream`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao obter stream");
        const data: Stream = await res.json();
        const url = data.url;

        // Limpar HLS anterior
        if (hlsRef.current) {
          try { hlsRef.current.destroy(); } catch {}
          hlsRef.current = null;
        }
        audio.src = "";

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
          audio.src = url;
        }

        // Autoplay no clique do card
        await audio.play().catch(() => {});
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Erro ao tocar stream");
      } finally {
        setLoading(false);
      }
    };

    return () => {
      window.__playStation = undefined;
      if (hlsRef.current) {
        try { hlsRef.current.destroy(); } catch {}
        hlsRef.current = null;
      }
    };
  }, []);

  return (
    <div className="player" style={{ position: "sticky", top: 0, zIndex: 20 }}>
      <div className="player-inner">
        {/* Logo grande ao lado (acima visualmente do player) */}
        <div className="player-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {current?.logo_url ? (
            <img src={current.logo_url} alt={current.name || "Estação"} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 10, background: "rgba(255,255,255,0.08)" }} />
          )}
        </div>

        {/* Controles nativos do áudio (sem botão extra) */}
        <div style={{ flex: 1 }}>
          <audio
            ref={audioRef}
            controls
            style={{ width: "100%" }}
          />
          {loading && <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Carregando…</div>}
          {errorMsg && <div style={{ color: "#c00", fontSize: 12, marginTop: 4 }}>{errorMsg}</div>}
        </div>
      </div>
    </div>
  );
}
