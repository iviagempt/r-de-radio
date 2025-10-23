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

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {dvrUrl ? (
          usingDvr ? (
            <>
              <button onClick={() => seekBack(10)} disabled={!canSeek} style={{ background: "#111", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>
                ⏪ 10 min
              </button>
              <button onClick={() => seekBack(30)} disabled={!canSeek} style={{ background: "#111", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>
                ⏪ 30 min
              </button>
              <button onClick={goLive} disabled={!canSeek} style={{ background: "#0c63e4", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>
                Live
              </button>
              <button onClick={() => setUsingDvr(false)} style={{ background: "#777", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>
                Voltar ao Ao Vivo
              </button>
            </>
          ) : (
            <button onClick={() => setUsingDvr(true)} style={{ background: "#0c63e4", color: "#fff", padding: "8px 10px", borderRadius: 6 }}>
              Ativar Timeshift
            </button>
          )
        ) : null}

        {windowSec ? <span style={{ color: "#666" }}>Janela DVR ~ {Math.round(windowSec / 60)} min</span> : null}
        {loading && <span>Carregando...</span>}
      </div>
    </div>
  );
}
