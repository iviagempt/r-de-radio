"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  liveUrl: string;   // URL do stream ao vivo (.m3u8, .mp3, .aac)
  dvrUrl?: string;   // URL HLS com janela (timeshift), opcional
  autoPlay?: boolean;
};

export default function RadioPlayerDVR2({ liveUrl, dvrUrl, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [usingDvr, setUsingDvr] = useState<boolean>(false);
  const [windowSec, setWindowSec] = useState<number | null>(null);
  const [canSeek, setCanSeek] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Calcula a janela do DVR a partir dos fragments (API estável no hls.js 1.5.x)
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

    // Se não é HLS, toca direto via <audio>
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

    // HLS
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls({
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

      hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
        const dur = computeWindowFromFragments((data as any)?.details);
        setWindowSec(dur);
        setCanSeek(!!dur && dur > 0);
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          try { hls.destroy(); } catch {}
          hlsRef.current = null;
          // Alguns navegadores (ex.: iOS Safari) tocam HLS nativamente
          audio.src = urlToUse;
        }
      });

      return () => {
        try { hls.destroy(); } catch {}
        hlsRef.current = null;
      };
    } else {
      // Fallback HLS nativo (Safari/iOS)
      audio.src = urlToUse;
      setLoading(false);
      if (autoPlay) audio.play().catch(() => {});
      setCanSeek(false);
      setWindowSec(null);
    }
  }, [liveUrl, dvrUrl, usingDvr, autoPlay]);

  // Controles de timeshift
  const seekBack = (minutes: number) => {
    if (!canSeek || !hlsRef.current) return;
    const media
