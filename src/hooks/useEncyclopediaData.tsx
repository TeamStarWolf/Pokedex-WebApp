// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { encyclopediaSeed } from "../data/encyclopediaSeed";
import { EMPTY_ENCYCLOPEDIA_SCHEMA, type EncyclopediaSchema } from "../lib/encyclopedia-schema";

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

function overlaySeedOnGenerated(schema: EncyclopediaSchema): EncyclopediaSchema {
  // Seed fills gaps for entities missing from the generated dataset,
  // but generated data takes precedence when both exist (richer game associations, etc.).
  // Forms get special handling: keep seed learnsets when generated ones are empty.
  // Types get special handling: keep seed matchups when generated ones are empty.
  return {
    pokemon: { ...encyclopediaSeed.pokemon, ...schema.pokemon },
    forms: mergeFormsPreservingLearnsets(encyclopediaSeed.forms, schema.forms),
    evolutions: { ...encyclopediaSeed.evolutions, ...schema.evolutions },
    moves: { ...encyclopediaSeed.moves, ...schema.moves },
    abilities: { ...encyclopediaSeed.abilities, ...schema.abilities },
    items: { ...encyclopediaSeed.items, ...schema.items },
    regions: { ...encyclopediaSeed.regions, ...schema.regions },
    gameVersions: { ...encyclopediaSeed.gameVersions, ...schema.gameVersions },
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
