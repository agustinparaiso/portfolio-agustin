"use client";

import { useEffect, useState } from "react";
import { cleanHtml } from "../../../lib/sanitize";

type Question = {
  id: number;
  key: string;
  title: string;
  type: string;
  order: number;
  helpHtml?: string | null;
};

export default function PreguntasPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState({ key: "", title: "", type: "singleChoice", order: 1 });

  const load = async () => {
    const res = await fetch("/api/admin/questions");
    const data = await res.json();
    setQuestions(data.items);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setForm({ key: "", title: "", type: "singleChoice", order: 1 });
    load();
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Preguntas</p>
        <h1 className="text-3xl font-bold text-orange-200">Gestiona el flujo</h1>
        <p className="text-sm text-slate-400">CRUD completo, opciones se guardan en JSON.</p>
      </div>
      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Nueva pregunta</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="key"
            value={form.key}
            onChange={(e) => setForm({ ...form, key: e.target.value })}
          />
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            placeholder="Título"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="rounded-lg bg-slate-800 p-2 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option>singleChoice</option>
            <option>multiChoice</option>
            <option>slider</option>
            <option>inputNumber</option>
            <option>inputText</option>
          </select>
          <input
            className="rounded-lg bg-slate-800 p-2 text-sm"
            type="number"
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          />
        </div>
        <button className="btn-primary mt-3" onClick={create}>
          Guardar
        </button>
      </div>

      <div className="card p-4">
        <h2 className="text-lg font-semibold text-orange-200">Listado</h2>
        <div className="mt-3 space-y-2 text-sm">
          {questions.map((q) => (
            <div key={q.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="font-semibold text-orange-100">
                {q.order}. {q.title} <span className="text-xs text-slate-500">({q.type})</span>
              </p>
              <p className="text-xs text-slate-500">key: {q.key}</p>
              {q.helpHtml && (
                <div
                  className="prose prose-invert mt-2 text-xs"
                  dangerouslySetInnerHTML={{ __html: cleanHtml(q.helpHtml) }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
