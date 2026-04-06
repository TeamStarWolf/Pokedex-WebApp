// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { useMemo } from "react";
import { usePokedexIndex } from "./usePokedexData";
import { useTrainerDetailPresets, useTrainerPresets } from "./useTrainerPresets";
import { buildTrainerAppearances, buildTrainerAppearanceSummaries, buildTrainerReferenceEntries, getTrainerReferenceBySlug } from "../lib/trainerEncyclopedia";

export function useTrainerReferenceData() {
  const { appearances, loading: trainerLoading, error: trainerError } = useTrainerPresets();
  const { pokemonList, loading: pokemonLoading, error: pokemonError } = usePokedexIndex();

  const entries = useMemo(() => buildTrainerReferenceEntries(appearances, pokemonList), [appearances, pokemonList]);

  return {
    entries,
    appearances,
    pokemonList,
    loading: trainerLoading || pokemonLoading,
    error: trainerError ?? pokemonError,
  };
}

export function useTrainerArticleData(trainerSlug: string) {
  const reference = useTrainerReferenceData();
  const { presets, loading: detailLoading, error: detailError } = useTrainerDetailPresets(trainerSlug);

  const entry = useMemo(() => {
    const existing = getTrainerReferenceBySlug(reference.entries, trainerSlug);
    if (existing) return existing;
    if (!presets.length) return null;
    return buildTrainerReferenceEntries(buildTrainerAppearanceSummaries(presets), reference.pokemonList)[0] ?? null;
  }, [presets, reference.entries, reference.pokemonList, trainerSlug]);

  const appearances = useMemo(() => buildTrainerAppearances(presets), [presets]);

  return {
    entry,
    appearances,
    pokemonList: reference.pokemonList,
    loading: reference.loading || detailLoading,
    error: detailError ?? reference.error,
  };
}

export function useTrainerAppearanceData(trainerSlug: string, appearanceSlug: string) {
  const article = useTrainerArticleData(trainerSlug);
  const appearance = useMemo(
    () => article.appearances.find((entry) => entry.slug === appearanceSlug) ?? null,
    [appearanceSlug, article.appearances],
  );

  return {
    ...article,
    appearance,
  };
}
