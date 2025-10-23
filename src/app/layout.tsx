import "./globals.css";
import AppHeader from "@/components/AppHeader";

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
