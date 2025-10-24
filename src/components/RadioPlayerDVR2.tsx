"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  liveUrl: string;
  dvrUrl?: string;
  autoPlay?: boolean;
};

export default function RadioPlayerDVR2({ liveUrl, dvrUrl, autoPlay = false }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [usingDvr, setUsingDvr] = useState(false);
  const [canSeek, setCanSeek] = useState(false);
  const [loading, setLoading] = useState(false);
  const [windowSec, setWindowSec] = useState<number | null>(null);

  useEffect(() => {
    setUsingDvr(false);
  }, [liveUrl, dvrUrl]);

  const seekBack = (mins: number) => {
    // implementação específica do seu player HLS/DASH
    console.log("seekBack", mins);
  };

  const goLive = () => {
    setUsingDvr(false);
  };

  // ATÉ AQUI, garanta que todos os blocos acima estão fechados com ; e }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <audio ref={audioRef} controls style={{ width: "100%" }} />

      
    </div>
  );
}
