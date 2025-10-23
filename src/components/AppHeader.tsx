"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppHeader() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    sb.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signIn() {
    // escolha: Google OAuth
    await sb.auth.signInWithOAuth({ provider: "google" });
    // ou Magic Link por email:
    // const email = prompt("Seu e-mail:");
    // if (email) await sb.auth.signInWithOtp({ email });
  }

  async function signOut() {
    await sb.auth.signOut();
  }

  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
      position: "sticky", top: 0, zIndex: 20,
      background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)"
    }}>
      <img src="/logo.png" alt="RDR" width={28} height={28} style={{ borderRadius: 6 }} />
      <strong style={{ letterSpacing: 0.3 }}>RDR</strong>

      <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
        <Link href="/">Início</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/termos">Termos</Link>
        <Link href="/admin">Admin</Link>
        <Link href="/premium">Premium</Link>
      </nav>

      <div style={{ marginLeft: 16 }}>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>
              {user.user_metadata?.name || user.email}
            </span>
            <button onClick={signOut} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)" }}>
              Sair
            </button>
          </div>
        ) : (
          <button onClick={signIn} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)" }}>
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
