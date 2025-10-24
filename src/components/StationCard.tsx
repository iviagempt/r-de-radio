"use client";

import React from "react";

type StationCardProps = {
  stationId: string;
  name: string;
  logo?: string;
  onClick?: () => void;
  className?: string;
};

export default function StationCard({ stationId, name, logo, onClick, className = "" }: StationCardProps) {
  return (
    <div
      key={stationId}
      className={`card-link ${className}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logo ? (
        <img src={logo} alt={name} className="logo" />
      ) : (
        <div className="logo-placeholder" aria-hidden>
          🎧
        </div>
      )}
      <div className="station-name">{name}</div>
    </div>
  );
}
