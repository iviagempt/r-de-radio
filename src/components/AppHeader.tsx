"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [carMode, setCarMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("car-mode", carMode);
  }, [carMode]);

  return (
    <header style={{ borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 20, background: "rgba(26,26,26,0.7)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="RDR" width={24} height={24} priority />
          <span className="header-title" style={{ color: "#fff" }}>RDR</span>
        </Link>
        <nav style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "center" }}>
          <Link href="/">Início</Link>
          <Link href="/auth">Entrar</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/premium">Premium</Link>
          <button
            onClick={() => setCarMode((v) => !v)}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              background: carMode ? "#ffc600" : "#333",
              color: carMode ? "#1a1a1a" : "#fff",
              border: "1px solid #444",
              fontWeight: 700,
            }}
            aria-pressed={carMode}
            title="Modo Auto"
          >
            {carMode ? "Auto ON" : "Modo Auto"}
          </button>
        </nav>
      </div>
    </header>
  );
}
