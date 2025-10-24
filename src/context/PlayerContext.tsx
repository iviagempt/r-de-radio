"use client";

import React, { createContext, useContext, useState } from "react";

type PlayerState = {
  streamUrl: string;
  stationName: string;
  logoUrl?: string;
  isPlaying: boolean;
};

type PlayerContextType = {
  player: PlayerState;
  setStation: (streamUrl: string, stationName: string, logoUrl?: string, autoPlay?: boolean) => void;
  play: () => void;
  pause: () => void;
  setVolume: (v: number) => void;
};

const defaultState: PlayerState = {
  streamUrl: "",
  stationName: "",
  logoUrl: undefined,
  isPlaying: false,
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useState<PlayerState>(defaultState);
  const [volume, setVol] = useState<number>(0.7);

  const setStation = (streamUrl: string, stationName: string, logoUrl?: string, autoPlay = true) => {
    setPlayer({ streamUrl, stationName, logoUrl, isPlaying: autoPlay });
  };

  const play = () => setPlayer((p) => ({ ...p, isPlaying: true }));
  const pause = () => setPlayer((p) => ({ ...p, isPlaying: false }));

  return (
    <PlayerContext.Provider value={{ player, setStation, play, pause, setVolume: setVol }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}
