// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { encyclopediaSeed } from "../data/encyclopediaSeed";
import { walkthroughs } from "../data/walkthroughData";
import { EMPTY_ENCYCLOPEDIA_SCHEMA, type EncyclopediaSchema, type GameVersionId } from "../lib/encyclopedia-schema";

type EncyclopediaDataContextValue = {
  schema: EncyclopediaSchema;
  loading: boolean;
  error: string | null;
  source: "generated" | "seed";
};

type EncyclopediaDetailState = {
  schema: EncyclopediaSchema;
  loading: boolean;
  error: string | null;
  source: "generated" | "index";
};

const EncyclopediaDataContext = createContext<EncyclopediaDataContextValue>({
  schema: encyclopediaSeed,
  loading: true,
  error: null,
  source: "seed",
});

function mergeSchema(base: EncyclopediaSchema, overlay: Partial<EncyclopediaSchema>): EncyclopediaSchema {
  return {
    pokemon: { ...base.pokemon, ...overlay.pokemon },
    forms: { ...base.forms, ...overlay.forms },
    evolutions: { ...base.evolutions, ...overlay.evolutions },
    moves: { ...base.moves, ...overlay.moves },
    abilities: { ...base.abilities, ...overlay.abilities },
    items: { ...base.items, ...overlay.items },
    regions: { ...base.regions, ...overlay.regions },
    gameVersions: { ...base.gameVersions, ...overlay.gameVersions },
    types: { ...base.types, ...overlay.types },
    locations: { ...base.locations, ...overlay.locations },
  };
}

function mergeFormsPreservingLearnsets(
  seed: EncyclopediaSchema["forms"],
  generated: EncyclopediaSchema["forms"],
): EncyclopediaSchema["forms"] {
  const merged = { ...seed, ...generated };
  // If a generated form has an empty learnset but the seed has one, keep the seed's learnset.
  for (const [formId, genForm] of Object.entries(generated)) {
    const seedForm = seed[formId as keyof typeof seed];
    if (seedForm && seedForm.learnset.length > 0 && genForm.learnset.length === 0) {
      merged[formId as keyof typeof merged] = { ...genForm, learnset: seedForm.learnset };
    }
  }
  return merged;
}

function mergeTypesPreservingMatchups(
  seed: EncyclopediaSchema["types"],
  generated: EncyclopediaSchema["types"],
): EncyclopediaSchema["types"] {
  const merged = { ...seed, ...generated };
  // If a generated type has empty matchups but the seed has them, keep the seed's matchups.
  for (const [typeId, genType] of Object.entries(generated)) {
    const seedType = seed[typeId as keyof typeof seed];
    if (!seedType) continue;
    const key = typeId as keyof typeof merged;
    if (genType.defensiveMatchups.length === 0 && seedType.defensiveMatchups.length > 0) {
      merged[key] = { ...merged[key], defensiveMatchups: seedType.defensiveMatchups };
    }
    if (genType.offensiveMatchups.length === 0 && seedType.offensiveMatchups.length > 0) {
      merged[key] = { ...merged[key], offensiveMatchups: seedType.offensiveMatchups };
    }
  }
  return merged;
}

