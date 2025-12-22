"use client";

import { useEffect, useState } from "react";
import { useQuizStore } from "../store/quizStore";
import { Condition, evaluateCondition } from "../lib/depends";
import { cleanHtml } from "../lib/sanitize";

export type Question = {
  id: number;
  key: string;
  title: string;
  description?: string | null;
  helpHtml?: string | null;
  footerHtml?: string | null;
  type: string;
  order: number;
  options?: any;
  validations?: any;
  isSkippable: boolean;
  dependsOn?: Condition;
  uiVariant?: string | null;
};

type Props = {
  questions: Question[];
  onSubmit: () => void;
  onSave: (payload: { key: string; value: any; step: number }) => Promise<void>;
};

export function StepRenderer({ questions, onSubmit, onSave }: Props) {
  const { answers, currentStep, setAnswer, nextStep, prevStep } = useQuizStore();
  const [loading, setLoading] = useState(false);
  const ordered = questions.sort((a, b) => a.order - b.order);
  const currentQuestion = ordered[currentStep - 1];

  useEffect(() => {
    if (!currentQuestion?.dependsOn) return;
    const shouldShow = evaluateCondition(currentQuestion.dependsOn, answers);
    if (!shouldShow) {
      nextStep();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.key]);

  if (!currentQuestion) {
    return (
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-orange-200">Quiz completado</h2>
        <p className="text-sm text-slate-300">Envía tus respuestas para generar el borrador.</p>
        <div className="mt-4 flex gap-2">
          <button className="btn-secondary" onClick={prevStep}>
            Volver
          </button>
          <button className="btn-primary" onClick={onSubmit}>
            Enviar respuestas
          </button>
        </div>
      </div>
    );
  }

  const value = answers[currentQuestion.key] ?? "";

  const renderField = () => {
    switch (currentQuestion.type) {
      case "singleChoice":
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {(currentQuestion.options || []).map((opt: any) => (
              <button
                key={opt.value}
                className={`btn-secondary justify-start ${value === opt.value ? "border border-orange-400 bg-orange-500/10 text-orange-100" : ""}`}
                onClick={() => setAnswer(currentQuestion.key, opt.value)}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm">{opt.label}</p>
                  {opt.help && <p className="text-xs text-slate-400">{opt.help}</p>}
                </div>
              </button>
            ))}
          </div>
        );
      case "multiChoice":
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {(currentQuestion.options || []).map((opt: any) => {
              const arr = Array.isArray(value) ? value : [];
              const active = arr.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  className={`btn-secondary justify-start ${active ? "border border-orange-400 bg-orange-500/10 text-orange-100" : ""}`}
                  onClick={() => {
                    const next = active ? arr.filter((v) => v !== opt.value) : [...arr, opt.value];
                    setAnswer(currentQuestion.key, next);
                  }}
                >
                  <div className="text-left">
                    <p className="font-semibold text-sm">{opt.label}</p>
                    {opt.help && <p className="text-xs text-slate-400">{opt.help}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        );
      case "slider":
        return (
          <div className="space-y-2">
            <input
              type="range"
              min={currentQuestion.validations?.min ?? 0}
              max={currentQuestion.validations?.max ?? 10}
              value={value || 0}
              className="w-full"
              onChange={(e) => setAnswer(currentQuestion.key, Number(e.target.value))}
            />
            <p className="text-sm text-orange-200">{value || 0}</p>
          </div>
        );
      case "inputNumber":
        return (
          <input
            type="number"
            className="w-full rounded-lg bg-slate-800 p-3"
            value={value}
            onChange={(e) => setAnswer(currentQuestion.key, Number(e.target.value))}
          />
        );
      case "inputEmail":
        return (
          <input
            type="email"
            className="w-full rounded-lg bg-slate-800 p-3"
            value={value}
            onChange={(e) => setAnswer(currentQuestion.key, e.target.value)}
          />
        );
      case "inputText":
      case "info":
      default:
        return currentQuestion.type === "info" ? (
          <div className="rounded-lg bg-slate-800/40 p-3 text-sm text-slate-200">
            {currentQuestion.description}
          </div>
        ) : (
          <textarea
            className="min-h-[120px] w-full rounded-lg bg-slate-800 p-3"
            value={value}
            onChange={(e) => setAnswer(currentQuestion.key, e.target.value)}
          />
        );
    }
  };

  const handleNext = async () => {
    setLoading(true);
    await onSave({ key: currentQuestion.key, value, step: currentStep });
    nextStep();
    setLoading(false);
  };

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
        <span>
          Paso {currentStep} de {ordered.length}
        </span>
        {currentQuestion.isSkippable && (
          <button className="text-orange-300 underline" onClick={nextStep}>
            Omitir
          </button>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-orange-200">{currentQuestion.title}</h2>
      {currentQuestion.description && (
        <p className="mt-2 text-sm text-slate-300">{currentQuestion.description}</p>
      )}
      {currentQuestion.helpHtml && (
        <div
          className="prose prose-invert mt-3 rounded-lg bg-slate-800/50 p-3 text-sm"
          dangerouslySetInnerHTML={{ __html: cleanHtml(currentQuestion.helpHtml) }}
        />
      )}

      <div className="mt-4">{renderField()}</div>

      {currentQuestion.footerHtml && (
        <div
          className="prose prose-invert mt-3 text-xs text-slate-400"
          dangerouslySetInnerHTML={{ __html: cleanHtml(currentQuestion.footerHtml) }}
        />
      )}

      <div className="mt-6 flex gap-2">
        <button className="btn-secondary" onClick={prevStep} disabled={currentStep === 1}>
          Atrás
        </button>
        <button className="btn-primary" onClick={handleNext} disabled={loading}>
          {currentStep === ordered.length ? "Enviar respuestas" : "Continuar"}
        </button>
      </div>
    </div>
  );
}
