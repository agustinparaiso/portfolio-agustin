"use client";

import { useEffect, useState } from "react";

type SessionRow = {
  id: string;
  goal?: string;
  dietType?: string;
  status: string;
  responses: any;
  computedMetrics: any;
};

export default function SesionesPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [selected, setSelected] = useState<SessionRow | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/sessions");
      const data = await res.json();
      setSessions(data.items);
    };
    load();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_420px]">
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Sesiones</h2>
        <div className="mt-3 space-y-2 text-sm">
          {sessions.map((session) => (
            <button
              key={session.id}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-left hover:border-orange-400"
              onClick={() => setSelected(session)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-orange-100">{session.id}</p>
                  <p className="text-xs text-slate-400">
                    {session.goal} · {session.dietType}
                  </p>
                </div>
                <span className="text-xs text-slate-500">{session.status}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Detalle</h2>
        {!selected && <p className="text-sm text-slate-400">Selecciona una sesión para ver detalles.</p>}
        {selected && (
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Respuestas</p>
              <pre className="mt-1 max-h-36 overflow-auto rounded bg-slate-800 p-2 text-xs">
                {JSON.stringify(selected.responses, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Métricas</p>
              <pre className="mt-1 max-h-36 overflow-auto rounded bg-slate-800 p-2 text-xs">
                {JSON.stringify(selected.computedMetrics, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
