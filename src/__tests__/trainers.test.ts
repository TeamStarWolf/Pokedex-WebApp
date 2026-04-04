import { describe, expect, it } from "vitest";
import { buildTrainerDossiers } from "../lib/trainers";

describe("buildTrainerDossiers", () => {
  it("aggregates preset and pokemon data into offline trainer dossiers", () => {
    const dossiers = buildTrainerDossiers(
      [
        {
          presetId: "red-1",
          name: "Mt. Silver",
          trainer: "Red",
          category: "Main Characters",
          region: "Johto",
          battleLabel: "Postgame Final Boss",
          sourceGame: "Pokemon Gold / Silver / Crystal",
          sourceGroup: "gold-silver",
          difficulty: "elite",
          canonical: true,
          tags: ["player", "postgame"],
          members: [25, 6],
          source: {
            kind: "bulbapedia",
            label: "Bulbapedia trainer page",
            url: "https://example.com",
          },
        },
      ],
      [
        {
          id: 25,
          name: "pikachu",
          image: "/25.png",
          generation: "generation-i",
          generationLabel: "Gen I",
          types: ["electric"],
          versionCount: 1,
          versionGroupCount: 1,
          varietyCount: 3,
          moveCount: 10,
          isLegendary: false,
          isMythical: false,
          entryGames: ["yellow"],
          moveGroups: ["red-blue"],
          formNames: [],
          formTags: [],
        },
        {
          id: 6,
          name: "charizard",
          image: "/6.png",
          generation: "generation-i",
          generationLabel: "Gen I",
          types: ["fire", "flying"],
          versionCount: 1,
          versionGroupCount: 1,
          varietyCount: 2,
          moveCount: 12,
          isLegendary: false,
          isMythical: false,
          entryGames: ["red"],
          moveGroups: ["red-blue", "gold-silver"],
          formNames: [],
          formTags: [],
        },
      ],
    );

    expect(dossiers).toHaveLength(1);
    expect(dossiers[0].trainer).toBe("Red");
    expect(dossiers[0].acePokemonName).toBe("charizard");
    expect(dossiers[0].uniqueTypeCount).toBe(3);
    expect(dossiers[0].source?.kind).toBe("bulbapedia");
  });
});
