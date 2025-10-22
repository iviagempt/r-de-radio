'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'in'|'up'>('in'); const [error, setError] = useState<string | null>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null)); }, []);

  const signIn = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    setUser(data.user);
  };
  const signUp = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);
    setUser(data.user);
  };
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); };

  if (user) {
    return (
      <div className="card">
        <p>Conectado como {user.email}</p>
        <button onClick={signOut}>Sair</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: 380 }}>
      <h2>{mode === 'in' ? 'Entrar' : 'Criar conta'}</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha" type="password" />
        <button onClick={mode==='in' ? signIn : signUp}>{mode==='in' ? 'Entrar' : 'Cadastrar'}</button>
        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        <button onClick={()=>setMode(mode==='in'?'up':'in')} style={{ justifySelf: 'start' }}>
          {mode==='in' ? 'Criar conta' : 'Já tenho conta'}
        </button>
      </div>
    </div>
  );
}
