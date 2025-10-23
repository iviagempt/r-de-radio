"use client";
import { useEffect, useState } from "react";

export default function BrandSplash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;

  return (
    <div className="splash">
      <div className="splash-inner">
        <div className="splash-title">R de Rádio</div>
        <div className="splash-sub">by T de Trips</div>
      </div>
    </div>
  );
}
