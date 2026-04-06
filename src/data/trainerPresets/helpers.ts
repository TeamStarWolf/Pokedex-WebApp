// PokeNav - Copyright (c) 2026 TeamStarWolf
// https://github.com/TeamStarWolf/PokeNav - MIT License
import type { PresetTeam } from "../../lib/types";
import { withBulbapediaReference } from "./bulbapedia";

export function preset(team: PresetTeam): PresetTeam {
  return withBulbapediaReference(team);
}
