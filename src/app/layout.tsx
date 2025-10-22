import './globals.css';

export const metadata = {
  title: 'R de Rádio – by T de Trips',
  description: 'Rádio online, simples e global',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b6bcb" />
        <link rel="icon" href="/icon-192.png" />
      </head>
      <body>
        <div className="container">
          <header className="header">
            <h1>R de Rádio – by T de Trips</h1>
            <nav style={{ display: 'flex', gap: 12 }}>
              <a href="/">Início</a>
              <a href="/auth">Entrar</a>
              <a href="/admin">Admin</a>
              <a href="/premium">Premium</a>
            </nav>
          </header>
          <main style={{ marginTop: 16 }}>{children}</main>
        </div>
        <script src="/sw.js" defer></script>
      </body>
    </html>
  );
}
