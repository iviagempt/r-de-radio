"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      setSessionEmail(s?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Cadastro iniciado! Se a confirmação de email estiver ativa, verifique sua caixa de entrada.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("Login realizado! Agora acesse /admin.");
      }
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setMessage("Logout efetuado.");
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao sair");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 460, margin: "0 auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <h1 style={{ marginBottom: 12 }}>Autenticação</h1>

      <div style={{ marginBottom: 12, color: "#555" }}>
        {sessionEmail ? (
          <div>Logado como: <strong>{sessionEmail}</strong></div>
        ) : (
          <div>Você não está logado.</div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setMode("signup")} disabled={mode === "signup" || loading}>
          Sign up
        </button>
        <button type="button" onClick={() => setMode("signin")} disabled={mode === "signin" || loading}>
          Sign in
        </button>
        <button type="button" onClick={handleLogout} disabled={loading}>
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8 }}
        />
        <input
          type="password"
          placeholder="senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8 }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Aguarde..." : mode === "signup" ? "Cadastrar" : "Entrar"}
        </button>
      </form>

      {message && <p style={{ color: "#333" }}>{message}</p>}

      <p style={{ marginTop: 16 }}>
        Após login, acesse <code>/admin</code>.
      </p>
    </main>
  );
}
