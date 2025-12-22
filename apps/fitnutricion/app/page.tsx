import Link from "next/link";
import Image from "next/image";

const highlights = [
  { title: "Onboarding inteligente", desc: "48 pasos configurables, guarda progreso en local." },
  { title: "Cálculos transparentes", desc: "IMC, TDEE, hidratación y edad fitness explicada." },
  { title: "Revisión humana", desc: "Cola de revisión antes de aprobar y publicar un plan." }
];

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="grid items-center gap-8 rounded-3xl border border-slate-800/60 bg-slate-900/70 px-6 py-10 shadow-xl md:grid-cols-2">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">
            Sin claims médicos · revisión humana
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            FitNutricion: planes personalizados que siempre pasan por revisión humana
          </h1>
          <p className="text-lg text-slate-300">
            Completa un quiz avanzado, vemos tus métricas y generamos un borrador IA. Un especialista lo revisa, edita y publica.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-primary" href="/quiz">
              Crear mi plan
            </Link>
            <Link className="btn-secondary" href="/admin/login">
              Ir al panel admin
            </Link>
          </div>
          <p className="text-xs text-orange-200">
            Aviso: uso orientativo. No sustituye consejo médico ni nutricional profesional.
          </p>
        </div>
        <div className="relative h-72 w-full">
          <Image
            alt="Progreso"
            src="/illustrations/progress.svg"
            fill
            className="object-contain"
            priority
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="card p-5">
            <h3 className="text-lg font-semibold text-orange-200">{item.title}</h3>
            <p className="text-sm text-slate-300">{item.desc}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-orange-200">Cómo funciona</h3>
          <ol className="mt-3 space-y-3 text-sm text-slate-300">
            <li>1. Completa el quiz guiado (48 pasos).</li>
            <li>2. Calculamos métricas clave y generamos un borrador.</li>
            <li>3. El plan pasa a estado “Pendiente de revisión”.</li>
            <li>4. Un admin edita, aprueba y lo envía manualmente.</li>
            <li>5. Todo queda trazado en auditoría.</li>
          </ol>
        </div>
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-orange-200">Seguridad y ética</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Avisos claros: información orientativa, sin sustituir asesoría médica.</li>
            <li>• Sin dark patterns: opt-in marketing no preseleccionado.</li>
            <li>• Planes y HTML sanitizados para evitar inyecciones.</li>
            <li>• API Key OpenAI cifrada en base de datos con AES-GCM.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
