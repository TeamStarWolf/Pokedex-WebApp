// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import { buildTrainerDossiers, type TrainerPresetRecord } from "./trainers";
import type { PokemonSummary, PresetTeam, TrainerAppearance, TrainerAppearanceSummary, TrainerDossier } from "./types";

export function slugifyTrainerName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type TrainerReferenceEntry = TrainerDossier & {
  slug: string;
  appearances: TrainerAppearanceSummary[];
};

export function slugifyAppearance(preset: Pick<PresetTeam, "id" | "sourceGroup" | "battleLabel" | "name">) {
  return preset.id
    ? preset.id.toLowerCase()
    : slugifyTrainerName([preset.sourceGroup, preset.battleLabel, preset.name].join(" "));
}

function trainerPresetKey(preset: TrainerPresetRecord) {
  return [
    preset.trainer.toLowerCase(),
    preset.sourceGroup.toLowerCase(),
    preset.battleLabel.toLowerCase(),
    preset.members.join("-"),
  ].join("|");
}

type AppearanceSummarySource = TrainerPresetRecord | PresetTeam;

export function buildTrainerAppearanceSummaries(presets: AppearanceSummarySource[]): TrainerAppearanceSummary[] {
  return presets.map((preset) => ({
    slug: slugifyAppearance({
      id: "presetId" in preset ? preset.presetId : preset.id,
      sourceGroup: preset.sourceGroup,
      battleLabel: preset.battleLabel,
      name: preset.name,
    }),
    trainerSlug: slugifyTrainerName(preset.trainer),
    trainer: preset.trainer,
    presetId: "presetId" in preset ? preset.presetId : preset.id,
    name: preset.name,
    region: preset.region,
    category: preset.category,
    battleLabel: preset.battleLabel,
    sourceGame: preset.sourceGame,
    sourceGroup: preset.sourceGroup,
    difficulty: preset.difficulty,
    canonical: preset.canonical,
    tags: preset.tags,
    members: preset.members,
    acePokemonId: preset.members[preset.members.length - 1] ?? null,
    source: preset.source,
  }));
}

export function buildTrainerAppearances(presets: PresetTeam[]): TrainerAppearance[] {
  return presets.map((preset) => ({
    ...buildTrainerAppearanceSummaries([preset])[0],
    description: preset.description,
    howToBeat: preset.howToBeat,
  }));
}

export function mergeTrainerAppearanceSummaries(...groups: TrainerAppearanceSummary[][]) {
  const merged = new Map<string, TrainerAppearanceSummary>();
  for (const group of groups) {
    for (const appearance of group) {
      merged.set(
        trainerPresetKey({
          presetId: appearance.presetId,
          name: appearance.name,
          trainer: appearance.trainer,
          category: appearance.category,
          region: appearance.region,
          battleLabel: appearance.battleLabel,
          sourceGame: appearance.sourceGame,
          sourceGroup: appearance.sourceGroup,
          difficulty: appearance.difficulty,
          canonical: appearance.canonical,
          tags: appearance.tags,
          members: appearance.members,
          source: appearance.source,
        }),
        appearance,
      );
    }
  }
  return Array.from(merged.values()).sort(
    (left, right) =>
      left.region.localeCompare(right.region) ||
      left.sourceGame.localeCompare(right.sourceGame) ||
      left.trainer.localeCompare(right.trainer) ||
      left.name.localeCompare(right.name),
  );
}

export function buildTrainerReferenceEntries(presets: TrainerPresetRecord[], pokemonList: PokemonSummary[]): TrainerReferenceEntry[] {
  const dossiers = buildTrainerDossiers(presets, pokemonList);
  const appearances = buildTrainerAppearanceSummaries(presets);
  const appearancesByTrainer = appearances.reduce<Record<string, TrainerAppearanceSummary[]>>((accumulator, appearance) => {
    accumulator[appearance.trainer] = [...(accumulator[appearance.trainer] ?? []), appearance];
    return accumulator;
  }, {});

  return dossiers.map((dossier) => ({
    ...dossier,
    slug: slugifyTrainerName(dossier.trainer),
    appearances: (appearancesByTrainer[dossier.trainer] ?? []).sort(
      (left, right) =>
        left.sourceGame.localeCompare(right.sourceGame) ||
        left.battleLabel.localeCompare(right.battleLabel) ||
        left.name.localeCompare(right.name),
    ),
  }));
}

export function getTrainerReferenceBySlug(entries: TrainerReferenceEntry[], slug: string) {
  return entries.find((entry) => entry.slug === slug) ?? null;
}

export function getTrainerAppearanceBySlug(entries: TrainerReferenceEntry[], trainerSlug: string, appearanceSlug: string) {
  const trainer = getTrainerReferenceBySlug(entries, trainerSlug);
  if (!trainer) return null;
  return trainer.appearances.find((appearance) => appearance.slug === appearanceSlug) ?? null;
}

export function getTrainerAppearancesForPokemon(
  appearances: TrainerAppearanceSummary[],
  pokemonId: number,
  sourceGroup?: string | null,
) {
  return appearances
    .filter((appearance) =>
      appearance.members.includes(pokemonId) && (!sourceGroup || appearance.sourceGroup === sourceGroup),
    )
    .sort(
      (left, right) =>
        Number(right.canonical) - Number(left.canonical)
        || left.sourceGame.localeCompare(right.sourceGame)
        || left.trainer.localeCompare(right.trainer)
        || left.name.localeCompare(right.name),
    );
}
