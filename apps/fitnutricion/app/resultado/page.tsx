"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plan } from "../../lib/planSchema";

export default function ResultadoPage() {
  const params = useSearchParams();
  const sessionId = params.get("session");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!sessionId) return;
      const res = await fetch(`/api/session/${sessionId}`);
      const data = await res.json();
      setPlan(data.plan);
      setMetrics(data.computedMetrics);
    };
    load();
  }, [sessionId]);

  const sendToReview = async () => {
    if (!sessionId) return;
    await fetch(`/api/admin/review/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PENDIENTE" })
    });
    setStatus("Plan enviado a cola de revisión humana.");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-orange-200">Resumen de tu plan</h1>
      {!plan && <p className="text-slate-400">Generando plan... vuelve en unos segundos.</p>}
      {plan && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h2 className="text-xl font-semibold text-orange-200">Metas y macros</h2>
            <ul className="mt-2 text-sm text-slate-300">
              <li>Objetivo: {plan.meta.goal}</li>
              <li>Duración diaria: {plan.meta.durationMin} min</li>
              <li>Calorías objetivo: {plan.meta.caloriesTarget} kcal</li>
              <li>
                Macros: P {plan.meta.macros.protein_g}g / G {plan.meta.macros.fat_g}g / C{" "}
                {plan.meta.macros.carbs_g}g
              </li>
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="text-xl font-semibold text-orange-200">Métricas calculadas</h2>
            {metrics ? (
              <ul className="mt-2 text-sm text-slate-300">
                <li>IMC: {metrics.bmi} ({metrics.bmiLabel})</li>
                <li>TDEE: {metrics.tdee} kcal</li>
                <li>Agua: {metrics.waterMl} ml/día</li>
                <li>Edad fitness: {metrics.fitnessAge} años (estimado)</li>
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Aún sin cálculos.</p>
            )}
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-orange-200">Entrenamiento (semana 1)</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {plan.workoutPlan.weeks[0].days.map((day) => (
                <li key={day.day}>
                  <p className="font-semibold text-orange-100">
                    Día {day.day}: {day.title}
                  </p>
                  <p>{day.exercises.map((ex) => ex.name).join(" · ")}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="text-lg font-semibold text-orange-200">Nutrición (día 1)</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {plan.nutritionPlan.days[0].meals.map((meal) => (
                <li key={meal.name}>
                  <p className="font-semibold text-orange-100">{meal.name}</p>
                  <p>{meal.recipe.title}</p>
                  <p className="text-xs text-slate-400">{meal.recipe.minutes} min · {meal.recipe.macros.kcal} kcal</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button className="btn-primary" onClick={sendToReview}>
          Enviar a revisión humana
        </button>
        <Link className="btn-secondary" href="/planes">
          Ver pricing
        </Link>
      </div>
      {status && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{status}</p>}
      <p className="text-xs text-slate-500">
        Aviso: esta información es orientativa. Un admin revisa antes de aprobar o enviar el plan.
      </p>
    </div>
  );
}
