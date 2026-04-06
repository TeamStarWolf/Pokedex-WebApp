// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { encyclopediaSeed } from "../data/encyclopediaSeed";
import { getPokedexEntriesForSpecies, getUniqueMoveCount, groupLearnsetByMethod, searchEntities, slugify } from "../lib/encyclopedia";
import { PokemonDetailPage } from "../pages/encyclopedia/PokemonDetailPage";

describe("encyclopedia helpers", () => {
  it("creates clean slugs", () => {
    expect(slugify("Mr. Mime")).toBe("mr-mime");
  });

  it("returns fuzzy search results across entities", () => {
    const results = searchEntities(encyclopediaSeed, "thunder");
    expect(results[0]?.title).toBe("Thunderbolt");
  });

  it("counts unique moves instead of raw learnset records", () => {
    const pikachu = encyclopediaSeed.pokemon["pokemon:pikachu"];
    if (!pikachu.defaultFormId) {
      throw new Error("Expected seeded Pikachu to have a default form");
    }
    const pikachuForm = encyclopediaSeed.forms[pikachu.defaultFormId];

    expect(getUniqueMoveCount(pikachuForm)).toBeGreaterThan(0);
    expect(getUniqueMoveCount(pikachuForm)).toBeLessThanOrEqual(pikachuForm.learnset.length);
  });

  it("scopes dex entries and learnset rows to one game", () => {
    const pikachu = encyclopediaSeed.pokemon["pokemon:pikachu"];
    if (!pikachu.defaultFormId) {
      throw new Error("Expected seeded Pikachu to have a default form");
    }

    const pikachuForm = encyclopediaSeed.forms[pikachu.defaultFormId];
    const gameId = pikachu.pokedexEntries[0]?.gameVersionId ?? pikachuForm.learnset[0]?.gameVersionId;
    if (!gameId) {
      throw new Error("Expected seeded Pikachu to have at least one game-scoped record");
    }

    const entries = getPokedexEntriesForSpecies(pikachu, gameId);
    const groups = groupLearnsetByMethod(encyclopediaSeed, pikachuForm, gameId);

    expect(entries.every((entry) => entry.gameVersionId === gameId)).toBe(true);
    expect(groups.flatMap((group) => group.entries).every((entry) => entry.game.id === gameId)).toBe(true);
  });
});

describe("encyclopedia routes", () => {
  it("renders a seeded pokemon detail page", () => {
    render(
      <MemoryRouter initialEntries={["/pokemon/pikachu"]}>
        <Routes>
          <Route path="/pokemon/:speciesSlug" element={<PokemonDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("heading", { name: "Pikachu" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Mouse Pokemon/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Moves" })).toBeInTheDocument();
  });
});
