import './globals.css';

export const metadata = {
  title: 'R de Rádio – by T de Trips',
  description: 'Rádio online global',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <header style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
          
// em src/app/layout.tsx, dentro de <head> se estiver usando head manual
<link rel="manifest" href="/manifest.webmanifest" />
          
          <nav style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <a href="/">Início</a>
            <a href="/auth">Entrar</a>
            <a href="/admin">Admin</a>
            <a href="/premium">Premium</a>
          </nav>
        </header>
        <main style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
