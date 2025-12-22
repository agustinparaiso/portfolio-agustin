"use client";

import { useEffect, useState } from "react";

type Pricing = { id: number; name: string; weeks: number; priceTotal: number; pricePerDay: number; popular: boolean };

export default function PricingAdminPage() {
  const [plans, setPlans] = useState<Pricing[]>([]);
  const [form, setForm] = useState<Pricing>({
    id: 0,
    name: "",
    weeks: 4,
    priceTotal: 49,
    pricePerDay: 1.75,
    popular: false
  });

  const load = async () => {
    const res = await fetch("/api/admin/pricing");
    const data = await res.json();
    setPlans(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ id: 0, name: "", weeks: 4, priceTotal: 49, pricePerDay: 1.75, popular: false });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Pricing</p>
        <h1 className="text-3xl font-bold text-orange-200">Planes y badges</h1>
        <p className="text-sm text-slate-400">CRUD simple. Sin pagos reales.</p>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Nuevo plan</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="number"
            className="rounded-lg bg-slate-800 p-2 text-sm"
            value={form.weeks}
            onChange={(e) => setForm({ ...form, weeks: Number(e.target.value) })}
            placeholder="Semanas"
          />
          <input
            type="number"
            className="rounded-lg bg-slate-800 p-2 text-sm"
            value={form.priceTotal}
            onChange={(e) => setForm({ ...form, priceTotal: Number(e.target.value) })}
            placeholder="Precio total"
          />
          <input
            type="number"
            className="rounded-lg bg-slate-800 p-2 text-sm"
            value={form.pricePerDay}
            onChange={(e) => setForm({ ...form, pricePerDay: Number(e.target.value) })}
            placeholder="€/día"
          />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.popular}
              onChange={(e) => setForm({ ...form, popular: e.target.checked })}
            />
            Más popular
          </label>
        </div>
        <button className="btn-primary mt-3" onClick={create}>
          Guardar
        </button>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Listado</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="font-semibold text-orange-100">{plan.name}</p>
              <p className="text-xs text-slate-400">{plan.weeks} semanas · {plan.priceTotal}€</p>
              {plan.popular && <p className="text-xs text-orange-200">Más popular</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
