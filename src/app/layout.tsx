import "./globals.css";
import AppHeader from "@/components/AppHeader";
import BrandSplash from "@/components/BrandSplash";

export const metadata = {
  title: "R de Rádio – by T de Trips",
  description: "Ouça rádios ao vivo com timeshift, catálogo global e favoritos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <BrandSplash />
        <AppHeader />
        {children}
        <footer style={{ padding: "12px", borderTop: "1px solid #222", marginTop: 24, fontSize: 12, color: "#aaa" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <div>© 2025 R de Rádio – by T de Trips</div>
            <div style={{ display: "flex", gap: 12 }}>
              <a href="/sobre">Sobre</a>
              <a href="/privacidade">Privacidade</a>
              <a href="/terms">Termos</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
