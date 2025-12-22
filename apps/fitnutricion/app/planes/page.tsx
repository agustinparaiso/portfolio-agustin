import Link from "next/link";
import { prisma } from "../../lib/db";

export default async function PlanesPage() {
  const plans = await prisma.pricingPlan.findMany({ orderBy: { weeks: "asc" } });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Elige tu ritmo</p>
          <h1 className="text-3xl font-bold text-orange-200">Planes sin compromiso</h1>
          <p className="text-sm text-slate-400">
            Precios orientativos. No hay pagos reales en esta demo.
          </p>
        </div>
        <div className="rounded-full bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
          Descuento sorpresa listo (cerrable)
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {plans.map((plan: any) => (
          <div key={plan.id} className="card p-5">
            {plan.popular && (
              <span className="rounded-full bg-orange-500/20 px-2 py-1 text-xs font-semibold text-orange-100">
                Más popular
              </span>
            )}
            <h3 className="mt-2 text-xl font-semibold text-orange-50">{plan.name}</h3>
            <p className="text-sm text-slate-400">{plan.weeks} semanas</p>
            <p className="mt-2 text-3xl font-bold text-orange-200">{plan.priceTotal}€</p>
            <p className="text-xs text-slate-400">~ {plan.pricePerDay} €/día</p>
            <p className="mt-3 text-sm text-slate-300">{plan.badge}</p>
            <div className="mt-4">
              <Link className="btn-primary w-full" href="/quiz">
                Continuar
              </Link>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">La rueda de descuento es opcional y puede cerrarse.</p>
    </div>
  );
}
