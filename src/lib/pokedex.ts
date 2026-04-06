// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { unique } from "./format";
import type { PokemonSummary, PresetTeam } from "./types";

export type Filters = {
  query: string;
  selectedTypes: string[];
  selectedGeneration: string;
  selectedMoveGroup: string;
  favoritesOnly: boolean;
  favorites: number[];
  typeMode: "all" | "any";
  sortBy: "id" | "name" | "games" | "forms" | "moves";
  specialFilter: "all" | "legendary" | "mythical" | "forms" | "multi-game";
};

export function filterPokemon(pokemonList: PokemonSummary[], filters: Filters) {
  const query = filters.query.trim().toLowerCase();

  return [...pokemonList]
    .filter((pokemon) => {
      const matchesQuery =
        !query ||
        pokemon.name.includes(query) ||
        String(pokemon.id) === query ||
        pokemon.generationLabel.toLowerCase().includes(query) ||
        pokemon.types.some((type) => type.includes(query)) ||
        pokemon.entryGames.some((game) => game.includes(query)) ||
        pokemon.moveGroups.some((group) => group.includes(query)) ||
        pokemon.formNames.some((name) => name.includes(query)) ||
        pokemon.formTags.some((tag) => tag.includes(query));

      const matchesTypes =
        filters.selectedTypes.length === 0 ||
        (filters.typeMode === "all"
          ? filters.selectedTypes.every((type) => pokemon.types.includes(type))
          : filters.selectedTypes.some((type) => pokemon.types.includes(type)));

      const matchesSpecial =
        filters.specialFilter === "all" ||
        (filters.specialFilter === "legendary" && pokemon.isLegendary) ||
        (filters.specialFilter === "mythical" && pokemon.isMythical) ||
        (filters.specialFilter === "forms" && pokemon.varietyCount > 1) ||
        (filters.specialFilter === "multi-game" && pokemon.moveGroups.length >= 3);

      const matchesGeneration = filters.selectedGeneration === "all" || pokemon.generation === filters.selectedGeneration;
      const matchesMoveGroup = filters.selectedMoveGroup === "all" || pokemon.moveGroups.includes(filters.selectedMoveGroup);
      const matchesFavorite = !filters.favoritesOnly || filters.favorites.includes(pokemon.id);

      return matchesQuery && matchesTypes && matchesSpecial && matchesGeneration && matchesMoveGroup && matchesFavorite;
    })
    .sort((left, right) => {
      switch (filters.sortBy) {
        case "name":
          return left.name.localeCompare(right.name);
        case "games":
          return right.versionCount - left.versionCount || left.id - right.id;
        case "forms":
          return right.varietyCount - left.varietyCount || left.id - right.id;
        case "moves":
          return right.moveCount - left.moveCount || left.id - right.id;
        case "id":
        default:
          return left.id - right.id;
      }
    });
}

export function collectTypes(pokemonList: PokemonSummary[]) {
  return unique(pokemonList.flatMap((pokemon) => pokemon.types)).sort();
}

export function collectGenerations(pokemonList: PokemonSummary[]) {
  return unique(pokemonList.map((pokemon) => pokemon.generation).filter(Boolean)).sort();
}

export function collectMoveGroups(pokemonList: PokemonSummary[]) {
  return unique(pokemonList.flatMap((pokemon) => pokemon.moveGroups)).sort();
}

export function filterPresets(presets: PresetTeam[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return presets;
  return presets.filter((preset) =>
    [
      preset.name,
      preset.trainer,
      preset.category,
      preset.sourceGame,
      preset.description,
      preset.region,
      preset.battleLabel,
      preset.source?.label ?? "",
      preset.source?.note ?? "",
      ...preset.tags,
      ...preset.howToBeat,
    ].some((value) => value.toLowerCase().includes(normalized)),
  );
}
