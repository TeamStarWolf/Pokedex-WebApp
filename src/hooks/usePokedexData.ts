import { useEffect, useState } from "react";
import type { PokemonDetail, PokemonSummary } from "../lib/types";

export function usePokedexIndex() {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/data/index.json")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load local dataset.");
        return response.json() as Promise<PokemonSummary[]>;
      })
      .then((payload) => {
        if (active) setPokemonList(payload);
      })
      .catch((reason: Error) => {
        if (active) setError(reason.message || "Failed to load local dataset.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { pokemonList, loading, error };
}

export function usePokemonDetail(pokemonId: number | null) {
  const [detail, setDetail] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!pokemonId) {
      setDetail(null);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    fetch(`/data/pokemon/${pokemonId}.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load Pokemon detail.");
        return response.json() as Promise<PokemonDetail>;
      })
      .then((payload) => {
        if (active) setDetail(payload);
      })
      .catch((reason: Error) => {
        if (active) {
          setDetail(null);
          setError(reason.message || "Failed to load Pokemon detail.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pokemonId]);

  return { detail, loading, error };
}
