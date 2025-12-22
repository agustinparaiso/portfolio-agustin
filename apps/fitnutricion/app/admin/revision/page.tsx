"use client";

import { useEffect, useState } from "react";

type PlanRow = {
  id: number;
  sessionId: string;
  status: string;
  planJson: any;
};

export default function RevisionPage() {
  const [queue, setQueue] = useState<PlanRow[]>([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/review-queue");
    const data = await res.json();
    setQueue(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch(`/api/admin/review/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    setMessage(`Plan ${id} actualizado a ${status}`);
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Revisión de planes</p>
        <h1 className="text-3xl font-bold text-orange-200">Cola de revisión</h1>
        <p className="text-sm text-slate-400">Estados: PENDIENTE → EN_REVISION → APROBADO/RECHAZADO → ENVIADO.</p>
      </div>
      <div className="space-y-3">
        {queue.map((plan) => (
          <div key={plan.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-100">Plan #{plan.id}</p>
                <p className="text-xs text-slate-400">Sesión {plan.sessionId}</p>
                <p className="text-xs text-slate-400">Estado: {plan.status}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => updateStatus(plan.id, "EN_REVISION")}>
                  Tomar
                </button>
                <button className="btn-primary" onClick={() => updateStatus(plan.id, "APROBADO")}>
                  Aprobar y publicar
                </button>
                <button className="btn-secondary" onClick={() => updateStatus(plan.id, "RECHAZADO")}>
                  Rechazar
                </button>
              </div>
            </div>
            <div className="mt-3 rounded-lg bg-slate-800/40 p-3 text-xs text-slate-300">
              <p className="text-orange-200">Vista previa IA</p>
              <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(plan.planJson?.meta, null, 2)}
              </pre>
            </div>
          </div>
        ))}
      </div>
      {message && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>}
      <p className="text-xs text-slate-500">
        Las acciones quedan registradas en auditoría con usuario y timestamp. El envío final se simula y no dispara
        emails reales.
      </p>
    </div>
  );
}
