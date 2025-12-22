export type Condition =
  | { key: string; eq?: string | number | boolean; in?: Array<string | number>; gt?: number; lt?: number }
  | { and: Condition[] }
  | { or: Condition[] };

export function evaluateCondition(condition: Condition, answers: Record<string, unknown>): boolean {
  if ("and" in condition) {
    return condition.and.every((c) => evaluateCondition(c, answers));
  }
  if ("or" in condition) {
    return condition.or.some((c) => evaluateCondition(c, answers));
  }

  const value = answers[condition.key];
  if (condition.eq !== undefined) {
    return value === condition.eq;
  }
  if (condition.in) {
    return Array.isArray(value)
      ? value.some((v) => condition.in?.includes(v as never))
      : condition.in.includes(value as never);
  }
  if (condition.gt !== undefined && typeof value === "number") {
    return value > condition.gt;
  }
  if (condition.lt !== undefined && typeof value === "number") {
    return value < condition.lt;
  }
  return true;
}
