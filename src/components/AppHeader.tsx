import Image from "next/image";
import Link from "next/link";

export default function AppHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 14px",
        borderBottom: "1px solid #eee",
        background: "#fff",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/logo.png" alt="R de Rádio – by T de Trips" width={28} height={28} priority />
        <span style={{ fontWeight: 600, fontSize: 16, color: "#111" }}>R de Rádio – by T de Trips</span>
      </Link>

      <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
        <Link href="/">Início</Link>
        <Link href="/auth">Entrar</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/premium">Premium</Link>
      </nav>
    </header>
  );
}
