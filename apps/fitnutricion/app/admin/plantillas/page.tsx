"use client";

import { useEffect, useState } from "react";

type Template = { id: number; kind: string; title: string; goal?: string | null; content: any };

export default function PlantillasPage() {
  const [items, setItems] = useState<Template[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/templates");
      const data = await res.json();
      setItems(data.items);
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Plantillas</p>
        <h1 className="text-3xl font-bold text-orange-200">Entreno + nutrición + reglas</h1>
        <p className="text-sm text-slate-400">Definen el fallback rule-based y enriquecen el prompt.</p>
      </div>
      <div className="space-y-3">
        {items.map((tpl) => (
          <div key={tpl.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-100">{tpl.title}</p>
                <p className="text-xs text-slate-500">
                  {tpl.kind} · objetivo {tpl.goal || "n/a"}
                </p>
              </div>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                {Object.keys(tpl.content || {}).length} campos
              </span>
            </div>
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-slate-800 p-3 text-xs text-slate-200">
              {JSON.stringify(tpl.content, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
