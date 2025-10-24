// src/components/AppHeader.tsx
import Link from "next/link";

export default function AppHeader() {
  return (
    <header style={{
      background: "rgba(0,0,0,0.3)",
      padding: "16px 24px",
      borderBottom: "1px solid rgba(255,255,255,0.1)"
    }}>
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1400,
        margin: "0 auto"
      }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 600 }}>
          R de Rádio
        </Link>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/sobre">Sobre</Link>
          <Link href="/premium">Premium</Link>
        </div>
      </nav>
    </header>
  );
}
