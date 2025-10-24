// src/app/layout.tsx
import "./globals.css";
import AppHeader from "@/components/AppHeader";
import GlobalRadioPlayer from "@/components/GlobalRadioPlayer";

export const metadata = { title: "R de Rádio — by T de Trips" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AppHeader />
        <div style={{ padding: "8px 12px" }}>
          <GlobalRadioPlayer />
        </div>
        <main>{children}</main>
      </body>
    </html>
  );
}