function mergeGameVersionsPreservingSeed(
  seed: EncyclopediaSchema["gameVersions"],
  generated: EncyclopediaSchema["gameVersions"],
): EncyclopediaSchema["gameVersions"] {
  const merged = { ...seed, ...generated };
  for (const [gameId, genGame] of Object.entries(generated)) {
    const seedGame = seed[gameId as keyof typeof seed];
    if (!seedGame) continue;
    const key = gameId as keyof typeof merged;
    // If generated entry has no generation or regionId, keep seed values
    if ((!genGame.generation || genGame.generation === 0) && seedGame.generation) {
      merged[key] = { ...merged[key], generation: seedGame.generation };
    }
    if (!genGame.regionId && seedGame.regionId) {
      merged[key] = { ...merged[key], regionId: seedGame.regionId };
    }
    if (seedGame.shortName && genGame.shortName !== seedGame.shortName) {
      merged[key] = { ...merged[key], shortName: seedGame.shortName };
    }
    if (!genGame.releaseDate && seedGame.releaseDate) {
      merged[key] = { ...merged[key], releaseDate: seedGame.releaseDate };
    }
    if (!genGame.platform && seedGame.platform) {
      merged[key] = { ...merged[key], platform: seedGame.platform };
    }
  }
  // Second pass: fix generation/region for individual games that have no seed entry
  // by finding a seed game whose versionGroup contains this game's slug (e.g. "gold" → "gold-silver").
  const seedGames = Object.values(seed);
  for (const [gameId, game] of Object.entries(merged)) {
    if (seed[gameId as keyof typeof seed]) continue; // already handled
    const key = gameId as keyof typeof merged;
    const slug = game.slug;
    const parent = seedGames.find((s) => s.versionGroup.includes(slug) && s.versionGroup !== slug);
    if (parent) {
      if (game.generation !== parent.generation) {
        merged[key] = { ...merged[key], generation: parent.generation };
      }
      if (!game.regionId && parent.regionId) {
        merged[key] = { ...merged[key], regionId: parent.regionId };
      }
    }
  }
  return merged;
}

function mergeItemsPreservingLinks(
  seed: EncyclopediaSchema["items"],
  generated: EncyclopediaSchema["items"],
): EncyclopediaSchema["items"] {
  const merged = { ...seed, ...generated };
  for (const [itemId, genItem] of Object.entries(generated)) {
    const seedItem = seed[itemId as keyof typeof seed];
    if (!seedItem) continue;
    const key = itemId as keyof typeof merged;
    if (genItem.relatedMoveIds.length === 0 && seedItem.relatedMoveIds.length > 0) {
      merged[key] = { ...merged[key], relatedMoveIds: seedItem.relatedMoveIds };
    }
    if (genItem.relatedPokemonIds.length === 0 && seedItem.relatedPokemonIds.length > 0) {
      merged[key] = { ...merged[key], relatedPokemonIds: seedItem.relatedPokemonIds };
    }
  }
  return merged;
}

function mergeRegionsPreservingLinks(
  seed: EncyclopediaSchema["regions"],
  generated: EncyclopediaSchema["regions"],
): EncyclopediaSchema["regions"] {
  const merged = { ...seed, ...generated };
  for (const [regionId, genRegion] of Object.entries(generated)) {
    const seedRegion = seed[regionId as keyof typeof seed];
    if (!seedRegion) continue;
    const key = regionId as keyof typeof merged;
    if (genRegion.gameVersionIds.length === 0 && seedRegion.gameVersionIds.length > 0) {
      merged[key] = { ...merged[key], gameVersionIds: seedRegion.gameVersionIds };
    }
    if (genRegion.locationIds.length === 0 && seedRegion.locationIds.length > 0) {
      merged[key] = { ...merged[key], locationIds: seedRegion.locationIds };
    }
    if (!genRegion.introducedInGameId && seedRegion.introducedInGameId) {
      merged[key] = { ...merged[key], introducedInGameId: seedRegion.introducedInGameId };
    }
    if ((!genRegion.generationLabel || genRegion.generationLabel === "Mixed") && seedRegion.generationLabel && seedRegion.generationLabel !== "Mixed") {
      merged[key] = { ...merged[key], generationLabel: seedRegion.generationLabel };
    }
  }
  return merged;
}

function applyWalkthroughs(
  gameVersions: EncyclopediaSchema["gameVersions"],
): EncyclopediaSchema["gameVersions"] {
  const result = { ...gameVersions };
  for (const [walkthroughGameId, chapters] of Object.entries(walkthroughs)) {
    const gid = walkthroughGameId as GameVersionId;
    if (result[gid]) {
      result[gid] = { ...result[gid], walkthrough: chapters };
    }
    // Also apply to individual games whose versionGroup matches the walkthrough key's slug
    // (e.g., walkthrough for "game:red-blue" also applies to "game:red" and "game:blue")
    const walkthroughSlug = walkthroughGameId.replace("game:", "");
    for (const [gameId, game] of Object.entries(result)) {
      if (gameId === walkthroughGameId) continue;
      if (!game.walkthrough && game.versionGroup === walkthroughSlug) {
        result[gameId as GameVersionId] = { ...game, walkthrough: chapters };
      }
    }
  }
  return result;
}

