import { planZodSchema } from "../lib/planSchema";

describe("plan schema", () => {
  it("validates a structured plan", () => {
    const sample = {
      meta: {
        version: "1.0",
        goal: "perder_grasa",
        level: "principiante",
        place: "casa",
        equipment: ["ninguno"],
        durationMin: 30,
        dietType: "omnivoro",
        caloriesTarget: 1800,
        macros: { protein_g: 120, fat_g: 60, carbs_g: 180 }
      },
      workoutPlan: {
        weeks: [
          {
            week: 1,
            days: [
              {
                day: 1,
                title: "Full body",
                durationMin: 30,
                warmup: [{ name: "Movilidad", sets: 1, reps: "10" }],
                exercises: [{ name: "Sentadilla", sets: 3, reps: "10-12", restSec: 60 }],
                cooldown: [{ name: "Respiración", durationMin: 3 }]
              }
            ]
          }
        ]
      },
      nutritionPlan: {
        days: [
          {
            day: 1,
            meals: [
              {
                name: "Desayuno",
                time: "08:00",
                recipe: {
                  title: "Avena",
                  minutes: 10,
                  ingredients: ["Avena", "Leche", "Fruta"],
                  steps: ["Calentar", "Mezclar"],
                  macros: { kcal: 400, protein_g: 20, fat_g: 10, carbs_g: 60 }
                }
              }
            ]
          }
        ],
        shoppingList: [{ item: "Avena", qty: "500g", category: "Desayuno" }],
        substitutions: [{ if: "vegano", replace: "leche", with: "bebida vegetal" }]
      },
      habits: [{ title: "Hidratación", detail: "2-3L día" }],
      disclaimer: "Plan orientativo, no sustituye consejo médico."
    };

    const parsed = planZodSchema.parse(sample);
    expect(parsed.meta.goal).toBe("perder_grasa");
  });
});
