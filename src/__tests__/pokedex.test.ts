// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { describe, expect, it } from "vitest";
import { filterPokemon } from "../lib/pokedex";

const sample = [
  { id: 6, name: "charizard", image: "", generation: "generation-i", generationLabel: "Gen I", types: ["fire", "flying"], versionCount: 3, versionGroupCount: 2, varietyCount: 3, moveCount: 120, isLegendary: false, isMythical: false, entryGames: ["red", "blue"], moveGroups: ["red-blue", "yellow"], formNames: ["charizard", "charizard-mega-x"], formTags: ["mega"] },
  { id: 150, name: "mewtwo", image: "", generation: "generation-i", generationLabel: "Gen I", types: ["psychic"], versionCount: 8, versionGroupCount: 6, varietyCount: 2, moveCount: 160, isLegendary: true, isMythical: false, entryGames: ["red"], moveGroups: ["x-y"], formNames: ["mewtwo"], formTags: [] },
];

describe("filterPokemon", () => {
  it("filters by query and type", () => {
    const filtered = filterPokemon(sample, {
      query: "fire",
      selectedTypes: ["fire"],
      selectedGeneration: "all",
      selectedMoveGroup: "all",
      favoritesOnly: false,
      favorites: [],
      typeMode: "all",
      sortBy: "id",
      specialFilter: "all",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("charizard");
  });

  it("filters by legendary flag", () => {
    const filtered = filterPokemon(sample, {
      query: "",
      selectedTypes: [],
      selectedGeneration: "all",
      selectedMoveGroup: "all",
      favoritesOnly: false,
      favorites: [],
      typeMode: "all",
      sortBy: "id",
      specialFilter: "legendary",
    });
    expect(filtered.map((item) => item.id)).toEqual([150]);
  });
});
