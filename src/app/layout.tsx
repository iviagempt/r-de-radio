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
  // Substitui estes valores pelos reais ou integra com contexto para trocar dinamicamente
  const defaultStream = "URL_DO_STREAM_AQUI"; // ex: "https://stream.example.com/stream"
  const defaultStationName = "Nome da Estação";
  const defaultLogo = "URL_DO_LOGO_AQUI"; // ex: "/logos/fm-exemplo.png" ou https external

  return (
    <html lang="pt">
      <body>
        <Header />
        {children}
        <ElegantPlayer
          streamUrl={defaultStream}
          stationName={defaultStationName}
          logoUrl={defaultLogo}
          autoPlay={false}
        />
        <Footer />
      </body>
    </html>
  );
}
