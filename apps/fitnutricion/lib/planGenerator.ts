import { planZodSchema } from "./planSchema";
import { computeMacros, computeMetrics } from "./calculations";

type GenerateInput = {
  answers: Record<string, any>;
  useOpenAI: boolean;
  settings: {
    model?: string | null;
    promptSystem?: string | null;
    promptUser?: string | null;
    temperature?: number | null;
    maxTokens?: number | null;
  };
  openaiClient?: any;
};

const fallbackPlan = (answers: Record<string, any>) => {
  const metrics = computeMetrics({
    heightCm: Number(answers.height) || 170,
    weightKg: Number(answers.weight) || 70,
    age: Number(answers.age) || 28,
    sex: answers.sex
  });
  const { caloriesTarget, macros } = computeMacros(
    answers.goal || "perder_grasa",
    Number(answers.weight) || 70,
    metrics.tdee
  );
  return {
    meta: {
      version: "1.0",
      goal: answers.goal || "perder_grasa",
      level: answers.level || "principiante",
      place: answers.place || "casa",
      equipment: answers.equipment || ["ninguno"],
      durationMin: 30,
      dietType: answers.dietType || "omnivoro",
      caloriesTarget,
      macros
    },
    workoutPlan: {
      weeks: Array.from({ length: 4 }).map((_, idx) => ({
        week: idx + 1,
        days: [
          {
            day: 1,
            title: "Full body básico",
            durationMin: 30,
            warmup: [{ name: "Movilidad articular", sets: 1, reps: "8-10" }],
            exercises: [
              { name: "Sentadillas asistidas", sets: 3, reps: "10-12", restSec: 60 },
              { name: "Flexiones inclinadas", sets: 3, reps: "8-10", restSec: 75 },
              { name: "Plancha", sets: 3, reps: "30s", restSec: 45 }
            ],
            cooldown: [{ name: "Respiración diafragmática", durationMin: 3 }]
          },
          {
            day: 2,
            title: "Cardio suave",
            durationMin: 20,
            exercises: [{ name: "Caminata ligera", sets: 1, reps: "20 min", restSec: 0, notes: "RPE 5/10" }]
          }
        ]
      }))
    },
    nutritionPlan: {
      days: Array.from({ length: 7 }).map((_, idx) => ({
        day: idx + 1,
        meals: [
          {
            name: "Desayuno",
            time: "08:00",
            recipe: {
              title: "Avena cremosa con fruta",
              minutes: 10,
              ingredients: ["Copos de avena", "Leche o bebida vegetal", "Fruta fresca", "Semillas"],
              steps: ["Calienta la bebida", "Añade avena y remueve", "Sirve con fruta y semillas"],
              macros: { kcal: 420, protein_g: 20, fat_g: 12, carbs_g: 55 }
            }
          },
          {
            name: "Comida",
            time: "14:00",
            recipe: {
              title: "Bowl de pollo y verduras",
              minutes: 25,
              ingredients: ["Pechuga de pollo", "Arroz integral", "Brócoli", "Aceite de oliva"],
              steps: ["Cocina el arroz", "Saltea el pollo", "Añade brócoli y aceite en crudo"],
              macros: { kcal: 620, protein_g: 45, fat_g: 18, carbs_g: 70 }
            }
          }
        ]
      })),
      shoppingList: [
        { item: "Avena", qty: "500g", category: "Desayuno" },
        { item: "Pechuga de pollo", qty: "1kg", category: "Proteína" },
        { item: "Verduras mixtas", qty: "1kg", category: "Vegetales" },
        { item: "Arroz integral", qty: "1kg", category: "Carbohidratos" }
      ],
      substitutions: [{ if: "vegano", replace: "pollo", with: "tofu marinado" }]
    },
    habits: [
      { title: "Hidratación", detail: "Alcanza al menos 30-35 ml/kg al día." },
      { title: "Movimiento", detail: "Suma 6-8k pasos diarios en días suaves." },
      { title: "Sueño", detail: "Prioriza 7-9h y rutinas de descanso consistentes." }
    ],
    disclaimer: "Plan orientativo. No sustituye consejo médico ni nutricional profesional."
  };
};

export async function generatePlan(input: GenerateInput) {
  if (!input.useOpenAI || !input.openaiClient) {
    return fallbackPlan(input.answers);
  }

  try {
    const response = await input.openaiClient.responses.create({
      model: input.settings.model || "gpt-4.1-mini",
      temperature: input.settings.temperature ?? 0.4,
      max_output_tokens: input.settings.maxTokens ?? 1500,
      input: [
        { role: "system", content: input.settings.promptSystem || "" },
        {
          role: "user",
          content:
            (input.settings.promptUser || "").replace("{{answers}}", JSON.stringify(input.answers, null, 2))
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "FitNutricionPlan",
          schema: input.answers.planJsonSchemaOverride ?? undefined
        }
      }
    });

    const message = response.output[0]?.content[0];
    // @ts-expect-error runtime check
    const parsed = message?.text ? JSON.parse(message.text) : message?.json ?? message;
    return planZodSchema.parse(parsed);
  } catch (error) {
    console.error("Error OpenAI, fallback activado", error);
    return fallbackPlan(input.answers);
  }
}
