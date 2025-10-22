// src/hooks/useRadioPlayer.ts
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type Stream = {
  url: string;
  priority?: number;      // menor = mais prioritário
  codec?: string | null;  // "mp3", "aac", "hls"... (opcional, só informativo)
  bitrate_kbps?: number | null;
};

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export function useRadioPlayer(streams: Stream[], autoPlay = false) {
  const ordered = useMemo(
    () => [...streams].sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)),
    [streams]
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1); // 0..1

  // cria elemento audio (uma vez)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audio.crossOrigin = "anonymous"; // ajuda no CORS/metadados
    audioRef.current = audio;

    const onPlaying = () => setState("playing");
    const onPause = () => setState("paused");
    const onWaiting = () => setState("loading");
    const onError = () => {
      setState("error");
      setErrorMsg("Falha ao reproduzir este stream.");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
  }, []);

  // aplica mute/volume sempre que mudarem
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = muted;
    audioRef.current.volume = volume;
  }, [muted, volume]);

  const loadAndPlay = async (idx: number) => {
    const audio = audioRef.current;
    if (!audio || !ordered[idx]) return;

    setErrorMsg(null);
    setState("loading");
    setCurrentIndex(idx);
    audio.pause();
    audio.src = ordered[idx].url;

    try {
      // play precisa ser chamado em user gesture em alguns browsers;
      // no desktop costuma funcionar, no mobile depende de interação prévia
      await audio.play();
      setState("playing");
    } catch (err: any) {
      setState("error");
      setErrorMsg(err?.message ?? "Não foi possível iniciar a reprodução.");
      // tenta próximo fallback automaticamente
      const next = idx + 1;
      if (next < ordered.length) {
        loadAndPlay(next);
      }
    }
  };

  const play = async () => {
    // se não há stream atual, comece do primeiro
    if (state === "idle" || !ordered[currentIndex]) {
      await loadAndPlay(0);
      return;
    }
    try {
      await audioRef.current?.play();
      setState("playing");
    } catch (e: any) {
      setState("error");
      setErrorMsg(e?.message ?? "Erro ao reproduzir.");
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setState("paused");
  };

  const nextStream = () => {
    const next = currentIndex + 1;
    if (next < ordered.length) {
      loadAndPlay(next);
    }
  };

  const prevStream = () => {
    const prev = currentIndex - 1;
    if (prev >= 0) {
      loadAndPlay(prev);
    }
  };

  const setVolumeNormalized = (v: number) => {
    const val = Math.min(1, Math.max(0, v));
    setVolume(val);
  };

  const toggleMute = () => setMuted((m) => !m);

  // autoplay opcional ao montar (se houver gesto prévio pode iniciar)
  useEffect(() => {
    if (autoPlay && ordered.length > 0) {
      loadAndPlay(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, ordered.map((s) => s.url).join("|")]);

  return {
    state,
    errorMsg,
    currentIndex,
    currentStream: ordered[currentIndex] ?? null,
    streams: ordered,
    play,
    pause,
    nextStream,
    prevStream,
    setVolume: setVolumeNormalized,
    volume,
    muted,
    toggleMute,
    loadAndPlay,
  };
}
