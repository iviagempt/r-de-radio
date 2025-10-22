'use client';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

export default function RadioPlayer({ primaryUrl, fallbacks = [] }: { primaryUrl: string; fallbacks?: string[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string>(primaryUrl);

  useEffect(() => {
    let destroyed = false;
    const audio = audioRef.current!;
    setError(null);

    const tryPlay = async (src: string) => {
      if (destroyed) return;
      audio.src = src;
      await audio.play();
    };

    const sequence = async () => {
      const candidates = [primaryUrl, ...fallbacks].filter(Boolean);
      for (const src of candidates) {
        try {
          setCurrentSrc(src);
          if (Hls.isSupported() && src.endsWith('.m3u8')) {
            const hls = new Hls({ maxBufferLength: 10, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(audio);
            await new Promise<void>((resolve, reject) => {
              hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                try { await audio.play(); resolve(); } catch (e) { reject(e); }
              });
              hls.on(Hls.Events.ERROR, (_e, data) => {
                if (data.fatal) { hls.destroy(); reject(new Error('fatal')); }
              });
            });
            return;
          } else {
            await tryPlay(src);
            return;
          }
        } catch {
          /* next candidate */
        }
      }
      setError('Stream indisponível no momento.');
    };

    sequence();
    return () => { destroyed = true; audio.pause(); audio.removeAttribute('src'); audio.load(); };
  }, [primaryUrl, fallbacks]);

  return (
    <div className="card">
      <audio ref={audioRef} controls preload="none" />
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Fonte: {currentSrc}</div>
      {error && <div style={{ color: 'crimson', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
