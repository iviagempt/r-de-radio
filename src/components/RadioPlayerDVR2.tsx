"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  liveUrl: string;
  dvrUrl?: string;
  autoPlay?: boolean;
};

export default function RadioPlayerDVR2({ liveUrl, dvrUrl, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [usingDvr, setUsingDvr] = useState<boolean>(false);
  const [windowSec, setWindowSec] = useState<number | null>(null);
  const [canSeek, setCanSeek] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const urlToUse = usingDvr && dvrUrl ? dvrUrl : liveUrl;
    const isHls = /\.m3u8(\?.*)?$/i.test(urlToUse);

    if (!isHls) {
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

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true, backBufferLength: 90 });
      hlsRef.current = hls;

      hls.attachMedia(audio);
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(urlToUse);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        if (autoPlay) audio.play().catch(() => {});
      });
      hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
        const dur = computeWindowFromFragments((data as any)?.details);
        setWindowSec(dur);
        setCanSeek(!!dur && dur > 0);
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          try { hls.destroy(); } catch {}
          hlsRef.current = null;
          audio.src = urlToUse;
        }
      });

      return () => {
        try { hls.destroy(); } catch {}
        hlsRef.current = null;
      };
    } else {
      audio.src = urlToUse;
      setLoading(false);
      if (autoPlay) audio.play().catch(() => {});
      setCanSeek(false);
      setWindowSec(null);
    }
  }, [liveUrl, dvrUrl, usingDvr, autoPlay]);

  const seekBack = (minutes: number) => {
    if (!canSeek || !audioRef.current || !hlsRef.current) return;
    const media = hlsRef.current.media;
    if (!media) return;
    try { media.currentTime = Math.max(0, (media.currentTime || 0) - minutes * 60); } catch {}
  };

  const goLive = () => {
    if (!audioRef.current || !hlsRef.current) return;
    const details: any = (hlsRef.current as any)?.levelDetails || (hlsRef.current as any)?.currentLevelDetails || null;
    if (details && Array.isArray(details.fragments) && details.fragments.length) {
      const last = details.fragments[details.fragments.length - 1];
      const end =
        typeof last?.start === "number" && typeof last?.duration === "number"
          ? last.start + last.duration
          : null;
      const media = hlsRef.current.media;
      if (media && typeof end === "number") {
        try { media.currentTime = end - 1; } catch {}
      }
    }
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
              <button onClick={() => setUsingDvr(false)}>Voltar ao Ao Vivo</button>
            </>
          ) : (
            <button onClick={() => setUsingDvr(true)}>Ativar Timeshift</button>
          )
        ) : null}
        {windowSec ? <span style={{ color: "#666" }}>Janela DVR ~ {Math.round(windowSec / 60)} min</span> : null}
        {loading && <span>Carregando...</span>}
      </div>
    </div>
  );
}
