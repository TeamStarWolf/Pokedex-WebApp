import { describe, expect, it } from "vitest";
import { getBulbapediaReference, withBulbapediaReference } from "../data/trainerPresets/bulbapedia";

describe("Bulbapedia trainer references", () => {
  it("uses direct trainer pages for mapped trainers", () => {
    expect(getBulbapediaReference("Red").url).toContain("/Red_(game)");
    expect(getBulbapediaReference("Cynthia").label).toBe("Bulbapedia trainer page");
  });

  it("falls back to Bulbapedia search for unmapped trainers", () => {
    const reference = getBulbapediaReference("Some Future Trainer");
    expect(reference.label).toBe("Bulbapedia search");
    expect(reference.url).toContain("Special:Search");
    expect(reference.url).toContain("Some%20Future%20Trainer");
  });

  it("attaches Bulbapedia source metadata to presets", () => {
    const enriched = withBulbapediaReference({
      id: "test",
      name: "Test Battle",
      trainer: "Leon",
      category: "Champions",
      region: "Galar",
      battleLabel: "Champion",
      sourceGame: "Pokemon Sword / Shield",
      sourceGroup: "sword-shield",
      difficulty: "elite",
      canonical: true,
      description: "Test",
      howToBeat: ["Test"],
      tags: ["test"],
      members: [6],
    });

    expect(enriched.source?.kind).toBe("bulbapedia");
    expect(enriched.source?.url).toContain("/Leon");
  });
});
