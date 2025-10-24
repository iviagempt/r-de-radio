"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    let hls: Hls | null = null;
    const isHls = src.toLowerCase().endsWith(".m3u8");

    // Ajuda no autoplay em navegadores modernos
    audio.muted = true;

    if (isHls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(audio);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setReady(true);
        audio.play().catch(() => {});
      });
    } else {
      audio.src = src;
      const onCanPlay = () => {
        setReady(true);
        audio.play().catch(() => {});
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

  const unmute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    audio.play().catch(() => {});
  };

  return (
    <div>
      <audio ref={audioRef} controls style={{ width: "100%", maxWidth: 640 }} />
      <button onClick={unmute} style={{ marginTop: 8 }}>
        Ativar som
      </button>
    </div>
  );
}
