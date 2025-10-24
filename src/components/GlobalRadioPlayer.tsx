// src/components/GlobalRadioPlayer.tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Station = { id: string; name: string; slug?: string | null; logo_url?: string | null };

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
  const [bufferSecs, setBufferSecs] = useState<number>(60); // 60 | 250 | 360

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

    // registrar função global
    window.__playStation = async (s: Station) => {
      try {
        setStatus("loading");
        setErrorMsg(null);
        setCurrent(s);

        // Busca a URL do stream pela API (usa slug ou id)
        const slugOrId = s.slug || s.id;
        const res = await fetch(`/api/stations/${slugOrId}/primary-stream`, { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao obter stream");
        const { url } = await res.json();
        if (!url) throw new Error("Stream inválido");

        // Pre-buffer simples: faz uma “pré-conexão” aguardando N segundos antes de dar play
        // Para streams contínuos MP3/AAC, não há buffer size fixo. Esta espera reduz stutter inicial.
        const a = audioRef.current!;
        a.src = url;

        // inicia silent load
        await a.load();

        // aguardar bufferSecs (você pode mudar no seletor)
        await new Promise((r) => setTimeout(r, bufferSecs * 1000));

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
  }, [bufferSecs, volume]);

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

  return (
    <div className="player-bar" style={{
      display: "grid",
      gridTemplateColumns: "auto 1fr auto",
      alignItems: "center",
      gap: 12
    }}>
      {/* Esquerda: Logo + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, overflow: "hidden",
          background: "rgba(255,255,255,0.08)", display: "grid", placeItems: "center"
        }}>
          {current?.logo_url ? (
            <img src={current.logo_url} alt={current.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 12, opacity: 0.7 }}>RDR</span>
          )}
        </div>
        <div style={{ display: "grid" }}>
          <strong style={{ fontSize: 14, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: 220 }}>
            {current?.name || "R de Rádio"}
          </strong>
          
        </div>
      </div>

      {/* Centro: controles principais */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={togglePlay} title="Play/Pause" style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
          {audioRef.current?.paused ? "▶️" : "⏸️"}
        </button>

        {/* Seletor de buffer */}
        <label className="text-muted" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Buffer:
          <select value={bufferSecs} onChange={(e) => setBufferSecs(Number(e.target.value))}>
            <option value={60}>60s</option>
            <option value={250}>250s</option>
            <option value={360}>360s</option>
          </select>
        </label>
      </div>

      {/* Direita: volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span title="Volume">🔊</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ width: 120 }}
        />
      </div>
    </div>
  );
}
