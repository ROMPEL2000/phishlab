import { describe, expect, it } from "vitest";
import { scenarios } from "./data";
import { grade, readProgress } from "./logic";
describe("scenario evaluation", () => {
  it("accepts a precise analysis of each scenario", () => {
    for (const s of scenarios)
      expect(
        grade(s, {
          verdict: s.phishing,
          selected: s.parts.filter((p) => p.suspicious).map((p) => p.id),
        }).correct,
      ).toBe(true);
  });
  it("requires the right verdict even with all signs found", () => {
    const s = scenarios[0];
    expect(
      grade(s, {
        verdict: false,
        selected: s.parts.filter((p) => p.suspicious).map((p) => p.id),
      }).correct,
    ).toBe(false);
  });
  it("counts missed signs and false positives independently", () => {
    const r = grade(scenarios[0], {
      verdict: true,
      selected: ["from", "greeting"],
    });
    expect(r).toMatchObject({
      hits: 1,
      extras: 1,
      missed: 2,
      correct: false,
      verdictCorrect: true,
    });
  });
  it("accepts safe cases with no marks, rejects arbitrary marks", () => {
    const s = scenarios[1];
    expect(grade(s, { verdict: false, selected: [] }).correct).toBe(true);
    expect(grade(s, { verdict: false, selected: ["from"] }).correct).toBe(
      false,
    );
  });
  it("has ten unique cases with coherent signs", () => {
    expect(scenarios).toHaveLength(10);
    expect(new Set(scenarios.map((s) => s.id)).size).toBe(10);
    for (const s of scenarios) {
      expect(s.parts.some((p) => p.suspicious)).toBe(s.phishing);
      expect(new Set(s.parts.map((p) => p.id)).size).toBe(s.parts.length);
    }
  });
});
describe("progress recovery", () => {
  it("recovers from malformed or blocked storage content", () => {
    for (const raw of ["{", "null", "{}", '{"answers":null}'])
      expect(readProgress(raw, scenarios).answers).toEqual({});
  });
  it("filters obsolete cases and invalid answers", () => {
    const saved = readProgress(
      JSON.stringify({
        active: "obsolete",
        answers: {
          mailbox: { verdict: true, selected: ["missing"] },
          meeting: { verdict: false, selected: [] },
          obsolete: { verdict: true, selected: [] },
        },
      }),
      scenarios,
    );
    expect(saved.active).toBe("mailbox");
    expect(Object.keys(saved.answers)).toEqual(["meeting"]);
  });
  it("restores valid progress and deduplicates marks", () => {
    expect(
      readProgress(
        JSON.stringify({
          active: "meeting",
          answers: { mailbox: { verdict: true, selected: ["from", "from"] } },
        }),
        scenarios,
      ),
    ).toEqual({
      active: "meeting",
      answers: { mailbox: { verdict: true, selected: ["from"] } },
    });
  });
});
