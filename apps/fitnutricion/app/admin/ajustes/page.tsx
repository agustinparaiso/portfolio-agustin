"use client";

import { useEffect, useState } from "react";

type Settings = {
  useOpenAI: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  promptSystem?: string;
  promptUser?: string;
};

export default function AjustesPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      setSettings(data.settings);
      const modelsRes = await fetch("/api/openai/models");
      const modelsData = await modelsRes.json();
      setModels(modelsData.models || []);
    };
    load();
  }, []);

  const save = async () => {
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, apiKey })
    });
    setMessage("Ajustes guardados. La API key se cifra con AES-GCM y no se muestra.");
  };

  const testConnection = async () => {
    const res = await fetch("/api/openai/test-connection", { method: "POST" });
    const data = await res.json();
    setMessage(data.ok ? "Conexión correcta" : data.error || "Error");
  };

  if (!settings) return <p className="text-slate-400">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Ajustes</p>
        <h1 className="text-3xl font-bold text-orange-200">OpenAI, límites y prompts</h1>
        <p className="text-sm text-slate-400">La API Key nunca se envía al cliente. Se cifra en BD.</p>
      </div>
      <div className="card p-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={settings.useOpenAI}
            onChange={(e) => setSettings({ ...settings, useOpenAI: e.target.checked })}
          />
          Usar OpenAI para generación
        </label>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">Modelo</p>
            <select
              className="w-full rounded-lg bg-slate-800 p-2"
              value={settings.model || ""}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
            >
              {models.map((model) => (
                <option key={model}>{model}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-xs text-slate-400">API Key (no se muestra de nuevo)</p>
            <input
              className="w-full rounded-lg bg-slate-800 p-2"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div>
            <p className="text-xs text-slate-400">Temperatura</p>
            <input
              className="w-full rounded-lg bg-slate-800 p-2"
              type="number"
              value={settings.temperature ?? 0.4}
              onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
            />
          </div>
          <div>
            <p className="text-xs text-slate-400">Max tokens</p>
            <input
              className="w-full rounded-lg bg-slate-800 p-2"
              type="number"
              value={settings.maxTokens ?? 1500}
              onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <p className="text-xs text-orange-200">Prompt sistema</p>
          <textarea
            className="mt-1 w-full rounded-lg bg-slate-800 p-3 text-sm"
            value={settings.promptSystem || ""}
            onChange={(e) => setSettings({ ...settings, promptSystem: e.target.value })}
          />
        </div>
        <div>
          <p className="text-xs text-orange-200">Prompt usuario</p>
          <textarea
            className="mt-1 w-full rounded-lg bg-slate-800 p-3 text-sm"
            value={settings.promptUser || ""}
            onChange={(e) => setSettings({ ...settings, promptUser: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={save}>
            Guardar
          </button>
          <button className="btn-secondary" onClick={testConnection}>
            Probar conexión
          </button>
        </div>
        {message && <p className="text-sm text-emerald-200">{message}</p>}
        <p className="text-xs text-slate-500">
          La key se cifra con AES-GCM usando MASTER_KEY. Rate limit interno recomendado: 30/min para endpoints admin.
        </p>
      </div>
    </div>
  );
}
