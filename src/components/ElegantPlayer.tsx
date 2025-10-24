"use client";

import { useEffect, useRef, useState } from "react";

interface ElegantPlayerProps {
  streamUrl: string;
  stationName: string;
  logoUrl?: string;
  // opcional: iniciar tocando ao montar (não garante autoplay por restrições do browser)
  autoPlay?: boolean;
}

export default function ElegantPlayer({
  streamUrl,
  stationName,
  logoUrl,
  autoPlay = false,
}: ElegantPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isBuffering, setIsBuffering] = useState(false);

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

  // Quando a stream muda, tenta carregar e reproduzir (se estava tocando ou se autoPlay)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = streamUrl || "";
    audio.load();

    // se já estava tocando ou pediu autoPlay, tenta tocar (pode falhar por autoplay)
    if (isPlaying || autoPlay) {
      audio.play().catch(() => {
        // autoplay bloqueado — mantém o estado isPlaying = false
        setIsPlaying(false);
      });
    } else {
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      // autoplay bloqueado: informar visualmente e pedir interação do usuário
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((v) => !v);
  };

  const onVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (v > 0 && isMuted) setIsMuted(false);
  };

  return (
    <div className="elegant-player" role="region" aria-label={`Player - ${stationName}`}>
      <audio ref={audioRef} src={streamUrl} preload="none" />
      <div className="player-logo-container">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={stationName} className="player-logo" />
        ) : (
          <div className="player-logo-placeholder" aria-hidden>
            🎧
          </div>
        )}
      </div>

      <div className="player-station-name">
        {stationName || "Nenhuma estação seleccionada"}
      </div>

      <div className="player-controls">
        <button
          className={`control-btn play-btn`}
          onClick={togglePlay}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? "Pausar" : "Tocar"}
          title={isPlaying ? "Pausar" : "Tocar"}
        >
          {isPlaying ? (
            /* ícone pause */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            /* ícone play */
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        <button
          className="control-btn mute-btn"
          onClick={toggleMute}
          aria-pressed={isMuted}
          aria-label={isMuted ? "Desativar mudo" : "Ativar mudo"}
          title={isMuted ? "Desativar mudo" : "Ativar mudo"}
        >
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <path d="M9 9v6h4l5 5V4l-5 5H9z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 9v6h4l5 5V4l-5 5H9z" />
            </svg>
          )}
        </button>

        <input
          className="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={onVolumeChange}
          aria-label="Volume"
        />
      </div>

      <div style={{ position: "absolute", right: 16, top: 16 }}>
        {isBuffering ? (
          <div className="live-indicator" aria-hidden>
            <span className="live-dot" />
            <span className="live-text">Buffering…</span>
          </div>
        ) : isPlaying ? (
          <div className="live-indicator" aria-hidden>
            <span className="live-dot" />
            <span className="live-text">Ao vivo</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
