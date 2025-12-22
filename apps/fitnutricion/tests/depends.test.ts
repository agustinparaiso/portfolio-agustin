import { evaluateCondition } from "../lib/depends";

describe("dependsOn engine", () => {
  const answers = { goal: "perder_grasa", height: 175, preferences: ["cardio"], steps: 8000 };

  it("matches eq and in", () => {
    expect(evaluateCondition({ key: "goal", eq: "perder_grasa" }, answers)).toBe(true);
    expect(evaluateCondition({ key: "goal", in: ["ganar_musculo", "perder_grasa"] }, answers)).toBe(true);
  });

  it("supports gt and lt", () => {
    expect(evaluateCondition({ key: "height", gt: 150 }, answers)).toBe(true);
    expect(evaluateCondition({ key: "height", lt: 150 }, answers)).toBe(false);
  });

  it("supports logical groups", () => {
    expect(evaluateCondition({ and: [{ key: "goal", eq: "perder_grasa" }, { key: "height", gt: 160 }] }, answers)).toBe(true);
    expect(evaluateCondition({ or: [{ key: "height", lt: 160 }, { key: "goal", eq: "ganar" }] }, answers)).toBe(false);
  });
});
