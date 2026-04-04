import { unique } from "./format";
import type { PokemonSummary, PresetTeam, TrainerAppearanceSummary, TrainerDossier } from "./types";

export type TrainerPresetRecord = Pick<
  TrainerAppearanceSummary,
  "presetId" | "name" | "trainer" | "category" | "region" | "battleLabel" | "sourceGame" | "sourceGroup" | "difficulty" | "canonical" | "tags" | "members" | "source"
>;

function difficultyWeight(value: PresetTeam["difficulty"]) {
  switch (value) {
    case "elite":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
    default:
      return 1;
  }
}

function representativePresetScore(preset: TrainerPresetRecord) {
  const curatedBoost = preset.presetId.startsWith("bulba-") ? 0 : 10;
  const canonicalBoost = preset.canonical ? 6 : 0;
  const finalBossBoost = /champion|final boss|pokemon league|postgame/i.test(preset.battleLabel) ? 2 : 0;
  return curatedBoost + canonicalBoost + finalBossBoost + difficultyWeight(preset.difficulty);
}

export function buildTrainerDossiers(presets: TrainerPresetRecord[], pokemonList: PokemonSummary[]): TrainerDossier[] {
  const pokemonById = new Map(pokemonList.map((pokemon) => [pokemon.id, pokemon] as const));
  const grouped = presets.reduce<Record<string, TrainerPresetRecord[]>>((acc, preset) => {
    acc[preset.trainer] = [...(acc[preset.trainer] ?? []), preset];
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([trainer, trainerPresets]) => {
      const representativePreset = [...trainerPresets].sort(
        (left, right) =>
          representativePresetScore(right) - representativePresetScore(left) ||
          right.members.length - left.members.length ||
          left.sourceGame.localeCompare(right.sourceGame) ||
          left.name.localeCompare(right.name),
      )[0];
      const memberIds = trainerPresets.flatMap((preset) => preset.members);
      const pokemonEntries = memberIds.map((id) => pokemonById.get(id)).filter(Boolean) as PokemonSummary[];
      const typeSet = new Set(pokemonEntries.flatMap((pokemon) => pokemon.types));
      const totalMoveGroups = pokemonEntries.reduce((sum, pokemon) => sum + pokemon.moveGroups.length, 0);
      const specialPokemonCount = pokemonEntries.filter((pokemon) => pokemon.isLegendary || pokemon.isMythical).length;

      const acePokemonId = representativePreset?.members[representativePreset.members.length - 1] ?? null;
      const acePokemonName = acePokemonId ? pokemonById.get(acePokemonId)?.name ?? "Unknown" : "Unknown";

      return {
        trainer,
        region: representativePreset.region,
        categories: unique(trainerPresets.map((preset) => preset.category)).sort(),
        sourceGames: unique(trainerPresets.map((preset) => preset.sourceGame)).sort(),
        difficulties: unique(trainerPresets.map((preset) => preset.difficulty)).sort((left, right) => difficultyWeight(right) - difficultyWeight(left)),
        canonicalCount: trainerPresets.filter((preset) => preset.canonical).length,
        inspiredCount: trainerPresets.filter((preset) => !preset.canonical).length,
        presetCount: trainerPresets.length,
        acePokemonId,
        acePokemonName,
        teamMemberCount: memberIds.length,
        uniqueTypeCount: typeSet.size,
        totalMoveGroups,
        specialPokemonCount,
        battleLabels: unique(trainerPresets.map((preset) => preset.battleLabel)).sort(),
        tags: unique(trainerPresets.flatMap((preset) => preset.tags)).sort(),
        source: representativePreset.source,
      } satisfies TrainerDossier;
    })
    .sort((left, right) => left.trainer.localeCompare(right.trainer));
}
