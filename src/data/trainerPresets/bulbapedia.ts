import type { PresetTeam } from "../../lib/types";

const trainerPageUrls: Record<string, string> = {
  "Adaman": "https://bulbapedia.bulbagarden.net/wiki/Adaman",
  "Alder": "https://bulbapedia.bulbagarden.net/wiki/Alder",
  "Arven": "https://bulbapedia.bulbagarden.net/wiki/Arven",
  "Archie": "https://bulbapedia.bulbagarden.net/wiki/Archie",
  "Barry": "https://bulbapedia.bulbagarden.net/wiki/Barry_(game)",
  "Blue": "https://bulbapedia.bulbagarden.net/wiki/Blue_(game)",
  "Brendan": "https://bulbapedia.bulbagarden.net/wiki/Brendan_(game)",
  "Bugsy": "https://bulbapedia.bulbagarden.net/wiki/Bugsy",
  "Clair": "https://bulbapedia.bulbagarden.net/wiki/Clair",
  "Cynthia": "https://bulbapedia.bulbagarden.net/wiki/Cynthia",
  "Cyrus": "https://bulbapedia.bulbagarden.net/wiki/Cyrus",
  "Diantha": "https://bulbapedia.bulbagarden.net/wiki/Diantha",
  "Geeta": "https://bulbapedia.bulbagarden.net/wiki/Geeta",
  "Ghetsis": "https://bulbapedia.bulbagarden.net/wiki/Ghetsis",
  "Giovanni": "https://bulbapedia.bulbagarden.net/wiki/Giovanni",
  "Gladion": "https://bulbapedia.bulbagarden.net/wiki/Gladion",
  "Gold / Ethan": "https://bulbapedia.bulbagarden.net/wiki/Ethan_(game)",
  "Guzma": "https://bulbapedia.bulbagarden.net/wiki/Guzma",
  "Hau": "https://bulbapedia.bulbagarden.net/wiki/Hau",
  "Hilbert / Hilda": "https://bulbapedia.bulbagarden.net/wiki/Hilbert_(game)",
  "Irida": "https://bulbapedia.bulbagarden.net/wiki/Irida",
  "Iris": "https://bulbapedia.bulbagarden.net/wiki/Iris",
  "Karen": "https://bulbapedia.bulbagarden.net/wiki/Karen",
  "Kieran": "https://bulbapedia.bulbagarden.net/wiki/Kieran",
  "Kris": "https://bulbapedia.bulbagarden.net/wiki/Kris_(game)",
  "Lance": "https://bulbapedia.bulbagarden.net/wiki/Lance",
  "Leon": "https://bulbapedia.bulbagarden.net/wiki/Leon",
  "Lysandre": "https://bulbapedia.bulbagarden.net/wiki/Lysandre",
  "Marnie": "https://bulbapedia.bulbagarden.net/wiki/Marnie",
  "Maxie": "https://bulbapedia.bulbagarden.net/wiki/Maxie",
  "Mustard": "https://bulbapedia.bulbagarden.net/wiki/Mustard",
  "N": "https://bulbapedia.bulbagarden.net/wiki/N",
  "Nemona": "https://bulbapedia.bulbagarden.net/wiki/Nemona",
  "Penny": "https://bulbapedia.bulbagarden.net/wiki/Penny",
  "Professor Kukui": "https://bulbapedia.bulbagarden.net/wiki/Professor_Kukui",
  "Raihan": "https://bulbapedia.bulbagarden.net/wiki/Raihan",
  "Red": "https://bulbapedia.bulbagarden.net/wiki/Red_(game)",
  "Sabrina": "https://bulbapedia.bulbagarden.net/wiki/Sabrina",
  "Serena": "https://bulbapedia.bulbagarden.net/wiki/Serena_(game)",
  "Silver": "https://bulbapedia.bulbagarden.net/wiki/Silver_(game)",
  "Steven": "https://bulbapedia.bulbagarden.net/wiki/Steven_Stone",
  "Volo": "https://bulbapedia.bulbagarden.net/wiki/Volo",
  "Volkner": "https://bulbapedia.bulbagarden.net/wiki/Volkner",
  "Wallace": "https://bulbapedia.bulbagarden.net/wiki/Wallace",
  "Will": "https://bulbapedia.bulbagarden.net/wiki/Will",
  "Wally": "https://bulbapedia.bulbagarden.net/wiki/Wally",
};

export function getBulbapediaReference(trainer: string) {
  const directUrl = trainerPageUrls[trainer];
  if (directUrl) {
    return {
      kind: "bulbapedia" as const,
      label: "Bulbapedia trainer page",
      url: directUrl,
      note: "Reference page for trainer identity, appearances, and canonical roster context.",
    };
  }

  return {
    kind: "bulbapedia" as const,
    label: "Bulbapedia search",
    url: `https://bulbapedia.bulbagarden.net/wiki/Special:Search?search=${encodeURIComponent(trainer)}`,
    note: "Search fallback for trainer or battle references not mapped to a direct page yet.",
  };
}

export function withBulbapediaReference(team: PresetTeam): PresetTeam {
  if (team.source) return team;
  return {
    ...team,
    source: getBulbapediaReference(team.trainer),
  };
}
