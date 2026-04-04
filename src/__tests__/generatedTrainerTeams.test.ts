import { describe, expect, it } from "vitest";
import generatedTrainerTeams from "../data/generatedTrainerTeams.json";

describe("generated trainer team archive", () => {
  it("contains more than 500 Bulbapedia-imported teams", () => {
    expect(generatedTrainerTeams.length).toBeGreaterThan(500);
  });
});
