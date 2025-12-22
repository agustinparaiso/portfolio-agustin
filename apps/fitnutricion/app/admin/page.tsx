import { prisma } from "../../lib/db";
import { format } from "date-fns";

async function getMetrics() {
  const sessions = await prisma.session.count();
  const completed = await prisma.session.count({
    where: { status: { in: ["PLAN_GENERADO", "PENDIENTE_REVISION"] } }
  });
  const approved = await prisma.plan.count({ where: { status: "APROBADO" } });
  return {
    sessions,
    completed,
    approved,
    conversion: sessions ? Math.round((completed / sessions) * 100) : 0
  };
}

async function getRecentSessions() {
  return prisma.session.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, createdAt: true, status: true, goal: true, dietType: true }
  });
}

export default async function AdminDashboard() {
  const metrics = await getMetrics();
  const sessions = await getRecentSessions();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Dashboard</p>
        <h1 className="text-3xl font-bold text-orange-200">Estado general</h1>
        <p className="text-sm text-slate-400">Métricas mock de los últimos 7 días.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Sesiones iniciadas" value={metrics.sessions} />
        <MetricCard label="Planes generados" value={metrics.completed} />
        <MetricCard label="Planes aprobados" value={metrics.approved} />
        <MetricCard label="Tasa conversión" value={`${metrics.conversion}%`} />
      </div>
      <div className="card p-5">
        <h2 className="text-lg font-semibold text-orange-200">Últimas sesiones</h2>
        <div className="mt-3 divide-y divide-slate-800 text-sm">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-orange-100">{session.id}</p>
                <p className="text-xs text-slate-400">
                  {session.goal} · {session.dietType || "sin dieta"}
                </p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{session.status}</p>
                <p>{format(session.createdAt, "dd/MM HH:mm")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-orange-200">{value}</p>
    </div>
  );
}
