import type { Scenario } from "./data";
export type Answer = { verdict: boolean; selected: string[] };
export function grade(scenario: Scenario, answer: Answer) {
  const expected = scenario.parts.filter((p) => p.suspicious).map((p) => p.id);
  const hits = answer.selected.filter((id) => expected.includes(id)).length;
  const extras = answer.selected.filter((id) => !expected.includes(id)).length;
  const missed = expected.length - hits;
  return {
    correct:
      answer.verdict === scenario.phishing && missed === 0 && extras === 0,
    verdictCorrect: answer.verdict === scenario.phishing,
    hits,
    extras,
    missed,
    expected,
  };
}
export const STORAGE_KEY = "phishlab-progress-v1";
export type Saved = { answers: Record<string, Answer>; active: string };
export function readProgress(raw: string | null, scenarios: Scenario[]): Saved {
  const fallback = { answers: {}, active: scenarios[0].id };
  try {
    const saved = JSON.parse(raw || "null");
    if (!saved || typeof saved.answers !== "object" || !saved.answers)
      return fallback;
    const answers: Record<string, Answer> = {};
    for (const s of scenarios) {
      const a = saved.answers[s.id];
      if (
        a &&
        typeof a.verdict === "boolean" &&
        Array.isArray(a.selected) &&
        a.selected.every(
          (id: unknown) =>
            typeof id === "string" && s.parts.some((p) => p.id === id),
        )
      )
        answers[s.id] = {
          verdict: a.verdict,
          selected: [...new Set<string>(a.selected)],
        };
    }
    return {
      answers,
      active: scenarios.some((s) => s.id === saved.active)
        ? saved.active
        : scenarios[0].id,
    };
  } catch {
    return fallback;
  }
}
