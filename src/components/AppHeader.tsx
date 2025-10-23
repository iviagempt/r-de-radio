"use client";
import Image from "next/image";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header style={{ borderBottom: "1px solid #222", position: "sticky", top: 0, zIndex: 20, background: "rgba(26,26,26,0.7)", backdropFilter: "blur(8px)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/logo.png" alt="RDR" width={24} height={24} priority />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>RDR</span>
        </Link>
        <nav style={{ display: "flex", gap: 10, fontSize: 14, alignItems: "center" }}>
          <Link href="/">Início</Link>
          <Link href="/auth">Entrar</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/premium">Premium</Link>
        </nav>
      </div>
    </header>
  );
}
