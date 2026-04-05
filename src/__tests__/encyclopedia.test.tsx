import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { encyclopediaSeed } from "../data/encyclopediaSeed";
import { getUniqueMoveCount, searchEntities, slugify } from "../lib/encyclopedia";
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
    expect(screen.getByText(/Mouse Pokemon \| National Dex/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Moves" })).toBeInTheDocument();
  });
});
