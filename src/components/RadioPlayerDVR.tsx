// src/components/RadioPlayerDVR.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  liveUrl: string;        // URL do stream ao vivo (.m3u8, .mp3, .aac)
  dvrUrl?: string;        // URL HLS com janela (timeshift), opcional
  autoPlay?: boolean;
};

export default function RadioPlayerDVR({ liveUrl, dvrUrl, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [usingDvr, setUsingDvr] = useState<boolean>(false);
  const [windowSec, setWindowSec] = useState<number | null>(null);
  const [canSeek, setCanSeek] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper: calcula janela a partir de fragments (compatível com hls.js 1.5.x)
  function computeWindowFromFragments(details: any) {
    const frags = Array.isArray(details?.fragments) ? details.fragments : [];
    if (!frags.length) return null;

    const first = frags[0];
    const last = frags[frags.length - 1];

    const start = typeof first?.start === "number" ? first.start : 0;
    const end =
      typeof last?.start === "number" && typeof last?.duration === "number"
        ? last.start + last.duration
        : 0;

    const dur = Math.max(0, end - start);
    return dur || null;
  }

  // Inicializa player HLS quando usando dvrUrl (.m3u8 com janela)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Se for usar HLS (DVR ou live HLS)
    const urlToUse = usingDvr && dvrUrl ? dvrUrl : liveUrl;
    const isHls = /\.m3u8(\?.*)?$/i.test(urlToUse);

    // Se não é HLS, toca direto
    if (!isHls) {
      // cleanup HLS se existir
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.src = urlToUse;
      setLoading(false);
      if (autoPlay) audio.play().catch(() => {});
      setCanSeek(false);
      setWindowSec(null);
      return;
    }

    // HLS.js disponível e suportado?
    if (Hls.isSupported()) {
      // clean up anterior
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
        // algumas configs conservadoras
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.attachMedia(audio);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(urlToUse);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) audio.play().catch(() => {});
      });

      // Atualiza janela quando nível for atualizado
      hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
        const dur = computeWindowFromFragments(data?.details);
        setWindowSec(dur);
        // Se houver janela (> 0), podemos habilitar seek
        setCanSeek(!!dur && dur > 0);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        // erro fatal -> fallback para <audio> direto
        if (data.fatal) {
          try {
            hls.destroy();
          } catch {}
          hlsRef.current = null;
          audio.src = urlToUse; // ainda é .m3u8; alguns navegadores iOS podem tocar nativo
        }
      });

      return () => {
        try {
          hls.destroy();
        } catch {}
        hlsRef.current = null;
      };
    } else {
      // iOS Safari costuma tocar HLS nativo
      audio.src = urlToUse;
      setLoading(false);
      if (autoPlay) audio.play().catch(() => {});
      setCanSeek(false);
      setWindowSec(null);
    }
  }, [liveUrl, dvrUrl, usingDvr, autoPlay]);

  // Ações de timeshift
  const seekBack = (minutes: number) => {
    if (!canSeek || !audioRef.current || !hlsRef.current) return;
    const audio = audioRef.current as HTMLAudioElement;
    const hls = hlsRef.current as Hls;
    const media = hls.media;
    if (!media) return;

    try {
      const target = Math.max(0, (media.currentTime || 0) - minutes * 60);
      media.currentTime = target;
    } catch {
      // ignora
    }
  };

  const goLive = () => {
    if (!audioRef.current || !hlsRef.current) return;
    const hls = hlsRef.current as Hls;
    const details: any = (hls as any)?.levelDetails || (hls as any)?.currentLevelDetails || null;

    let liveEdge: number | null = null;
    if (details && Array.isArray(details.fragments) && details.fragments.length) {
      const last = details.fragments[details.fragments.length - 1];
      const end =
        typeof last?.start === "number" && typeof last?.duration === "number"
          ? last.start + last.duration
          : null;
      liveEdge = end ?? null;
    }

    try {
      const media = hls.media;
      if (media && typeof liveEdge === "number") {
        media.currentTime = liveEdge - 1; // vai para o fim (quase live)
      }
    } catch {
      // ignora
    }
  };

  const switchToDvr = () => {
    if (!dvrUrl) return;
    setUsingDvr(true);
  };
  const switchToLive = () => {
    setUsingDvr(false);
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <audio ref={audioRef} controls style={{ width: "100%" }} />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {dvrUrl ? (
          usingDvr ? (
            <>
              <button onClick={() => seekBack(10)} disabled={!canSeek}>⏪ 10 min</button>
              <button onClick={() => seekBack(30)} disabled={!canSeek}>⏪ 30 min</button>
              <button onClick={goLive} disabled={!canSeek}>Live</button>
              <button onClick={switchToLive}>Voltar ao Ao Vivo</button>
            </>
          ) : (
            <button onClick={switchToDvr}>Ativar Timeshift</button>
          )
        ) : null}

        {windowSec ? (
          <span style={{ color: "#666" }}>
            Janela DVR ~ {Math.round(windowSec / 60)} min
          </span>
        ) : null}

        {loading && <span>Carregando...</span>}
      </div>
    </div>
  );
}
