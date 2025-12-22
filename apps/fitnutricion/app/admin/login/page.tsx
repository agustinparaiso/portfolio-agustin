"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("admin@fitnutricion.test");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Credenciales inválidas");
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6 shadow-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Acceso admin</p>
        <h1 className="text-2xl font-bold text-orange-200">Panel FitNutricion</h1>
        <p className="text-sm text-slate-400">Solo para roles autorizados. Registros en auditoría.</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input
            className="mt-1 w-full rounded-lg bg-slate-800 p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Contraseña</label>
          <input
            className="mt-1 w-full rounded-lg bg-slate-800 p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </div>
        <button className="btn-primary w-full" type="submit">
          Entrar
        </button>
      </form>
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
      <p className="text-xs text-slate-500">
        Importante: la información es orientativa. No se envía ningún plan sin revisión humana.
      </p>
    </div>
  );
}