function overlaySeedOnGenerated(schema: EncyclopediaSchema): EncyclopediaSchema {
  // Seed fills gaps for entities missing from the generated dataset,
  // but generated data takes precedence when both exist (richer game associations, etc.).
  // Forms get special handling: keep seed learnsets when generated ones are empty.
  // Types get special handling: keep seed matchups when generated ones are empty.
  // Items get special handling: keep seed relatedMoveIds/relatedPokemonIds when generated ones are empty.
  // Regions get special handling: keep seed gameVersionIds/locationIds when generated ones are empty.
  return {
    pokemon: { ...encyclopediaSeed.pokemon, ...schema.pokemon },
    forms: mergeFormsPreservingLearnsets(encyclopediaSeed.forms, schema.forms),
    evolutions: { ...encyclopediaSeed.evolutions, ...schema.evolutions },
    moves: { ...encyclopediaSeed.moves, ...schema.moves },
    abilities: { ...encyclopediaSeed.abilities, ...schema.abilities },
    items: mergeItemsPreservingLinks(encyclopediaSeed.items, schema.items),
    regions: mergeRegionsPreservingLinks(encyclopediaSeed.regions, schema.regions),
    gameVersions: applyWalkthroughs(mergeGameVersionsPreservingSeed(encyclopediaSeed.gameVersions, schema.gameVersions)),
    types: mergeTypesPreservingMatchups(encyclopediaSeed.types, schema.types),
    locations: { ...encyclopediaSeed.locations, ...schema.locations },
  };
}

export function EncyclopediaDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<EncyclopediaDataContextValue>({
    schema: encyclopediaSeed,
    loading: true,
    error: null,
    source: "seed",
  });

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}data/encyclopedia/index.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load encyclopedia index: ${response.status}`);
        return response.json() as Promise<EncyclopediaSchema>;
      })
      .then((schema) => {
        if (cancelled) return;
        setState({ schema: overlaySeedOnGenerated(schema), loading: false, error: null, source: "generated" });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState({ schema: encyclopediaSeed, loading: false, error: error.message, source: "seed" });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return <EncyclopediaDataContext.Provider value={state}>{children}</EncyclopediaDataContext.Provider>;
}

export function useEncyclopediaData() {
  return useContext(EncyclopediaDataContext);
}

export function usePokemonDetailData(speciesSlug: string) {
  const { schema: indexSchema, source } = useEncyclopediaData();
  const [detailSchema, setDetailSchema] = useState<EncyclopediaSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!speciesSlug || source !== "generated") {
      setDetailSchema(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${import.meta.env.BASE_URL}data/encyclopedia/pokemon/${speciesSlug}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load Pokemon detail: ${response.status}`);
        return response.json() as Promise<EncyclopediaSchema>;
      })
      .then((schema) => {
        if (cancelled) return;
        setDetailSchema(schema);
        setLoading(false);
      })
      .catch((fetchError: Error) => {
        if (cancelled) return;
        setDetailSchema(null);
        setLoading(false);
        setError(fetchError.message);
      });

    return () => {
      cancelled = true;
    };
  }, [source, speciesSlug, retryKey]);

  const retry = () => setRetryKey((k) => k + 1);

  return { retry, ...useMemo<EncyclopediaDetailState>(() => {
    if (!detailSchema) {
      return {
        schema: mergeSchema(EMPTY_ENCYCLOPEDIA_SCHEMA, indexSchema),
        loading,
        error,
        source: "index",
      };
    }

    return {
      schema: mergeSchema(indexSchema, detailSchema),
      loading,
      error,
      source: "generated",
    };
  }, [detailSchema, error, indexSchema, loading]) };
}
