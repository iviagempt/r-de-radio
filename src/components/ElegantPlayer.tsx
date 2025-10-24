"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function ElegantPlayer({ 
  src, 
  stationName, 
  stationLogo 
}: { 
  src: string; 
  stationName: string;
  stationLogo?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    let hls: Hls | null = null;
    const isHls = src.toLowerCase().includes(".m3u8");
    audio.muted = true;
    audio.volume = volume;

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      });
    } else {
      audio.src = src;
      const onCanPlay = () => {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      };
      audio.addEventListener("canplay", onCanPlay, { once: true });
      audio.load();

      return () => {
        audio.removeEventListener("canplay", onCanPlay);
      };
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
      audio.play().catch(() => {});
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="elegant-player">
      <audio ref={audioRef} />
      
      {/* Logo em destaque */}
      <div className="player-logo-container">
        {stationLogo ? (
          <img src={stationLogo} alt={stationName} className="player-logo" />
        ) : (
          <div className="player-logo-placeholder">📻</div>
        )}
      </div>

      {/* Nome da estação */}
      <div className="player-station-name">{stationName}</div>

      {/* Indicador de transmissão ao vivo */}
      <div className="live-indicator">
        <span className="live-dot"></span>
        <span className="live-text">AO VIVO</span>
      </div>

      {/* Controles */}
      <div className="player-controls">
        {/* Botão Play/Pause */}
        <button onClick={togglePlay} className="control-btn play-btn">
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>

        {/* Botão Mute/Unmute */}
        <button onClick={toggleMute} className="control-btn mute-btn">
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </button>

        {/* Controle de volume */}
        <div className="volume-control">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}
