import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "R de Rádio – by T de Trips",
  description: "Ouça rádios do mundo todo, simples e rápido.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  );
}
