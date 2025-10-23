// src/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "R de Rádio – by T de Trips",
  description: "Ouça rádios ao vivo com timeshift, catálogo global e favoritos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "10px 14px",
            borderBottom: "1px solid #eee",
            background: "#fff",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo.png" alt="R de Rádio – by T de Trips" width={28} height={28} priority />
            <span style={{ fontWeight: 600, fontSize: 16, color: "#111" }}>R de Rádio – by T de Trips</span>
          </Link>

          <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <Link href="/">Início</Link>
            <Link href="/auth">Entrar</Link>
            <Link href="/admin">Admin</Link>
            <Link href="/premium">Premium</Link>
          </nav>
        </header>

        {children}

        <footer style={{ padding: "14px", borderTop: "1px solid #eee", marginTop: 24, fontSize: 12, color: "#666" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div>© 2025 R de Rádio – by T de Trips</div>
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/sobre">Sobre</Link>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/terms">Termos</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
