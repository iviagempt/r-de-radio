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
  const [fav, setFav] = useState(false);

  async function ensureHls() {
    if (typeof window === "undefined") return null;
    if (window.Hls) return window.Hls;
    const mod = await import("hls.js");
    window.Hls = mod.default;
    return window.Hls;
  }

  // Restaurar favorito por id
  useEffect(() => {
    if (current?.id) {
      const key = `fav:${current.id}`;
      setFav(localStorage.getItem(key) === "1");
    }
  }, [current?.id]);

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
        try { hlsRef.current.destroy(); } catch {}
        hlsRef.current = null;
      }
    };
  }, []);

  function toggleFav() {
    if (!current?.id) return;
    const key = `fav:${current.id}`;
    const next = !fav;
    setFav(next);
    if (next) localStorage.setItem(key, "1");
    else localStorage.removeItem(key);
    // aqui você pode também enviar ao backend/supabase se quiser persistir por usuário
  }

  return (
    <div className="player" style={{ position: "sticky", top: 0, zIndex: 20 }}>
      <div className="player-inner">
        {/* Logo da estação atual (sem nome) — acima do áudio */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {current?.logo_url ? (
            <img
              src={current.logo_url}
              alt={current.name || "Estação"}
              width={36}
              height={36}
              style={{ borderRadius: 6, objectFit: "contain" }}
            />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 6, background: "#f2f2f2" }} />
          )}

          {/* Botão de favoritos */}
          <button
            className={`fav-btn ${fav ? "active" : ""}`}
            onClick={toggleFav}
            title={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={fav}
            aria-label="Favoritos"
          >
            {fav ? "★" : "☆"}
          </button>
        </div>

        {/* Controles do áudio — player fino */}
        <div style={{ flex: 1 }}>
          <audio
            ref={audioRef}
            controls
            style={{ width: "100%" }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {loading && <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>Carregando…</div>}
          {errorMsg && <div style={{ color: "#c00", fontSize: 12, marginTop: 4 }}>{errorMsg}</div>}
        </div>

        {/* Botão Play/Pause rápido */}
        <button
          onClick={() => {
            const a = audioRef.current;
            if (!a) return;
            if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
            else { a.pause(); setPlaying(false); }
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            background: "#ffc600",
            color: "#1a1a1a",
            border: 0,
            fontSize: 14,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {playing ? "Pausar" : "Tocar"}
        </button>
      </div>
    </div>
  );
}
