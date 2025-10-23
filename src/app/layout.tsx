// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "R de Rádio – by T de Trips",
  description: "Ouça rádios do mundo todo, ao vivo, simples e rápido.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body style={{ background: "var(--bg, #fafafa)" }}>
        <SiteHeader />
        <main style={{ minHeight: "calc(100dvh - 120px)" }}>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#fff",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "#0c63e4",
              display: "inline-block",
            }}
          />
          <span style={{ fontWeight: 800, color: "#111", letterSpacing: 0.2 }}>
            R de Rádio
          </span>
        </Link>

        <nav
          aria-label="Navegação principal"
          style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
        >
          <Link href="/">Início</Link>
          <Link href="/auth">Entrar</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/premium">Premium</Link>
        </nav>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid #eee", background: "#fff", marginTop: 24 }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <small style={{ color: "#666" }}>
          © {new Date().getFullYear()} R de Rádio – by T de Trips
        </small>
        <div style={{ display: "flex", gap: 12, color: "#666", fontSize: 14 }}>
          <Link href="/sobre">Sobre</Link>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
