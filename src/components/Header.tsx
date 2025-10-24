"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="app-header">
      <Link href="/" className="logo-link">
        <div className="logo-rdr">
          <span className="logo-text">RDR</span>
          <span className="logo-subtitle">Radio de Rádio</span>
        </div>
      </Link>
      <nav className="nav-links">
        <Link href="/favoritos" className="nav-link">⭐ Favoritos</Link>
        <Link href="/historico" className="nav-link">📜 Histórico</Link>
      </nav>
    </header>
  );
}
