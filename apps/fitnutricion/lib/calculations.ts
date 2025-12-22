export type CalculationInput = {
  heightCm: number;
  weightKg: number;
  age?: number;
  sex?: "masculino" | "femenino" | "otro" | "prefiero_no_decir";
  activityLevel?: "bajo" | "medio" | "alto";
};

export type ComputedMetrics = {
  bmi: number;
  bmiLabel: string;
  bmr: number;
  tdee: number;
  waterMl: number;
  fitnessAge: number;
  notes: string[];
};

export function computeMetrics(input: CalculationInput): ComputedMetrics {
  const bmi = +(input.weightKg / Math.pow(input.heightCm / 100, 2)).toFixed(2);
  const bmiLabel =
    bmi < 18.5 ? "bajo peso" : bmi < 25 ? "saludable" : bmi < 30 ? "sobrepeso" : "obesidad";

  const sexFactor = input.sex === "femenino" ? -161 : input.sex === "masculino" ? 5 : -78;
  const bmr = Math.round(10 * input.weightKg + 6.25 * input.heightCm - 5 * (input.age ?? 28) + sexFactor);
  const activityMultiplier = input.activityLevel === "alto" ? 1.5 : input.activityLevel === "medio" ? 1.35 : 1.2;
  const tdee = Math.round(bmr * activityMultiplier);

  const waterMl = Math.round(input.weightKg * 32);
  const fitnessAgeBase = (input.age ?? 28) + (bmi - 22) * 0.6 + (activityMultiplier - 1.2) * -8;
  const fitnessAge = Math.max(18, Math.round(fitnessAgeBase));

  const notes = [
    `IMC ${bmi} (${bmiLabel})`,
    `BMR estimada ${bmr} kcal`,
    `TDEE aproximado ${tdee} kcal`,
    `Agua recomendada ${waterMl} ml/día (30-35 ml/kg)`,
    "La edad fitness es una estimación orientativa, no un diagnóstico."
  ];

  return { bmi, bmiLabel, bmr, tdee, waterMl, fitnessAge, notes };
}

export function computeMacros(goal: string, weightKg: number, tdee: number) {
  const multiplier = goal === "ganar_musculo" ? 0.15 : goal === "recomposicion" ? -0.05 : -0.15;
  const caloriesTarget = Math.round(tdee + tdee * multiplier);
  const protein_g = Math.round(weightKg * 1.8);
  const fat_g = Math.round((caloriesTarget * 0.25) / 9);
  const carbs_g = Math.max(0, Math.round((caloriesTarget - protein_g * 4 - fat_g * 9) / 4));
  return { caloriesTarget, macros: { protein_g, fat_g, carbs_g } };
}
