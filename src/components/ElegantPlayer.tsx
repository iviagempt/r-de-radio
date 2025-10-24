"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";

export default function ElegantPlayer() {
  const ctx = (() => { try { return usePlayer(); } catch { return null; } })();

  const streamUrl = ctx?.player.streamUrl ?? "";
  const stationName = ctx?.player.stationName ?? "RDR";
  const logo = ctx?.player.logoUrl ?? undefined;
  const shouldPlay = ctx?.player.isPlaying ?? false;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(shouldPlay);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  useEffect(() => {
    setIsPlaying(ctx?.player.isPlaying ?? false);
  }, [ctx?.player.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = streamUrl || "";
    audio.load();

    if ((ctx?.player.isPlaying ?? false) && streamUrl) {
      audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => { setIsBuffering(false); setIsPlaying(true); };
    const onPause = () => setIsPlaying(false);
    const onError = () => { setIsBuffering(false); setIsPlaying(false); };

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

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      ctx?.pause();
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      ctx?.play();
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => setIsMuted((v) => !v);

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    ctx?.setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  return (
    <div className="elegant-player" role="region" aria-label={`Player - ${stationName}`}>
      <audio ref={audioRef} preload="none" />
      <div className="player-logo-container" aria-hidden>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt={stationName} className="player-logo" />
        ) : (
          <div className="player-logo-placeholder">🎧</div>
        )}
      </div>

      <div className="player-content">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div className="player-station-name">{stationName}</div>
          {isBuffering ? <div style={{ fontSize: 12, color: "var(--text-dimmer)" }}>Buffering…</div> : null}
        </div>

        <div className="player-controls">
          <button aria-label={isPlaying ? "Pausar" : "Tocar"} onClick={togglePlay} className="control-btn play-btn">
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button aria-label={isMuted ? "Ativar som" : "Mudo"} onClick={toggleMute} className="control-btn mute-btn">
            {isMuted ? "🔇" : "🔊"}
          </button>

          <input
            className="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={onVolumeChange}
            aria-label="Volume"
          />
        </div>
      </div>
    </div>
  );
}
