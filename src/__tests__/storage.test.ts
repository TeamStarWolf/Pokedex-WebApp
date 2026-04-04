import { describe, expect, it } from "vitest";
import { importTeamSets, migrateStorage } from "../lib/storage";

describe("storage migration", () => {
  it("migrates legacy favorites and team keys", () => {
    expect(migrateStorage({ favorites: [1, 2], team: [3, 4] })).toEqual({
      favorites: [1, 2],
      currentTeam: [
        { pokemonId: 3, nickname: "", role: "", notes: "" },
        { pokemonId: 4, nickname: "", role: "", notes: "" },
      ],
      currentTeamProfile: { name: "Current Team", notes: "" },
      customTeamSets: [],
    });
  });

  it("imports valid team sets", () => {
    const imported = importTeamSets(
      JSON.stringify({
        customTeamSets: [{ id: "alpha", name: "Alpha", description: "", members: [1, 2], updatedAt: "2026-03-13T00:00:00.000Z" }],
      }),
    );
    expect(imported).toHaveLength(1);
    expect(imported[0]?.members).toEqual([
      { pokemonId: 1, nickname: "", role: "", notes: "" },
      { pokemonId: 2, nickname: "", role: "", notes: "" },
    ]);
  });
});
