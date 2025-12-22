import { z } from "zod";

export const planZodSchema = z.object({
  meta: z.object({
    version: z.string(),
    goal: z.enum(["perder_grasa", "ganar_musculo", "recomposicion"]),
    level: z.enum(["principiante", "intermedio", "avanzado"]),
    place: z.enum(["casa", "gimnasio"]),
    equipment: z.array(z.string()),
    durationMin: z.union([z.literal(10), z.literal(15), z.literal(20), z.literal(30), z.literal(45)]),
    dietType: z.enum(["omnivoro", "vegetariano", "vegano", "pescetariano"]),
    caloriesTarget: z.number(),
    macros: z.object({
      protein_g: z.number(),
      fat_g: z.number(),
      carbs_g: z.number()
    })
  }),
  workoutPlan: z.object({
    weeks: z.array(
      z.object({
        week: z.number(),
        days: z.array(
          z.object({
            day: z.number(),
            title: z.string(),
            durationMin: z.number(),
            warmup: z.array(z.object({ name: z.string(), sets: z.number(), reps: z.string() })).optional(),
            exercises: z.array(
              z.object({
                name: z.string(),
                sets: z.number(),
                reps: z.string(),
                restSec: z.number(),
                notes: z.string().optional()
              })
            ),
            cooldown: z.array(z.object({ name: z.string(), durationMin: z.number() })).optional()
          })
        )
      })
    )
  }),
  nutritionPlan: z.object({
    days: z.array(
      z.object({
        day: z.number(),
        meals: z.array(
          z.object({
            name: z.string(),
            time: z.string(),
            recipe: z.object({
              title: z.string(),
              minutes: z.number(),
              ingredients: z.array(z.string()),
              steps: z.array(z.string()),
              macros: z.object({
                kcal: z.number(),
                protein_g: z.number().optional(),
                fat_g: z.number().optional(),
                carbs_g: z.number().optional()
              })
            })
          })
        )
      })
    ),
    shoppingList: z.array(z.object({ item: z.string(), qty: z.string(), category: z.string() })),
    substitutions: z.array(z.object({ if: z.string(), replace: z.string(), with: z.string() })).optional()
  }),
  habits: z.array(z.object({ title: z.string(), detail: z.string() })),
  disclaimer: z.string()
});

export type Plan = z.infer<typeof planZodSchema>;

export const planJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    meta: {
      type: "object",
      properties: {
        version: { type: "string" },
        goal: { enum: ["perder_grasa", "ganar_musculo", "recomposicion"] },
        level: { enum: ["principiante", "intermedio", "avanzado"] },
        place: { enum: ["casa", "gimnasio"] },
        equipment: { type: "array", items: { type: "string" } },
        durationMin: { enum: [10, 15, 20, 30, 45] },
        dietType: { enum: ["omnivoro", "vegetariano", "vegano", "pescetariano"] },
        caloriesTarget: { type: "number" },
        macros: {
          type: "object",
          properties: {
            protein_g: { type: "number" },
            fat_g: { type: "number" },
            carbs_g: { type: "number" }
          },
          required: ["protein_g", "fat_g", "carbs_g"]
        }
      },
      required: ["version", "goal", "level", "place", "equipment", "durationMin", "dietType", "caloriesTarget", "macros"]
    },
    workoutPlan: {
      type: "object",
      properties: {
        weeks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              week: { type: "number" },
              days: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "number" },
                    title: { type: "string" },
                    durationMin: { type: "number" },
                    warmup: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "number" },
                          reps: { type: "string" }
                        },
                        required: ["name", "sets", "reps"]
                      }
                    },
                    exercises: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "number" },
                          reps: { type: "string" },
                          restSec: { type: "number" },
                          notes: { type: "string" }
                        },
                        required: ["name", "sets", "reps", "restSec"]
                      }
                    },
                    cooldown: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          durationMin: { type: "number" }
                        },
                        required: ["name", "durationMin"]
                      }
                    }
                  },
                  required: ["day", "title", "durationMin", "exercises"]
                }
              }
            },
            required: ["week", "days"]
          }
        }
      },
      required: ["weeks"]
    },
    nutritionPlan: {
      type: "object",
      properties: {
        days: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              meals: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    time: { type: "string" },
                    recipe: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        minutes: { type: "number" },
                        ingredients: { type: "array", items: { type: "string" } },
                        steps: { type: "array", items: { type: "string" } },
                        macros: {
                          type: "object",
                          properties: {
                            kcal: { type: "number" },
                            protein_g: { type: "number" },
                            fat_g: { type: "number" },
                            carbs_g: { type: "number" }
                          },
                          required: ["kcal"]
                        }
                      },
                      required: ["title", "minutes", "ingredients", "steps", "macros"]
                    }
                  },
                  required: ["name", "time", "recipe"]
                }
              }
            },
            required: ["day", "meals"]
          }
        },
        shoppingList: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item: { type: "string" },
              qty: { type: "string" },
              category: { type: "string" }
            },
            required: ["item", "qty", "category"]
          }
        },
        substitutions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              if: { type: "string" },
              replace: { type: "string" },
              with: { type: "string" }
            },
            required: ["if", "replace", "with"]
          }
        }
      },
      required: ["days", "shoppingList"]
    },
    habits: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          detail: { type: "string" }
        },
        required: ["title", "detail"]
      }
    },
    disclaimer: { type: "string" }
  },
  required: ["meta", "workoutPlan", "nutritionPlan", "habits", "disclaimer"]
};
