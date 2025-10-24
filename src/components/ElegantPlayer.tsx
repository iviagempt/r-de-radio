"use client";

import { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext"; // importa o hook

export default function ElegantPlayer(props?: any) {
  const ctx = (() => {
    try {
      return usePlayer();
    } catch {
      return null;
    }
  })();

  // se o layout chamou sem props, usa o contexto; se tiver props, usa props (compatibilidade)
  const effectiveStream = props?.streamUrl || props?.src || ctx?.player.streamUrl || "";
  const effectiveLogo = props?.logoUrl || props?.stationLogo || ctx?.player.logoUrl;
  const effectiveName = props?.stationName || ctx?.player.stationName || "Nome da Estação";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(ctx?.player.isPlaying ?? false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isBuffering, setIsBuffering] = useState(false);

  // quando o contexto muda (p.ex. setStation), sincroniza o player
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
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
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
          <div className="player-logo-placeholder" aria-hidden>
            🎧
          </div>
        )}
      </div>

      <div className="player-station-name">{effectiveName}</div>

      <div className="player-controls">
        <button className="control-btn play-btn" onClick={togglePlay} aria-pressed={isPlaying}>
          {isPlaying ? "⏸" : "▶️"}
        </button>
        <button className="control-btn mute-btn" onClick={toggleMute}>{isMuted ? "🔇" : "🔊"}</button>
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
