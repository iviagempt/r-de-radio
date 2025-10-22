'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import type { Station } from '@/types';

export default function AdminPage() {
  const [items, setItems] = useState<Station[]>([]);
  const [form, setForm] = useState<Partial<Station>>({ name: '', country: '', language: '', genres: [], logo_url: '' });

  const load = async () => {
    const { data } = await supabase.from('stations').select('*').order('created_at', { ascending: false }).limit(200);
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = { name: form.name, country: form.country || null, language: form.language || null, genres: form.genres || [], logo_url: form.logo_url || null, is_active: true };
    await supabase.from('stations').insert(payload);
    setForm({ name: '', country: '', language: '', genres: [], logo_url: '' });
    await load();
  };

  const remove = async (id: string) => { await supabase.from('stations').delete().eq('id', id); await load(); };

  return (
    <div>
      <h2>Admin - Estações</h2>
      <div className="card" style={{ display:'grid', gap:8, maxWidth:600 }}>
        <input placeholder="Nome" value={form.name || ''} onChange={e=>setForm(f=>({...f, name:e.target.value}))}/>
        <input placeholder="País" value={form.country || ''} onChange={e=>setForm(f=>({...f, country:e.target.value}))}/>
        <input placeholder="Idioma" value={form.language || ''} onChange={e=>setForm(f=>({...f, language:e.target.value}))}/>
        <input placeholder="Gêneros (separados por vírgula)" value={(form.genres || []).join(', ')} onChange={e=>setForm(f=>({...f, genres:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)}))}/>
        <input placeholder="Logo URL" value={form.logo_url || ''} onChange={e=>setForm(f=>({...f, logo_url:e.target.value}))}/>
        <button onClick={save}>Salvar estação</button>
      </div>
      <ul style={{ marginTop:16, padding:0, listStyle:'none' }}>
        {items.map(s => (
          <li key={s.id} className="card" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            {s.logo_url ? <img src={s.logo_url} width={28} height={28} /> : <div style={{ width:28, height:28, background:'#eee' }}/>}
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600 }}>{s.name}</div>
              <div style={{ fontSize:12, opacity:0.7 }}>{[s.country, s.language].filter(Boolean).join(' • ')}</div>
            </div>
            <a href={`/admin/${s.id}`}>Streams</a>
            <button onClick={()=>remove(s.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
