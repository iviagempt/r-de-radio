"use client";
import Script from "next/script";

export default function AdsenseScript() {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return null;
  return (
    <Script
      id="adsense-script"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
    />
  );
}
