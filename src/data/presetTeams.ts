// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { PresetTeam } from "../lib/types";
import { alolaGalarPresets } from "./trainerPresets/alola-galar";
import { hisuiPaldeaSpecialPresets } from "./trainerPresets/hisui-paldea-special";
import { hoennSinnohPresets } from "./trainerPresets/hoenn-sinnoh";
import { kantoJohtoPresets } from "./trainerPresets/kanto-johto";
import { unovaKalosPresets } from "./trainerPresets/unova-kalos";

function presetKey(preset: PresetTeam) {
  return [
    preset.trainer.toLowerCase(),
    preset.sourceGroup.toLowerCase(),
    preset.battleLabel.toLowerCase(),
    preset.members.join("-"),
  ].join("|");
}

export const curatedPresetTeams: PresetTeam[] = [
  ...kantoJohtoPresets,
  ...hoennSinnohPresets,
  ...unovaKalosPresets,
  ...alolaGalarPresets,
  ...hisuiPaldeaSpecialPresets,
];

export function mergePresetTeams(...groups: PresetTeam[][]) {
  const mergedPresetMap = new Map<string, PresetTeam>();
  for (const group of groups) {
    for (const preset of group) {
      mergedPresetMap.set(presetKey(preset), preset);
    }
  }
  return Array.from(mergedPresetMap.values()).sort((left, right) =>
    left.region.localeCompare(right.region) ||
    left.sourceGame.localeCompare(right.sourceGame) ||
    left.trainer.localeCompare(right.trainer),
  );
}

export const presetTeams: PresetTeam[] = mergePresetTeams(curatedPresetTeams);
