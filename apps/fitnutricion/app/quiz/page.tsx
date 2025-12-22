"use client";

import { useEffect, useState } from "react";
import { StepRenderer, Question } from "../../components/StepRenderer";
import { useQuizStore } from "../../store/quizStore";
import Link from "next/link";

export default function QuizPage() {
  const { sessionId, setSessionId, answers } = useQuizStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    const bootstrap = async () => {
      const qRes = await fetch("/api/questions");
      const data = await qRes.json();
      setQuestions(data.questions);
      if (!sessionId) {
        const res = await fetch("/api/session", { method: "POST" });
        const session = await res.json();
        setSessionId(session.id);
      }
    };
    bootstrap();
  }, [sessionId, setSessionId]);

  const saveAnswer = async (payload: { key: string; value: any; step: number }) => {
    if (!sessionId) return;
    await fetch(`/api/session/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { [payload.key]: payload.value }, currentStep: payload.step })
    });
  };

  const submit = async () => {
    if (!sessionId) return;
    await fetch(`/api/compute/${sessionId}`, { method: "POST" });
    await fetch(`/api/generate-plan/${sessionId}`, { method: "POST" });
    setStatus("Plan borrador generado y en revisión.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-200">Quiz FitNutricion</h1>
          <p className="text-sm text-slate-400">
            48 pasos. Tus respuestas se guardan de forma local y en la sesión de servidor.
          </p>
        </div>
        <Link className="btn-secondary" href="/planes">
          Ver planes
        </Link>
      </div>
      <StepRenderer questions={questions} onSubmit={submit} onSave={saveAnswer} />
      {status && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{status}</p>}
      <p className="text-xs text-slate-500">
        Recordatorio ético: la información es orientativa y no sustituye consejo médico.
      </p>
      {sessionId && (
        <Link className="btn-primary" href={`/resultado?session=${sessionId}`}>
          Ir al resultado
        </Link>
      )}
    </div>
  );
}
