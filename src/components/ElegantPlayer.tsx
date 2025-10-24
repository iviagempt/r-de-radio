"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

interface ElegantPlayerProps {
  streamUrl?: string;
  src?: string;
  logoUrl?: string;
  stationLogo?: string;
  stationName?: string;
  autoPlay?: boolean;
}

export default function ElegantPlayer(props: ElegantPlayerProps = {}) {
  // tenta obter contexto — se não houver (uso isolado) a função usePlayer irá lançar erro,
  // por isso tratamos com try/catch:
  let ctx = null;
  try {
    ctx = usePlayer();
  } catch (e) {
    ctx = null;
  }

  const {
    streamUrl,
    src,
    logoUrl,
    stationLogo,
    stationName,
    autoPlay = false,
  } = props;

  const effectiveStream = streamUrl ?? src ?? (ctx?.player.streamUrl ?? "");
  const effectiveLogo = logoUrl ?? stationLogo ?? (ctx?.player.logoUrl ?? undefined);
  const effectiveName = stationName ?? (ctx?.player.stationName ?? "Nome da Estação");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(ctx?.player.isPlaying ?? false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isBuffering, setIsBuffering] = useState(false);

  // sincroniza estado isPlaying se houver contexto
  useEffect(() => {
    if (!ctx) return;
    setIsPlaying(ctx.player.isPlaying);
  }, [ctx?.player.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      setIsBuffering(false);
      setIsPlaying(false);
    };

    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = effectiveStream || "";
    audio.load();

    // se o contexto diz que deve estar a tocar ou se props autoPlay foi pedida
    const shouldPlay = ctx ? ctx.player.isPlaying : isPlaying || autoPlay;
    if (shouldPlay) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveStream]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (ctx) ctx.pause();
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      if (ctx) ctx.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => setIsMuted((v) => !v);
  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  return (
    <div className="elegant-player" role="region" aria-label={`Player - ${effectiveName}`}>
      <audio ref={audioRef} src={effectiveStream} preload="none" />
      <div className="player-logo-container">
        {effectiveLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={effectiveLogo} alt={effectiveName} className="player-logo" />
        ) : (
          <div className="player-logo-placeholder" aria-hidden>🎧</div>
        )}
      </div>

      <div className="player-station-name">{effectiveName}</div>

      <div className="player-controls">
        <button className="control-btn play-btn" onClick={togglePlay} aria-pressed={isPlaying} aria-label={isPlaying ? "Pausar" : "Tocar"}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>

        <button className="control-btn mute-btn" onClick={toggleMute} aria-pressed={isMuted} aria-label={isMuted ? "Desativar mudo" : "Ativar mudo"}>
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><path d="M9 9v6h4l5 5V4l-5 5H9z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 9v6h4l5 5V4l-5 5H9z"/></svg>
          )}
        </button>

        <input className="volume-slider" type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={onVolumeChange} aria-label="Volume" />
      </div>

      <div style={{ position: "absolute", right: 16, top: 16 }}>
        {isBuffering ? (
          <div className="live-indicator"><span className="live-dot" /> <span className="live-text">Buffering…</span></div>
        ) : isPlaying ? (
          <div className="live-indicator"><span className="live-dot" /> <span className="live-text">Ao vivo</span></div>
        ) : null}
      </div>
    </div>
  );
}
