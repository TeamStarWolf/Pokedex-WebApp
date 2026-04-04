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

function overlaySeedOnGenerated(schema: EncyclopediaSchema): EncyclopediaSchema {
  return {
    pokemon: { ...schema.pokemon, ...encyclopediaSeed.pokemon },
    forms: { ...schema.forms, ...encyclopediaSeed.forms },
    evolutions: { ...schema.evolutions, ...encyclopediaSeed.evolutions },
    moves: { ...schema.moves, ...encyclopediaSeed.moves },
    abilities: { ...schema.abilities, ...encyclopediaSeed.abilities },
    items: { ...schema.items, ...encyclopediaSeed.items },
    regions: { ...schema.regions, ...encyclopediaSeed.regions },
    gameVersions: { ...schema.gameVersions, ...encyclopediaSeed.gameVersions },
    types: { ...schema.types, ...encyclopediaSeed.types },
    locations: { ...schema.locations, ...encyclopediaSeed.locations },
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
    fetch("/data/encyclopedia/index.json")
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

    fetch(`/data/encyclopedia/pokemon/${speciesSlug}.json`)
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
