"use client";

import { useEffect, useState } from "react";

type Testimonial = { id: number; name: string; quote: string; age?: number; metric?: string; avatar: string };

export default function TestimoniosPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState<Testimonial>({
    id: 0,
    name: "",
    quote: "",
    avatar: "AV"
  });

  const load = async () => {
    const res = await fetch("/api/admin/testimonios");
    const data = await res.json();
    setItems(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/admin/testimonios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ id: 0, name: "", quote: "", avatar: "AV" });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Testimonios mock</p>
        <h1 className="text-3xl font-bold text-orange-200">Historias ficticias sin fotos reales</h1>
        <p className="text-sm text-slate-400">Usamos avatares SVG generados con iniciales.</p>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Nuevo testimonio</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="Avatar (iniciales)"
            value={form.avatar}
            onChange={(e) => setForm({ ...form, avatar: e.target.value })}
          />
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="Métrica (opcional)"
            value={form.metric || ""}
            onChange={(e) => setForm({ ...form, metric: e.target.value })}
          />
          <textarea
            className="rounded-lg bg-slate-800 p-2 text-sm md:col-span-2"
            placeholder="Cita"
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
          />
        </div>
        <button className="btn-primary mt-3" onClick={create}>
          Guardar
        </button>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Listado</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-500/20 text-sm font-bold text-orange-100">
                  {item.avatar}
                </span>
                <div>
                  <p className="font-semibold text-orange-100">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.metric}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">“{item.quote}”</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
