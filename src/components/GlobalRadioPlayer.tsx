"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    __setStationToPlay?: (s: StationLite) => Promise<void>;
    Hls?: any;
  }
}

export type StationLite = {
  id: string;
  name: string;
  slug: string | null;
  logo_url: string | null;
};

type Stream = {
  url: string;
  dvr_url?: string | null;
  priority?: number | null;
};

export default function GlobalRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<any>(null);
  const [current, setCurrent] = useState<StationLite | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // lazy-load hls.js quando precisar
  async function ensureHls() {
    if (typeof window === "undefined") return null;
    if (window.Hls) return window.Hls;
    const mod = await import("hls.js");
    window.Hls = mod.default;
    return window.Hls;
  }

  useEffect(() => {
    window.__setStationToPlay = async (station: StationLite) => {
      setErrorMsg(null);
      setLoading(true);
      setCurrent(station);
      try {
        const res = await fetch(`/api/stations/${station.slug || station.id}/primary-stream`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao buscar stream");
        const data = await res.json();
        setStream({ url: data.url, dvr_url: data.dvr_url, priority: data.priority });
      } catch (e: any) {
        setErrorMsg(e?.message || "Erro ao carregar stream");
        setStream(null);
      } finally {
        setLoading(false);
      }
    };
    return () => {
      window.__setStationToPlay = undefined;
    };
  }, []);

  // carregar e tocar a stream
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !stream?.url) return;

    const url = stream.url;
    const isHls = url.endsWith(".m3u8") || url.includes(".m3u8");

    async function attachAndPlay() {
      // limpar HLS anterior
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
      audio.src = "";

      if (isHls && audio.canPlayType("application/vnd.apple.mpegURL") === "") {
        // Precisa de hls.js
        try {
          const Hls = await ensureHls();
          if (Hls && Hls.isSupported()) {
            const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsRef.current = hls;
            hls.attachMedia(audio);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              hls.loadSource(url);
              audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
            });
            hls.on(Hls.Events.ERROR, (_ev: any, data: any) => {
              console.error("HLS error", data);
              setErrorMsg("Erro no stream HLS");
            });
          } else {
            setErrorMsg("HLS não suportado");
          }
        } catch (e) {
          console.error(e);
          setErrorMsg("Falha ao inicializar HLS");
        }
      } else {
        // MP3/AAC/OGG direto
        audio.src = url;
        audio.play().then(() => setPlaying(true)).catch((err) => {
          console.error(err);
          setPlaying(false);
          setErrorMsg("Autoplay bloqueado. Clique em Tocar.");
        });
      }
    }

    attachAndPlay();

    return () => {
      if (hlsRef.current) {
        try {
          hlsRef.current.destroy();
        } catch {}
        hlsRef.current = null;
      }
    };
  }, [stream?.url]);

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {current?.logo_url ? (
          <img src={current.logo_url} alt={current.name} width={36} height={36} style={{ borderRadius: 6, objectFit: "contain" }} />
        ) : (
          <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f2f2f2" }} />
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {current ? current.name : "Selecione uma rádio"}
          </div>
          <audio
            ref={audioRef}
            controls
            style={{ width: "100%" }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {loading && <div style={{ color: "#666", fontSize: 12 }}>Carregando stream…</div>}
          {errorMsg && <div style={{ color: "#c00", fontSize: 12 }}>{errorMsg}</div>}
        </div>

        <button
          onClick={() => {
            const el = audioRef.current;
            if (!el) return;
            if (el.paused) {
              el.play().then(() => setPlaying(true)).catch(() => {});
            } else {
              el.pause();
              setPlaying(false);
            }
          }}
          style={{ padding: "8px 10px", borderRadius: 8, background: "#0c63e4", color: "#fff", border: 0, fontSize: 14 }}
        >
          {playing ? "Pausar" : "Tocar"}
        </button>
      </div>
    </div>
  );
}
