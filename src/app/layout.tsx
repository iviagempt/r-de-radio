// src/app/layout.tsx
import "./globals.css";
import AppHeader from "@/components/AppHeader";

export const metadata = {
  title: "R de Rádio — by T de Trips",
  icons: { icon: "/favicon.icon" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
