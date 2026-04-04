import { useEffect, useMemo, useState } from "react";
import { curatedPresetTeams, mergePresetTeams } from "../data/presetTeams";
import { buildTrainerAppearanceSummaries, mergeTrainerAppearanceSummaries, slugifyTrainerName } from "../lib/trainerEncyclopedia";
import type { PresetTeam, TrainerAppearanceSummary, TrainerDetailPayload, TrainerReferenceManifest } from "../lib/types";

const curatedAppearances = buildTrainerAppearanceSummaries(curatedPresetTeams);

export function useTrainerPresets() {
  const [appearances, setAppearances] = useState<TrainerAppearanceSummary[]>(() => curatedAppearances);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/data/trainers/manifest.json")
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load trainer manifest: ${response.status}`);
        return response.json() as Promise<TrainerReferenceManifest>;
      })
      .then((payload) => {
        if (!active) return;
        setAppearances(mergeTrainerAppearanceSummaries(payload.appearances ?? [], curatedAppearances));
        setLoading(false);
        setError(null);
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setAppearances(curatedAppearances);
        setLoading(false);
        setError(loadError.message);
      });

    return () => {
      active = false;
    };
  }, []);

  return { appearances, loading, error };
}

export function useTrainerDetailPresets(trainerSlug: string) {
  const curated = useMemo(
    () => curatedPresetTeams.filter((preset) => slugifyTrainerName(preset.trainer) === trainerSlug),
    [trainerSlug],
  );
  const [presets, setPresets] = useState<PresetTeam[]>(() => curated);
  const [loading, setLoading] = useState(Boolean(trainerSlug));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainerSlug) {
      setPresets(curated);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/data/trainers/by-trainer/${trainerSlug}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load trainer detail: ${response.status}`);
        return response.json() as Promise<TrainerDetailPayload>;
      })
      .then((payload) => {
        if (!active) return;
        setPresets(mergePresetTeams(payload.presets ?? [], curated));
        setLoading(false);
        setError(null);
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setPresets(curated);
        setLoading(false);
        setError(curated.length ? null : loadError.message);
      });

    return () => {
      active = false;
    };
  }, [curated, trainerSlug]);

  return { presets, loading, error };
}
