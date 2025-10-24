import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ElegantPlayer from "@/components/ElegantPlayer";
import { PlayerProvider } from "@/context/PlayerContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <PlayerProvider>
          <Header />
          {children}
          <Footer />
          <ElegantPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
