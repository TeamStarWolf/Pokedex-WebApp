import type { PresetTeam } from "../../lib/types";
import { withBulbapediaReference } from "./bulbapedia";

export function preset(team: PresetTeam): PresetTeam {
  return withBulbapediaReference(team);
}
