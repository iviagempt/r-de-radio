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
            padding: "12px 16px",
            borderBottom: "1px solid #eee",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo.png" alt="R de Rádio – by T de Trips" width={28} height={28} priority />
            <strong style={{ color: "#111" }}>R de Rádio – by T de Trips</strong>
          </Link>

          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/" style={{ color: "#0c63e4" }}>Início</Link>
            <Link href="/auth" style={{ color: "#0c63e4" }}>Entrar</Link>
            <Link href="/admin" style={{ color: "#0c63e4" }}>Admin</Link>
            <Link href="/premium" style={{ color: "#0c63e4" }}>Premium</Link>
          </nav>
        </header>

        {children}

        <footer style={{ padding: "16px", borderTop: "1px solid #eee", marginTop: 40, fontSize: 13, color: "#666" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
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
