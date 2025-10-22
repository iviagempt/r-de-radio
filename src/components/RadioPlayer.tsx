"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  primaryUrl: string;
  fallbacks?: string[];
  autoPlay?: boolean; // padrão: true
};

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export default function RadioPlayer({ primaryUrl, fallbacks = [], autoPlay = true }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // lista ordenada de candidatos
  const sources = useMemo(() => {
    const list = [primaryUrl, ...fallbacks].filter(Boolean);
    return list;
  }, [primaryUrl, fallbacks]);

  const currentSrc = sources[currentIndex] ?? "";

  // listeners básicos do <audio>
  useEffect(() => {
    const audio = (audioRef.current ??= new Audio());
    audio.preload = "none";
    audio.crossOrigin = "anonymous";

    const onPlaying = () => setState("playing");
    const onPause = () => setState("paused");
    const onWaiting = () => setState("loading");
    const onError = () => {
      setState("error");
      setError("Falha ao reproduzir este stream.");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // aplica mute e volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    audioRef.current.volume = volume;
  }, [muted, volume]);

  // limpa instância HLS atual
  const destroyHls = () => {
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {}
      hlsRef.current = null;
    }
  };

  // tenta reproduzir uma fonte por índice
  const loadAndPlay = async (idx: number) => {
    if (!audioRef.current || !sources[idx]) return;
    const audio = audioRef.current;

    setError(null);
    setState("loading");
    setCurrentIndex(idx);

    // limpar estado anterior
    destroyHls();
    audio.pause();
    audio.src = "";

    const src = sources[idx];

    // timeout de conexão (ex.: 10s) para evitar travar em fontes que não respondem
    let timeoutId: any;
    const setupTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        audio.pause();
        if (Hls.isSupported() && hlsRef.current) {
          destroyHls();
        }
        setState("error");
        setError("Tempo limite ao conectar. Tentando próxima fonte...");
        // tenta próximo automaticamente
        const next = idx + 1;
        if (next < sources.length) {
          loadAndPlay(next);
        }
      }, 10000);
    };

    try {
      if (Hls.isSupported() && /\.m3u8($|\?)/i.test(src)) {
        const hls = new Hls({
          maxBufferLength: 10,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(audio);

        setupTimeout();

        await new Promise<void>((resolve, reject) => {
          hls.on(Hls.Events.MANIFEST_PARSED, async () => {
            try {
              clearTimeout(timeoutId);
              await audio.play();
              resolve();
            } catch (e) {
              reject(e);
            }
          });
          hls.on(Hls.Events.ERROR, (_e, data) => {
            // fatal: trocar de stream
            if (data.fatal) {
              reject(new Error("HLS fatal error"));
            }
          });
        });

        setState("playing");
      } else {
        // MP3/AAC direto
        audio.src = src;
        setupTimeout();
        await audio.play();
        clearTimeout(timeoutId);
        setState("playing");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      setState("error");
      setError(err?.message ?? "Não foi possível reproduzir.");
      // tenta próximo automaticamente
      const next = idx + 1;
      if (next < sources.length) {
        loadAndPlay(next);
      }
    }
  };

  const play = async () => {
    if (!audioRef.current) return;
    if (!sources.length) {
      setError("Nenhuma fonte disponível.");
      return;
    }
    // se está idle/erro ou não tem src atual, começa do primeiro
    if (state === "idle" || !sources[currentIndex]) {
      await loadAndPlay(0);
      return;
    }
    try {
      await audioRef.current.play();
      setState("playing");
    } catch (e: any) {
      setState("error");
      setError(e?.message ?? "Erro ao reproduzir.");
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setState("paused");
  };

  const nextSource = () => {
    const next = currentIndex + 1;
    if (next < sources.length) {
      loadAndPlay(next);
    }
  };

  // quando primaryUrl/fallbacks mudarem, reinicia se autoPlay estiver ativo
  useEffect(() => {
    if (!sources.length) return;
    if (autoPlay) {
      loadAndPlay(0);
    } else {
      setState("idle");
      setCurrentIndex(0);
      setError(null);
      destroyHls();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources.join("|"), autoPlay]);

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      {/* manter o controls nativo é útil; mas agora também temos botões custom */}
      <audio ref={audioRef} controls preload="none" style={{ width: "100%" }} />

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
        {(state === "playing" || state === "loading") ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={play}>Play</button>
        )}
        <button onClick={nextSource} disabled={sources.length <= 1}>Tentar próximo</button>

        <button onClick={() => setMuted((m) => !m)}>{muted ? "Unmute" : "Mute"}</button>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(volume * 100)}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          style={{ width: 160 }}
          title={`Volume: ${Math.round(volume * 100)}%`}
        />

        <span style={{ fontSize: 12, color: "#666" }}>
          {state === "loading" && "Conectando..."}
          {state === "playing" && "Reproduzindo"}
          {state === "paused" && "Pausado"}
          {state === "idle" && "Pronto"}
          {state === "error" && "Erro"}
        </span>
      </div>

      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, wordBreak: "break-all" }}>
        Fonte atual: {currentSrc || "—"}
      </div>

      {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
