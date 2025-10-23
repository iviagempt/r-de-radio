"use client";
import { useEffect } from "react";

type Props = {
  slot: string; // data-ad-slot
  style?: React.CSSProperties;
  format?: string; // "auto" por padrão
  layout?: string;
  className?: string;
};

export default function AdSlot({ slot, style, format = "auto", layout, className }: Props) {
  useEffect(() => {
    try {
      // @ts-expect-error
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <ins
      className={`adsbygoogle ${className || ""}`}
      style={style || { display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive="true"
    />
  );
}
