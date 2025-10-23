"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type Props = {
  dvrUrl?: string;   // HLS com janela (gerada por você)
  liveUrl: string;   // stream ao vivo original
  autoPlay?: boolean;
};

export default function RadioPlayerDVR({ dvrUrl, liveUrl, autoPlay = true }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasDvr, setHasDvr] = useState(false);
  const [state, setState] = useState<"idle"|"loading"|"playing"|"paused"|"error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [windowSec, setWindowSec] = useState<number | null>(null);
  const [livePos, setLivePos] = useState<number | null>(null);
  const [cur, setCur] = useState<number>(0);

  useEffect(() => {
    const audio = (audioRef.current ??= new Audio());
    audio.preload = "none";
    audio.crossOrigin = "anonymous";

    const onTime = () => setCur(audio.currentTime);
    const onPlaying = () => setState("playing");
    const onPause = () => setState("paused");
    const onWaiting = () => setState("loading");
    const onError = () => { setState("error"); setError("Erro de reprodução"); };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
    };
  }, []);

  const destroyHls = () => { try { hlsRef.current?.destroy(); } catch {} hlsRef.current = null; };

  const start = async () => {
    setError(null);
    setState("loading");
    destroyHls();

    const preferDvr = Boolean(dvrUrl && Hls.isSupported());
    const src = preferDvr ? dvrUrl! : liveUrl;

    if (Hls.isSupported() && /\.m3u8($|\?)/i.test(src)) {
      const hls = new Hls({ maxBufferLength: 10, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(audioRef.current!);

      hls.on(Hls.Events.LEVEL_UPDATED, (_e, data) => {
        const start = data.details?.fragmentStart ?? 0;
        const end = data.details?.fragmentEnd ?? 0;
        const dur = end - start;
        setWindowSec(dur || null);
        setLivePos(end || null);
        setHasDvr(preferDvr && Boolean(dur && dur > 60));
      });

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await audioRef.current!.play();
          setState("playing");
        } catch (e: any) {
          setState("error");
          setError(e?.message ?? "Não foi possível iniciar");
        }
      });

      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setState("error");
          setError("HLS fatal");
        }
      });
    } else {
      setHasDvr(false);
      audioRef.current!.src = src;
      try {
        await audioRef.current!.play();
        setState("playing");
      } catch (e: any) {
        setState("error");
        setError(e?.message ?? "Não foi possível iniciar");
      }
    }
  };

  const pause = () => audioRef.current?.pause();

  const seekToMinutesFromLive = (mins: number) => {
    if (!hasDvr || !livePos || !audioRef.current) return;
    const target = Math.max(0, livePos - mins * 60);
    audioRef.current.currentTime = target;
  };

  const goLive = () => {
    if (!hasDvr || !livePos || !audioRef.current) return;
    audioRef.current.currentTime = livePos;
  };

  useEffect(() => {
    if (autoPlay) start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dvrUrl, liveUrl]);

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        {(state === "playing" || state === "loading") ? (
          <button onClick={pause}>Pause</button>
        ) : (
          <button onClick={start}>Play</button>
        )}
        {hasDvr && (
          <>
            <button onClick={() => seekToMinutesFromLive(10)}>⏪ 10 min</button>
            <button onClick={() => seekToMinutesFromLive(30)}>⏪ 30 min</button>
            <button onClick={goLive}>Live</button>
          </>
        )}
        <span style={{ fontSize: 12, color: "#666" }}>
          {state === "loading" && "Conectando..."}
          {state === "playing" && "Reproduzindo"}
          {state === "paused" && "Pausado"}
          {state === "idle" && "Pronto"}
          {state === "error" && "Erro"}
        </span>
      </div>

      <audio ref={audioRef} controls preload="none" style={{ width: "100%" }} />

      {hasDvr && windowSec && livePos && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
          Janela DVR: ~{Math.round(windowSec / 60)} min • Agora você está ~{Math.max(0, Math.round((livePos - cur) / 60))} min atrás do ao vivo
        </div>
      )}

      {error && <div style={{ color: "crimson", marginTop: 6 }}>{error}</div>}
    </div>
  );
}
