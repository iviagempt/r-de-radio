"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppHeader() {
  const [carMode, setCarMode] = useState(false);

  useEffect(() => {
    if (carMode) document.body.classList.add("car-mode");
    else document.body.classList.remove("car-mode");
  }, [carMode]);

  return (
    <header style={{ borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 20, background: "rgba(26,26,26,0.7)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="R de Rádio – by T de Trips" width={28} height={28} priority />
          <span style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>R de Rádio – by T de Trips</span>
        </Link>

        <nav style={{ display: "flex", gap: 12, fontSize: 14, alignItems: "center" }}>
          <Link href="/">Início</Link>
          <Link href="/auth">Entrar</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/premium">Premium</Link>
          <button
            onClick={() => setCarMode((v) => !v)}
            style={{
              marginLeft: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: carMode ? "#ffc600" : "#333",
              color: carMode ? "#1a1a1a" : "#fff",
              border: "1px solid #444",
              fontWeight: 700,
            }}
            aria-pressed={carMode}
            aria-label="Alternar Modo Auto"
            title="Alternar Modo Auto"
          >
            {carMode ? "Modo Auto ON" : "Modo Auto"}
          </button>
        </nav>
      </div>
    </header>
  );
}
