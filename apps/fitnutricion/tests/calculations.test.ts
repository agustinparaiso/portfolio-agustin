import { computeMetrics, computeMacros } from "../lib/calculations";

describe("calculations", () => {
  it("computes BMI and hydration", () => {
    const metrics = computeMetrics({ heightCm: 180, weightKg: 75, age: 30, sex: "masculino", activityLevel: "medio" });
    expect(metrics.bmi).toBeCloseTo(23.15, 2);
    expect(metrics.waterMl).toBe(2400);
    expect(metrics.tdee).toBeGreaterThan(0);
  });

  it("computes macros based on goal", () => {
    const macros = computeMacros("perder_grasa", 70, 2200);
    expect(macros.caloriesTarget).toBeLessThan(2200);
    expect(macros.macros.protein_g).toBe(126);
  });
});
