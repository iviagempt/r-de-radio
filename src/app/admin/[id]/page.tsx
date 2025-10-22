'use client';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import type { StationStream } from '@/types';
import { useParams } from 'next/navigation';

export default function StationStreamsPage() {
  const params = useParams();
  const stationId = params?.id as string;
  const [items, setItems] = useState<StationStream[]>([]);
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('');
  const [bitrate, setBitrate] = useState<number | ''>('');
  const [priority, setPriority] = useState<number | ''>(1);

  const load = async () => {
    const { data } = await supabase.from('station_streams').select('*').eq('station_id', stationId).order('priority', { ascending: true });
    setItems(data || []);
  };
  useEffect(() => { if (stationId) load(); }, [stationId]);

  const add = async () => {
    await supabase.from('station_streams').insert({
      station_id: stationId, url, format: format || null, bitrate_kbps: bitrate || null, priority: priority || 1, is_active: true
    });
    setUrl(''); setFormat(''); setBitrate(''); setPriority(1);
    await load();
  };

  const remove = async (id: string) => { await supabase.from('station_streams').delete().eq('id', id); await load(); };

  return (
    <div>
      <h2>Streams da Estação</h2>
      <div className="card" style={{ display:'grid', gap:8, maxWidth:650 }}>
        <input placeholder="URL do stream (.m3u8, .mp3, .aac)" value={url} onChange={e=>setUrl(e.target.value)}/>
        <input placeholder="Formato (hls/mp3/aac)" value={format} onChange={e=>setFormat(e.target.value)} />
        <input placeholder="Bitrate kbps (opcional)" value={bitrate} onChange={e=>setBitrate(e.target.value ? Number(e.target.value) : '')} />
        <input placeholder="Prioridade (1 é mais alto)" value={priority} onChange={e=>setPriority(e.target.value ? Number(e.target.value) : '')} />
        <button onClick={add}>Adicionar stream</button>
      </div>
      <ul style={{ marginTop:16, padding:0, listStyle:'none' }}>
        {items.map(s => (
          <li key={s.id} className="card" style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
            <div style={{ flex:1, fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis' }}>{s.url}</div>
            <div>{s.format}</div>
            <div>prio {s.priority}</div>
            <button onClick={()=>remove(s.id)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
