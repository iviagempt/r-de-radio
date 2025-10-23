"use client";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      position: "sticky",
      top: 0,
      zIndex: 20,
      background: "rgba(0,0,0,0.25)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
      <img src="/logo.png" alt="RDR" width={28} height={28} style={{ borderRadius: 6 }} />
      <strong style={{ letterSpacing: 0.3 }}>RDR</strong>

      <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
        <Link href="/">Início</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/premium">Premium</Link>
      </nav>
    </header>
  );
}
