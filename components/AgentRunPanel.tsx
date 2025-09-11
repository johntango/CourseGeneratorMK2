// components/AgentRunPanel.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AgentRunPanel({ runId }: { runId: string }) {
  const [run, setRun] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    let sub1: any, sub2: any;

    (async () => {
      // Initial fetch
      const { data: r0 } = await supabase.from('agent_runs').select('*').eq('id', runId).single();
      setRun(r0);

      const { data: ev0 } = await supabase.from('agent_events').select('*').eq('run_id', runId).order('id', { ascending: true });
      setEvents(ev0 ?? []);

      // Realtime subscriptions
      sub1 = supabase
        .channel(`run-${runId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_runs', filter: `id=eq.${runId}` },
          (payload) => setRun(payload.new))
        .subscribe();

      sub2 = supabase
        .channel(`events-${runId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_events', filter: `run_id=eq.${runId}` },
          (payload) => setEvents((prev) => [...prev, payload.new]))
        .subscribe();
    })();

    return () => {
      sub1 && supabase.removeChannel(sub1);
      sub2 && supabase.removeChannel(sub2);
    };
  }, [runId]);

  if (!run) return null;

  return (
    <div className="card bg-body border">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <strong>Generation status</strong>
          <span className="small text-muted">{run.status}</span>
        </div>
        <div className="progress mb-3" role="progressbar" aria-valuenow={run.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className={`progress-bar ${run.status==='failed' ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${run.progress}%` }} />
        </div>
        <div className="small text-muted mb-3">{run.summary}</div>
        <div className="border rounded p-2" style={{ maxHeight: 280, overflowY: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          {events.map(e => (
            <div key={e.id}>
              <span className="text-secondary">[{new Date(e.created_at).toLocaleTimeString()}]</span>{' '}
              <strong>{e.phase}</strong>: {e.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
