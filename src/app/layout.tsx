import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ElegantPlayer from "@/components/ElegantPlayer";

export const metadata: Metadata = {
  title: "RDR",
  description: "Ouça rádios do mundo todo, simples e rápido.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
